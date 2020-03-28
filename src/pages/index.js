/**
 * TODO:
 * - Error handling
 *   - Maps unavailability
 *   - Failed to fetch stores
 * - Netlify feedback
 * - Remove use of GMaps & FB for security purposes
 *   - Generate geocodes at build time
 */

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { compose } from "ramda";
import FadeIn from "react-fade-in";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

import Layout from "../components/layout";
import Loader from "../components/loader";
import SEO from "../components/seo";
import addressToCoords from "../utils/geocoding";

import tpRoll from "../images/tp-roll.png";

import "./index.css";

/*****************************************************************/
// Data Structures
/*****************************************************************/

const IN_STOCK = "IN_STOCK";
const LIMITED_STOCK_SEE_STORE = "LIMITED_STOCK_SEE_STORE";
const NOT_SOLD_IN_STORE = "NOT_SOLD_IN_STORE";
const OUT_OF_STOCK = "OUT_OF_STOCK";
const UNKNOWN = "UNKNOWN";

// Default center coordinates (at the Washington Monument)
const DEFAULT_CENTER_COORDS = {
  lat: 38.8895,
  lng: -77.0353,
};

// Default zoom level for map
const DEFAULT_ZOOM = 10;

// Apply weights to each availability type for sorting purposes
// Lower sort weight -> higher priority
const SORT_WEIGHT = {
  [IN_STOCK]: 1,
  [LIMITED_STOCK_SEE_STORE]: 2,
  [NOT_SOLD_IN_STORE]: 3,
  [OUT_OF_STOCK]: 4,
  [UNKNOWN]: 5,
};

const BADGE_CLASSES = "text-white text-sm font-semibold py-1 px-2 rounded";

const AVAILABILITY_BADGE = {
  [IN_STOCK]: <div className={`bg-green-500 ${BADGE_CLASSES}`}>In Stock</div>,
  [LIMITED_STOCK_SEE_STORE]: (
    <div className={`bg-yellow-600 ${BADGE_CLASSES}`}>Limited Stock</div>
  ),
  [NOT_SOLD_IN_STORE]: (
    <div className={`bg-gray-600 ${BADGE_CLASSES}`}>Not Sold in Store</div>
  ),
  [OUT_OF_STOCK]: (
    <div className={`bg-gray-600 ${BADGE_CLASSES}`}>Out of Stock</div>
  ),
  [UNKNOWN]: <div className={`bg-gray-600 ${BADGE_CLASSES}`}>Unknown</div>,
};

/*****************************************************************/
// Functions
/*****************************************************************/

const isAvailable = location =>
  [IN_STOCK, LIMITED_STOCK_SEE_STORE].includes(location);

const toScreamingSnake = str => str.toUpperCase().replace(/\s/g, "_");

// Map through TP locations and make some formatting changes
// Also convert NOT_SOLD_IN_STORE availability to OUT_OF_STOCK
const formatTpLocations = locations =>
  locations.map(loc => ({
    ...loc,
    store: `${loc.store[0].toUpperCase()}${loc.store.slice(1)}`,
    available:
      loc.available === NOT_SOLD_IN_STORE
        ? toScreamingSnake(OUT_OF_STOCK)
        : toScreamingSnake(loc.available),
  }));

// Sort TP locations based on weights specified in SORT_WEIGHT mapping
const sortTpLocations = locations =>
  locations.sort(
    (locA, locB) => SORT_WEIGHT[locA.available] - SORT_WEIGHT[locB.available]
  );

// Filter out duplicate locations and locations with unknown TP availability
const filterTpLocations = locations => {
  const addressCache = {};

  return locations.filter(loc => {
    if (addressCache[loc.address]) {
      return false;
    } else {
      addressCache[loc.address] = true;
      return true;
    }
  });
};

/*****************************************************************/
// Page
/*****************************************************************/

const IndexPage = () => {
  const [tpLocations, setTpLocations] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [center, setCenter] = useState(DEFAULT_CENTER_COORDS);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  const showAddressOnMap = address => {
    scrollToMap();
    addressToCoords(address).then(coords => {
      setCenter(coords);
      setZoom(15);
    });
  };

  const focusOnMarker = coords => {
    setCenter(coords);
    setZoom(15);
  };

  const markTpLocations = locations => {
    Promise.all(
      locations
        .filter(loc => isAvailable(loc.available))
        .map(loc => {
          // console.log("~~~~~~~~~~~~~~~~~~~");
          if (loc.lat && loc.lng) {
            // console.log("GC0-api");
            return {
              lat: parseFloat(loc.lat),
              lng: parseFloat(loc.lng),
            };
          }
          return addressToCoords(loc.address);
        })
    ).then(coords => setMarkers(coords));

    return locations;
  };

  const resetMap = () => {
    setZoom(DEFAULT_ZOOM);
    setCenter(DEFAULT_CENTER_COORDS);
  };

  const scrollToMap = () => {
    if (!mapRef) return;

    window.scrollTo(0, mapRef.current.offsetTop);
  };

  const handleZoomChanged = () => {
    if (!mapRef) return;
    if (!mapRef.current) return;

    const mapZoom = mapRef.current.state.map.zoom;

    if (mapZoom !== zoom) {
      setZoom(mapZoom);
    }
  };

  useEffect(() => {
    axios.get(process.env.GATSBY_API_URL).then(res => {
      compose(
        () => setLoading(false),
        setTpLocations,
        markTpLocations,
        filterTpLocations,
        sortTpLocations,
        formatTpLocations
      )(res.data);
    });
  }, []);

  return (
    <Layout>
      <LoadScript
        id="script-loader"
        googleMapsApiKey={process.env.GATSBY_GMAPS_KEY}
      >
        <SEO title="Home" />

        {loading ? (
          <Loader />
        ) : (
          <FadeIn>
            <div>
              <div className="home-header mt-6 mx-auto flex items-center justify-center">
                <img src={tpRoll} alt="Toilet paper roll" className="w-16" />
                <h1 className="text-3xl inline ml-3">DC TP</h1>
              </div>

              <h2 className="text-lg p-2 text-center">
                Outwit the hoaders. Find available toilet paper in Washington,
                DC.
              </h2>
              <div className="text-sm italic mt-4 p-2 text-center">
                Currently supports showing Target, Walmart, and Walgreens stores
                in the DC-Maryland-Virginia area
              </div>

              <GoogleMap
                id="map"
                mapContainerStyle={{
                  height: "400px",
                  maxWidth: "800px",
                  position: "relative",
                }}
                zoom={zoom}
                center={center}
                ref={mapRef}
                onZoomChanged={handleZoomChanged}
              >
                {markers.map((marker, i) => (
                  <Marker
                    key={i}
                    position={marker}
                    onClick={() => focusOnMarker(marker)}
                  />
                ))}
                <button
                  onClick={resetMap}
                  className="bg-white hover:bg-gray-200 shadow-xl py-1 px-2 absolute z-50 border border-gray-400"
                  style={{
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  Reset to center
                </button>
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
                    <div className="text-gray-700 mt-2">
                      {tpLocation.address}
                    </div>
                    {isAvailable(tpLocation.available) && (
                      <div className="mt-2">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => {
                            showAddressOnMap(tpLocation.address);
                          }}
                        >
                          Show on map
                        </button>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 p-4">
                      {AVAILABILITY_BADGE[tpLocation.available] || (
                        <div className={`bg-gray-600 ${BADGE_CLASSES}`}>
                          {tpLocation.available}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </LoadScript>
    </Layout>
  );
};

export default IndexPage;
