import React from "react";
import { Link } from "react-router-dom";
import { User, Heart, ShoppingBag, Search, LogOut } from "lucide-react";
import { Button } from "../ui/Buttons";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/userSlice";
import Logo from '../../assets/Images/Logo.png'


function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useSelector((state) => state.user?.user);
  const dispatch = useDispatch();
  const isLoggedIn = !!user;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    dispatch(logout(user._id));
  };

  return (
    <div className="flex flex-col w-full">
      <nav className="flex items-center justify-between px-4 py-4 bg-black text-white">
        <div className="flex items-center flex-1">
          <Link to="/" className="flex items-center">
            <img
              src={Logo}
              alt="XPWIDE Logo"
              className="h-[60px] w-[80px]"
            />
          </Link>
        </div>

        <div className="flex-1 text-center">
          <Link to="/" className="text-2xl font-bold tracking-wider">
            XPWIDE
          </Link>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 rounded bg-white text-black w-full max-w-xs"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300"
                onClick={toggleDropdown}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
              {showDropdown && (
                <div
                  className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50"
                  style={{ transform: "translateX(-40%)" }}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="absolute -top-2 right-1/2 translate-x-1/2 w-4 h-4 bg-white rotate-45 z-40"></div>

                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    onClick={() => setShowDropdown(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/wallet"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                    onClick={() => setShowDropdown(false)}
                  >
                    Wallet
                  </Link>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300"
              >
                <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300"
              >
                <Link to="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-gray-300"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="text-white hover:text-gray-300"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  variant="solid"
                  className="text-white bg-blue-600 hover:bg-blue-500"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
