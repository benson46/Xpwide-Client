"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategorySidebar from "../../components/user/CategorySidebar";
import Pagination from "../../components/Pagination";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();
  const { categoryTitle } = useParams(); // Fetch category from route params

  // Fetch products based on the current category
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Call the endpoint with the category as a query parameter
        const endpoint = `/products?category=${categoryTitle === "all" ? "all" : categoryTitle}`;
        const response = await axiosInstance.get(endpoint);
        setProducts(response.data.products);
        setFilteredProducts(response.data.products); // Initially show all fetched products
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, [categoryTitle]);
  

  // Sort products whenever `sortBy` changes
  useEffect(() => {
    const sortProducts = () => {
      const sorted = [...products].sort((a, b) => {
        switch (sortBy) {
          case "featured":
            // Show featured products first
            if (a.isFeatured === b.isFeatured) return 0; // If both have the same featured status, no change
            return a.isFeatured ? -1 : 1; // Featured products come first
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "a-z":
            const titleA = a.name || '';
            const titleB = b.name || '';
            return titleA.localeCompare(titleB);
          case "z-a":
            const titleC = a.name || '';
            const titleD = b.name || '';
            return titleD.localeCompare(titleC);
          default:
            return 0;
        }
      });
      setFilteredProducts(sorted);
    };
  
    sortProducts();
  }, [sortBy, products]);
  

  // Navigate to product details page
  const handleClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <CategorySidebar currentCategory={categoryTitle || "all"} />{" "}
      {/* Pass currentCategory to Sidebar */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {categoryTitle === "all" || !categoryTitle
              ? "All Products"
              : categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1)}
          </h1>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products available in this category.</p>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleClick(product._id)}
              >
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-[330px] object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {product.name}
                  </h3>
                  <p className="font-bold text-gray-600">₹{product.price}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
