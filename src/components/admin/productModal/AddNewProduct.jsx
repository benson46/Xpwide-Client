import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../../utils/axios";

export default function AddNewProduct({ onClose, categories, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [fetchedBrands, setFetchedBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.setAspectRatio(aspectRatio);
    }
  }, [aspectRatio]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (brandSearchTerm.trim()) {
        fetchBrands(brandSearchTerm);
      } else {
        setFetchedBrands([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [brandSearchTerm]);

  const fetchBrands = async (searchTerm) => {
    try {
      const response = await adminAxiosInstance.get(
        `/brand/search?query=${searchTerm}`
      );
      // Adjust here to access the nested data array
      setFetchedBrands(response.data.data || []); // Changed from response.data to response.data.data
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to fetch brands");
      setFetchedBrands([]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    if (!formData.category) errors.category = "Category is required.";
    if (!formData.brand) errors.brand = "Brand is required.";
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      errors.price = "Valid price is required.";
    }
    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      errors.stock = "Valid stock quantity is required.";
    }
    if (!formData.description.trim()) {
      errors.description = "Product description is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && images.length < 3) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleCrop = async () => {
    if (cropperRef.current) {
      const croppedData = cropperRef.current.cropper
        .getCroppedCanvas()
        .toDataURL();
      try {
        const dataForm = new FormData();
        dataForm.append("file", croppedData);
        dataForm.append("upload_preset", "xpwide");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dva0jwx03/image/upload",
          { method: "POST", body: dataForm }
        );

        const data = await response.json();
        if (response.ok) {
          setImages([...images, data.secure_url]);
          setSelectedImage(null);
        } else {
          toast.error("Failed to upload image");
        }
      } catch (err) {
        console.error("Image upload error:", err);
        toast.error("Image upload failed");
      }
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (images.length !== 3) {
      toast.error("Please upload exactly 3 images");
      return;
    }

    onSubmit({ ...formData, images });
    setFormData({
      name: "",
      category: "",
      brand: "",
      price: "",
      stock: "",
      description: "",
    });
    setImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-gray-900 text-white shadow-lg">
        <div className="max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  formErrors.name
                    ? "border-red-500 text-black"
                    : "border-gray-800 bg-gray-800 focus:border-yellow-500"
                }`}
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    formErrors.category
                      ? "border-red-500 text-black"
                      : "border-gray-800 bg-gray-800 focus:border-yellow-500"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-red-500 text-sm">{formErrors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Brand
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={brandSearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBrandSearchTerm(value);
                      if (selectedBrand && value !== selectedBrand.title) {
                        setFormData((prev) => ({ ...prev, brand: "" }));
                        setSelectedBrand(null);
                      }
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                      formErrors.brand
                        ? "border-red-500 text-black"
                        : "border-gray-800 bg-gray-800 focus:border-yellow-500"
                    }`}
                    placeholder="Search brand..."
                  />
                  {fetchedBrands.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-800 bg-gray-800 max-h-48 overflow-y-auto">
                      {fetchedBrands.map((brand) => (
                        <li
                          key={brand._id}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              brand: brand._id,
                            }));
                            setBrandSearchTerm(brand.title);
                            setSelectedBrand(brand);
                            setFetchedBrands([]);
                          }}
                          className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
                        >
                          {brand.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {formErrors.brand && (
                  <p className="text-red-500 text-sm">{formErrors.brand}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  formErrors.description
                    ? "border-red-500 text-black"
                    : "border-gray-800 bg-gray-800 focus:border-yellow-500"
                }`}
                placeholder="Enter product description"
                rows="4"
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm">{formErrors.description}</p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    formErrors.price
                      ? "border-red-500 text-black"
                      : "border-gray-800 bg-gray-800 focus:border-yellow-500"
                  }`}
                  placeholder="Enter price"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm">{formErrors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    formErrors.stock
                      ? "border-red-500 text-black"
                      : "border-gray-800 bg-gray-800 focus:border-yellow-500"
                  }`}
                  placeholder="Enter stock"
                />
                {formErrors.stock && (
                  <p className="text-red-500 text-sm">{formErrors.stock}</p>
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">
                Product Images (3 required)
              </label>
              <div className="flex space-x-4 overflow-x-auto">
                {images.map((image, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={image}
                      alt={`Preview ${index}`}
                      className="h-32 w-32 rounded-lg object-cover cursor-pointer"
                      onClick={() => setPreviewImage(image)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 p-1 rounded-full bg-gray-800 hover:bg-gray-700"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ))}

                {images.length < 3 && (
                  <div className="flex items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg bg-gray-800 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                      className="flex flex-col items-center justify-center"
                    >
                      <Upload className="text-gray-400" />
                      <span className="text-sm text-gray-400 mt-1">Upload</span>
                    </button>
                    <input
                      type="file"
                      id="fileInput"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                )}
              </div>

              {selectedImage && (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[1, 16 / 9, 4 / 3, 3 / 2, 16 / 19, NaN].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2 py-1 border rounded ${
                          aspectRatio === ratio
                            ? "bg-yellow-500 text-black"
                            : ""
                        }`}
                      >
                        {isNaN(ratio) ? "Free" : `${ratio}`}
                      </button>
                    ))}
                  </div>
                  <Cropper
                    src={selectedImage}
                    style={{ height: 250, width: "100%" }}
                    aspectRatio={aspectRatio}
                    guides={false}
                    ref={cropperRef}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCrop}
                      className="mt-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-600"
                    >
                      Crop & Upload
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-800 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-600"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>

        {/* Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-full bg-gray-800 p-2 hover:bg-gray-700"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}

AddNewProduct.propTypes = {
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      isBlocked: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
};
