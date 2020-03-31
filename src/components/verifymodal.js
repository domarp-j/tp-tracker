import React, { useState } from "react";
import PropTypes from "prop-types";
import SweetAlert from "react-bootstrap-sweetalert";
import { ThumbsDown, ThumbsUp } from "react-feather";

export const VerifyModal = ({ onInStock, onOutOfStock, onCancel }) => {
  const [modalPage, setModalPage] = useState(0);

  return (
    <div>
      {modalPage === 0 && (
        <SweetAlert showConfirm={false} onConfirm={() => {}} title="">
          <h2 className="text-3xl pb-6 font-bold">Is this item in stock?</h2>
          <p className="mb-8 text-lg text-left px-6">
            If you have been to this store in the{" "}
            <span className="font-semibold">past day</span>, let other users
            know if this product is available or unavailable.
          </p>
          <div className="flex justify justify-around mb-6">
            <button
              title="In stock"
              onClick={() => {
                onInStock();
                setModalPage(1);
              }}
            >
              <ThumbsUp size="90" color="green" />{" "}
            </button>
            <button
              title="Out of stock"
              onClick={() => {
                onOutOfStock();
                setModalPage(1);
              }}
            >
              <ThumbsDown size="90" className={"text-red-700"} />
            </button>
          </div>
          <div className="mt-6">
            <button
              className="float-right text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onCancel}
            >
              Close
            </button>
          </div>
        </SweetAlert>
      )}
      {modalPage === 1 && (
        <SweetAlert showConfirm={false} onConfirm={() => {}} title="">
          <h2 className="text-3xl pb-6 font-bold">
            Thank you for letting us know!
          </h2>
          <div className="mt-6">
            <button
              className="float-right text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onCancel}
            >
              Close
            </button>
          </div>
        </SweetAlert>
      )}
    </div>
  );
};

VerifyModal.propTypes = {
  onInStock: PropTypes.func.isRequired,
  onOutOfStock: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default VerifyModal;
