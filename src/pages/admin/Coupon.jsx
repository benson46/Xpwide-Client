import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [formData, setFormData] = useState({
    code: "",
    minPurchaseAmount: "",
    startingDate: "",
    expiryDate: "",
    usageLimit: "",
    discount: "",
    usageLimitPerUser: "",
    isActive: true,
    isPublic: false,
    eligibleCategories: [],
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    try {
      const response = await adminAxiosInstance.get("/coupon", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setCoupons(response.data.coupons);
      setTotalCoupons(response.data.totalCoupons);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to fetch coupons");
    }
  };

  const handleEdit = (couponId) => {
    const coupon = coupons.find((c) => c._id === couponId);
    if (!coupon) return;
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      discount: coupon.discount || "",
      minPurchaseAmount: coupon.minPurchaseAmount || "",
      usageLimit: coupon.usageLimit || "",
      usageLimitPerUser: coupon.usageLimitPerUser || "",
      startingDate: coupon.startingDate
        ? coupon.startingDate.split("T")[0]
        : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
      eligibleCategories: coupon.eligibleCategories || [],
      isPublic: coupon.isPublic || false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const trimmedCode = formData.code.replace(/\s+/g, "");
    const newErrors = {};
    if (!trimmedCode) newErrors.code = "Coupon code is required";
    if (formData.discount < 1 || formData.discount > 100) {
      newErrors.discount = "Discount must be between 1% and 100%";
    }
    if (!formData.minPurchaseAmount || formData.minPurchaseAmount < 1) {
      newErrors.minPurchaseAmount = "Minimum purchase must be at least ₹1";
    }
    if (!formData.usageLimit || formData.usageLimit < 1) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    }
    if (!formData.startingDate)
      newErrors.startingDate = "Start date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (new Date(formData.expiryDate) < new Date(formData.startingDate)) {
      newErrors.expiryDate = "Expiry date must be after start date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const submissionData = { ...formData, code: trimmedCode };

    try {
      if (editingCoupon) {
        const { data } = await adminAxiosInstance.put(
          `/coupon/${editingCoupon._id}`,
          submissionData
        );
        
        if (data.success) {
          setCoupons((prevCoupons) =>
            prevCoupons.map((c) =>
              c._id === editingCoupon._id ? data.coupon : c
            )
          );
          toast.success("Coupon updated successfully");
          setIsModalOpen(false);
          setEditingCoupon(null);
          resetForm();
        }
      } else {
        const { data } = await adminAxiosInstance.post(
          "/coupon",
          submissionData
        );
        
        if (data.success) {
          setCoupons(prev => [data.newCoupon,...prev,]);
          toast.success("Coupon created successfully");
          setIsModalOpen(false);
          setTotalCoupons((prev) => prev+1)
          setEditingCoupon(null);
          resetForm();
        }
      }
    } catch (err) {
      console.error("Error saving coupon:", err);
      toast.error(err.response?.data?.message || "Failed to save coupon");
      // Only refetch if there was an error to ensure data consistency
    }
    setLoading(false);
  };

  const handleDelete = (coupon) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Coupon",
      message: "Are you sure you want to delete this coupon?",
      onConfirm: async () => {
        try {
          await adminAxiosInstance.delete(`/coupon/${coupon._id}`);
          setCoupons((prevCoupons) =>
            prevCoupons.filter((c) => c._id !== coupon._id)
          );
          toast.success("Coupon deleted successfully");
        } catch (err) {
          console.error("Error deleting coupon:", err);
          toast.error("Failed to delete coupon");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      minPurchaseAmount: "",
      startingDate: "",
      expiryDate: "",
      usageLimit: "",
      usageLimitPerUser: "",
      discount: "",
      isActive: true,
      isPublic: false,
      eligibleCategories: [],
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const tableHeaders = [
    { key: "code", label: "COUPON CODE" },
    { key: "discount", label: "DISCOUNT" },
    { key: "minPurchase", label: "MIN PURCHASE" },
    { key: "date", label: "EXPIRY DATE" },
    { key: "status", label: "STATUS" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (coupon) => (
    <tr key={coupon?._id} className="border-b border-gray-800">
      <td className="py-3 px-4">{coupon?.code}</td>
      <td className="py-3 px-4">{coupon?.discount}%</td>
      <td className="py-3 px-4">₹{coupon?.minPurchaseAmount}</td>
      <td className="py-3 px-4">
        {new Date(coupon?.expiryDate).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            coupon?.isActive
              ? "bg-yellow-400 text-black"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          {coupon?.isActive ? "Active" : "In Active"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(coupon._id)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(coupon)}
            className="p-1 hover:bg-red-900/20 rounded"
          >
            <Trash className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="w-full">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>
        <div className="flex flex-1">
          <Sidebar activePage="Coupons" isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">COUPONS</h1>
            <button
              onClick={() => {
                setEditingCoupon(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Coupon
            </button>
          </div>

          {!loading && totalCoupons === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No coupons till now
            </div>
          ) : (
            <Table
              headers={tableHeaders}
              rows={coupons}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalCoupons}
              onPageChange={handlePageChange}
              renderRow={renderUserRow}
            />
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
        </main>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl p-4 sm:p-6 relative my-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-6 text-yellow-400">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Coupon Code
                </label>
                <input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Enter coupon code"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm">{errors.code}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Discount (%)
                </label>
                <input
                  type="number"
                  required
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  placeholder="Enter discount percentage"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.discount && (
                  <p className="text-red-500 text-sm">{errors.discount}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Min Purchase Amount
                </label>
                <input
                  type="number"
                  required
                  value={formData.minPurchaseAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchaseAmount: e.target.value,
                    })
                  }
                  placeholder="Enter minimum purchase amount"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.minPurchaseAmount && (
                  <p className="text-red-500 text-sm">
                    {errors.minPurchaseAmount}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Usage Limit
                </label>
                <input
                  type="number"
                  required
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  placeholder="Enter usage limit"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.usageLimit && (
                  <p className="text-red-500 text-sm">{errors.usageLimit}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Usage Limit Per User
                </label>
                <input
                  type="number"
                  value={formData.usageLimitPerUser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimitPerUser: e.target.value || null,
                    })
                  }
                  placeholder="Enter limit per user"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.usageLimitPerUser && (
                  <p className="text-red-500 text-sm">
                    {errors.usageLimitPerUser}
                  </p>
                )}
              </div>

              {/* Add Public Coupon Toggle */}
              <div className="space-y-2 sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400"
                  id="isPublicCheckbox"
                />
                <label
                  htmlFor="isPublicCheckbox"
                  className="text-sm font-medium text-gray-300"
                >
                  Public Coupon (Visible to all users)
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Starting Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startingDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.startingDate && (
                  <p className="text-red-500 text-sm">{errors.startingDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  min={
                    formData.startingDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm">{errors.expiryDate}</p>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCoupon ? "Update" : "Add"}{" "}
                  Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;

/*

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [formData, setFormData] = useState({
    code: "",
    minPurchaseAmount: "",
    startingDate: "",
    expiryDate: "",
    usageLimit: "",
    discount: "",
    isActive: true,
    isPublic: false,
    eligibleCategories: [],
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const fetchCoupons = async () => {
    try {
      const response = await adminAxiosInstance.get("/coupon", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setCoupons(response.data.coupons);
      setTotalCoupons(response.data.totalCoupons);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to fetch coupons");
    }
  };

  const handleEdit = (couponId) => {
    const coupon = coupons.find((c) => c._id === couponId);
    if (!coupon) return;
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      discount: coupon.discount || "",
      minPurchaseAmount: coupon.minPurchaseAmount || "",
      usageLimit: coupon.usageLimit || "",
      startingDate: coupon.startingDate ? coupon.startingDate.split("T")[0] : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
      eligibleCategories: coupon.eligibleCategories || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const trimmedCode = formData.code.replace(/\s+/g, "");
    const newErrors = {};
    if (!trimmedCode) newErrors.code = "Coupon code is required";
    if (formData.discount < 1 || formData.discount > 100) {
      newErrors.discount = "Discount must be between 1% and 100%";
    }
    if (!formData.minPurchaseAmount || formData.minPurchaseAmount < 1) {
      newErrors.minPurchaseAmount = "Minimum purchase must be at least ₹1";
    }
    if (!formData.usageLimit || formData.usageLimit < 1) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    }
    if (!formData.startingDate) newErrors.startingDate = "Start date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (new Date(formData.expiryDate) < new Date(formData.startingDate)) {
      newErrors.expiryDate = "Expiry date must be after start date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const submissionData = { ...formData, code: trimmedCode };

    try {
      if (editingCoupon) {
        await adminAxiosInstance.put(`/coupon/${editingCoupon._id}`, submissionData);
        setCoupons((prevCoupons) =>
          prevCoupons.map((c) =>
            c._id === editingCoupon._id ? { ...c, ...submissionData } : c
          )
        );
        toast.success("Coupon updated successfully");
      } else {
        const response = await adminAxiosInstance.post("/coupon", submissionData);
        setCoupons([...coupons, response.data.coupon]);
        toast.success("Coupon created successfully");
      }
      await fetchCoupons();
      setIsModalOpen(false);
      setEditingCoupon(null);
      resetForm();
    } catch (err) {
      console.error("Error saving coupon:", err);
      toast.error(err.response?.data?.message || "Failed to save coupon");
    }
    setLoading(false);
  };

  const handleDelete = (coupon) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Coupon",
      message: "Are you sure you want to delete this coupon?",
      onConfirm: async () => {
        try {
          await adminAxiosInstance.delete(`/coupon/${coupon._id}`);
          setCoupons((prevCoupons) =>
            prevCoupons.filter((c) => c._id !== coupon._id)
          );
          toast.success("Coupon deleted successfully");
        } catch (err) {
          console.error("Error deleting coupon:", err);
          toast.error("Failed to delete coupon");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const resetForm = () => {
    setFormData({
      code: "",
      minPurchaseAmount: "",
      startingDate: "",
      expiryDate: "",
      usageLimit: "",
      discount: "",
      isActive: true,
      isPublic: false,
      eligibleCategories: [],
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const tableHeaders = [
    { key: "code", label: "COUPON CODE" },
    { key: "discount", label: "DISCOUNT" },
    { key: "minPurchase", label: "MIN PURCHASE" },
    { key: "date", label: "EXPIRY DATE" },
    { key: "status", label: "STATUS" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (coupon) => (
    <tr key={coupon?._id} className="border-b border-gray-800">
      <td className="py-3 px-4">{coupon?.code}</td>
      <td className="py-3 px-4">{coupon?.discount}%</td>
      <td className="py-3 px-4">₹{coupon?.minPurchaseAmount}</td>
      <td className="py-3 px-4">
        {new Date(coupon?.expiryDate).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            coupon?.isActive ? "bg-yellow-400 text-black" : "bg-gray-800 text-gray-400"
          }`}
        >
          {coupon?.isActive ? "Active" : "In Active"}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(coupon._id)}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(coupon)}
            className="p-1 hover:bg-red-900/20 rounded"
          >
            <Trash className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="w-full">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>
      <div className="flex flex-1">
        <Sidebar activePage="Coupons" isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">COUPONS</h1>
            <button
              onClick={() => {
                setEditingCoupon(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Coupon
            </button>
          </div>
          <Table
            headers={tableHeaders}
            rows={coupons}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalCoupons}
            onPageChange={handlePageChange}
            renderRow={renderUserRow}
          />
          {confirmModal.isOpen && (
            <ConfirmModal
              isOpen={confirmModal.isOpen}
              title={confirmModal.title}
              message={confirmModal.message}
              onConfirm={confirmModal.onConfirm}
              onCancel={confirmModal.onCancel}
            />
          )}
        </main>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl p-4 sm:p-6 relative my-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-6 text-yellow-400">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Coupon Code</label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter coupon code"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Discount (%)</label>
                <input
                  type="number"
                  required
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="Enter discount percentage"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.discount && <p className="text-red-500 text-sm">{errors.discount}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Min Purchase Amount</label>
                <input
                  type="number"
                  required
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  placeholder="Enter minimum purchase amount"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.minPurchaseAmount && <p className="text-red-500 text-sm">{errors.minPurchaseAmount}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Usage Limit</label>
                <input
                  type="number"
                  required
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Enter usage limit"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.usageLimit && <p className="text-red-500 text-sm">{errors.usageLimit}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Starting Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startingDate}
                  onChange={(e) => setFormData({ ...formData, startingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.startingDate && <p className="text-red-500 text-sm">{errors.startingDate}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Expiry Date</label>
                <input
                  type="date"
                  required
                  min={formData.startingDate || new Date().toISOString().split("T")[0]}
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                />
                {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCoupon ? "Update" : "Add"} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;

*/
