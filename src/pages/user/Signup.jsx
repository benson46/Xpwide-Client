import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import validate from "../../utils/validate";
import { axiosInstance } from "../../utils/axios";

export default function Signup() {
  const { loading } = useSelector((state) => state.user);
  const [validateError, setValidateError] = useState({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    referralCode: "", // New field for referral code
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidateError({});

    if (formData.confirmPassword !== formData.password) {
      return setValidateError({ confirmPassword: "Passwords do not match." });
    }

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setValidateError(validationErrors);
      return;
    }

    try {
      // Include referralCode in the payload
      await axiosInstance.post("/send-otp", { formData });
      navigate("/otp-verification", {
        state: { email: formData.email, from: "signup" },
      });
    } catch (error) {
      setValidateError({
        general: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setValidateError((prevErrors) => ({
      ...prevErrors,
      [name]: null, // Clear the error for the field being updated
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-8">
          Account Signup
        </h1>

        {validateError.general && (
          <p className="text-red-600 text-center">{validateError.general}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First name
            </label>
            {validateError.firstName && (
              <p className="text-red-600 text-sm">{validateError.firstName}</p>
            )}
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last name
            </label>
            {validateError.lastName && (
              <p className="text-red-600 text-sm">{validateError.lastName}</p>
            )}
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            {validateError.email && (
              <p className="text-red-600 text-sm">{validateError.email}</p>
            )}
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            {validateError.phoneNumber && (
              <p className="text-red-600 text-sm">{validateError.phoneNumber}</p>
            )}
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            {validateError.password && (
              <p className="text-red-600 text-sm">{validateError.password}</p>
            )}
            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            {validateError.confirmPassword && (
              <p className="text-red-600 text-sm">
                {validateError.confirmPassword}
              </p>
            )}
            <input
              type="text"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Referral Code */}
          <div>
            <label
              htmlFor="referralCode"
              className="block text-sm font-medium text-gray-700"
            >
              Referral Code (Optional)
            </label>
            {validateError.referralCode && (
              <p className="text-red-600 text-sm">{validateError.referralCode}</p>
            )}
            <input
              type="text"
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
