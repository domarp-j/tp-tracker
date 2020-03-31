import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { compose } from "ramda";
import FadeIn from "react-fade-in";
import { GoogleMap, InfoBox, LoadScript, Marker } from "@react-google-maps/api";
import { Share2 } from "react-feather";
import { Link } from "gatsby";

import Footer from "../components/footer";
import Layout from "../components/layout";
import Loader from "../components/loader";
import SEO from "../components/seo";
import VerifyModal from "../components/verifymodal";

import geocodeData from "../data/geocodes.json";
import {
  read as readVerifications,
  write as writeVerifications,
} from "../db/verifications";
import tpRoll from "../images/tp-roll.png";

import "./index.css";

/*****************************************************************/
// Data Structures
/*****************************************************************/

// Availability types
const IN_STOCK = "IN_STOCK";
const LIMITED_STOCK = "LIMITED_STOCK";
const LIMITED_STOCK_SEE_STORE = "LIMITED_STOCK_SEE_STORE";
const NOT_SOLD_IN_STORE = "NOT_SOLD_IN_STORE";
const OUT_OF_STOCK = "OUT_OF_STOCK";
const UNKNOWN = "UNKNOWN";
const DISCONTINUED = "DISCONTINUED";

// Product types
const TP = "tp"; // Toilet paper
const HS = "hs"; // Hand sanitizer

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
  [LIMITED_STOCK]: 2,
  [LIMITED_STOCK_SEE_STORE]: 2,
  [NOT_SOLD_IN_STORE]: 3,
  [OUT_OF_STOCK]: 4,
  [UNKNOWN]: 5,
  [DISCONTINUED]: 5,
};

const BADGE_CLASSES = "text-white text-sm font-semibold py-1 px-2 rounded";

const AVAILABILITY_BADGE = {
  [IN_STOCK]: <div className={`bg-green-500 ${BADGE_CLASSES}`}>In Stock</div>,
  [LIMITED_STOCK]: (
    <div className={`bg-yellow-600 ${BADGE_CLASSES}`}>Limited Stock</div>
  ),
  [LIMITED_STOCK_SEE_STORE]: (
    <div className={`bg-yellow-600 ${BADGE_CLASSES}`}>Limited Stock</div>
  ),
  [NOT_SOLD_IN_STORE]: (
    <div className={`bg-gray-600 ${BADGE_CLASSES}`}>Not Sold in Store</div>
  ),
  [OUT_OF_STOCK]: (
    <div className={`bg-gray-600 ${BADGE_CLASSES}`}>Out of Stock</div>
  ),
};

const STORES = {
  WALMART: "Walmart",
  TARGET: "Target",
  WALGREENS: "Walgreens",
  CVS: "CVS",
};

/*****************************************************************/
// Functions
/*****************************************************************/

const isAvailable = available =>
  [IN_STOCK, LIMITED_STOCK, LIMITED_STOCK_SEE_STORE].includes(available);

const isInvalidAvailability = available =>
  [UNKNOWN, DISCONTINUED].includes(available);

const toScreamingSnake = str => str.toUpperCase().replace(/\s/g, "_");

// Map through locations and make some formatting changes
// Also convert NOT_SOLD_IN_STORE availability to OUT_OF_STOCK
const formatLocations = locations =>
  locations.map(loc => ({
    ...loc,
    store: STORES[loc.store.toUpperCase()],
    available:
      loc.available === NOT_SOLD_IN_STORE
        ? toScreamingSnake(OUT_OF_STOCK)
        : toScreamingSnake(loc.available),
    type: loc.type || TP,
    lat: loc.lat ? parseFloat(loc.lat) : loc.lat,
    lng: loc.lng ? parseFloat(loc.lng) : loc.lng,
  }));

// Filter out any locations that have "bad" availability values, e.g.
// UNKNOWN or DISCONTINUED
const filterInvalidLocations = locations =>
  locations.filter(loc => !isInvalidAvailability(loc.available));

