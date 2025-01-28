import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { HeartIcon, IndianRupee } from "lucide-react";
import Navbar from "../../components/user/Navbar";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const [count, setCount] = useState(0);
  const [product, setProduct] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const navigate = useNavigate();
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const { productId } = useParams();
  const ZoomLevel = 2.5;
  const [relatedProducts, setRelatedProducts] = useState([]);

  const reviews = [
    {
      author: "Anonymous",
      rating: 5,
      comment: "Nice Game",
    },
    {
      author: "David",
      rating: 4,
      comment: "Value for money, But addictive",
    },
    {
      author: "Sarah",
      rating: 5,
      comment: "Good game",
    },
  ];

  useEffect(() => {
    const fetchProductDetail = async () => {
      const response = await axiosInstance.get("/product", {
        params: { productId },
      });
      if (response.data.product.isBlocked) {
        toast.error("Product Blocked");
        navigate("/");
      } else {
        setProduct(response.data.product);
        const relatedProducts = await axiosInstance.get("/related-products", {
          params: {
            categoryId: response.data.product.category?._id,
            brandId: response.data.product.brand?._id,
            productId,
          },
        });
        setRelatedProducts(relatedProducts.data.products);
      }
    };
    fetchProductDetail();
  }, [productId]);

  const handleImage = (operation) => {
    if ((count <= 0 && operation === "-") || (count >= 2 && operation === "+"))
      return;
    if (operation === "+") setCount((prev) => ++prev);
    if (operation === "-") setCount((prev) => --prev);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = async (productId) => {
    if (quantity > product.stock || quantity > 5) {
      toast.error("Selected quantity exceeds stock available");
      return;
    }

    try {
      const response = await axiosInstance.post("/cart", {
        productId,
        quantity,
      });
      if (response.status === 200) {
        toast.success("Product added to cart successfully");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image Section */}
          <div className="relative">
            <div
              ref={imageRef}
              className="relative aspect-square w-3/4 h-auto overflow-hidden rounded-lg"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {product?.images && (
                <img
                  src={product.images[count] || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            {/* Navigation Buttons */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow"
              onClick={() => handleImage("-")}
            >
              &lt;
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow"
              onClick={() => handleImage("+")}
            >
              &gt;
            </button>
            {/* Image Position Indicator */}
            <div className="flex justify-center mt-2 gap-2">
              {product.images?.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    count === index ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></span>
              ))}
            </div>

            {/* Zoom Container */}
            {isZoomed && (
              <div className="hidden lg:block absolute top-0 left-[100%] ml-4 w-[400px] h-[400px] overflow-hidden border border-gray-200 bg-white">
                {product.images && (
                  <div
                    style={{
                      backgroundImage: `url(${product.images[count]})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: `${ZoomLevel * 100}%`,
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">(128 Reviews)</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold flex items-center">
                <IndianRupee /> {product.price}
              </p>
              <p className="text-sm text-gray-500">{product.description}</p>
            </div>
            <div className="flex flex-col w-full items-start gap-4">
              {product.stock > 0 ? (
                <>
                  <div className="gap-2 flex items-center">
                    <label
                      htmlFor="quantity"
                      className="text-black text-lg font-medium"
                    >
                      Quantity:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={Math.min(product.stock, 5)} // Limit the max to the smaller value between stock and 5
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > product.stock) {
                          toast.error("Quantity exceeds available stock");
                          setQuantity(product.stock); // Reset to max stock
                        } else if (value > 5) {
                          toast.error("You cannot purchase more than 5 units");
                          setQuantity(5); // Reset to max 5
                        } else if (value >= 1) {
                          setQuantity(value); // Valid value
                        }
                      }}
                      className="w-24 border text-center p-2 rounded"
                    />
                  </div>

                  <button
                    className={`flex-1 bg-orange-500 text-white px-5 py-2 rounded ${
                      product.stock > 0
                        ? "hover:bg-orange-600"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock <= 0}
                  >
                    ADD TO CART
                  </button>

                  <button className="py-2 px-5 border rounded flex gap-4 items-center text-gray-700 text-lg font-medium">
                    Wishlist <HeartIcon />
                  </button>
                </>
              ) : (
                <p className="text-red-500 font-bold">Out of Stock</p>
              )}
            </div>
            <div className="text-gray-700 text-md font-semibold">
              <p>Brand: {product?.brand?.title}</p>
              <p>Category: {product?.category?.title}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.author}</span>
                </div>
                <p className="text-sm text-gray-500">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="border rounded overflow-hidden"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{relatedProduct.name}</h3>
                    <p className="texsdt-lg font-bold mt-2">
                      {relatedProduct.price}
                    </p>
                    <button
                      className="w-full bg-blue-500 text-white p-2 mt-4 rounded"
                      onClick={() => navigate(`/product/${relatedProduct._id}`)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No related products found.</p>
          )}
        </div>
      </div>
    </>
  );
}
