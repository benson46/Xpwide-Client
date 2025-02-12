import React, { memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { logoutAdmin } from "../../store/adminSlice"; 
import { Search, User, LogOut } from "lucide-react";
import { adminAxiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Memoizing handleLogout function to prevent re-renders
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
      console.error(`Logout Error : ${error}`);
    }
  }, [dispatch, navigate]);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <input
            type="search"
            placeholder="search"
            className="w-full bg-gray-900 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <User className="h-5 w-5" />
          <span>Admin</span>
        </div>
        <button className="text-yellow-500 hover:text-yellow-400" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

// Wrap in React.memo
export default memo(Navbar);
