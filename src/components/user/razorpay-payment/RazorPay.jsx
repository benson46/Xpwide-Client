import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useRazorpay } from "react-razorpay";

const RazorPay = ({ amount, handlePlaceOrder, isWallet }) => {
  const { error, Razorpay } = useRazorpay();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const razorpayInitialized = useRef(false);

  useEffect(() => {
    // Only fetch user info if not already loaded
    if (!userInfo) {
      const getUserInfo = async () => {
        try {
          const response = await axiosInstance.get("/get-user-info");
          setUserInfo({
            name: response.data.userData.firstName + " " + response.data.userData.lastName,
            email: response.data.userData.email,
            contact: response.data.userData.phoneNumber,
          });
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setIsLoadingUserInfo(false);
        }
      };
      getUserInfo();
    }
  }, [userInfo]);

  // Mark Razorpay as initialized when available
  useEffect(() => {
    if (Razorpay && !razorpayInitialized.current) {
      razorpayInitialized.current = true;
    }
  }, [Razorpay]);

  const handlePayment = () => {
    if (!userInfo || !Razorpay) return;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: Number(amount).toFixed(0) * 100,
      currency: "INR",
      name: "",
      description: "",
      order_id: "",
      handler: (response) => {
        console.log(response);
        handlePlaceOrder(isWallet && "completed");
        setIsOrderPlaced(true);
      },
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
        contact: userInfo.contact,
      },
      theme: {
        color: "#F37254",
      },
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  };

  // Show loading only during initial load
  if (!razorpayInitialized.current || isLoadingUserInfo) {
    return <p className="text-center mt-3">Loading payment details...</p>;
  }

  if (error) {
    return <p className="text-center mt-3 text-red-500">Error loading Razorpay: {error}</p>;
  }

  if (!userInfo) {
    return <p className="text-center mt-3 text-red-500">Failed to load user information</p>;
  }

  if (isOrderPlaced) {
    return null;
  }

  return (
    <div className="mt-3">
      <button
        className="py-2 bg-gray-700 text-white rounded hover:bg-gray-800 w-full"
        onClick={handlePayment}
      >
        Pay Now
      </button>
    </div>
  );
};

export default RazorPay;