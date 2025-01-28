import { Route, Routes, useLocation } from "react-router-dom";
import Homepage from "../pages/user/Homepage";
import Signup from "../pages/user/Signup";
import Login from "../pages/user/Login";
import OTPVerification from "../pages/user/OTPVerification";
import ResetPasswordEmail from "../pages/user/ResetPasswordEmail";
import ResetPassword from "../pages/user/ResetPassword";
import ProductDetails from "../pages/user/ProductDetials";
import { UserAuth, UserRequireAuth } from "../components/private/userProtectedRoute";
import ShopPage from "../pages/user/ShopPage";
import Orders from "../pages/user/Orders";
import OrderDetails from "../pages/user/OrderDetials";
import Navbar from "../components/user/Navbar";
import Cart from "../pages/user/Cart";
import Profile from "../pages/user/Profile";
import ChangePassword from "../pages/user/ChangePassword";
import ManageAddress from "../pages/user/MangaeAddress";

function UserRoutes() {
  const location = useLocation();

  // Only render Navbar if the current route is not one of the excluded ones
  const showNavbar = ![
    "/signup",
    "/login",
    "/otp-verification",
    "/reset-password-email",
    "/reset-password",
    "/change-password",
  ].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />} {/* Conditionally render Navbar */}
      <Routes>
        {/* Public Routes */}
        <Route path="signup" element={<UserRequireAuth><Signup /></UserRequireAuth>} />
        <Route path="login" element={<UserRequireAuth><Login /></UserRequireAuth>} />
        <Route path="otp-verification" element={<UserRequireAuth><OTPVerification /></UserRequireAuth>} />
        <Route path="reset-password-email" element={<UserRequireAuth><ResetPasswordEmail /></UserRequireAuth>} />
        <Route path="reset-password" element={<UserRequireAuth><ResetPassword /></UserRequireAuth>} />

        {/* Protected Routes (Requires Authentication) */}
        <Route index element={<Homepage />} />
        <Route path="shop/:categoryTitle" element={<ShopPage />} />
        <Route path="product/:productId" element={<ProductDetails />} />
        
        {/* Wrapping protected routes with UserAuth */}
        <Route path="cart" element={<UserAuth><Cart /></UserAuth>} />
        <Route path="profile" element={<UserAuth><Profile /></UserAuth>} />
        <Route path="change-password" element={<UserAuth><ChangePassword /></UserAuth>} />
        <Route path="address" element={<UserAuth><ManageAddress /></UserAuth>} />
        <Route path="orders" element={<UserAuth><Orders /></UserAuth>} />
        <Route path="order-detials" element={<UserAuth><OrderDetails /></UserAuth>} />

        {/* Catch-all Route */}
        <Route path="*" element={<>404 PAGE NOT FOUND</>} />
      </Routes>
    </>
  );
}

export default UserRoutes;
