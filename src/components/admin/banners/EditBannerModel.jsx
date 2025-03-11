import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../../utils/axios";
import axios from "axios";

export default function EditBannerModal({ banner, onSubmit, onClose }) {
  const [title, setTitle] = useState(banner.title);
  const [link, setLink] = useState(banner.link);
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(banner.image);
  const cropperRef = useRef(null);

  useEffect(() => {
    setTitle(banner.title);
    setLink(banner.link);
    setCroppedImage(banner.image);
  }, [banner]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      return () => URL.revokeObjectURL(imageUrl);
    }
  }, []);

  const handleCrop = useCallback(async () => {
    if (!cropperRef.current) return;

    const canvas = cropperRef.current.cropper.getCroppedCanvas();
    if (!canvas) {
      toast.error("Failed to crop image");
      return;
    }

    try {
      const croppedData = canvas.toDataURL();
      const dataForm = new FormData();
      dataForm.append("file", croppedData);
      dataForm.append("upload_preset", "xpwide");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dva0jwx03/image/upload",
        dataForm,
        {headers:{"Content-Type" : "multipart/form-data"}}
      );

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      setCroppedImage(data.secure_url);
      setSelectedImage(null);
      toast.success("Image updated!");
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Error uploading image:", err);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!title || !croppedImage || !link) {
        toast.error("Please fill all fields");
        return;
      }

      try {
        const res = await adminAxiosInstance.put(`/banners/${banner._id}`, {
          title,
          link,
          image: croppedImage,
        });

        onSubmit(res.data);
        onClose();
      } catch (err) {
        toast.error("Update failed");
        console.error("Error updating banner:", err);
      }
    },
    [title, link, croppedImage, banner._id, onSubmit, onClose]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Banner</h2>
          <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Banner Title"
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Banner Link"
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
          <input type="file" onChange={handleImageChange} />
          {selectedImage && (
            <Cropper
              ref={cropperRef}
              src={selectedImage}
              style={{ height: 300, width: "100%" }}
              aspectRatio={16 / 9}
              guides={false}
            />
          )}
          {selectedImage && (
            <button
              type="button"
              onClick={handleCrop}
              className="bg-blue-600 p-2 rounded text-white"
            >
              Crop Image
            </button>
          )}
          <button type="submit" className="bg-green-600 p-2 rounded text-white">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

EditBannerModal.propTypes = {
  banner: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
