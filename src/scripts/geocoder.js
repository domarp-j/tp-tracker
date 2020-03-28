const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const util = require("util");

const writeFile = util.promisify(fs.writeFile);

dotenv.config({ path: ".env.development" });

const main = async () => {
  try {
    // Track whether geocodes JSON needs to be overwritten
    let newGeocodesRequired = false;

    console.log("Retrieving existing geocodes from JSON file...");
    let geocodes = require("../data/geocodes.json");

    console.log("Fetching data from API...");
    const res = await axios.get(process.env.GATSBY_API_URL);
    if (!res.data) {
      console.log("API did not return data. Aborting...");
      process.exitCode(1);
    }

    console.log("Filtering out duplicate locations...");
    const addressCache = {};
    const locations = res.data.filter(location => {
      if (addressCache[location.address]) return false;
      addressCache[location.address] = true;
      return true;
    });

    // Track addresses that need to hit Geocoding API
    let geocodeCandidates = [];

    console.log("Checking new location data against existing geocode data...");
    locations.forEach(location => {
      // Skip if geocode is already logged
      if (geocodes[location.address]) return;

      newGeocodesRequired = true;

      // If latitute & longitude are known from API, log them
      if (location.lat && location.lng) {
        geocodes[location.address] = {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
        };
      }

      // Otherwise, mark address as a Geocoding API candidate
      else {
        geocodeCandidates.push(location.address);
      }
    });

    if (geocodeCandidates.length > 0) {
      console.log("New addresses found that require geocoding...");
    } else {
      console.log("No new addresses found.");
    }

    // Create a promise for each Geocoding API request
    // Add a timeout buffer between each request to prevent API overloading
    const geocodeReqs = geocodeCandidates.map(
      (address, index) =>
        new Promise(resolve => {
          setTimeout(async () => {
            console.log(`Geocoding address ${address}`);

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
            geocodes[address] = coords;
            resolve();
          }, 200 * index);
        })
    );

    Promise.all(geocodeReqs).then(() => {
      if (!newGeocodesRequired) return;
      console.log("Writing new geocode data file...");
      writeFile("src/data/geocodes.json", JSON.stringify(geocodes));
    });
  } catch (error) {
    console.error(error);
  }
};

main();
