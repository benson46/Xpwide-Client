import React from "react";
import PropTypes from "prop-types";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
}) {
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  return (
    <div className="flex justify-between items-center px-4 py-2 border-t border-gray-800">
      <span className="text-sm text-gray-400">
        Showing {(validCurrentPage - 1) * itemsPerPage + 1}-
        {Math.min(validCurrentPage * itemsPerPage, totalItems)} of {totalItems}
      </span>

      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            validCurrentPage === 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
          disabled={validCurrentPage === 1}
          onClick={() => {
            console.log("Previous clicked, new page:", validCurrentPage - 1);
            if (validCurrentPage > 1) onPageChange(validCurrentPage - 1);
          }}
        >
          Previous
        </button>

        <span className="text-sm font-medium text-gray-300">
          Page {validCurrentPage} of {totalPages}
        </span>

        <button
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            validCurrentPage === totalPages
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
          disabled={validCurrentPage === totalPages}
          onClick={() => {
            console.log("Next clicked, new page:", validCurrentPage + 1);
            if (validCurrentPage < totalPages) onPageChange(validCurrentPage + 1);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number,
  totalItems: PropTypes.number,
};
