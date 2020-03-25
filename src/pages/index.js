import React, { useState, useEffect } from "react"

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
      <SEO title="Home" />
      <h1>Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>
      <div>
        {JSON.stringify(tpLocations)}
      </div>
    </Layout>
  )
}

export default IndexPage
