import React, { useState, useEffect } from "react";

import "./loader.css";
import tpRoll from "../images/tp-roll.png";

const Loader = () => {
  const [error, displayError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      displayError(true);
    }, 10000);

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
        {error && (
          <>
            <div className="mt-5 text-left">We broke something. Apologies!</div>
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
