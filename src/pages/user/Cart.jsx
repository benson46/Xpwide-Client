import React, { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { axiosInstance } from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/cart");

        const cartProducts = response.data.items;
        if (cartProducts && cartProducts.length > 0) {
          const mappedProducts = cartProducts.map((item) => {
            const prod = item.productId;
            return {
              id: prod._id,
              name: prod.name,
              category: prod.category,
              manufacturer: prod.manufacturer,
              // Use discountedPrice if an offer exists, otherwise the original price
              price: prod.hasOffer ? prod.discountedPrice : prod.price,
              originalPrice: prod.price,
              hasOffer: prod.hasOffer,
              offer: prod.offer,
              quantity: item.quantity,
              stock: prod.stock,
              image: prod.images[0],
            };
          });
          setProducts(mappedProducts);
          setSubtotal(response.data.subtotal);
        } else {
          setProducts([]);
          setSubtotal(0);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (id, change) => {
    try {
      const product = products.find((product) => product.id === id);
      if (!product) return;
      
      const newQuantity = product.quantity + change;
      if (newQuantity < 1 || newQuantity > product.stock || newQuantity > 5) return;
  
      const response = await axiosInstance.patch("/cart", { productId: id, quantity: newQuantity });
  
      if (response.data.success) {
        const updatedStock = response.data.productStock; // Get latest stock from backend
  
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.map((p) => {
            if (p.id === id) {
              const adjustedQuantity = Math.min(p.quantity + change, updatedStock);
              return { ...p, quantity: adjustedQuantity, stock: updatedStock };
            }
            return p;
          });
  
          const newSubtotal = updatedProducts.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          );
          setSubtotal(newSubtotal);
          return updatedProducts;
        });
  
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };
  

  const removeProduct = async (id) => {
    try {
      // Make the API call to remove the product
      const res = await axiosInstance.delete("/cart", {data: { productId: id },
      });

      if (res.data.success) {
        // Update local state only if API call was successful
        setProducts((prevProducts) => {
          const updatedProducts = prevProducts.filter((p) => p.id !== id);
          const newSubtotal = updatedProducts.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          );
          setSubtotal(newSubtotal);
          return updatedProducts;
        });
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">SHOPPING CART</h1>
        <button
          className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
          onClick={() => navigate("/shop/all")}
        >
          CONTINUE SHOPPING
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center p-10 bg-white shadow-sm rounded-lg">
          <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
          <p className="text-gray-600 mt-2">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            onClick={() => navigate("/shop/all")}
            className="mt-4 px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="font-semibold mb-4">MY CART</h2>
            <div className="space-y-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="w-32 h-32 flex-shrink-0">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded cursor-pointer"
                      />
                    </Link>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.manufacturer}
                        </p>
                      </div>
                      <div>
                        {product.hasOffer ? (
                          <div className="flex flex-col items-end">
                            <p className="font-medium text-green-600">
                              ₹{product.price.toFixed(2)}
                            </p>
                            <p className="text-sm line-through text-gray-500">
                              ₹{product.originalPrice.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="font-medium">
                            ₹{product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          disabled={product.quantity <= 1}
                          className="p-1 rounded border hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          disabled={
                            product.quantity >= product.stock ||
                            product.quantity >= 5 ||
                            product.stock === 0
                          }
                          className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <span
                          className={
                            product.stock === 0 ||
                            product.quantity > product.stock
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {product.stock === 0 ||
                          product.quantity > product.stock
                            ? "OUT OF STOCK"
                            : "IN STOCK"}
                        </span>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          REMOVE
                        </button>
                      </div>

                      {/* Per item total price */}
                      <div className="ml-auto font-bold">
                        ₹{(product.price * product.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">SUBTOTAL</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <button
                disabled={
                  products.length === 0 || products.some((p) => p.quantity > p.stock)
                }
                
                className={`w-full py-2 rounded transition-colors ${
                  products.length === 0 ||
                  products.some(
                    (product) =>
                      product.stock === 0 || product.quantity > product.stock
                  )
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
                onClick={() => navigate("/checkout")}
              >
                BUY ALL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
