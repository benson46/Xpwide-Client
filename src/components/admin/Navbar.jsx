"use client";

import { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../store/adminSlice";
import { User, LogOut, Menu } from "lucide-react";
import { adminAxiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      const response = await adminAxiosInstance.post("/logout");
      if (response) {
        dispatch(logoutAdmin());
        localStorage.removeItem("adminInfo");
        navigate("/admin");
        toast.success("Logout Success");
      }
    } catch (error) {
      toast.error("Logout Failed");
      console.error(`Logout Error: ${error}`);
    }
  }, [dispatch, navigate]);

  return (
    <nav className="w-full overflow-hidden flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800">
      {/* Toggle button for the sidebar */}
      <button
        onClick={toggleSidebar}
        className="text-yellow-500 hover:text-yellow-400 p-1"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <User className="h-5 w-5" />
          <span className="hidden sm:inline">Admin</span>
        </div>
        <button
          className="text-yellow-500 hover:text-yellow-400 p-1"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default memo(Navbar);
