import { useState, useEffect } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Pagination from "../../components/Pagination";
import Navbar from "../../components/admin/Navbar";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    code: "",
    minPurchaseAmount: "",
    startingDate: "",
    expiryDate: "",
    usageLimit: "",
    discount: "",
    isActive: true,
    eligibleCategories: [],
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
    fetchCoupons();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminAxiosInstance.get("/category");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await adminAxiosInstance.get("/coupon");
      console.log("coupons response ", response.data);
      setCoupons(response.data.coupons);
      console.log("response fetch coupons: ", response.data.coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
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
      startingDate: coupon.startingDate
        ? coupon.startingDate.split("T")[0]
        : "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
      eligibleCategories: coupon.eligibleCategories || [],
    });

    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Reset errors

    // Frontend validation
    const newErrors = {};

    if (!formData.code || formData.code == "") newErrors.code = "Coupon code is required";
    if (formData.discount < 1 || formData.discount > 100) {
      newErrors.discount = "Discount must be between 1% and 100%";
    }
    if (formData.minPurchaseAmount === "" || formData.minPurchaseAmount < 1) {
      newErrors.minPurchaseAmount = "Minimum purchase must be at least ₹1";
    }
    if (formData.usageLimit === "" || formData.usageLimit < 1) {
      newErrors.usageLimit = "Usage limit must be at least 1";
    }
    if (!formData.startingDate)
      newErrors.startingDate = "Start date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";

    if (new Date(formData.expiryDate) < new Date(formData.startingDate)) {
      newErrors.expiryDate = "Expiry date must be after start date";
    }
    if (formData.eligibleCategories.length === 0) {
      newErrors.eligibleCategories = "At least one category is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      if (editingCoupon) {
        await adminAxiosInstance.put(`/coupon/${editingCoupon._id}`, formData);
        setCoupons((prevCoupons) =>
          prevCoupons.map((c) =>
            c._id === editingCoupon._id ? { ...c, ...formData } : c
          )
        );
        toast.success("Coupon updated successfully");
      } else {
        const response = await adminAxiosInstance.post("/coupon", formData);
        setCoupons([...coupons, response.data.coupon]);
        toast.success("Coupon created successfully");
      }

      await fetchCoupons();
      setIsModalOpen(false);
      setEditingCoupon(null);
      resetForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon");
    }

    setLoading(false);
  };

  const handleDelete = (coupon) => {
    setSelectedCoupon(coupon);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCoupon) return;

    try {
      await adminAxiosInstance.delete(`/coupon/${selectedCoupon._id}`);

      setCoupons((prevCoupons) =>
        prevCoupons.filter((coupon) => coupon._id !== selectedCoupon._id)
      );
      toast.success("Coupon deleted successfully");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }

    setDeleteModalOpen(false);
    setSelectedCoupon(null);
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
      eligibleCategories: [],
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCategoryChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    // If "all" is selected, ignore other selections
    if (value.includes("all")) {
      setFormData({ ...formData, eligibleCategories: ["all"] });
    } else {
      setFormData({ ...formData, eligibleCategories: value });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="w-full">
        <Navbar />
      </div>

      <div className="flex flex-1">
        <Sidebar activePage="Coupons" />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-yellow-400">
                COUPONS
              </h1>
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

            <div className="overflow-x-auto rounded-lg bg-gray-900 -mx-4 md:mx-0">
              <div className="min-w-[800px]">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-800">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">COUPON CODE</th>
                      <th className="py-3 px-4">DISCOUNT</th>
                      <th className="py-3 px-4">MIN PURCHASE</th>
                      <th className="py-3 px-4">EXPIRY DATE</th>
                      <th className="py-3 px-4">CATEGORIES</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr
                        key={coupon?._id}
                        className="border-b border-gray-800"
                      >
                        <td className="py-3 px-4">{coupon?._id}</td>
                        <td className="py-3 px-4">{coupon?.code}</td>
                        <td className="py-3 px-4">{coupon?.discount}%</td>
                        <td className="py-3 px-4">
                          ₹{coupon?.minPurchaseAmount}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(coupon?.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {coupon?.eligibleCategories.length ===
                          categories.length
                            ? "All"
                            : coupon?.eligibleCategories
                                .map((categoryId) => {
                                  const category = categories.find(
                                    (cat) => cat._id === categoryId
                                  );
                                  return category ? category?.title : "Unknown";
                                })
                                .join(", ")}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              coupon?.isActive === true
                                ? "bg-yellow-400 text-black"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {coupon?.isActive === true ? "Active" : "In Active"}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={coupons.length}
          />
        </main>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-yellow-400">
              Delete Coupon
            </h2>
            <p className="text-gray-300 mt-2">
              Are you sure you want to delete this coupon?
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
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
                  Starting Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]} // Optional: prevent past dates
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
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Eligible Category
                </label>
                <select
                  required
                  value={formData.eligibleCategories[0] || ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setErrors({
                        ...errors,
                        eligibleCategories: "Please select a category",
                      });
                    } else {
                      setErrors({ ...errors, eligibleCategories: "" });
                    }
                    setFormData({
                      ...formData,
                      eligibleCategories: [e.target.value],
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400 text-white"
                >
                  <option value="">Select Category</option>
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                {errors.eligibleCategories && (
                  <p className="text-red-500 text-sm">
                    {errors.eligibleCategories}
                  </p>
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
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
