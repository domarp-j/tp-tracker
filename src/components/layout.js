import React from "react"
import PropTypes from "prop-types"

import "./styles.css"

const Layout = ({ children }) => (
  <div className="mx-auto max-w-screen-md">
    <main>{children}</main>
    <footer className="text-center mt-12">
      © {new Date().getFullYear()}, Built with
      {` `}
      <a href="https://www.gatsbyjs.org">Gatsby</a>
    </footer>
  </div>
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
