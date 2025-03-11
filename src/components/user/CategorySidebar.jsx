import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import PropTypes from "prop-types";

export default function CategorySidebar({ currentCategory }) {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/category");
        let categoryData = response.data.categories;
        categoryData = categoryData.filter(category => !category.isBlocked);
        setCategories(categoryData);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (category) => {
    navigate(`/shop/${category === "all" ? "all" : category}`);
  };
  

  return (
    <aside className="w-64 p-6 border-r">
      <div className="mb-8">
        <h2 className="font-semibold mb-4">PRODUCT CATEGORIES</h2>
        <ul className="space-y-2">
          <li>
            <button
              className={`block w-full text-left p-2 rounded-md ${
                currentCategory === "all" ? "bg-gray-200" : ""
              }`}
              onClick={() => handleCategoryChange("all")}
            >
              All Products
            </button>
          </li>
          {categories.map((category) => (
            <li key={category._id}>
              <button
                className={`block w-full text-left p-2 rounded-md ${
                  currentCategory === category.title ? "bg-gray-200" : ""
                }`}
                onClick={() => handleCategoryChange(category.title)}
              >
                {category.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}


CategorySidebar.propTypes = {
  currentCategory: PropTypes.string.isRequired, // Validate currentCategory as a required string
};