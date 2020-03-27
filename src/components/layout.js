import React from "react";
import PropTypes from "prop-types";

import "./styles.css";

const Layout = ({ children }) => (
  <div className="mx-auto max-w-screen-md">
    <main>{children}</main>
    <footer className="text-center mt-8 mb-4">
      © {new Date().getFullYear()}. Built by{" "}
      <a
        href="https://github.com/sepehr500"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 visited:text-purple-900 underline"
      >
        Sepehr Sobhani
      </a>{" "}
      and{" "}
      <a
        href="https://github.com/domarp-j"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 visited:text-purple-700 underline"
      >
        Pramod Jacob
      </a>
      .
    </footer>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
