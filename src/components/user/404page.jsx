import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react"; // Assuming you're using Lucide icons

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon/Image */}
        <div className="mb-8 flex justify-center">
          <svg
            className="w-32 h-32 text-gray-900 md:w-48 md:h-48"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Text */}
        <h1 className="text-9xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Oops! The page you're looking for might have been removed or is
          temporarily unavailable.
        </p>

        {/* Return Home Button */}
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}