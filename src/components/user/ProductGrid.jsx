// components/ProductGrid.js
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { axiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/featured-products");
        setProducts(response.data.products);
      } catch (err) {
        toast.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="px-4 py-8">
      <h2 className="text-xl font-bold mb-6 text-center">HOT GAMES</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 &&
            products
              .filter((product) => !product.isBlocked)
              .map((product) => (
                <ProductCard
                  key={product._id}
                  {...product}
                  onClick={handleClick}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
