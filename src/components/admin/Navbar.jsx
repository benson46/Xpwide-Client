import React,{ memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../store/adminSlice";
import { User, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const Navbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = useCallback(async () => {
    try {
        dispatch(adminLogout());
        localStorage.removeItem("adminInfo");
        navigate("/admin");
        toast.success("Logout Success");
    } catch (err) {
      toast.error("Logout Failed");
      console.error(`Logout err: ${err}`);
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

Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
};

export default memo(Navbar);
