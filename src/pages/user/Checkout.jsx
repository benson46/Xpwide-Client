import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { IndianRupee, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AddressForm from "../../components/user/AddressForm";
import AddressCard from "../../components/user/AddressCard";
import OrderSuccessModal from "../../components/user/OrderSuccessMadal";

export default function CheckoutPage() {
  const user = useSelector((state) => state.user?.user);
  const token = localStorage.getItem("accessToken");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [products, setProducts] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    quantity: 0,
    originalPrice: 0,
    discountedPrice: 0,
    deliveryFee: 0,
    couponDiscount: 0,
    total: 0,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const [addressResponse, checkoutResponse] = await Promise.all([
          axiosInstance.get("/address"),
          axiosInstance.get("/checkout"),
        ]);

        setAddresses(addressResponse.data.addresses);
        if (addressResponse.data.addresses.length > 0) {
          setSelectedAddress(addressResponse.data.addresses[0]._id);
        }

        setProducts(checkoutResponse.data.items);
        const summary = checkoutResponse.data;
        setOrderSummary({
          quantity: summary.quantity,
          originalPrice: summary.subtotal,
          discountedPrice: 0,
          deliveryFee: summary.deliveryFee,
          couponDiscount: summary.couponDiscount,
          total: summary.subtotal,
        });
      } catch (error) {
        toast.error("Failed to load checkout data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleAddressSubmit = async (formData) => {
    try {
      if (!editingAddress && addresses.length >= 10) {
        toast.error("Maximum 10 addresses allowed");
        return;
      }
      if (editingAddress) {
        // Update existing address
        const response = await axiosInstance.put(
          `/address/${editingAddress._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAddresses(
          addresses.map((addr) =>
            addr._id === editingAddress._id ? response.data.address : addr
          )
        );
        toast.success("Address updated successfully");
        setEditingAddress(null);
      } else {
        // Add new address
        const response = await axiosInstance.post("/address", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses([...addresses, response.data.savedAddress]);
        setSelectedAddress(response.data.savedAddress._id);
        toast.success("Address added successfully");
      }
      setShowAddAddress(false);
    } catch (error) {
      toast.error(
        editingAddress ? "Failed to update address" : "Failed to add address"
      );
      console.error(error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(editingAddressId === address._id ? null : address._id);
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await axiosInstance.post("/apply-coupon", {
        couponCode,
      });
      setOrderSummary((prev) => ({
        ...prev,
        couponDiscount: response.data.discount,
        total: prev.total - response.data.discount,
      }));
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      const response = await axiosInstance.post("/orders", {
        addressId: selectedAddress,
        paymentMethod,
        products: products.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        totalAmount: orderSummary.total,
      });

      console.log(response);

      toast.success("Order placed successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      toast.error("Failed to place order");
      console.error(error);
    }
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  console.log(products);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            {products.map((product) => (
              <div key={product.productId._id} className="flex gap-4 mb-5">
                <img
                  src={product.productId?.images[0] || "placeholder.svg"}
                  alt={product.productId.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium">{product.productId.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold flex items-center">
                      <IndianRupee className="h-4 w-4" />
                      {product.productId.price}
                    </span>
                  </div>
                  <div className="mt-1">
                    {product.productId.stock === 0 ? (
                      <span className="text-red-500 font-medium">
                        Stock Not Available
                      </span>
                    ) : (
                      <span className="text-green-500">
                        In Stock: {product.productId.stock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            <div className="space-y-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  isSelected={selectedAddress === address._id}
                  onSelect={() => setSelectedAddress(address._id)}
                  onEdit={handleEditAddress}
                  isEditing={editingAddressId === address._id}
                  onCancelEdit={handleCancelEdit}
                  onSubmit={(formData) => {
                    handleAddressSubmit({
                      ...formData,
                      _id: address._id,
                    });
                    setEditingAddressId(null);
                  }}
                />
              ))}

              <button
                onClick={() => {
                  setShowAddAddress(!showAddAddress);
                  setEditingAddress(null);
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                {showAddAddress ? "Hide Form" : "Add New Address"}
              </button>

              {showAddAddress && (
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="font-medium mb-4">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </h3>
                  <AddressForm
                    address={editingAddress}
                    onSubmit={handleAddressSubmit}
                    onCancel={() => {
                      setShowAddAddress(false);
                      setEditingAddress(null);
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
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">
                    Pay when you receive your order
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <div>
                  <p className="font-medium">Razorpay</p>
                  <p className="text-sm text-gray-600">
                    Pay securely with credit/debit card or UPI
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-4"
                />
                <div>
                  <p className="font-medium">Wallet</p>
                  <p className="text-sm text-gray-600">
                    Available balance: ₹1,500
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Price Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Price ({orderSummary?.quantity} item)</span>
              {""}
              {/* Assuming one product for now */}
              <span className="flex items-center">
                <IndianRupee className="h-4 w-4" />
                {orderSummary?.originalPrice?.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Product Discount</span>
              <span className="text-green-600 flex items-center">
                -<IndianRupee className="h-4 w-4" />
                {/* {(
                  orderSummary.originalPrice - orderSummary?.discountedPrice
                ).toLocaleString()} */}
                {orderSummary.discountedPrice}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              {orderSummary?.deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {typeof orderSummary?.deliveryFee === "number"
                    ? orderSummary.deliveryFee.toLocaleString()
                    : "0"}
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
                {typeof orderSummary?.total === "number"
                  ? orderSummary.total.toLocaleString()
                  : "0"}
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

          <button
            onClick={handlePlaceOrder}
            disabled={
              !selectedAddress ||
              products.some((product) => product.productId.stock === 0)
            }
            className="mt-6 w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Order
          </button>
        </div>
      </div>
      <OrderSuccessModal
        isOpen={showSuccessModal}
        amount={orderSummary.total}
        onClose={handleContinueShopping}
      />
    </div>
  );
}
