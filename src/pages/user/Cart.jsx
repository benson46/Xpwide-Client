import React from "react";
import { useState, useEffect } from "react";
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
        const response = await axiosInstance.get("/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const cartProducts = response.data.items;
        if (cartProducts && cartProducts.length > 0) {
          setProducts(
            cartProducts.map((product) => ({
              id: product.productId._id,
              name: product.productId.name,
              category: product.productId.category,
              manufacturer: product.productId.manufacturer,
              price: product.productId.price,
              quantity: product.quantity,
              stock: product.productId.stock,
              image: product.productId.images[0],
            }))
          );
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
    setProducts((products) => {
      const updatedProducts = products.map((product) => {
        if (product.id === id) {
          const newQuantity = product.quantity + change;
          // Allow decreasing the quantity even if stock is 0
          if (newQuantity < 1) return product;
          console.log("hee");
          // Prevent increasing the quantity beyond stock or limit (e.g., 5)
          if (newQuantity > product.stock || newQuantity > 5) return product;
          return { ...product, quantity: newQuantity };
        }
        return product;
      });

      const newSubtotal = updatedProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
      );
      setSubtotal(newSubtotal);

      return updatedProducts;
    });

    try {
      const updatedProduct = products.find((product) => product.id === id);
      if (updatedProduct) {
        const response = await axiosInstance.patch(
          "/cart",
          {
            productId: id,
            quantity: updatedProduct.quantity + change,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeProduct = async (id) => {
    setProducts((products) => {
      const updatedProducts = products.filter((product) => product.id !== id);
      if (updatedProducts.length === 0) setSubtotal(0);
      return updatedProducts;
    });

    try {
      await axiosInstance.delete("/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: {
          productId: id,
        },
      });
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
            Looks like you haven&#39;t added anything to your cart yet.
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
                      <p className="font-medium">₹{product.price}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
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

                      <div className="flex items-center gap-2">
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
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <button
                disabled={
                  products.some(
                    (product) =>
                      product.stock === 0 || product.quantity > product.stock
                  ) ||
                  products.length === 0 ||
                  products.quantity <= 1
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
