import firestore from "../utils/firebase";
import axios from "axios";

export default async address => {
  try {
    // Check local storage first for coordinates
    let coords = localStorage.getItem(`tp tracker ${address}`);
    if (coords) return JSON.parse(coords);

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
    coords = geocodeRes.data.results[0].geometry.location;

    // Store coordinates in firestore
    firestore
      .collection("coordinates")
      .doc(address)
      .set(coords);

    // Store coordinates in local storage
    localStorage.setItem(`tp tracker ${address}`, JSON.stringify(coords));

    return coords;
  } catch (error) {
    console.error(error);
  }
};
