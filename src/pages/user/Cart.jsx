import React, { useState, useEffect, useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { debounce } from "lodash";
import { axiosInstance } from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();
  const debouncedUpdatesRef = useRef({});

  // Cleanup debounced functions on component unmount
  useEffect(() => {
    return () => {
      Object.values(debouncedUpdatesRef.current).forEach(debouncedFn => 
        debouncedFn.cancel()
      );
    };
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/cart");
        const cartProducts = response.data.items;
        
        if (cartProducts?.length > 0) {
          const mappedProducts = cartProducts.map((item) => ({
            id: item.productId._id,
            name: item.productId.name,
            category: item.productId.category,
            manufacturer: item.productId.manufacturer,
            price: item.productId.hasOffer ? item.productId.discountedPrice : item.productId.price,
            originalPrice: item.productId.price,
            hasOffer: item.productId.hasOffer,
            offer: item.productId.offer,
            quantity: item.quantity,
            stock: item.productId.stock,
            image: item.productId.images[0],
          }));
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

  const updateQuantity = useCallback((id, change) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.id === id) {
          const newQuantity = product.quantity + change;
          if (newQuantity < 1 || newQuantity > product.stock || newQuantity > 5) {
            return product;
          }
          return { ...product, quantity: newQuantity };
        }
        return product;
      });
      
      // Update subtotal optimistically
      const newSubtotal = updatedProducts.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
      setSubtotal(newSubtotal);
      return updatedProducts;
    });

    // Cancel any pending updates for this product
    if (debouncedUpdatesRef.current[id]) {
      debouncedUpdatesRef.current[id].cancel();
    }

    // Create new debounced function if it doesn't exist
    if (!debouncedUpdatesRef.current[id]) {
      debouncedUpdatesRef.current[id] = debounce(async (productId, quantity) => {
        try {
          const response = await axiosInstance.patch("/cart", { 
            productId, 
            quantity 
          });

          if (response.data.success) {
            // Update stock from server response
            setProducts(prevProducts => 
              prevProducts.map(p => 
                p.id === productId 
                  ? { ...p, stock: response.data.productStock } 
                  : p
              )
            );
            toast.success(response.data.message);
          }
        } catch (error) {
          console.error("Update failed:", error);
          // Revert to server state on error
          try {
            const response = await axiosInstance.get("/cart");
            const cartProducts = response.data.items.map((item) => ({
              id: item.productId._id,
              quantity: item.quantity,
              stock: item.productId.stock,
              // ... other properties
            }));
            setProducts(cartProducts);
            setSubtotal(response.data.subtotal);
            toast.error("Failed to update quantity. Please try again.");
          } catch (fetchError) {
            console.error("Error fetching cart:", fetchError);
          }
        }
      }, 500); // 500ms debounce delay
    }

    // Get current quantity from state (after optimistic update)
    const currentQuantity = products.find(p => p.id === id)?.quantity || 0;
    const targetQuantity = currentQuantity + change;
    
    if (targetQuantity >= 1 && targetQuantity <= 5) {
      debouncedUpdatesRef.current[id](id, targetQuantity);
    }
  }, [products]);

  const removeProduct = async (id) => {
    try {
      // Cancel any pending updates for this product
      if (debouncedUpdatesRef.current[id]) {
        debouncedUpdatesRef.current[id].cancel();
        delete debouncedUpdatesRef.current[id];
      }

      const res = await axiosInstance.delete("/cart", { data: { productId: id } });
      
      if (res.data.success) {
        setProducts(prev => {
          const updated = prev.filter(p => p.id !== id);
          setSubtotal(updated.reduce((sum, p) => sum + p.price * p.quantity, 0));
          return updated;
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
                  products.length === 0 || 
                  products.some(p => p.quantity > p.stock)
                }
                className={`w-full py-2 rounded transition-colors ${
                  products.length === 0 ||
                  products.some(p => p.stock === 0 || p.quantity > p.stock)
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