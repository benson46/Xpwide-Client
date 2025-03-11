import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { googleLogin, login } from "../../store/userSlice";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateFields = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please provide a valid email address.";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const responseMessage = async (response) => {
    try {
      await dispatch(googleLogin(response.credential))
        .unwrap() 
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          toast.error(error || "Google login failed.");
        });
    } catch (error) {
      // Handle unexpected errors from dispatch
      toast.error(error.message || "An unexpected error occurred.");
      console.error("Error during Google login:", error);
    }
  };
  

  const errorMessage = (error) => {
    toast.error(`Google login failed: ${error}`);
    console.error(error);
    setErrors({ google: "Google login failed. Please try again." });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      await dispatch(login(formData)).unwrap();
      navigate("/");
    } catch (error) {
      setErrors({ form: error.response?.data?.message || "Login failed." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Account Login
        </h1>

        {errors.form && (
          <p className="text-red-600 text-center mb-4">{errors.form}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              type="text" // Keeps browser validation disabled
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={validateFields} // Calls validateFields() when input loses focus
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 ${
                errors.password ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/change-password-email"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Login Account
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
          </div>
          {errors.google && (
            <p className="text-red-600 text-center mt-4">{errors.google}</p>
          )}

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
