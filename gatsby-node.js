/*****************************************************************/
// Exports
/*****************************************************************/

const fs = require("fs");

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  if (stage === "build-html") {
    actions.setWebpackConfig({
      externals: getConfig().externals.concat(function(_, request, callback) {
        const regex = /^@?firebase(\/(.+))?/;
        // Exclude firebase products from being bundled, so they will be loaded using require() at runtime.
        if (regex.test(request)) {
          return callback(null, "umd " + request);
        }
        callback();
      }),
    });
  }
};

exports.onPostBuild = async () => {
  const firebase = require("firebase/app");

  require("firebase/firestore");

  require("dotenv").config({
    path: `.env.${process.env.NODE_ENV}`,
  });

  firebase.initializeApp({
    apiKey: process.env.GATSBY_FIREBASE_API_KEY,
    authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
  });

  const snapshot = await firebase
    .firestore()
    .collection("coordinates")
    .get();

  let docData;

  fs.writeFile(
    "src/data/geocode.json",
    JSON.stringify(
      snapshot.docs.reduce((accum, doc) => {
        docData = doc.data();
        accum[docData.address] = {
          lat: docData.lat,
          lng: docData.lng,
        };
        return accum;
      }, {}) || {}
    ),
    err => {
      console.error(
        "Something went wrong while trying to create geocode JSON: ",
        err
      );
    }
  );
};