// Sort locations based on weights specified in SORT_WEIGHT mapping
const sortLocations = locations =>
  locations.sort(
    (locA, locB) => SORT_WEIGHT[locA.available] - SORT_WEIGHT[locB.available]
  );

// Filter locations based on a given product
const filterLocationsByType = type => locations =>
  locations.filter(loc => loc.type === type);

// Filter out duplicate addresses
const filterDuplicateLocations = locations => {
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
  /*****************************************************************/
  // State
  /*****************************************************************/

  // Toilet paper locations
  const [tpLocations, setTpLocations] = useState([]);
  // Hand sanitizer locations
  const [hsLocations, setHsLocations] = useState([]);
  // Currently selected product
  const [productType, setProductType] = useState(TP);
  // Coordinates to place map markers
  const [markers, setMarkers] = useState([]);
  // Verification modal
  const [storeToVerify, setStoreToVerify] = useState(null);
  // Map zoom level
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  // Map center coordinates
  const [center, setCenter] = useState(DEFAULT_CENTER_COORDS);
  // User's IP address
  const [userIP, setIP] = useState();
  // Loading state
  const [loading, setLoading] = useState(true);
  // Display info-box for a specific marker
  const [infobox, setInfobox] = useState();
  // Store verification data
  const [verifications, setVerifications] = useState({
    [TP]: {},
    [HS]: {},
  });

  /*****************************************************************/
  // Refs
  /*****************************************************************/

  // Ref for GoogleMap component
  const mapRef = useRef(null);

  /*****************************************************************/
  // Component-Scoped Functions
  /*****************************************************************/

  // When "Show on map" is selected, scroll to map and show marker
  const showAddressOnMap = address => {
    if (!geocodeData[address]) return;
    scrollToMap();
    setCenter(geocodeData[address]);
    setZoom(15);
  };

  // When a marker is cleared, zoom in and focus on it
  const focusOnMarker = coords => {
    setCenter(coords);
    setZoom(15);
  };

  const getCoords = location => {
    // If API already provided lat/lng, use those values
    if (location.lat && location.lng) {
      return {
        ...location,
        lat: location.lat,
        lng: location.lng,
      };
    }
    // Get geocode data from local JSON file, if it's there
    if (geocodeData[location.address]) {
      return {
        ...location,
        ...geocodeData[location.address],
      };
    }
    return null;
  };

  // Set marker locations based on stores with TP/HS availability
  const markLocations = locations => {
    const markers = locations
      .filter(loc => isAvailable(loc.available))
      .map(loc => getCoords(loc))
      .filter(loc => loc);

    setMarkers(markers);
    return locations;
  };

  // Get verification/dispute data for locations
  const getVerificationData = async (locations, productType) => {
    const res = await Promise.all(
      locations
        .filter(loc => isAvailable(loc.available))
        .map(loc => readVerifications({ store: loc, productType }))
    );

    setVerifications({
      ...verifications,
      [productType]: {
        ...verifications[productType],
        ...res
          .filter(vData => vData)
          .reduce((accum, vData) => {
            accum[Object.keys(vData)[0]] = Object.values(vData)[0];
            return accum;
          }, {}),
      },
    });
  };

  // Reset the map to center on Washington, DC
  const resetMap = () => {
    setZoom(DEFAULT_ZOOM);
    setCenter(DEFAULT_CENTER_COORDS);
    setInfobox(null);
  };

  // When "Show on map" is selected, scroll to the map
  const scrollToMap = () => {
    if (!mapRef) return;
    if (!mapRef.current) return;
    window.scrollTo(0, mapRef.current.offsetTop);
  };

  // Keep map zoom in sync with local state zoom
  const handleZoomChanged = () => {
    if (!mapRef) return;
    if (!mapRef.current) return;
    const mapZoom = mapRef.current.state.map.zoom;
    if (mapZoom !== zoom) setZoom(mapZoom);
  };

  // Add share link using Web Share API
  const shareApp = () => {
    if (!navigator.share) return;

    navigator
      .share({
        title: "Find toilet paper and hand sanitizer in the DMV area.",
        url: "http://get-me-tp.today/",
      })
      .catch(console.error);
  };

  const verificationsForLocation = location =>
    verifications[productType][location.address];

  const locationUpvotes = location =>
    verificationsForLocation(location).filter(val => val.available).length;

  const locationDownvotes = location =>
    verificationsForLocation(location).filter(val => !val.available).length;

  /*****************************************************************/
  // Mount/Update/Unmount Behavior
  /*****************************************************************/

  useEffect(() => {
    // Fetch store data from API
    axios.get(process.env.GATSBY_API_URL).then(res => {
      if (!res.data) return; // TODO: Error handling

      const locations = compose(
        sortLocations,
        filterInvalidLocations,
        formatLocations
      )(res.data);

      compose(
        locations => {
          getVerificationData(locations, TP);
          return locations;
        },
        locations => {
          setLoading(false);
          return locations;
        },
        markLocations,
        locations => {
          setTpLocations(locations);
          return locations;
        },
        filterDuplicateLocations,
        filterLocationsByType(TP)
      )(locations);

      compose(
        setHsLocations,
        filterDuplicateLocations,
        filterLocationsByType(HS)
      )(locations);
    });
  }, []);

  useEffect(() => {
    // Get user IP address to prevent duplicate
    axios.get("https://www.cloudflare.com/cdn-cgi/trace").then(result => {
      // convert plain text to json
      var data = result.data.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
      data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
      var jsondata = JSON.parse(data);
      setIP(jsondata.ip);
    });
  }, []);

  /*****************************************************************/
  // Component JSX
  /*****************************************************************/

  return (
    <Layout>
      <LoadScript
        id="script-loader"
        loadingElement={<Loader />}
        googleMapsApiKey={process.env.GATSBY_GMAPS_KEY}
      >
        <SEO title="Home" />

        {loading ? (
          <Loader />
        ) : (
          <FadeIn>
            {storeToVerify && (
              <VerifyModal
                onInStock={() => {
                  writeVerifications({
                    store: storeToVerify,
                    productType,
                    userIP,
                    available: true,
                  });
                  getVerificationData([storeToVerify], productType);
                }}
                onOutOfStock={() => {
                  writeVerifications({
                    store: storeToVerify,
                    productType,
                    userIP,
                    available: false,
                  });
                  getVerificationData([storeToVerify], productType);
                }}
                onCancel={() => {
                  setStoreToVerify(null);
                }}
              />
            )}
            <div>
              <div className="home-header mt-6 mx-auto flex items-center justify-center">
                <img src={tpRoll} alt="Toilet paper roll" className="w-16" />
                <h1 className="text-3xl inline ml-3">Get Me TP</h1>
              </div>

              <h2 className="text-md p-2 my-4">
                Find available toilet paper (and hand sanitizer) at stores in
                Washington D.C., Maryland, and Virginia.
              </h2>

              <div className="mb-1 px-2 w-full flex justify-end">
                {navigator.share && (
                  <button
                    title="Share"
                    className="inline-block pr-2"
                    onClick={shareApp}
                  >
                    <Share2 />
                  </button>
                )}
                <Link className="text-blue-600 underline" to="/feedback">
                  Feedback?
                </Link>
              </div>

              <GoogleMap
                id="map"
                mapContainerStyle={{
                  height: "400px",
                  maxWidth: "800px",
                  position: "relative",
                  marginTop: "15px",
                }}
                zoom={zoom}
                center={center}
                ref={mapRef}
                onZoomChanged={handleZoomChanged}
              >
                {markers.map((marker, i) => (
                  <div key={i}>
                    <Marker
                      position={marker}
                      onClick={() => {
                        focusOnMarker(marker);
                        setInfobox(marker);
                      }}
                    />
                    {infobox && infobox.address === marker.address && (
                      <InfoBox
                        position={marker}
                        onCloseClick={() => setInfobox(null)}
                      >
                        <div className="bg-white p-2 rounded max-w-xs border-2 border-gray-300">
                          <div className="text-lg">{marker.store}</div>
                          <div className="mt-2 text-sm text-gray-700">
                            {marker.address.toUpperCase()}
                          </div>
                          <div className="mt-2">
                            <a
                              className="text-blue-600 text-sm underline"
                              href={marker.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View product
                            </a>
                            <button
                              className="text-blue-600 underline pl-2 text-sm"
                              onClick={() => setStoreToVerify(marker)}
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      </InfoBox>
                    )}
                  </div>
                ))}
                <button
                  onClick={resetMap}
                  className="bg-white hover:bg-gray-200 shadow-xl py-1 px-2 absolute z-50 border border-gray-400"
                  style={{
                    bottom: "8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  Reset to center
                </button>
              </GoogleMap>

              <div>
                <button
                  className={`w-1/2 py-2 ${
                    productType === TP
                      ? "bg-green-600 text-white font-bold"
                      : "bg-white hover:bg-gray-300 focus:bg-gray-300 border-t-2 border-l-2 border-gray-400"
                  }`}
                  onClick={() => {
                    setProductType(TP);
                    resetMap();
                    markLocations(tpLocations);
                  }}
                >
                  Find toilet paper
                </button>
                <button
                  className={`w-1/2 py-2 ${
                    productType === HS
                      ? "bg-green-600 text-white font-bold"
                      : "bg-white hover:bg-gray-300 focus:bg-gray-300 border-t-2 border-l-2 border-r-2 border-gray-400 "
                  }`}
                  onClick={() => {
                    setProductType(HS);
                    resetMap();
                    getVerificationData(hsLocations, HS);
                    markLocations(hsLocations);
                  }}
                >
                  Find hand sanitizer
                </button>
              </div>

              <div className="border-2 border-gray-400">
                {(productType === TP ? tpLocations : hsLocations).map(loc => (
                  <div
                    key={`${loc.store} ${loc.id} ${loc.address}`}
                    className={`border-b-2 border-gray-400 p-4 relative ${
                      !isAvailable(loc.available) ? "opacity-50" : ""
                    }`}
                  >
                    <div className="text-2xl">{loc.store}</div>
                    <div className="text-gray-700 mt-2">
                      {loc.address.toUpperCase()}
                    </div>
                    {isAvailable(loc.available) && (
                      <div className="mt-2">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => {
                            showAddressOnMap(loc.address);
                            setInfobox(loc);
                          }}
                        >
                          Show on map
                        </button>
                        {loc.url && (
                          <>
                            ｜
                            <a
                              className="text-blue-600 underline"
                              href={loc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View product
                            </a>
                          </>
                        )}
                      </div>
                    )}
                    {isAvailable(loc.available) && (
                      <div className="mt-2">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => setStoreToVerify(loc)}
                        >
                          Is this correct?
                        </button>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 p-4">
                      {AVAILABILITY_BADGE[loc.available] || (
                        <div className={`bg-gray-600 ${BADGE_CLASSES}`}>
                          {loc.available}
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 right-0 p-4 text-sm text-right text-gray-700">
                      {verificationsForLocation(loc) &&
                        locationUpvotes(loc) > 0 && (
                          <div>Verified by {locationUpvotes(loc)}</div>
                        )}
                      {verificationsForLocation(loc) &&
                        locationDownvotes(loc) > 0 && (
                          <div>Disputed by {locationDownvotes(loc)}</div>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              <Footer />
            </div>
          </FadeIn>
        )}
      </LoadScript>
    </Layout>
  );
};

export default IndexPage;
