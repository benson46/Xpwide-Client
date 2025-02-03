import React from "react";
import PropTypes from "prop-types";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
}) {
  // Ensure valid values for pagination calculations
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages); // Clamp between 1 and totalPages
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Handle case when there are no items
  const startItem = totalItems === 0 ? 0 : Math.min((validCurrentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = totalItems === 0 ? 0 : Math.min(validCurrentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-medium text-white">{startItem}</span>{" "}
          -{" "}
          <span className="font-medium text-white">{endItem}</span>{" "}
          of <span className="font-medium text-white">{totalItems}</span>{" "}
          results
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {/* Previous Button */}
            <button
              onClick={() => onPageChange(validCurrentPage - 1)}
              disabled={validCurrentPage === 1 || totalItems === 0}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={totalItems === 0}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-800
                    ${
                      validCurrentPage === page
                        ? "z-10 bg-yellow-500 text-black focus-visible:outline-offset-0"
                        : "text-gray-400 hover:bg-gray-900"
                    }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(validCurrentPage + 1)}
              disabled={validCurrentPage === totalPages || totalItems === 0}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  itemsPerPage: PropTypes.number,
  totalItems: PropTypes.number,
};