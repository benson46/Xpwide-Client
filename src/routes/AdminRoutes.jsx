import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserList from "../pages/admin/UsersPage";
import Categories from "../pages/admin/Categories";
import ProductPage from "../pages/admin/ProductPage";
import Brands from "../pages/admin/Brands";
import { AdminAuth, AdminRequireAuth } from "../components/private/AdminProtectedRoute";

function AdminRoutes() {
  return (
    <>
    <Routes>
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
      <Route path="*" element={<>404 PAGE NOT FOUND</>} />
      </Routes>
    </>
  );
}

export default AdminRoutes;
