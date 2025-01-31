import { useState, useEffect, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProductModal({
  products,
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
  const [images, setImages] = useState([]); // To store existing and newly cropped images
  const [selectedImage, setSelectedImage] = useState(null); // For image being cropped
  const [previewImage, setPreviewImage] = useState(null); // For full-screen preview
  const cropperRef = useRef(null);
  const [loading, setLoading] = useState(true);


  
  useEffect(() => {
    if (products) {
      console.log(products)
      setFormData({
        id: products._id,
        name: products.name,
        category: products.category._id,
        brand: products.brand._id,
        price: products.price,
        stock: products.stock,
        description: products.description,
      });

      setImages(products.images || []);
    }
    setLoading(false)
  }, [products]);

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

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedData = cropperRef.current.cropper
        .getCroppedCanvas()
        .toDataURL();
      setImages([...images, croppedData]);
      setSelectedImage(null); // Clear the cropper
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index)); // Remove image by index
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (images.length !== 3) {
      toast.error("Please upload exactly 3 images.");
      return;
    }
    const updatedProduct = { ...formData, images };
    console.log(updatedProduct)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form Fields */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">
          Product Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full rounded-lg border px-3 py-2 text-sm  placeholder-gray-600 focus:outline-none ${
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className={`w-full rounded-lg border px-3 py-2 text-sm  placeholder-gray-600 focus:outline-none ${
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">Brand</label>
        <select
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className={`w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-600 focus:outline-none ${
            formErrors.brand
              ? "border-red-500 text-black"
              : " text-white border-gray-800 bg-gray-800 focus:border-yellow-500"
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={`w-full rounded-lg border px-3 py-2 text-sm  placeholder-gray-600 focus:outline-none ${
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

      <div className="grid grid-cols-2 gap-4">
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
            className={`w-full rounded-lg border px-3 py-2 text-sm  placeholder-gray-600 focus:outline-none ${
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
            className={`w-full rounded-lg border px-3 py-2 text-sm  placeholder-gray-600 focus:outline-none ${
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
      {/* Cropper and Images */}
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
                onClick={() => setPreviewImage(image)} // Open modal on click
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

        {selectedImage && (
          <Cropper
            src={selectedImage}
            style={{ height: 250, width: "100%" }}
            initialAspectRatio={16 / 9}
            guides={false}
            ref={cropperRef}
          />
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

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)} // Close modal on click
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </form>
  );
}
