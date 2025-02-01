import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../../Modal";

export default function AddCategoryModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    icon: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: "", icon: "" });
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="icon"
            className="block text-sm font-medium text-white mb-2"
          >
            Category Icon
          </label>
          <input
            type="text"
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            placeholder="icon text"
            required
          />
          
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-white mb-2"
          >
            Category Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            placeholder="Category Name"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors font-medium"
        >
          Add Category
        </button>
      </form>
    </Modal>
  );
}

AddCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // Boolean flag for modal visibility
  onClose: PropTypes.func.isRequired, // Function to close modal
  onSubmit: PropTypes.func.isRequired, // Function to submit form data
};