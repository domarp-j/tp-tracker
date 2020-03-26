/**
 * TODO:
 * - Use GMaps static API instead? More forgiving usage rates.
 */

import React, { useState, useEffect } from "react"
import { GoogleMap, LoadScript } from "@react-google-maps/api"

import Layout from "../components/layout"
import SEO from "../components/seo"

/*******************************************************/
// Data Definitions
/*******************************************************/

const IN_STOCK = "IN_STOCK"
const LIMITED_STOCK_SEE_STORE = "LIMITED_STOCK_SEE_STORE"
const NOT_SOLD_IN_STORE = "NOT_SOLD_IN_STORE"
const OUT_OF_STOCK = "OUT_OF_STOCK"

// Apply weights to each availability type, for sorting purposes
const SORT_WEIGHT = {
  [IN_STOCK]: 0,
  [LIMITED_STOCK_SEE_STORE]: 1,
  [NOT_SOLD_IN_STORE]: 2,
  [OUT_OF_STOCK]: 3,
}

/*******************************************************/
// Functions
/*******************************************************/

// Convert string into SCREAMING_SNAKE_CASE
const toScreamingSnake = str => str.toUpperCase().replace(/\s/, "_")

// Map through TP locations to format data
const formatTpLocations = locations =>
  locations.map(location => ({
    ...location,
    store: `${location.store[0].toUpperCase()}${location.store.slice(1)}`,
    available: toScreamingSnake(location.available),
  }))

// Sort given TP locations by availability
const sortTpLocations = locations =>
  locations.sort(
    (locA, locB) => SORT_WEIGHT[locA.available] - SORT_WEIGHT[locB.available]
  )

/*******************************************************/
// Page
/*******************************************************/

const IndexPage = () => {
  const [tpLocations, setTpLocations] = useState([])

  useEffect(() => {
    fetch(process.env.GATSBY_API_URL)
      .then(res => res.json())
      .then(res => {
        setTpLocations(sortTpLocations(formatTpLocations(res)))
      })
  }, [])

  return (
    <Layout>
      <LoadScript
        id="script-loader"
        googleMapsApiKey={process.env.GATSBY_GMAPS_KEY}
      >
        <SEO title="Home" />

        <div className="home-header mt-6 mx-auto flex items-center justify-center">
          {/* TODO: Add some icons */}
          {/* <div className="image-placeholder h-20 w-20 border-solid border-2"></div> */}
          <h1 className="text-3xl inline ml-3">Toilet Paper Tracker</h1>
        </div>

        <div className="mt-8 zip-code-input text-center">
          <label htmlFor="zip-code">Enter your zip code:</label>
          <input
            disabled
            id="zip-code"
            className="mt-4 block mx-auto border-solid border-2 h-10 text-2xl text-center"
            style={{ maxWidth: 200 }}
          ></input>
        </div>

        <GoogleMap
          id="map"
          mapContainerStyle={{
            height: "400px",
            maxWidth: "800px",
            marginTop: "48px",
          }}
          zoom={12}
          center={{
            lat: -3.745,
            lng: -38.523,
          }}
        />

        <div className="border-2 border-gray-400">
          {tpLocations.map(tpLocation => (
            <div
              key={`${tpLocation.store} ${tpLocation.id} ${tpLocation.address}`}
              className="border-b-2 border-gray-400 p-4"
            >
              <div>{tpLocation.store}</div>
              <div>{tpLocation.address}</div>
              <div>{tpLocation.available}</div>
            </div>
          ))}
        </div>

        {/* <div className="mt-20">
          {JSON.stringify(tpLocations)}
        </div> */}
      </LoadScript>
    </Layout>
  )
}

export default IndexPage
