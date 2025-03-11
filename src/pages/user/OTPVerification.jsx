import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

export default function OTPVerification() {
  const location = useLocation();
  const [data, setData] = useState({
    otp: "",
    email: location.state?.email, // email passed from the previous page
  });
  const [timeLeft, setTimeLeft] = useState(60); 
  const [isResendDisabled, setIsResendDisabled] = useState(true); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  
  useEffect(() => {
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [timeLeft]);
  

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    if (value.length <= 6) {
      setData({ ...data, [name]: value });
    }
  };

  const handleResendOTP = async () => {
    setTimeLeft(60); 
    setIsResendDisabled(true);
    try {
      await axiosInstance.post("/resend-otp", { email: location.state?.email });
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.otp.length !== 4) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    try {
      if (location.state?.from === "forgot-password") {
        await axiosInstance.post("/verify-otp", data);
        navigate("/change-password", { state: { email: data.email } });
      } else if (location.state?.from === "signup") {
        await axiosInstance.post("/verify-otp", data);
        navigate("/login");
        toast.success("Signup successful. Please login.");
      } else {
        toast.error("Invalid navigation state. Try again.");
      }
    } catch (error) {
      console.error('OTP VERIFICATION ERROR : ',error)
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4">
          OTP Verification
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Enter the 4-digit OTP sent to your registered email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {error && <p className="text-red-600">{error}</p>}
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={data.otp}
              onChange={handleOtpChange}
              placeholder="0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              maxLength={4}
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Valid for: {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendDisabled}
              className={`text-blue-600 hover:text-blue-800 ${
                isResendDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Validate OTP
          </button>
        </form>
      </div>
    </div>
  );
}
