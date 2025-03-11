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
    <div className="flex justify-center space-x-8 my-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        categories.map((category) => (
          <button
            key={category._id} 
            onClick={() => handleCategoryClick(category)}
            className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
              <span className="text-2xl">{category.icon}</span>
            </div>
            <span className="text-sm font-medium">{category.title}</span>
          </button>
        ))
      )}
    </div>
  );
}



