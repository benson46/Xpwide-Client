import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/category");
        let categoryData = response.data.categories;
        categoryData = categoryData.filter(category => !category.isBlocked);
  
        setCategories([{ _id: "0001", title: "All Products", icon: "🌟" }, ...categoryData]);
      }  catch (err) {
        toast.error(`Failed to fetch categories: ${err}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/shop/${category.title === "All Products" ? "all" : category.title}`);
  };

  return (
    <div className="px-4 my-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-4 gap-6 md:flex-wrap md:justify-center md:gap-8">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <span className="text-xl md:text-2xl">{category.icon}</span>
              </div>
              <span className="text-xs md:text-sm font-medium text-center">{category.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}