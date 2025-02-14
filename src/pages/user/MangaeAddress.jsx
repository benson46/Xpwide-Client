import React from "react";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast"; // Toast for notifications
import AddressForm from "../../components/user/AddressForm"; // Assuming AddressForm exists
import Sidebar from "../../components/user/Sidebar";
import { axiosInstance } from "../../utils/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ManageAddress() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [addresses, setAddresses] = useState([]); // Store address list
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axiosInstance.get("/address", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setAddresses(response.data.addresses);
        } else {
          toast.error("Failed to fetch addresses.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching addresses.");
      }
    };

    fetchAddresses();
  }, [user, navigate]);

  const handleAddAddress = () => {
    if (addresses.length >= 10) {
      toast.error("You can only add up to 10 addresses.");
      return;
    }
    setShowNewForm(true);
    setEditingId(null);
  };

  const handleEditAddress = (addressId) => {
    
    setEditingId(addressId);
    setShowNewForm(false);
  };

  const handleDeleteClick = (addressId) => {
    setDeletingId(addressId);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        const token = localStorage.getItem("accessToken");
        await axiosInstance.delete(`/address/${deletingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAddresses(addresses.filter((addr) => addr._id !== deletingId));
        toast.success("Address deleted successfully.");
        setDeletingId(null);
      } catch (error) {
        toast.error("Failed to delete address.");
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (editingId) {
        const response = await axiosInstance.put(`/address/${editingId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      

        if (response.data.success) {
          setAddresses(
            addresses.map((addr) =>
              addr._id === editingId ? { ...data, _id: addr._id } : addr
            )
          );
          toast.success("Address updated successfully.");
          setEditingId(null);
        }
      } else {
        const response = await axiosInstance.post("/address", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setAddresses([...addresses, response.data.savedAddress]);
          toast.success("Address added successfully.");
          setShowNewForm(false);
        }
      }
    } catch (error) {
      toast.error("Failed to save address.");
    }
  };

  const handleCancel = () => {
    setShowNewForm(false);
    setEditingId(null);
  };

  const deletingAddress = deletingId
    ? addresses.find((addr) => addr._id === deletingId)
    : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Sidebar */}
      <main className="flex-1 p-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold">Manage Addresses</h1>
              <p className="text-sm text-gray-500">
                You can add up to 10 delivery addresses.
              </p>
            </div>
            <button
              onClick={handleAddAddress}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4" /> ADD A NEW ADDRESS
            </button>
          </div>

          {showNewForm && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <AddressForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          )}

          {addresses.map((address) => (
            <div
              key={address._id}
              className="bg-gray-50 shadow-md rounded-lg p-6 mb-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-full">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">
                      {address.addressType ? address.addressType.toUpperCase() : "UNKNOWN"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.name}</span>
                        <span className="text-sm text-gray-500">
                          {address.phoneNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddress(address._id)}
                        className="p-2 rounded-full text-gray-500 hover:text-gray-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(address._id)}
                        className="p-2 rounded-full text-gray-500 hover:text-gray-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {address.address}, {address.locality}, {address.city},
                    {address.state} - {address.pincode}
                  </p>
                </div>
              </div>

              {editingId === address._id && (
                <div className="bg-gray-100 p-6 rounded-lg">
                  <AddressForm
                    address={address}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Delete Confirmation Modal */}
          {deletingId && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-lg font-semibold">Delete Address</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete this address?
                  {deletingAddress && (
                    <div className="mt-2 text-sm">
                      {deletingAddress.address}, {deletingAddress.locality},
                      {deletingAddress.city}
                    </div>
                  )}
                </p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 text-gray-500 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}