import React from "react";
import { Link } from "gatsby";
import FadeIn from "react-fade-in";

import Layout from "../components/layout";

const Feedback = () => (
  <Layout>
    <FadeIn>
      <div
        className="fixed w-full max-w-md py-4 px-3 border border-gray-500 rounded"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="text-xl font-bold">Thank you!</div>
        <p className="mt-2">Your feedback has been received.</p>
        <div className="mt-5">
          <Link
            className="float-right text-xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            to="/"
          >
            Back
          </Link>
        </div>
      </div>
    </FadeIn>
  </Layout>
);

export default Feedback;
