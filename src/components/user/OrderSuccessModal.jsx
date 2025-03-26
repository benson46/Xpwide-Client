import React from "react";
import PropTypes from "prop-types"; 
export default function OrderSuccessModal({ isOpen, amount, onClose }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Order success</h2>
            <div className="mb-4">
              <p className="text-gray-600 mb-1">Amount</p>
              <p className="text-2xl font-bold">₹{amount}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            >
              Orders page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  OrderSuccessModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    amount: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
  };
  