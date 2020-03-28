import React from "react";

import "./loader.css";
import tpRoll from "../images/tp-roll.png";

const Loader = () => (
  <div className="w-screen h-screen">
    <img
      className="fixed fade-in-out"
      src={tpRoll}
      alt="Toilet paper roll loading screen"
      style={{
        width: 200,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    />
  </div>
);

export default Loader;
