import { useState, useEffect, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Upload, X } from "lucide-react";

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
  const [images, setImages] = useState([]); // To store existing and newly cropped images
  const [selectedImage, setSelectedImage] = useState(null); // For image being cropped
  const [previewImage, setPreviewImage] = useState(null); // For full-screen preview
  const cropperRef = useRef(null);

  useEffect(() => {
    if (products) {
      setFormData({
        id: products._id,
        name: products.name,
        category: products.category.title,
        brand: products.brand.title,
        price: products.price,
        stock: products.stock,
        description: products.description,
      });

      setImages(products.images || []);
    }
  }, [products]);

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
    const updatedProduct = { ...formData, images };
    onUpdate(updatedProduct);
    onClose();
  };

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
          className="w-full rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
          placeholder="Enter product name"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">
          Category
        </label>
        <select
          value={formData.category.title}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
        >
          <option value="">Select category</option>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <option key={category._id} value={category.title}>
                {category.title}
              </option>
            ))
          ) : (
            <option disabled>Loading categories...</option>
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">Brand</label>
        <select
          value={formData.brand.title}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
        >
          <option value="">Select brand</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand.title}>
              {brand.title}
            </option>
          ))}
        </select>
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
          className="w-full rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
          placeholder="Enter product description"
        />
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
            className="w-full rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
            placeholder="Enter price"
          />
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
            className="w-full rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
            placeholder="Enter stock"
          />
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
