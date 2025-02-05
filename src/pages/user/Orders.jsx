import React from "react";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/orders", { withCredentials: true })
      .then((response) => {
        setOrders(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => console.error("Error fetching orders:", error))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const cancelOrder = async (orderId, productId) => {
    try {
      const response = await axiosInstance.patch(
        `/orders/${orderId}/cancel/${productId}`,
        {},
        { withCredentials: true }
      );
  
      // Update the UI with new order status from the response
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
                status: response.data.order.status, // Ensure order status is updated
              }
            : order
        )
      );
  
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
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
      console.error("Error returning order:", error);
      toast.error("Failed to initiate return");
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

    // Get the delivery date
    const deliveredDate = new Date(product.deliveryDate);
    const currentDate = new Date();

    // Calculate the difference in days
    const timeDifference = currentDate - deliveredDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    // Return true if the order was delivered within 7 days, otherwise false
    return daysDifference <= 7;
  };

  const openModal = (order) => {
    setSelectedOrder(order);
  };

  // Define closeModal function
  const closeModal = () => {
    setSelectedOrder(null);
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">ORDERS</h1>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">PRODUCT</th>
              <th className="text-center py-4 px-4">QUANTITY</th>
              <th className="text-center py-4 px-4">PRICE</th>
              <th className="text-center py-4 px-4">STATUS</th>
              <th className="text-center py-4 px-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : (
              orders.map((order) =>
                order.products.map((product, productIndex) => (
                  <tr
                    key={`${order._id}-${product._id || productIndex}`}
                    className="border-b"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-24 h-24 rounded"
                        />
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      {product.quantity}
                    </td>
                    <td className="text-center py-4 px-4">
                      ₹{product.price * product.quantity}
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={getStatusColor(product.status)}>
                        {product.status}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 flex flex-col space-y-2">
                      <button
                        onClick={() => openModal(order)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        VIEW
                      </button>
                      {/* {product.status !== "Cancelled" &&
                         && (
                          <button
                            onClick={() => cancelOrder(order._id, product._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            CANCEL
                          </button>
                        )} */}
                      {product.status === "Delivered" &&
                        canReturnOrder(product) && (
                          <button
                            onClick={() => returnOrder(order._id, product._id)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                          >
                            RETURN
                          </button>
                        )}
                      {/* Disable cancel button if the product status is "Return Pending" */}
                      {product.status !== "Return Pending" &&
                        product.status !== "Return Rejected" &&
                        product.status !== "Return Approved" &&
                        product.status !== "Cancelled" &&
                        product.status !== "Delivered" && (
                          <button
                            onClick={() => cancelOrder(order._id, product._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            CANCEL
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            {selectedOrder.addressId &&
              (() => {
                const { address, locality, city, state, pincode, name } =
                  selectedOrder.addressId;

                return (
                  <>
                    <p>
                      <strong>Order ID:</strong> {selectedOrder._id}
                    </p>
                    <p>
                      <strong>Customer Name:</strong> {name}
                    </p>
                    <p>
                      <strong>Product:</strong>
                    </p>
                    <ul className="list-disc ml-5 mb-2">
                      {selectedOrder.products.map((product, index) => (
                        <li key={index}>
                          {product.name} - {product.quantity}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Address:</strong>{" "}
                      {`${address}, ${locality}, ${city}, ${state} - ${pincode}`}
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{selectedOrder.totalAmount}
                    </p>
                    <p>
                      <strong>Booked Date:</strong>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                    {selectedOrder.products.some(
                      (product) =>
                        product.status === "Delivered" && product.deliveryDate
                    ) && (
                      <p>
                        <strong>Delivered Date:</strong>{" "}
                        {new Date(
                          selectedOrder.products.find(
                            (product) => product.status === "Delivered"
                          ).deliveryDate
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </>
                );
              })()}

            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
