import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"
import Modal from "../../Modal";

export default function EditBrandModal({ isOpen, onClose, brand, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (brand) {
      setFormData({
        title: brand.title,
        description: brand.description,
      });
    }
  }, [brand]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...brand, ...formData });
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Brand">
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
          Update Brand
        </button>
      </form>
    </Modal>
  );
}

EditBrandModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,  // Boolean flag for modal visibility
  onClose: PropTypes.func.isRequired, // Function to close modal
  onUpdate: PropTypes.func.isRequired, // Function to update brand details
  brand: PropTypes.shape({             // Object validation for brand
    title: PropTypes.string,
    description: PropTypes.string,
  }),
};

EditBrandModal.defaultProps = {
  brand: {
    title: "",
    description: "",
  },
};