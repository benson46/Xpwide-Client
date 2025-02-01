import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; 
import Modal from "../../Modal";

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    icon: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        categoryId: category._id,
        title: category.title,
        icon: category.icon,
      });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...category, ...formData }); // Pass updated category data
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Category">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label
            htmlFor="icon"
            className="block text-sm font-medium text-white mb-2"
          >
            icon
          </label>
          <input
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
             className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-yellow-500"
            placeholder="icon"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors font-medium"
        >
          Update Category
        </button>
      </form>
    </Modal>
  );
}

EditCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // Boolean flag for modal visibility
  onClose: PropTypes.func.isRequired, // Function to close modal
  onUpdate: PropTypes.func.isRequired, // Function to update category data
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired, // Ensure _id is a string and required
    title: PropTypes.string.isRequired, // Ensure title is a string and required
    icon: PropTypes.string.isRequired, // Ensure icon is a string and required
  }).isRequired, // Ensure category object is required
};