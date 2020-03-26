/**
 * TODO:
 * - Use GMaps static API instead? More forgiving usage rates.
 * - Add loading states
 *   - Loading page
 *   - Showing store on map
 * - Error handling
 *   - Maps unavailability
 *   - Failed to fetch stores
 */

import React, { useState, useEffect } from "react"
import axios from "axios"
import { compose } from "ramda"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

import Layout from "../components/layout"
import SEO from "../components/seo"

/*******************************************************/
// Data Structures
/*******************************************************/

const IN_STOCK = "IN_STOCK"
const LIMITED_STOCK_SEE_STORE = "LIMITED_STOCK_SEE_STORE"
const NOT_SOLD_IN_STORE = "NOT_SOLD_IN_STORE"
const OUT_OF_STOCK = "OUT_OF_STOCK"

const MAX_MARKER_COUNT = 3

// Washington Monument coordinates
const DEFAULT_CENTER_COORDS = {
  lat: 38.8895,
  lng: -77.0353,
}

// Apply weights to each availability type, for sorting purposes
const SORT_WEIGHT = {
  [IN_STOCK]: 0,
  [LIMITED_STOCK_SEE_STORE]: 1,
  [NOT_SOLD_IN_STORE]: 2,
  [OUT_OF_STOCK]: 3,
}

// Given availability, return JSX for availability badge
const AVAILABILITY = {
  [IN_STOCK]: (
    <div className="bg-green-500 text-white text-sm font-semibold py-1 px-2 rounded">
      In Stock
    </div>
  ),
  [LIMITED_STOCK_SEE_STORE]: (
    <div className="bg-yellow-600 text-white text-sm font-semibold py-1 px-2 rounded">
      Limited Stock
    </div>
  ),
  [NOT_SOLD_IN_STORE]: (
    <div className="bg-gray-600 text-white text-sm font-semibold py-1 px-2 rounded">
      Not Sold in Store
    </div>
  ),
  [OUT_OF_STOCK]: (
    <div className="bg-gray-600 text-white text-sm font-semibold py-1 px-2 rounded">
      Out of Stock
    </div>
  ),
}

/*******************************************************/
// Functions
/*******************************************************/

const formatTpLocations = locations =>
  locations.map(loc => ({
    ...loc,
    store: `${loc.store[0].toUpperCase()}${loc.store.slice(1)}`,
    available: loc.available.toUpperCase().replace(/\s/g, "_"),
  }))

const sortTpLocations = locations =>
  locations.sort(
    (locA, locB) => SORT_WEIGHT[locA.available] - SORT_WEIGHT[locB.available]
  )

const removeDuplicateLocations = locations => {
  const addressCache = {}
  return locations.filter(loc => {
    if (addressCache[loc.address]) {
      return false
    } else {
      addressCache[loc.address] = true
      return true
    }
  })
}

const isAvailable = location =>
  [IN_STOCK, LIMITED_STOCK_SEE_STORE].includes(location)

const addressToCoords = async address => {
  try {
    const req = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address,
          key: process.env.GATSBY_GMAPS_KEY,
        },
      }
    )

    return req.data.results[0].geometry.location
  } catch (error) {
    console.error(error)
    // TODO: Error handling
  }
}

/*******************************************************/
// Page
/*******************************************************/

const IndexPage = () => {
  const [tpLocations, setTpLocations] = useState([])
  const [markers, setMarkers] = useState([])
  const [zoom, setZoom] = useState(10)
  const [center, setCenter] = useState(DEFAULT_CENTER_COORDS)

  const showAddressOnMap = async address => {
    addressToCoords(address).then(coords => {
      setMarkers([coords])
      setCenter(coords)
    })
  }

  const markTpLocations = locations => {
    let addresses = []
    // let markerCount = 0

    locations.forEach(loc => {
      // if (markerCount === MAX_MARKER_COUNT) return
      if (isAvailable(loc.available)) {
        // markerCount++
        addresses.push(loc.address)
      }
    })

    Promise.all(
      addresses.map(address => addressToCoords(address))
    ).then(coords => setMarkers(coords))

    return locations
  }

  useEffect(() => {
    axios.get(process.env.GATSBY_API_URL).then(res => {
      compose(
        setTpLocations,
        markTpLocations,
        removeDuplicateLocations,
        sortTpLocations,
        formatTpLocations
      )(res.data)
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
          {/* TODO: Add a logo */}
          {/* <div className="image-placeholder h-20 w-20 border-solid border-2"></div> */}
          <h1 className="text-3xl inline ml-3">Toilet Paper Tracker</h1>
        </div>

        <div className="mt-4 zip-code-input text-center">
          <label htmlFor="zip-code">Enter your zip code:</label>
          <input
            disabled
            id="zip-code"
            className="mt-4 block mx-auto border-solid border-2 h-10 text-2xl text-center"
            style={{ maxWidth: 200 }}
            value="22180"
          ></input>
          <div className="text-sm italic mt-2">
            <span className="font-semibold">BETA</span> - Currently supporting
            the DC-Maryland-Virginia area
          </div>
        </div>

        <GoogleMap
          id="map"
          mapContainerStyle={{
            height: "400px",
            maxWidth: "800px",
            marginTop: "44px",
          }}
          zoom={zoom}
          center={center}
        >
          {markers.map((marker, i) => (
            <Marker key={i} position={marker} />
          ))}
        </GoogleMap>

        <div className="border-2 border-gray-400">
          {tpLocations.map(tpLocation => (
            <div
              key={`${tpLocation.store} ${tpLocation.id} ${tpLocation.address}`}
              className={`border-b-2 border-gray-400 p-4 relative ${
                !isAvailable(tpLocation.available) ? "opacity-50" : ""
              }`}
            >
              <div className="text-xl">{tpLocation.store}</div>
              <div className="text-gray-700 mt-2">{tpLocation.address}</div>
              {isAvailable(tpLocation.available) && (
                <div className="mt-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => {
                      showAddressOnMap(tpLocation.address)
                      setZoom(12)
                    }}
                  >
                    Show on map
                  </button>
                </div>
              )}
              <div className="absolute top-0 right-0 p-4">
                {AVAILABILITY[tpLocation.available] || tpLocation.available}
              </div>
            </div>
          ))}
        </div>
      </LoadScript>
    </Layout>
  )
}

export default IndexPage
