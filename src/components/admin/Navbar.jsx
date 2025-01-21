import { useDispatch } from "react-redux";
import { logout } from "../../store/adminSlice"; // Import the logout action
import { Search, User, LogOut } from "lucide-react";
import { adminAxiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const dispatch = useDispatch(); // Dispatch function from Redux
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Perform any necessary API logout request
      const response = await adminAxiosInstance.post("/logout");

      // If the response is successful, clear the Redux state and localStorage
      if (response) {
        dispatch(logout()); // Dispatch the logout action to clear adminInfo from Redux store
        localStorage.removeItem("adminInfo"); // Ensure that adminInfo is removed from localStorage

        // Redirect to login page and show a success toast
        navigate("/admin");
        toast.success("Logout Success");
      }
    } catch (error) {
      toast.error("Logout Failed");
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center">
        {/* Logo */}
        {/* <img 
          src="/placeholder.svg" 
          alt="XPWide Logo" 
          className="h-8 w-auto"
        /> */}
      </div>

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
}
