import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/user/Homepage";
import Signup from "../pages/user/Signup";
import Login from "../pages/user/Login";
import OTPVerification from "../pages/user/OTPVerification";
import ResetPasswordEmail from "../pages/user/ResetPasswordEmail";
import ResetPassword from "../pages/user/ResetPassword";
import ProductDetails from "../pages/user/ProductDetials";
import { UserAuth, UserRequireAuth } from "../components/private/userProtectedRoute";

function UserRoutes() {
  return (
    <>
    <Routes>
      <Route index element={<Homepage />} />
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
        path="reset-password-email"
        element={
          <UserRequireAuth>
            <ResetPasswordEmail />
          </UserRequireAuth>
        }
      />
      <Route
        path="reset-password"
        element={
          <UserRequireAuth>
            <ResetPassword />
          </UserRequireAuth>
        }
      />
      <Route path="product/:productId" element={<ProductDetails />} />
      <Route path="*" element={<>404 PAGE NOT FOUND</>} />
      </Routes>
    </>
  );
}

export default UserRoutes;
