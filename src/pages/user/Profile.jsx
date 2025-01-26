"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/user/Sidebar";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

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
                      type={
                        key === "email"
                          ? "email"
                          : key === "phoneNumber"
                          ? "tel"
                          : "text"
                      }
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      disabled={key === "email"} // Disable editing email
                    />
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
          </div>
        </div>
      </main>
    </div>
  );
}
