const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);

dotenv.config({ path: ".env.development" });

const main = async () => {
  try {
    console.log("Retrieving existing geocodes...");
    let geocodes = require("../data/geocodes.json");

    console.log("Fetching TP location data...");
    const res = await axios.get(process.env.GATSBY_API_URL);
    if (!res.data) return;

    // Track addresses that need to hit Geocoding API
    let geocodeCandidates = [];

    console.log("Checking new TP location data against existing data...");
    res.data.forEach(location => {
      // Skip if geocode is already logged
      if (geocodes[location.address]) return;

      // Save unlogged geocode
      geocodes[location.address] = location;

      // Stop if latitute & longitude are known
      if (location.lat && location.lng) return;

      // Mark address as a Geocoding API candidate
      geocodeCandidates.push(location.address);
    });

    if (geocodeCandidates.length > 0) {
      console.log("New addresses found that require geocoding...  ");
    }

    // Create a promise for each Geocoding API request
    // Add a timeout buffer between each request to prevent API overloading
    const geocodeReqs = geocodeCandidates.map(
      (address, index) =>
        new Promise(resolve => {
          setTimeout(async () => {
            const res = await axios.get(
              "https://maps.googleapis.com/maps/api/geocode/json",
              {
                params: { address, key: process.env.GATSBY_GMAPS_KEY },
              }
            );

            // Skip any encountered errors
            if (res.data.error_message) return;

            // Retrieve lat/lng coordinates
            const coords = res.data.results[0].geometry.location;

            // Update geocodes object with coordinates
            geocodes[address] = {
              ...geocodes[address],
              ...coords,
            };

            resolve();
          }, 200 * index);
        })
    );

    Promise.all(geocodeReqs).then(() => {
      console.log("Writing new geocode data file...");
      writeFile("src/data/geocodes.json", JSON.stringify(geocodes));
    });
  } catch (error) {
    console.error(error);
  }
};

main();
