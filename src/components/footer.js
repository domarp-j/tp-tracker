import React from "react";

const Footer = () => (
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
);

export default Footer;
