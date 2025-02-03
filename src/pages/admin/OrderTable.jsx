import React, { useEffect, useState } from "react";
import { adminAxiosInstance } from "../../utils/axios";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import toast from "react-hot-toast";
import Pagination from "../../components/Pagination";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await adminAxiosInstance.get("/orders", {
          withCredentials: true,
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.log(error);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage]);

  const updateStatus = async (orderId, productId, newStatus) => {
    try {
      await adminAxiosInstance.put(`/orders/${orderId}/status`, {
        status: newStatus,
        productId: productId,
      });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((p) =>
                  p.productId === productId ? { ...p, status: newStatus } : p
                ),
              }
            : order
        )
      );
    } catch (error) {
      toast.error("Error updating status");
      console.log(error);
    }
  };

  const cancelProduct = async (orderId, productId) => {
    try {
      await adminAxiosInstance.put(`/orders/${orderId}/cancel/${productId}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((p) =>
                  p.productId === productId ? { ...p, status: "Cancelled" } : p
                ),
              }
            : order
        )
      );
    } catch (error) {
      console.log(error);
      toast.error("Error cancelling product");
    }
  };

  const handleReturnAction = async (orderId, productId, action) => {
    try {
      await adminAxiosInstance.patch(
        `/orders/${orderId}/handle-return/${productId}`,
        {
          action,
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map((product) =>
                  product.productId === productId
                    ? {
                        ...product,
                        status:
                          action === "approve"
                            ? "Return Approved"
                            : "Return Rejected",
                      }
                    : product
                ),
              }
            : order
        )
      );
      toast.success(`Return request ${action}d`);
    } catch (error) {
      console.error("Error handling return request:", error);
      toast.error(`Failed to ${action} return`);
    }
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex">
        <Sidebar activePage="Orders" />
        <main className="flex-1 p-6">
          <h1 className="text-2xl text-white font-bold mb-6">
            Order Management
          </h1>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="bg-gray-900 rounded-lg shadow text-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Order ID</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Products</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Total</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="p-4">{order._id}</td>
                      <td className="p-4">{order.customerName}</td>
                      <td className="p-4">
                        <div className="space-y-4">
                          {order.products.map((product) => (
                            <div key={product.productId} className="space-y-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                SKU: {product.sku || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Status: {product.status}
                              </div>
                              <div className="flex items-center gap-2">
                                {product.status === "Return Pending" ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleReturnAction(
                                          order._id,
                                          product.productId,
                                          "approve"
                                        )
                                      }
                                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                      Approve Return
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleReturnAction(
                                          order._id,
                                          product.productId,
                                          "reject"
                                        )
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                      Reject Return
                                    </button>
                                  </div>
                                ) : (
                                  <select
                                    value={
                                      product.status === "Return Rejected"
                                        ? "Delivered"
                                        : product.status === 'Return Approved' ? "Return Approved" : product.status
                                    }
                                    onChange={(e) =>
                                      updateStatus(
                                        order._id,
                                        product.productId,
                                        e.target.value
                                      )
                                    }
                                    className="border rounded px-2 py-1 text-sm text-black"
                                    disabled={
                                      product.status === "Delivered" ||
                                      product.status === "Return Rejected" ||
                                      product.status === "Return Approved" ||
                                      product.status === "Cancelled"
                                    }
                                  >
                                  {product.status=== 'Return Approved'&&(
                                    <option value="Return Approved">Return Approved</option>
                                  )}
                                    <option value="Pending">Pending</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                )}
                                {product.status !== "Cancelled" &&
                                product.status !== "Delivered" &&
                                product.status !== "Return Pending" &&
                                product.status !== "Return Rejected" &&
                                product.status !== "Return Accepted" ? ( // Hide cancel option for certain statuses
                                  <button
                                    onClick={() =>
                                      cancelProduct(
                                        order._id,
                                        product.productId
                                      )
                                    }
                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Cancel Product
                                  </button>
                                ) : null}
                                {product.status === "Cancelled" && (
                                  <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm">
                                    Cancelled
                                  </span>
                                )}
                                {(product.status === "Delivered" ||
                                  product.status === "Return Rejected") && (
                                  <span className="bg-green-200 text-green-600 px-3 py-1 rounded text-sm">
                                    Delivered
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">₹{order.totalAmount}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
                        >
                          Order Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={orders.length}
          />
        </main>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 text-gray-800">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <p>
              <strong>Order ID:</strong> {selectedOrder._id}
            </p>
            <p>
              <strong>Customer:</strong> {selectedOrder.customerName}
            </p>
            <p>
              <strong>Products:</strong>
            </p>
            <ul>
              {selectedOrder.products.map((p) => (
                <li key={p.productId}>
                  {p.name} - {p.quantity}
                </li>
              ))}
            </ul>
            <p>
              <strong>Address:</strong> {selectedOrder.address}{" "}
            </p>
            <p>
              <strong>Total:</strong> ₹{selectedOrder.totalAmount}{" "}
            </p>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 bg-red-500 px-3 py-1 rounded text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
