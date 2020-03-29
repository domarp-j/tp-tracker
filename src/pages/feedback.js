import React from "react";
import { Link } from "gatsby";

import Layout from "../components/layout";

const Feedback = ({ onCancel }) => (
  <Layout>
    <div
      className="fixed w-full max-w-xl p-3"
      style={{
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <form name="feedback-form" method="POST" data-netlify="true">
        <label className="text-xl" htmlFor="feedback">
          Your feedback is always welcome and appreciated!
        </label>
        <textarea
          id="feedback"
          name="feedback"
          className="block border border-gray-500 w-full mt-3"
          rows="6"
        ></textarea>
        <button
          className="float-right text-xl mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Send
        </button>
        <Link
          className="hover:bg-gray-300 float-right text-xl mt-3 mr-3 py-2 px-4 rounded"
          to="/"
        >
          Cancel
        </Link>
      </form>
    </div>
  </Layout>
);

export default Feedback;
