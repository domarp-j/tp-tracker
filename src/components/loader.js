import React, { useState, useEffect } from "react";

import "./loader.css";
import tpRoll from "../images/tp-roll.png";

const Loader = () => {
  const [longLoadTime, displayLoadMessage] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      displayLoadMessage(true);
    }, 15000);

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <div className="w-screen h-screen">
      <div
        className="fixed text-center w-screen"
        style={{
          top: "50%",
          left: "50%",
          maxWidth: 300,
          transform: "translate(-50%, -50%)",
        }}
      >
        <img
          className="fade-in-out mx-auto"
          src={tpRoll}
          alt="Toilet paper roll loading screen"
          style={{
            width: 200,
          }}
        />
        {!longLoadTime && (
          <div className="mt-5">Finding toilet paper near you. Sit tight!</div>
        )}
        {longLoadTime && (
          <>
            <div className="mt-5 text-left">
              We're taking a bit longer than expected. Apologies!
            </div>
            <div className="mt-3 text-left">
              We're working to get you to toilet paper as fast as possible.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Loader;
