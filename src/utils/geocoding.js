import firestore from "../utils/firebase";
import axios from "axios";

export default async address => {
  try {
    console.log("GC1-ls...");

    // Check local storage first for coordinates
    let coords = localStorage.getItem(`tp tracker ${address}`);
    if (coords) return JSON.parse(coords);

    console.warn("GC1-ls failed. GC2-fs...");

    // Check firestore
    coords = await firestore
      .collection("coordinates")
      .doc(address)
      .get();

    // If coordinates exist in firestore, then...
    if (coords.data()) {
      // Save to local storage
      localStorage.setItem(
        `tp tracker ${address}`,
        JSON.stringify(coords.data())
      );
      return coords.data();
    }

    console.warn("GC2-fs failed. GC3-gm...");

    // Since address coordinates aren't stored anywhere, call Geocode API
    const geocodeRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address,
          key: process.env.GATSBY_GMAPS_KEY,
        },
      }
    );

    if (geocodeRes.data.error_message) {
      throw new Error("API ERROR");
    } else {
      coords = geocodeRes.data.results[0].geometry.location;

      // Store coordinates in firestore
      firestore
        .collection("coordinates")
        .doc(address)
        .set(coords);

      // Store coordinates in local storage
      localStorage.setItem(`tp tracker ${address}`, JSON.stringify(coords));

      return coords;
    }
  } catch (error) {
    console.error(error);
  }
};
