import React from "react";
import { Link } from "gatsby";
import FadeIn from "react-fade-in";

import Layout from "../components/layout";

const Feedback = () => (
  <Layout>
    <FadeIn>
      <div
        className="fixed w-full max-w-xl p-3 border border-gray-500 rounded"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <form
          name="contact"
          method="post"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          action="/thanks"
        >
          <input type="hidden" name="form-name" value="contact" />
          <label className="text-xl" htmlFor="feedback">
            Tell us how we can improve Get Me TP. Your feedback is important to
            us!
          </label>
          <textarea
            id="feedback"
            name="feedback"
            className="p-2 block border border-gray-500 w-full mt-5"
            rows="6"
          ></textarea>
          <div className="mt-5">
            <button
              className="float-right text-xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Send
            </button>
            <Link
              className="hover:bg-gray-300 float-right text-xl mr-3 py-2 px-4 rounded"
              to="/"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </FadeIn>
  </Layout>
);

export default Feedback;
