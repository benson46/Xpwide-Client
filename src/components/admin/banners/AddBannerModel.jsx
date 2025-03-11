import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Upload } from "lucide-react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../../utils/axios";
import axios from "axios";

export default function AddBannerModal({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [previewImage, setPreviewImage] = useState(null);
  const cropperRef = useRef(null);

  // Update cropper when aspect ratio changes
  useEffect(() => {
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.setAspectRatio(aspectRatio);
    }
  }, [aspectRatio]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const handleCrop = async () => {
    if (!cropperRef.current) return;

    try {
      const canvas = cropperRef.current.cropper.getCroppedCanvas();
      const croppedData = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg");
      });

      const dataForm = new FormData();
      dataForm.append("file", croppedData);
      dataForm.append("upload_preset", "xpwide");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dva0jwx03/image/upload",
        dataForm,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const data = await response.data;
      if (response.statusText !== "OK") throw new Error(data.message);

      setCroppedImage(data.secure_url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Upload error:", err);
    } finally {
      setSelectedImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !croppedImage || !link) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await adminAxiosInstance.post("/banners", {
        title,
        link,
        image: croppedImage,
      });

      onSubmit(res.data);
      onClose();
    } catch (err) {
      toast.error("Failed to create banner");
      console.log("Error submitting banner : ", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-screen overflow-hidden">
    
    {/* Header (Fixed) */}
    <div className="flex justify-between p-6 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
      <h2 className="text-xl font-semibold">Add New Banner</h2>
      <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded">
        <X size={24} />
      </button>
    </div>

    {/* Scrollable Content */}
    <div className="p-6 max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Link *</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full bg-gray-800 rounded p-2"
            required
          />
        </div>

        {/* Image Upload & Crop Section */}
        <div>
          <label className="block mb-2">Image *</label>
          {!selectedImage && !croppedImage && (
            <div className="border-2 border-dashed border-gray-800 rounded p-8 text-center">
              <button
                type="button"
                onClick={() => document.getElementById("file-input").click()}
                className="flex flex-col items-center w-full text-gray-400"
              >
                <Upload className="mb-2" />
                Click to upload (Recommended: 16:9 or 3:1)
              </button>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </div>
          )}

          {selectedImage && (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio(16 / 9)}
                  className={`px-3 py-1 rounded ${
                    aspectRatio === 16 / 9
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800"
                  }`}
                >
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(3 / 1)}
                  className={`px-3 py-1 rounded ${
                    aspectRatio === 3 / 1
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800"
                  }`}
                >
                  3:1
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(NaN)}
                  className={`px-3 py-1 rounded ${
                    isNaN(aspectRatio)
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800"
                  }`}
                >
                  Free
                </button>
              </div>
              <Cropper
                src={selectedImage}
                style={{ height: 400, width: "100%" }}
                aspectRatio={aspectRatio}
                guides={true}
                autoCropArea={1}
                viewMode={1}
                ref={cropperRef}
                dragMode="move"
                cropBoxMovable={true}
                cropBoxResizable={true}
                toggleDragModeOnDblclick={false}
              />
              <button
                type="button"
                onClick={handleCrop}
                className="mt-2 w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600"
              >
                Crop & Upload Image
              </button>
            </>
          )}

          {croppedImage && (
            <div className="relative">
              <img
                src={croppedImage}
                alt="Cropped preview"
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={() => setPreviewImage(croppedImage)}
              />
              <button
                type="button"
                onClick={() => setCroppedImage(null)}
                className="absolute top-2 right-2 bg-gray-800 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {previewImage && (
          <div
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        )}
      </form>
    </div>

    {/* Footer (Fixed) */}
    <div className="p-6 border-t border-gray-800 bg-gray-900 sticky bottom-0 z-10 flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-gray-800 rounded hover:bg-gray-800"
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={handleSubmit}
        className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
      >
        Create Banner
      </button>
    </div>
  </div>
</div>

  );
}

AddBannerModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
