import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import { IndianRupee } from "lucide-react";
import RazorPay from "../../components/user/razorpay-payment/RazorPay";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [userWalletBalance, setUserWalletBalance] = useState(0);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayAmount, setRazorpayAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, walletResponse] = await Promise.all([
          axiosInstance.get("/orders", { withCredentials: true }),
          axiosInstance.get("/wallet", { withCredentials: true }),
        ]);

        setOrders(
          Array.isArray(ordersResponse.data) ? ordersResponse.data : []
        );
        setUserWalletBalance(walletResponse.data.wallet?.balance || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRetryPayment = (order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentModal(true);
  };

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get("/orders", {
        withCredentials: true,
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const cancelOrder = async (orderId, productId) => {
    try {
      const response = await axiosInstance.patch(
        `/orders/${orderId}/cancel/${productId}`,
        {},
        { withCredentials: true }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((product) =>
                  product._id === productId
                    ? { ...product, status: "Cancelled" }
                    : product
                ),
                status: response.data.order.status,
              }
            : order
        )
      );
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const returnOrder = async (orderId, productId) => {
    try {
      const response = await axiosInstance.patch(
        `/orders/${orderId}/return/${productId}`,
        {},
        { withCredentials: true }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((product) =>
                  product._id === productId
                    ? { ...product, status: "Return Pending" }
                    : product
                ),
              }
            : order
        )
      );
      toast.success("Return request initiated");
    } catch (error) {
      toast.error("Failed to initiate return");
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const processPaymentRetry = async () => {
    try {
      const response = await axiosInstance.post(
        `/orders/${selectedOrderForPayment._id}/retry-payment`,
        { paymentMethod },
        { withCredentials: true }
      );

      if (paymentMethod === "Razorpay") {
        // Set Razorpay amount from the response and show the component
        setRazorpayAmount(response.data.amount);
        setShowPaymentModal(false); // Close payment method modal
        setShowRazorpay(true); // Show RazorPay component
      } else if (paymentMethod === "Wallet") {
        // Handle wallet payment
        if (userWalletBalance < selectedOrderForPayment.totalAmount) {
          toast.error("Insufficient wallet balance");
          return;
        }
        toast.success("Payment successful!");
        fetchOrders();
        setShowPaymentModal(false);
      } else {
        // Handle COD or other methods
        toast.success("Payment method updated");
        fetchOrders();
        setShowPaymentModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-blue-500";
      case "Shipped":
        return "text-amber-500";
      case "Delivered":
        return "text-green-500";
      case "Cancelled":
        return "text-red-500";
      case "Return Pending":
        return "text-yellow-500";
      case "Return Approved":
        return "text-green-500";
      case "Return Rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const canReturnOrder = (product) => {
    if (product.status !== "Delivered") return false;
    const deliveredDate = new Date(product.deliveryDate);
    const daysDifference = (new Date() - deliveredDate) / (1000 * 3600 * 24);
    return daysDifference <= 7;
  };

  const openModal = (order) => setSelectedOrder(order);
  const closeModal = () => setSelectedOrder(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">ORDERS</h1>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">ORDER DATE</th>
              <th className="text-left py-4 px-4">PRODUCTS</th>
              <th className="text-center py-4 px-4">TOTAL AMOUNT</th>
              <th className="text-center py-4 px-4">ACTIONS</th>
              <th className="text-center py-4 px-4">PAYMENT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="py-4 px-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-4">
                      {order.products.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-start space-x-4"
                        >
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-24 h-24 rounded"
                          />
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <div className="text-sm text-gray-600">
                              {product.quantity} ×{" "}
                              <IndianRupee className="h-4 w-4 inline" />
                              {product.price.toFixed(2)}
                              <p
                                className={`text-sm ${getStatusColor(
                                  product.status
                                )}`}
                              >
                                Status: {product.status}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.status === "Delivered" &&
                                canReturnOrder(product) && (
                                  <button
                                    onClick={() =>
                                      returnOrder(order._id, product._id)
                                    }
                                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                                  >
                                    RETURN
                                  </button>
                                )}
                              {![
                                "Return Pending",
                                "Return Rejected",
                                "Return Approved",
                                "Cancelled",
                                "Delivered",
                              ].includes(product.status) && (
                                <button
                                  onClick={() =>
                                    cancelOrder(order._id, product._id)
                                  }
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  CANCEL
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {order.totalAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="text-center py-4 px-4 space-y-2">
                    <button
                      onClick={() => openModal(order)}
                      className="bg-gray-700 text-white px-3 py-1 rounded w-full flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Details
                    </button>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className={getStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4 space-y-2">
                    {order.paymentStatus === "Failed" && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        className="bg-orange-500 text-white px-3 py-1 rounded w-full flex items-center justify-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M22 12a10 10 0 01-10.25 10M2 12a10 10 0 0110.25-10" />
                        </svg>
                        Retry Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </p>
              <p>
                <strong>Total Amount:</strong>{" "}
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {selectedOrder.totalAmount.toFixed(2)}
                </span>
              </p>
              <div>
                <h3 className="font-bold mb-2">Products</h3>
                <div className="space-y-4">
                  {selectedOrder.products.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-start gap-4 border-b pb-4"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-20 h-20 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          {product.quantity} ×{" "}
                          <IndianRupee className="h-4 w-4 inline" />
                          {product.price.toFixed(2)}
                        </p>
                        <p
                          className={`text-sm ${getStatusColor(
                            product.status
                          )}`}
                        >
                          Status: {product.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => downloadInvoice(selectedOrder._id)}
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Download Invoice
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showRazorpay && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <RazorPay
              amount={razorpayAmount}
              handlePlaceOrder={async (status) => {
                if (status === "Success") {
                  try {
                    await axiosInstance.patch(
                      `/orders/${selectedOrderForPayment._id}/update-payment-status`,
                      { paymentStatus: "Success" },
                      { withCredentials: true }
                    );
                    toast.success("Payment successful!");
                    await fetchOrders(); // Wait for data refresh
                  } catch (error) {
                    toast.error("Failed to update payment status");
                  }
                } else {
                  toast.error("Payment failed");
                }
                setShowRazorpay(false); // Close modal after updates
              }}
              isWallet={false}
            />
            <button
              onClick={() => {
                setShowRazorpay(false);
                setSelectedOrderForPayment(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Payment Retry Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Retry Payment</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Razorpay"
                  checked={paymentMethod === "Razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Razorpay
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Wallet"
                  checked={paymentMethod === "Wallet"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Wallet (Balance: ₹{userWalletBalance.toFixed(2)})
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={processPaymentRetry}
                className="bg-green-500 text-white px-4 py-2 rounded flex-1"
                disabled={!paymentMethod}
              >
                Confirm Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
