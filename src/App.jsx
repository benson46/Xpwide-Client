import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/user/Homepage";
import Signup from "./pages/user/Signup";
import Login from "./pages/user/Login";
import OTPVerification from "./pages/user/OTPVerification";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserList from "./pages/admin/UsersPage";
import Categories from "./pages/admin/Categories";
import ProductPage from "./pages/admin/ProductPage";
import Brands from "./pages/admin/Brands";
import ResetPasswordEmail from "./pages/user/ResetPasswordEmail";
import ResetPassword from "./pages/user/ResetPassword";
import ProductDetails from "./pages/user/ProductDetials";
import {
  AdminAuth,
  AdminRequireAuth,
} from "./components/private/AdminProtectedRoute";
import {
  UserAuth,
  UserRequireAuth,
} from "./components/private/userProtectedRoute";

function App() {
  return (
    <div>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin">
          <Route
            index
            element={
              <AdminRequireAuth>
                <AdminLogin />
              </AdminRequireAuth>
            }
          />
          <Route
            path="dashboard"
            element={
              <AdminAuth>
                <AdminDashboard />
              </AdminAuth>
            }
          />
          <Route
            path="users"
            element={
              <AdminAuth>
                <UserList />
              </AdminAuth>
            }
          />
          <Route
            path="categories"
            element={
              <AdminAuth>
                <Categories />
              </AdminAuth>
            }
          />
          <Route
            path="brands"
            element={
              <AdminAuth>
                <Brands />
              </AdminAuth>
            }
          />
          <Route
            path="products"
            element={
              <AdminAuth>
                <ProductPage />
              </AdminAuth>
            }
          />
        </Route>

        {/* User routes */}
        <Route path="/">
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
        </Route>
        {/* Page Not Found */}
        <Route path="/*" element={<>404 PAGE NOT FOUND</>}></Route>
        <Route path="/admin/*" element={<>404 PAGE NOT FOUND</>}></Route>
      </Routes>
    </div>
  );
}

export default App;
