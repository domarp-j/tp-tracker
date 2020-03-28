import React from "react";
import PropTypes from "prop-types";

import "./styles.css";

const Layout = ({ children }) => (
  <div className="mx-auto max-w-screen-md">
    <main>{children}</main>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
