import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Homepage from "../pages/user/Homepage";
import Signup from "../pages/user/Signup";
import Login from "../pages/user/Login";
import OTPVerification from "../pages/user/OTPVerification";
import ResetPassword from "../pages/user/ResetPassword";
import ProductDetails from "../pages/user/ProductDetails";
import {
  UserAuth,
  UserRequireAuth,
} from "../components/private/UserProtectedRoute"; 
import ShopPage from "../pages/user/ShopPage";
import Orders from "../pages/user/Orders";
import Navbar from "../components/user/Navbar";
import Cart from "../pages/user/Cart";
import Profile from "../pages/user/Profile";
import ManageAddress from "../pages/user/ManageAddress";
import CheckoutPage from "../pages/user/Checkout";
import ForgotPasswordEmail from "../pages/user/ForgotPasswordEmail";
import Wallet from "../pages/user/Wallet";
import Wishlist from "../pages/user/Wishlist";
import NotFound from "../components/user/404page";
import AboutUs from "../pages/user/AboutUs";
import Contact from "../pages/user/Contact";
import Footer from "../components/user/footer";

function UserRoutes() {
  const location = useLocation();

  // Only render Navbar if the current route is not one of the excluded ones
  const showNavbar = ![
    "/signup",
    "/login",
    "/otp-verification",
    "/change-password-email",
    "/change-password",
    "/change-password",
  ].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />} {/* Conditionally render Navbar */}
      <Routes>
        {/* Public Routes */}
        <Route
          path="signup"
          element={
            <UserRequireAuth>
              <Signup />
            </UserRequireAuth>
          }
        />
        <Route
          path="login"
          element={
            <UserRequireAuth>
              <Login />
            </UserRequireAuth>
          }
        />
        <Route
          path="otp-verification"
          element={
            <UserRequireAuth>
              <OTPVerification />
            </UserRequireAuth>
          }
        />
        <Route
          path="change-password-email"
          element={
            <UserRequireAuth>
              <ForgotPasswordEmail />
            </UserRequireAuth>
          }
        />
        <Route
          path="change-password"
          element={
            <UserRequireAuth>
              <ResetPassword />
            </UserRequireAuth>
          }
        />
        <Route index element={<Homepage />} />
        <Route path="shop/:categoryTitle" element={<ShopPage />} />
        <Route path="product/:productId" element={<ProductDetails />} />
        {/* Wrapping protected routes with UserAuth */}
        <Route
          path="cart"
          element={
            <UserAuth>
              <Cart />
            </UserAuth>
          }
        />
        <Route
          path="checkout"
          element={
            <UserAuth>
              <CheckoutPage />
            </UserAuth>
          }
        />
        <Route
          path="profile"
          element={
            <UserAuth>
              <Profile />
            </UserAuth>
          }
        />
        <Route
          path="address"
          element={
            <UserAuth>
              <ManageAddress />
            </UserAuth>
          }
        />
        <Route
          path="orders"
          element={
            <UserAuth>
              <Orders />
            </UserAuth>
          }
        />
        <Route
          path="wallet"
          element={
            <UserAuth>
              <Wallet />
            </UserAuth>
          }
        />
        <Route
          path="wishlist"
          element={
            <UserAuth>
              <Wishlist />
            </UserAuth>
          }
        />
        {/* Catch-all Route */}
        <Route path="aboutus" element={<AboutUs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default UserRoutes;
