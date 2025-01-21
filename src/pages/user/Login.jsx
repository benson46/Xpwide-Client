import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance, googleAxiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import AdminLogin from "../admin/AdminLogin";
import { googleLogin, login } from "../../store/userSlice";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const responseMessage = async (response) => {
    try {
      const res = await googleAxiosInstance.post("/login-google", {
        token: response.credential,
      });
      console.log(res)
      dispatch(googleLogin(response.credential))
      .then((res) => {
        toast.success("Login successful!");
        navigate('/')
      })
    } catch (error) {
      toast.error("Google login failed!");
      console.error(error);
    }
  };
  
  const errorMessage = (error) => {
    console.log(error);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(login(formData))
        .unwrap();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      {/* Logo */}
      {/* <div className="mb-8">
        <img 
          src="/logo.png" 
          alt="XPWide Logo" 
          className="h-8"
        />
      </div> */}

      {/* Login Form */}
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Account Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              to="/reset-password-email"
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

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div >
    </div >
  );
}
