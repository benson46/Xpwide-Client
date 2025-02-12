import { useEffect, useState } from "react";
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
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
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

  // Fetch initial data
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

        setProducts(checkoutResponse.data.items || []);
        const summary = checkoutResponse.data;
        setOrderSummary({
          quantity: summary.quantity || 0,
          originalPrice: summary.total || 0, // Changed from subtotal to total
          discountedPrice: 0,
          deliveryFee: summary.deliveryFee || 0,
          couponDiscount: summary.couponDiscount || 0,
          total: summary.total || 0, // Changed from subtotal to total
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

  // Handle address submission
  const handleAddressSubmit = async (formData, addressId) => {
    try {
      const isEditing = Boolean(addressId);
      const endpoint = isEditing ? `/address/${addressId}` : "/address";
      const method = isEditing ? "put" : "post";

      await axiosInstance[method](endpoint, formData);

      // Fetch updated address list
      const addressResponse = await axiosInstance.get("/address");
      const addressList = addressResponse.data.addresses || [];
      setAddresses(addressList);

      if (!isEditing) {
        const newAddressId = addressList[addressList.length - 1]._id;
        setSelectedAddress(newAddressId);
      }

      toast.success(`Address ${isEditing ? "updated" : "added"} successfully`);
      setEditingAddressId(null);
      setShowAddAddress(false);
    } catch (error) {
      console.error("Address submission error:", error);
      toast.error(`Failed to ${isEditing ? "update" : "add"} address`);
    }
  };

  // Handle address editing
  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await axiosInstance.post("/apply", {
        code: couponCode,
        cartTotal: orderSummary.originalPrice,
        cartItems: products.map((item) => ({
          productId: item.productId._id, // Send product IDs from cart items
        })),
      });

      setOrderSummary((prev) => ({
        ...prev,
        couponDiscount: response.data.discountAmount,
        total: response.data.newTotal,
      }));
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    // Reset the coupon code and update the order summary:
    setCouponCode("");
    setOrderSummary((prev) => ({
      ...prev,
      couponDiscount: 0,
      total: prev.originalPrice, // Reset to originalPrice; adjust if deliveryFee is to be added
    }));
    toast.success("Coupon removed");
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
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
        })),
        totalAmount: orderSummary.total,
      };

      await axiosInstance.post("/checkout-order-success", orderData);

      if (paymentMethod === "Wallet") {
        await axiosInstance.post("/wallet", {
          amount: orderSummary.total,
          paymentStatus: "completed",
          type: "debit",
          products: products.map((item) => ({ productId: item.productId._id })),
        });
      }

      toast.success("Order placed successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order");
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
              // Destructure the product details from product.productId for convenience
              const prod = product.productId;
              // Determine the effective price: if an offer is active and discountedPrice is valid, use it; otherwise use the original price.
              const effectivePrice =
                prod.hasOffer &&
                prod.discountedPrice &&
                prod.discountedPrice !== 0
                  ? prod.discountedPrice
                  : prod.price;
              // Calculate per-item total (effective price * quantity)
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
                        <span className="text-lg font-bold flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {prod.price.toFixed(2)}
                        </span>
                      )}
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
                  {/* Per-item total price displayed on the right */}
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

              {/* Add New Address Button */}
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

              {/* Add New Address Form */}
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
                {orderSummary.originalPrice.toLocaleString()}
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
                {/* Show Remove Coupon option if a coupon is applied */}
                {orderSummary.couponDiscount > 0 && (
                  <button
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-red-500"
                  >
                    Remove Coupon
                  </button>
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
            </div>

            <div className="flex justify-between font-medium text-base pt-2">
              <span>Total Amount</span>
              <span className="flex items-center">
                <IndianRupee className="h-4 w-4" />
                {orderSummary.total.toLocaleString()}
              </span>
            </div>

            {orderSummary.originalPrice - orderSummary.total > 0 && (
              <div className="text-green-600 text-sm text-right">
                You will save <IndianRupee className="h-3 w-3 inline" />
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
                onClick={handlePlaceOrder}
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
          navigate("/");
        }}
      />
    </div>
  );
}
