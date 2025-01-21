import { useState, useEffect } from "react";
import Modal from "../Modal";

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        categoryId: category._id,
        title: category.title,
        description: category.description,
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
          Update Category
        </button>
      </form>
    </Modal>
  );
}
