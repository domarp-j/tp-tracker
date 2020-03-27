import firestore from "../utils/firebase";
import axios from "axios";

/**
 * This file contains the address-to-coordinates logic for TP Tracker. It uses
 * the Google Maps Geocoding API to fetch coordinates, but only as a last resort.
 *
 * The following steps are taken to retrieve the coordinates for a given address:
 * - Check a static JSON file that is created at every build and updates with
 *   the latest address coordinates stored in a Firestore database
 * - Check the user's local storage
 * - Check the Firestore database directly for the coordinates
 * - As a last resort, use the expensive Google Maps Geocoding API to get the
 *   coordinates, and save the coordinates to Firebase and local storage for
 *   later use.
 *
 * Why local storage?
 * - By saving the coordinates to local storage and checking it first, the client
 *   does not have to repeatedly reach out to any external services to get
 *   coordinate data.
 *
 * Why Firestore?
 * - Firestore has much more forgiving rate limits than Google Maps. The
 *   occasional fetch from the Firestore database is much cheaper than a Geocoding
 *   API query.
 */

/*****************************************************************/
// Geocode Data
/*****************************************************************/

let geocodeData;
try {
  geocodeData = require("../data/geocode.json");
} catch (_) {}

/*****************************************************************/
// Helper Functions
/*****************************************************************/

const checkGeocodeJson = address => {
  if (!geocodeData) return;

  const coordData = geocodeData[address];

  if (coordData) {
    return {
      lat: coordData.lat,
      lng: coordData.lng,
    };
  }
};

const checkLocalStorage = address => {
  const coords = localStorage.getItem(`tp tracker ${address}`);
  if (coords) return JSON.parse(coords);
};

const saveToLocalStorage = (address, coords) => {
  localStorage.setItem(`tp tracker ${address}`, JSON.stringify(coords));
};

const checkFirebase = async address => {
  try {
    const coords = await firestore
      .collection("coordinates")
      .doc(address)
      .get();

    const coordData = coords.data();

    if (coordData) {
      return {
        lat: coordData.lat,
        lng: coordData.lng,
      };
    }
  } catch (error) {
    // TODO: Error handling
    throw error;
  }
};

const saveToFirebase = (address, coords) => {
  firestore
    .collection("coordinates")
    .doc(address)
    .set({ ...coords, address });
};

const addressGeocode = async address => {
  const res = await axios.get(
    "https://maps.googleapis.com/maps/api/geocode/json",
    {
      params: {
        address,
        key: process.env.GATSBY_GMAPS_KEY,
      },
    }
  );

  if (res.data.error_message) return;

  return res.data.results[0].geometry.location;
};

/*****************************************************************/
// Main
/*****************************************************************/

export default async address => {
  let coords;

  // console.log("GC1-js...");
  coords = checkGeocodeJson(address);
  if (coords) return coords;

  // console.log("GC1-js failed. GC2-ls...");
  coords = checkLocalStorage(address);
  if (coords) return coords;

  // console.log("GC2-ls failed. GC3-fs...");
  coords = await checkFirebase(address);
  if (coords) {
    saveToLocalStorage(address, coords);
    return coords;
  }

  // console.log("GC3-fs failed. GC4-gm...");
  coords = await addressGeocode(address);
  if (coords) {
    saveToLocalStorage(address, coords);
    saveToFirebase(address, coords);
    return coords;
  }
};
