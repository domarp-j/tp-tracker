import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

export const query = graphql`
  query TPLocations {
    allTpLocation {
      nodes {
        address
        available
        id
        store
      }
    }
  }
`

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div>
      {JSON.stringify(data.allTpLocation.nodes)}
    </div>
  </Layout>
)

export default IndexPage
