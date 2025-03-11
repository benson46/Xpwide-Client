import React,{ useState, useEffect, useRef } from "react";
import Modal from "../../Modal";
import PropTypes from "prop-types";
import { adminAxiosInstance } from "../../../utils/axios";
import toast from "react-hot-toast";

export default function AddNewOfferModal({
  type,
  isOpen,
  onClose,
  onOfferCreated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    endDate: "",
    selection: "",
    selectionName: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (type === "category") {
      adminAxiosInstance
        .get("/offers/categories")
        .then((res) => {
          setCategories(res.data.data);
        })
        .catch(() => toast.error("Failed to load categories"));
    }
  }, [type]);

  const searchProducts = async (query) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await adminAxiosInstance.get(
        `/products/search?query=${query}`
      );
      setSearchResults(res.data.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.value || formData.value < 0 || formData.value > 100)
      newErrors.value = "Value must be between 0-100";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.selection) newErrors.selection = "Selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const offerData = {
      offerType: type,
      name: formData.name,
      value: Number(formData.value),
      endDate: formData.endDate,
      [type]: formData.selection,
    };
  
    try {
      const res = await adminAxiosInstance.post("/offers/createoffer", offerData);
      if (res.data.success) {
        // Update the offers list with the newly created offer from the API response
        onOfferCreated(res.data.offer);
        toast.success("Offer created successfully!");
        onClose();
      } else {
        toast.error("Failed to create offer.");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error on creating offer");
    }
  };
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Offer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white">Offer Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}
        </div>        

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white">Offer Value (%)</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              className="w-full p-2 bg-gray-700 text-white rounded"
            />
            {errors.value && <p className="text-red-500">{errors.value}</p>}
          </div>

          <div>
            <label className="block text-white">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full p-2 bg-gray-700 text-white rounded"
            />
            {errors.endDate && <p className="text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-white">
            {type === "product" ? "Select Product" : "Select Category"}
          </label>
          {type === "product" ? (
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-2 bg-gray-700 text-white rounded"
                value={formData.selectionName}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    selectionName: e.target.value,
                    selection: "",
                  });
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  timeoutRef.current = setTimeout(
                    () => searchProducts(e.target.value),
                    300
                  );
                }}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-gray-800 border rounded shadow-lg z-10 mt-1 max-h-60 overflow-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      className="p-2 hover:bg-gray-600 text-white cursor-pointer"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          selection: product._id,
                          selectionName: product.name,
                        });
                        setSearchResults([]);
                      }}
                    >
                      {product.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <select
              className="w-full p-2 bg-gray-700 text-white rounded"
              value={formData.selection} // Changed to use selection instead of selectionName
              onChange={(e) => {
                setFormData({
                  ...formData,
                  selection: e.target.value, // Store the ID directly
                  selectionName:
                    categories.find((cat) => cat._id === e.target.value)
                      ?.title || "",
                });
              }}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id} // Changed to use _id as value
                  className="text-white"
                >
                  {category.title}
                </option>
              ))}
            </select>
          )}
          {errors.selection && (
            <p className="text-red-500">{errors.selection}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors font-medium"
        >
          Create Offer
        </button>
      </form>
    </Modal>
  );
}

AddNewOfferModal.propTypes = {
  type: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOfferCreated: PropTypes.func.isRequired,
};
