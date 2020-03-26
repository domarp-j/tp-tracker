import React, { useState, useEffect } from "react"
import { GoogleMap, LoadScript } from '@react-google-maps/api'

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => {
  const [tpLocations, setTpLocations] = useState([])

  useEffect(() => {
    fetch(process.env.GATSBY_API_URL)
      .then(res => res.json())
      .then(res => {
        setTpLocations(res)
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
          <div className="image-placeholder h-20 w-20 border-solid border-2"></div>
          <h1 className="text-3xl inline ml-3">Toilet Paper Tracker</h1>
        </div>

        <div className="mt-8 zip-code-input text-center">
          <label htmlFor="zip-code">Enter your zip code:</label>
          <input
            disabled
            id="zip-code"
            className="mt-4 block mx-auto border-solid border-2 h-10 text-2xl text-center"
            style={{ maxWidth: 200 }}>
          </input>
        </div>

        <GoogleMap id='map'>
          Test
        </GoogleMap>

        <div className="mt-20">
          {JSON.stringify(tpLocations)}
        </div>
      </LoadScript>
    </Layout>
  )
}

export default IndexPage
