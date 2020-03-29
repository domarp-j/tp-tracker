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
          name="feedback"
          method="post"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          action="/thanks"
        >
          <input type="hidden" name="form-name" value="feedback" />
          <div className="text-xl">
            Tell us how we can improve Get Me TP. Your feedback is important to
            us!
          </div>
          <div className="mt-5">
            <label className="text-lg" htmlFor="email">
              Email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="p-2 block border border-gray-500 w-full mt-1 mb-5"
            />
            <label className="text-lg" htmlFor="message">
              Feedback
            </label>
            <textarea
              id="message"
              name="message"
              className="p-2 block border border-gray-500 w-full mt-1"
              rows="6"
            ></textarea>
          </div>
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
