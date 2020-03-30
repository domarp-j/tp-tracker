/**
 * This file provides a read & write interface for storing customer
 * product verifications.
 *
 * A verification is a  verified (or disputed) product availability
 * claim.
 */

import md5 from "blueimp-md5";

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
 * Fetch verification data for each store address
 * @param {object[]} stores - A list of stores.
 * @param {enum} productType - The product type: TP or HS.
 * @returns {object} - Upvote/downvote data for each address.
 */
export const read = async (store, productType) => {
  const hashedAddress = md5(store.address.toUpperCase());
  const pType = productType.toUpperCase();

  const snapshot = await db
    .ref(`stores/${hashedAddress}/${pType}`)
    .once("value");

  if (!snapshot.val()) return;

  return Object.values(snapshot.val());
};

/**
 * Store verification entry for a store,
 * @param {object} store - Store with new verification data.
 * @param {enum} productType - The product type: TP or HS.
 * @param {boolean} available
 * - If true, product has been verified as available at store.
 * - If false, product's availability has been disputed.
 */
export const write = (store, productType, available) => {
  const hashedAddress = md5(store.address.toUpperCase());
  const pType = productType.toUpperCase();

  db.ref(`stores/${hashedAddress}/${pType}`)
    .push()
    .set(
      {
        available,
        timestamp: new Date().toISOString(),
      },
      err => {
        if (err) throw err;
      }
    );
};
