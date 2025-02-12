import { useEffect, useState } from "react"
import { adminAxiosInstance } from "../../utils/axios"
import Navbar from "../../components/admin/Navbar"
import Sidebar from "../../components/admin/Sidebar"
import toast from "react-hot-toast"
import Pagination from "../../components/Pagination"

export default function OrdersTable() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentOrders, setCurrentOrders] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await adminAxiosInstance.get("/orders")
        setOrders(response.data)
        setTotalPages(Math.ceil(response.data.length / itemsPerPage))
        setCurrentOrders(response.data.slice(0, itemsPerPage))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [itemsPerPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setCurrentOrders(orders.slice(startIndex, endIndex))
  }

  const updateStatus = async (orderId, productId, status) => {
    try {
      await adminAxiosInstance.put(`/orders/${orderId}/products/${productId}`, {
        status,
      })
      toast.success("Product status updated successfully!")
      const updatedOrders = [...orders]
      const orderIndex = updatedOrders.findIndex((order) => order._id === orderId)
      const productIndex = updatedOrders[orderIndex].products.findIndex((product) => product.productId === productId)
      updatedOrders[orderIndex].products[productIndex].status = status
      setOrders(updatedOrders)
    } catch (err) {
      toast.error("Failed to update product status!")
    }
  }

  const cancelProduct = async (orderId, productId) => {
    try {
      await adminAxiosInstance.put(`/orders/${orderId}/products/${productId}`, {
        status: "Cancelled",
      })
      toast.success("Product cancelled successfully!")
      const updatedOrders = [...orders]
      const orderIndex = updatedOrders.findIndex((order) => order._id === orderId)
      const productIndex = updatedOrders[orderIndex].products.findIndex((product) => product.productId === productId)
      updatedOrders[orderIndex].products[productIndex].status = "Cancelled"
      setOrders(updatedOrders)
    } catch (err) {
      toast.error("Failed to cancel product!")
    }
  }

  const handleReturnAction = async (orderId, productId, action) => {
    try {
      await adminAxiosInstance.patch(`/orders/${orderId}/handle-return/${productId}`, {
        action,
      })
      toast.success("Return action processed successfully!")
      const updatedOrders = [...orders]
      const orderIndex = updatedOrders.findIndex((order) => order._id === orderId)
      const productIndex = updatedOrders[orderIndex].products.findIndex((product) => product.productId === productId)
      updatedOrders[orderIndex].products[productIndex].status =
        action === "approve" ? "Return Approved" : "Return Rejected"
      setOrders(updatedOrders)
    } catch (err) {
      toast.error("Failed to process return action!")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="w-full">
        <Navbar />
      </div>

      <div className="flex flex-1">
        <Sidebar activePage="Orders" />
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <h1 className="text-2xl text-white font-bold mb-6">Order Management</h1>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="bg-gray-900 rounded-lg shadow text-white">
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="min-w-[1000px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800">
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
                        <tr key={order._id} className="border-b border-gray-800">
                          <td className="p-4">{order._id}</td>
                          <td className="p-4">{order.customerName}</td>
                          <td className="p-4">
                            <div className="space-y-4">
                              {order.products.map((product) => (
                                <div key={product.productId} className="space-y-2">
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-gray-500">SKU: {product.sku || "N/A"}</div>
                                  <div className="text-sm text-gray-500">Status: {product.status}</div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {product.status === "Return Pending" ? (
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => handleReturnAction(order._id, product.productId, "approve")}
                                          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                          Approve Return
                                        </button>
                                        <button
                                          onClick={() => handleReturnAction(order._id, product.productId, "reject")}
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
                                            : product.status === "Return Approved"
                                              ? "Return Approved"
                                              : product.status
                                        }
                                        onChange={(e) => updateStatus(order._id, product.productId, e.target.value)}
                                        className="border rounded px-2 py-1 text-sm text-black"
                                        disabled={
                                          product.status === "Delivered" ||
                                          product.status === "Return Rejected" ||
                                          product.status === "Return Approved" ||
                                          product.status === "Cancelled"
                                        }
                                      >
                                        {product.status === "Return Approved" && (
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
                                    product.status !== "Return Approved" ? (
                                      <button
                                        onClick={() => cancelProduct(order._id, product.productId)}
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
                                    {(product.status === "Delivered" || product.status === "Return Rejected") && (
                                      <span className="bg-green-200 text-green-600 px-3 py-1 rounded text-sm">
                                        Delivered
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">₹{order.totalAmount}</td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                            >
                              Order Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={orders.length}
            />
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md text-gray-800">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-3">
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Customer:</strong> {selectedOrder.customerName}
              </p>
              <div>
                <strong>Products:</strong>
                <ul className="mt-2 space-y-2">
                  {selectedOrder.products.map((p) => (
                    <li key={p.productId} className="flex justify-between">
                      <span>{p.name}</span>
                      <span>x{p.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p>
                <strong>Address:</strong> {selectedOrder.address}
              </p>
              <p>
                <strong>Total:</strong> ₹{selectedOrder.totalAmount}
              </p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

