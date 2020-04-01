import React from "react";

const Footer = () => (
  <footer className="mt-5 px-2">
    <div className="mt-5">
      <strong>
        DISCLAIMER: Store inventory (especially Target) can be inaccurate
      </strong>
      . If you can verify the availability of a listed product, let us know
      using the "<em>Is this correct?</em>" link for your store.
    </div>
    <div className="text-sm text-right my-5">
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
    </div>
  </footer>
);

export default Footer;
