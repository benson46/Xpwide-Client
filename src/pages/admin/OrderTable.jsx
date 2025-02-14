import { useEffect, useState } from "react";
import { adminAxiosInstance } from "../../utils/axios";
import Navbar from "../../components/admin/Navbar";
import Sidebar from "../../components/admin/Sidebar";
import toast from "react-hot-toast";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal({ ...confirmModal, isOpen: false }),
  });



  const fetchOrders = async () => {
    try {
      const res = await adminAxiosInstance.get("/orders",{
        params:{page:currentPage,limit:itemsPerPage}
      });
      setOrders(res.data.orders);
      setTotalOrders(res.data.totalOrders);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchOrders();
  }, [currentPage]);

  const handleStatusChange = (orderId, productId, newStatus) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status to ${newStatus}?`,
      onConfirm: async () => {
        try {
          await adminAxiosInstance.put(`/orders/${orderId}/products/${productId}`, {
            status: newStatus,
          });
          toast.success("Product status updated successfully!");
          const updatedOrders = [...orders];
          const orderIndex = updatedOrders.findIndex(
            (order) => order._id === orderId
          );
          const productIndex = updatedOrders[orderIndex].products.findIndex(
            (product) => product.productId === productId
          );
          updatedOrders[orderIndex].products[productIndex].status = newStatus;
          setOrders(updatedOrders);
        } catch (err) {
          toast.error("Failed to update product status!");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
      onCancel: () => setConfirmModal({ ...confirmModal, isOpen: false }),
    });
  };

  // Similarly, wrap the cancel product action:
  const handleCancelProduct = (orderId, productId) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Cancellation",
      message: "Are you sure you want to cancel this product?",
      onConfirm: async () => {
        try {
          await adminAxiosInstance.put(`/orders/${orderId}/products/${productId}`, {
            status: "Cancelled",
          });
          toast.success("Product cancelled successfully!");
          const updatedOrders = [...orders];
          const orderIndex = updatedOrders.findIndex(
            (order) => order._id === orderId
          );
          const productIndex = updatedOrders[orderIndex].products.findIndex(
            (product) => product.productId === productId
          );
          updatedOrders[orderIndex].products[productIndex].status = "Cancelled";
          setOrders(updatedOrders);
        } catch (err) {
          toast.error("Failed to cancel product!");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
      onCancel: () => setConfirmModal({ ...confirmModal, isOpen: false }),
    });
  };

  const handleReturnAction = async (orderId, productId, action) => {
    try {
      await adminAxiosInstance.patch(
        `/orders/${orderId}/handle-return/${productId}`,
        {
          action,
        }
      );
      toast.success("Return action processed successfully!");
      const updatedOrders = [...orders];
      const orderIndex = updatedOrders.findIndex(
        (order) => order._id === orderId
      );
      const productIndex = updatedOrders[orderIndex].products.findIndex(
        (product) => product.productId === productId
      );
      updatedOrders[orderIndex].products[productIndex].status =
        action === "approve" ? "Return Approved" : "Return Rejected";
      setOrders(updatedOrders);
    } catch (err) {
      toast.error("Failed to process return action!");
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setLoading(true);
    fetchOrders();
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const tableHeaders = [
    { key: "orderId", label: "ORDER ID" },
    { key: "customerName", label: "CUSTOMER NAME" },
    { key: "products", label: "PRODUCTS" },
    { key: "createdAt", label: "ORDER DATE" },
    { key: "totalAmount", label: "TOTAL AMOUNT" },
    { key: "actions", label: "ACTIONS" },
  ];

  const renderUserRow = (order) => (
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
                      onClick={() =>
                        handleReturnAction(order._id, product.productId, "approve")
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve Return
                    </button>
                    <button
                      onClick={() =>
                        handleReturnAction(order._id, product.productId, "reject")
                      }
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject Return
                    </button>
                  </div>
                ) : (
                  <select
                    value={product.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, product.productId, e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm text-black"
                    disabled={
                      ["Delivered", "Return Rejected", "Return Approved", "Cancelled"].includes(
                        product.status
                      )
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                )}
                {product.status !== "Cancelled" &&
                !["Delivered", "Return Pending", "Return Rejected", "Return Approved"].includes(
                  product.status
                ) ? (
                  <button
                    onClick={() => handleCancelProduct(order._id, product.productId)}
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
                {["Delivered", "Return Rejected"].includes(product.status) && (
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
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="w-full">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>
  
      <div className="flex flex-1">
        <div className="sm:block">
          <Sidebar activePage="Orders" isCollapsed={isCollapsed} />
        </div>
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">ORDER MANAGEMENT</h1>
          </div>
  
          <Table
            headers={tableHeaders}
            rows={orders}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalOrders}
            onPageChange={handlePageChange}
            renderRow={(order) => renderUserRow(order)}
          />
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
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </div>
  );
  
}
