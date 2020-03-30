/*****************************************************************/
// Firebase Configuration
/*****************************************************************/

import * as firebase from "firebase/app";
import "firebase/database";

const config = {
  apiKey: process.env.GATSBY_FB_API_KEY,
  authDomain: process.env.GATSBY_FB_AUTH_DOMAIN,
  databaseURL: process.env.GATSBY_FB_DB_URL,
  storageBucket: process.env.GATSBY_FB_STORAGE_BUCKET,
};

firebase.initializeApp(config);

const db = firebase.database();

/*****************************************************************/
// Read/Write API
/*****************************************************************/

/**
 * Fetch upvotes & downvotes for each store address
 * @param {object[]} stores - A list of stores.
 * @returns {object} - Upvote/downvote data for each address.
 */
export const read = stores => {};

/**
 * Store an upvote/downvote entry for a store,
 * @param {object} store - The upvoted/downvoted store.
 * @param {object} data - Details of the upvote/downvote entry.
 * @returns {boolean} - If true, write operation was a success.
 */
export const write = (store, data) => {
  db.ref(`stores/testStore`).set({ hello: "world" }, err => {
    if (err) throw err;
    else console.log("Success!");
  });
};
