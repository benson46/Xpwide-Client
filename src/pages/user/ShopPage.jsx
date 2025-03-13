import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategorySidebar from "../../components/user/CategorySidebar";
import toast from "react-hot-toast";
import { axiosInstance } from "../../utils/axios";
import ProductCard from "../../components/user/ProductCard";

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { categoryTitle } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const endpoint = `/products?category=${
          categoryTitle === "all" ? "all" : categoryTitle
        }`;
        const response = await axiosInstance.get(endpoint);
        const filteredProducts = response.data.products.filter(product => !product.isBlocked);

        setProducts(filteredProducts);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryTitle]);

  // Compute sorted products based on the current sortBy and products state
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return a.isFeatured ? -1 : 1;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "a-z":
          return (a.name || "").localeCompare(b.name || "");
        case "z-a":
          return (b.name || "").localeCompare(a.name || "");
        default:
          return 0;
      }
    });
  }, [sortBy, products]);

  // Navigate to product details page
  const handleClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Sidebar for categories */}
      <CategorySidebar currentCategory={categoryTitle || "all"} />

      {/* Main content area */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          {/* Page title */}
          <h1 className="text-2xl font-bold">
            {categoryTitle === "all" || !categoryTitle
              ? "All Products"
              : categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1)}
          </h1>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.length === 0 && !loading ? (
            <p>No products available in this category.</p>
          ) : (
            sortedProducts.map((product) => (
              <ProductCard
                key={product._id}
                _id={product._id}
                name={product.name}
                price={product.price}
                images={product.images || []}
                onClick={() => handleClick(product._id)}
                hasOffer={product.hasOffer}
                discountedPrice={product.discountedPrice} // Make sure this matches your backend field name.
                offer={product.offer}
                stock={product.stock}
              />
            ))
          )}
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
