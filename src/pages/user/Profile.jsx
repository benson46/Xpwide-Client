import React from 'react';
import { useEffect, useState } from "react";
import Sidebar from "../../components/user/Sidebar";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import validate from "../../utils/validate";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    referralCode:"",
  });
  const user = useSelector((state) => state.user?.user);
  const googleUser = useSelector((state) => state?.user?.user?.googleUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error("Please Login to continue");
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axiosInstance.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const { userData } = response.data;
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            referralCode: userData.uniqueReferralCode || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load user profile.");
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form data
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.put(
        "/profile",
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating the profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate password fields
    const { oldPassword, newPassword, confirmPassword } = passwordData;
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    const errors = validate({ password: newPassword });
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.post(
        "/change-password",
        {
          oldPassword,
          newPassword,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Password updated successfully!");
        setIsPasswordModalOpen(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating the password.");
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(formData.referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              Your information is safe with us
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
              {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type={key === "email" ? "email" : key === "phoneNumber" ? "tel" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      disabled={key === "email" || key === "referralCode"} // Disable editing email and referral code
                    />
                    {key === "referralCode" && (
                      <button
                        type="button"
                        onClick={handleCopyReferralCode}
                        className="absolute right-2 top-9 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </form>
            {!googleUser && (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="mt-6 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Old Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="text"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="text"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
