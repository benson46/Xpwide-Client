import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProductModal({
  product,
  categories,
  brands,
  onClose,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [images, setImages] = useState([]); // Existing and new images
  const [selectedImage, setSelectedImage] = useState(null); // For image being cropped
  const [previewImage, setPreviewImage] = useState(null); // For full-screen preview
  const cropperRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Aspect ratio state (default 16:9)
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  // Update the cropper's aspect ratio when it changes
  useEffect(() => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.setAspectRatio(aspectRatio);
    }
  }, [aspectRatio]);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product._id,
        name: product.name,
        category: product.category._id,
        brand: product.brand._id,
        price: product.price,
        stock: product.stock,
        description: product.description,
      });
      setImages(product.images || []);
    }
    setLoading(false);
  }, [product]);

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
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedData = croppedCanvas.toDataURL();
      try {
        const dataForm = new FormData();
        const blob = await new Promise((resolve) =>
          croppedCanvas.toBlob(resolve)
        );
        dataForm.append("file", blob);
        dataForm.append("upload_preset", "xpwide");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dva0jwx03/image/upload",
          { method: "POST", body: dataForm }
        );

        const data = await response.json();
        if (response.ok) {
          setImages((prev) => [...prev, data.secure_url]);
          setSelectedImage(null);
        }
      } catch (err) {
        toast.error("Failed to upload image");
        console.error("Error uploading image : ",err)
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
      toast.error("Please upload exactly 3 images.");
      return;
    }
    const updatedProduct = { ...formData, images };
    onUpdate(updatedProduct);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-lg mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <div className="relative max-h-[90vh] overflow-y-auto p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-gray-700 p-2 hover:bg-gray-600"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
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

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
                  formErrors.category
                    ? "border-red-500 text-black"
                    : "text-white border-gray-800 bg-gray-800 focus:border-yellow-500"
                }`}
              >
                <option value="">Select category</option>
                {categories
                  .filter((category) => !category.isBlocked)
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
              </select>
              {formErrors.category && (
                <p className="text-red-500 text-sm">{formErrors.category}</p>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                Brand
              </label>
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
                  formErrors.brand
                    ? "border-red-500 text-black"
                    : "text-white border-gray-800 bg-gray-800 focus:border-yellow-500"
                }`}
              >
                <option value="">Select brand</option>
                {brands
                  .filter((brand) => !brand.isBlocked)
                  .map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.title}
                    </option>
                  ))}
              </select>
              {formErrors.brand && (
                <p className="text-red-500 text-sm">{formErrors.brand}</p>
              )}
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
                className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
                  formErrors.description
                    ? "border-red-500 text-black"
                    : "text-white border-gray-800 bg-gray-800 focus:border-yellow-500"
                }`}
                placeholder="Enter product description"
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm">{formErrors.description}</p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Price
                </label>
                {console.log(formData)}
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
                    formErrors.price
                      ? "border-red-500 text-black"
                      : "text-white border-gray-800 bg-gray-800 focus:border-yellow-500"
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
                    formErrors.stock
                      ? "border-red-500 text-black"
                      : "text-white border-gray-800 bg-gray-800 focus:border-yellow-500"
                  }`}
                  placeholder="Enter stock"
                />
                {formErrors.stock && (
                  <p className="text-red-500 text-sm">{formErrors.stock}</p>
                )}
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">
                Product Images
              </label>
              <div className="flex space-x-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Cropped ${index}`}
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
                  <div className="flex items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg bg-gray-800">
                    <button
                      type="button"
                      onClick={() => document.getElementById("fileInput").click()}
                      className="flex flex-col items-center justify-center"
                    >
                      <Upload className="text-gray-400" />
                      <span className="text-sm text-gray-400">Upload Image</span>
                    </button>
                    <input
                      type="file"
                      id="fileInput"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Cropper and Aspect Ratio Options */}
              {selectedImage && (
                <>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio(1)}
                      className={`px-2 py-1 border rounded ${
                        aspectRatio === 1 ? "bg-yellow-500 text-black" : ""
                      }`}
                    >
                      1:1
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio(16 / 9)}
                      className={`px-2 py-1 border rounded ${
                        aspectRatio === 16 / 9 ? "bg-yellow-500 text-black" : ""
                      }`}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio(4 / 3)}
                      className={`px-2 py-1 border rounded ${
                        aspectRatio === 4 / 3 ? "bg-yellow-500 text-black" : ""
                      }`}
                    >
                      4:3
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio(3 / 2)}
                      className={`px-2 py-1 border rounded ${
                        aspectRatio === 3 / 2 ? "bg-yellow-500 text-black" : ""
                      }`}
                    >
                      3:2
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio(16 / 19)}
                      className={`px-2 py-1 border rounded ${
                        aspectRatio === 16 / 19 ? "bg-yellow-500 text-black" : ""
                      }`}
                    >
                      16:19
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio(NaN)}
                      className={`px-2 py-1 border rounded ${
                        isNaN(aspectRatio) ? "bg-yellow-500 text-black" : ""
                      }`}
                    >
                      Free
                    </button>
                  </div>
                  <Cropper
                    src={selectedImage}
                    style={{ height: 250, width: "100%" }}
                    aspectRatio={aspectRatio}
                    guides={false}
                    ref={cropperRef}
                  />
                </>
              )}

              <div className="flex justify-end gap-3">
                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleCrop}
                    className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-600"
                  >
                    Crop Image
                  </button>
                )}
              </div>
            </div>

            {/* Submit and Cancel */}
            <div className="flex justify-end gap-3">
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

EditProductModal.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.object.isRequired,
    brand: PropTypes.object.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      isBlocked: PropTypes.bool,
    })
  ).isRequired,
  brands: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      isBlocked: PropTypes.bool,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
