import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { IndianRupee, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AddressForm from "../../components/user/AddressForm";
import AddressCard from "../../components/user/AddressCard";
import OrderSuccessModal from "../../components/user/OrderSuccessModal";
import RazorPay from "../../components/user/razorpay-payment/RazorPay";

export default function CheckoutPage() {
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  // State management
  const [realPrice,setRealPrice] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  // couponDetails holds the applied coupon object (id, code, discount percentage, etc.)
  const [couponDetails, setCouponDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    quantity: 0,
    originalPrice: 0,
    discountedPrice: 0,
    deliveryFee: 0,
    couponDiscount: 0,
    total: 0,
  });
  const [publicCoupons, setPublicCoupons] = useState([]);


  // Fetch initial checkout, address, and wallet data
  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [addressResponse, checkoutResponse, walletResponse] =
          await Promise.all([
            axiosInstance.get("/address"),
            axiosInstance.get("/checkout"),
            axiosInstance.get("/wallet"),
          ]);

        const addressList = addressResponse.data.addresses || [];
        setAddresses(addressList);
        if (addressList.length > 0) {
          setSelectedAddress(addressList[0]._id);
        }
        // Save the products as returned from the backend
        setProducts(checkoutResponse.data.items || []);
        const summary = checkoutResponse.data;

        setRealPrice(summary.total);
        setOrderSummary({
          quantity: summary.totalQuantity || 0,
          originalPrice: summary.originalPrice || 0,
          discountedPrice: 0,
          deliveryFee: 0,
          couponDiscount: 0,
          total: summary.total || 0,
        });
        setWalletBalance(walletResponse.data.wallet?.balance || 0);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Fetch public coupons for checkout (coupons marked as public and active)
  useEffect(() => {
    if (user) {
      const fetchPublicCoupons = async () => {
        try {
          const response = await axiosInstance.get("/coupon/public");
          setPublicCoupons(response.data.coupons);
        } catch (error) {
          console.error("Failed to fetch coupons", error);
        }
      };
      fetchPublicCoupons();
    }
  }, [user, orderSummary.originalPrice]);

  // Function to populate the coupon code when a public coupon is selected
  const handleSelectCoupon = (coupon) => {
    setCouponCode(coupon.code);
    // Save coupon details for later use (id, discount percentage, etc.)
    setCouponDetails(coupon);
    toast.success(`Coupon ${coupon.code} selected. Click apply to use it.`);
  };

  // Handle address submission (same as before)
  const handleAddressSubmit = async (formData, addressId) => {
    try {
      const isEditing = Boolean(addressId);
      const endpoint = isEditing ? `/address/${addressId}` : "/address";
      const method = isEditing ? "put" : "post";

      const response = await axiosInstance[method](endpoint, formData);

      if (response.data.success) {
        const newAddress = response.data.savedAddress;
        if (isEditing) {
          setAddresses((prevAddresses) =>
            prevAddresses.map((addr) =>
              addr._id === newAddress._id ? newAddress : addr
            )
          );
        } else {
          setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
          setSelectedAddress(newAddress._id);
        }
        toast.success(
          `Address ${isEditing ? "updated" : "added"} successfully`
        );
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "add"} address`);
      }
      setEditingAddressId(null);
      setShowAddAddress(false);
    } catch (error) {
      console.error("Address submission error:", error);
      toast.error(`Failed to ${addressId ? "update" : "add"} address`);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
  
    // If a coupon is applied, verify minimum purchase requirements
    if (
      couponDetails &&
      orderSummary.originalPrice < couponDetails.minPurchaseAmount
    ) {
      toast.error(
        `Requires ₹${couponDetails.minPurchaseAmount} minimum purchase`
      );
      return;
    }
  
    try {
      // Send coupon code to backend for verification and to get discountAmount and new total
      const response = await axiosInstance.post("/coupon/apply", {
        code: couponCode,
        cartTotal: orderSummary.total,
        cartItems: products.map((item) => ({
          productId: item.productId._id,
        })),
      });
  
      // Update order summary with coupon discount and new total amount
      setOrderSummary((prev) => ({
        ...prev,
        couponDiscount: response.data.discountAmount,
        total: response.data.newTotal,
      }));
  
      // Additionally, update each product to include its final price after coupon discount
      setProducts((prevProducts) =>
        prevProducts.map((item) => {
          // Use item-level discountedPrice and hasOffer from the checkout response
          const effectivePrice =
            item.hasOffer && item.discountedPrice && item.discountedPrice !== 0
              ? item.discountedPrice
              : item.productId.price;
  
          // Calculate discounted unit price
          const finalPrice =
            effectivePrice * (1 - couponDetails.discount / 100);
  
          return { ...item, finalPrice };
        })
      );
  
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDetails(null);
    // Remove coupon discount from the order summary by adding the coupon discount back
    setOrderSummary((prev) => ({
      ...prev,
      total: prev.total + prev.couponDiscount,
      couponDiscount: 0,
    }));
    // Revert products to their original effective prices by removing the finalPrice property
    setProducts((prevProducts) =>
      prevProducts.map((item) => ({ ...item, finalPrice: undefined }))
    );
    toast.success("Coupon removed");
  };

  console.log('products',products);
  // Handle order placement
  const handlePlaceOrder = async (paymentStatus) => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
  
    if (paymentMethod === "Wallet" && walletBalance < orderSummary.total) {
      toast.error("Insufficient wallet balance");
      return;
    }
  
    try {
      const orderData = {
        addressId: selectedAddress,
        paymentMethod,
        products: products.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          originalPrice: item.productId.price,
          productPrice: item.effectivePrice || item.productId.price,
        })),
        totalAmount: orderSummary.total,
        realPrice,
        couponCode: couponDetails ? couponDetails.code : null,
        couponId: couponDetails ? couponDetails._id : null,
        paymentStatus: paymentStatus 
      };
  
      console.log("Attempting order submission with:", orderData);
  
      // Always attempt the API call for COD/Wallet
      const response = await axiosInstance.post("/checkout-order-success", orderData);
      
      // Check if response exists before accessing data
      if (!response?.data) {
        throw new Error("No response from server");
      }
  
      if (response.data.success) {
        toast.success("Order placed successfully!");
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || "Order processing failed");
      }
    } catch (error) {
      console.error("Full error details:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Could not connect to server. Check your network connection."
      );
  
      if (error.message.includes("network")) {
        navigate("/cart");
      }
      
      if (paymentStatus === "Failed") {
        navigate("/orders");
      }
    }
  };

  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            {products.map((product) => {
              const prod = product.productId;
              const effectivePrice =
                product.finalPrice !== undefined
                  ? product.finalPrice
                  : product.hasOffer &&
                    product.discountedPrice &&
                    product.discountedPrice !== 0
                  ? product.discountedPrice
                  : prod.price;
              const itemTotal = effectivePrice * product.quantity;
              return (
                <div key={prod._id} className="flex gap-4 mb-5">
                  <img
                    src={prod?.images[0] || "/placeholder.svg"}
                    alt={prod.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{prod.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-col items-start">
                        {prod.hasOffer ? (
                          <div className="flex flex-col items-start">
                            <span className="text-lg font-bold text-green-600 flex items-center">
                              <IndianRupee className="h-4 w-4" />
                              {effectivePrice.toFixed(2)}
                            </span>
                            <span className="text-sm line-through text-gray-500">
                              ₹{prod.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start">
                            <span className="text-lg font-bold text-green-600 flex items-center">
                              <IndianRupee className="h-4 w-4" />
                              {effectivePrice.toFixed(2)}
                            </span>
                            <span className="text-sm line-through text-gray-500">
                              ₹{prod.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-1">
                      {prod.stock === 0 ? (
                        <span className="text-red-500 font-medium">
                          Stock Not Available
                        </span>
                      ) : (
                        <span className="text-green-500">
                          Quantity: {product.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center font-bold">
                    ₹{itemTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            <div className="space-y-4">
              {addresses?.length > 0 ? (
                addresses.map((address) =>
                  address?._id ? (
                    <AddressCard
                      key={address._id}
                      address={address}
                      isSelected={selectedAddress === address._id}
                      onSelect={() => setSelectedAddress(address._id)}
                      onEdit={handleEditAddress}
                      isEditing={editingAddressId === address._id}
                      onCancelEdit={handleCancelEdit}
                      onSubmit={(formData) =>
                        handleAddressSubmit(formData, address._id)
                      }
                    />
                  ) : null
                )
              ) : (
                <p>No addresses available.</p>
              )}

              <button
                onClick={() => {
                  setShowAddAddress(!showAddAddress);
                  setEditingAddressId(null);
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                {showAddAddress ? "Hide Form" : "Add New Address"}
              </button>

              {showAddAddress && !editingAddressId && (
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="font-medium mb-4">Add New Address</h3>
                  <AddressForm
                    onSubmit={handleAddressSubmit}
                    onCancel={() => {
                      setShowAddAddress(false);
                      setEditingAddressId(null);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-4">
              {[
                {
                  value: "COD",
                  label: "Cash on Delivery",
                  description: "Pay when you receive your order",
                },
                {
                  value: "Razorpay",
                  label: "Razorpay",
                  description: "Pay securely with credit/debit card or UPI",
                },
                {
                  value: "Wallet",
                  label: "Wallet",
                  description: `Available balance: ₹${walletBalance.toLocaleString()}`,
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4"
                  />
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Price Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Price ({orderSummary.quantity} item)</span>
              <span className="flex items-center">
                <IndianRupee className="h-4 w-4" />
                {realPrice}
              </span>
            </div>
            {orderSummary.discountedPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span>Product Discount</span>
                <span className="text-green-600 flex items-center">
                  -<IndianRupee className="h-4 w-4" />
                  {orderSummary.discountedPrice.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              {orderSummary.deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {orderSummary.deliveryFee.toLocaleString()}
                </span>
              )}
            </div>
            {orderSummary.couponDiscount > 0 && (
                <div className="flex justify-between mt-2 text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span className="flex items-center">
                    -<IndianRupee className="h-4 w-4" />
                    {orderSummary.couponDiscount.toLocaleString()}
                  </span>
                </div>
              )}

            {/* Coupon Code Section */}
            <div className="py-4 border-t border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Apply
                </button>
                {orderSummary.couponDiscount > 0 && (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-red-500"
                  >
                    Remove Coupon
                  </button>
                )}
              </div>
              
            </div>

            {/* Display available public coupons */}
            {publicCoupons.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Available Coupons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publicCoupons.map((coupon) => {
                    const isEligible =
                      orderSummary.originalPrice >= coupon.minPurchaseAmount;
                    return (
                      <div
                        key={coupon._id}
                        className={`border rounded-lg p-4 ${
                          isEligible
                            ? "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                            : "bg-gray-50 opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() => isEligible && handleSelectCoupon(coupon)}
                      >
                        <div className="font-bold text-gray-800">
                          {coupon.code}
                        </div>
                        <div className="text-sm text-gray-600">
                          Discount: {coupon.discount}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Min Purchase: ₹{coupon.minPurchaseAmount}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires on:{" "}
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </div>
                        {!isEligible && (
                          <div className="text-red-500 text-sm mt-2">
                            Requires ₹{coupon.minPurchaseAmount} minimum
                            purchase
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between font-medium text-base pt-2">
              <span>Total Amount</span>
              <span className="flex items-center">
                <IndianRupee className="h-4 w-4" />
                {orderSummary.total.toLocaleString()}
              </span>
            </div>

            {orderSummary.originalPrice - orderSummary.total > 0 && (
              <div className="text-green-600 text-sm text-right">
                You will save <IndianRupee className="h-3 w-3 inline" />{" "}
                {(
                  orderSummary.originalPrice - orderSummary.total
                ).toLocaleString()}{" "}
                on this order
              </div>
            )}
          </div>

          <div className="mt-6">
            {paymentMethod === "Razorpay" ? (
              <RazorPay
                amount={orderSummary.total}
                handlePlaceOrder={handlePlaceOrder}
                isWallet={false}
              />
            ) : (
              <button
                onClick={()=>handlePlaceOrder("Success")}
                className="w-full py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Place Order (
                {paymentMethod === "Wallet" ? "Wallet" : "Cash on Delivery"})
              </button>
            )}
          </div>
        </div>
      </div>

      <OrderSuccessModal
        isOpen={showSuccessModal}
        amount={orderSummary.total}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/orders");
        }}
      />
    </div>
  );
}
