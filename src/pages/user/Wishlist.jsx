import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const user = useSelector((state) => state.user?.user);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await axiosInstance.get("/get-wishlist");
      setWishlistItems(data.wishlists || []);
    } catch (error) {
      console.error("Error fetching wishlist", error);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // Fetch the current cart from the backend
      const { data } = await axiosInstance.get("/cart");
      const cartItems = data.items; // Extract items from the response

      // Check if the item is already in the cart
      const itemInCart = cartItems.some((cartItem) => {
        console.log(`cart item Id : ${JSON.stringify(cartItem.productId)}`);
        return cartItem.productId._id.toString() === item._id.toString();
      });
      console.log(`item: ${JSON.stringify(item)}`)

      console.log(itemInCart)

      if (itemInCart) {
        // Item is already in the cart, show a toast message
        toast.error(`${item.name} is already in the cart`);
      } else {
        // Item is not in the cart, add to the cart
        if (item.stock) {
          await axiosInstance.post("/cart", {
            productId: item._id,
            quantity: 1,
          });
          toast.success(`${item.name} added to cart`);
        }
      }
    } catch (error) {
      console.error("Error fetching cart data", error);
      toast.error("Error checking cart status");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await axiosInstance.post("/add-wishlist", { productId });
      setWishlistItems((prev) =>
        prev.filter((item) => item.product._id !== productId)
      );
    } catch (error) {
      console.error("Error removing from wishlist", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
        Wishlist
      </h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header - Hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 border-b text-sm font-semibold bg-gray-50">
          <div className="sm:col-span-5">PRODUCT</div>
          <div className="sm:col-span-2">PRICE</div>
          <div className="sm:col-span-2">STOCK</div>
          <div className="sm:col-span-3">ACTIONS</div>
        </div>

        {/* Items */}
        <div className="divide-y">
          {wishlistItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">Your wishlist is empty</p>
              <a href="/products" className="text-blue-600 hover:underline">
                Continue Shopping
              </a>
            </div>
          ) : (
            wishlistItems.map(({ product }) => (
              <div
                key={product._id}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-4 p-4 items-start sm:items-center"
              >
                {/* Product */}
                <div className="flex gap-4 w-full sm:col-span-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {product.category}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {product.publisher}
                    </p>
                  </div>
                </div>

                {/* Price - Responsive positioning */}
                <div className="sm:col-span-2 text-sm sm:text-base">
                  <span className="sm:hidden text-gray-600 mr-2">Price:</span>₹
                  {product.price}
                </div>

                {/* Stock Status */}
                <div className="sm:col-span-2">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      product.stock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock ? "IN STOCK" : "OUT OF STOCK"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:gap-2 w-full sm:w-auto sm:col-span-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.stock}
                    className={`flex-1 sm:w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors ${
                      product.stock
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="flex-1 sm:w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
