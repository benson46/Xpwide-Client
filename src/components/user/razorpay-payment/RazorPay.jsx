import React from "react";
import { useRazorpay } from "react-razorpay";

const RazorPay = () => {
  const { error, isLoading, Razorpay } = useRazorpay();
  const [userInfo, setUserInfo] = useState({});
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/get-user-info");
        console.log(response.data.user_data);
        setUserInfo({
          name:
            response.data.user_data.first_name +
            " " +
            response.data.user_data.last_name,
          email: response.data.user_data.email,
          contact: response.data.user_data.phone_number,
        });
      } catch (error) {
        console.log(error);
      }
    };
    getUserInfo();
  }, []);

  const handlePayment = () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: 50000, // Amount in paise
      currency: "INR",
      name: "Test Company",
      description: "Test Transaction",
      order_id: "order_9A33XWu170gUtm", // Generate order_id on server
      handler: (response) => {
        console.log(response);
        alert("Payment Successful!");
      },
      prefill: {
        name: "John Doe",
        email: "john.doe@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#F37254",
      },
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  };

  return (
    <div>
      <h1>Payment Page</h1>
      {isLoading && <p>Loading Razorpay...</p>}
      {error && <p>Error loading Razorpay: {error}</p>}
      <button onClick={handlePayment} disabled={isLoading}>
        Pay Now
      </button>
    </div>
  );
};

export default RazorPay;