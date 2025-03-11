import React from "react";
import { useState } from "react";
import Modal from "../../Modal";
import PropTypes from "prop-types";

export default function AddBrandModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
      onSubmit(formData);
    setFormData({ title: "", description: "" });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Brand">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-white mb-2"
          >
            Brand Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            placeholder="Brand Name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-white mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            placeholder="Description"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors font-medium"
        >
          Add Brand
        </button>
      </form>
    </Modal>
  );
}
AddBrandModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,   // Expecting a boolean
  onClose: PropTypes.func.isRequired,  // Expecting a function
  onSubmit: PropTypes.func.isRequired, // Expecting a function
};