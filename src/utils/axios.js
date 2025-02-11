import axios from "axios";
import { showCustomAlert } from "./customAlert";
import store from "../store/store";
import { logoutAdmin } from "../store/adminSlice";
import { logout } from "../store/userSlice";
import toast from "react-hot-toast";
// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_USER_API_BASE_URL,
  withCredentials: true, // Send cookies to the server
});

axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      const { email, accessToken } = user;

      // Add Authorization header if accessToken exists
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Add User-Email header if email exists
      if (email) {
        config.headers["User-Email"] = email;
      } else {
        console.warn("User email not found in localStorage");
      }
    }

    return config; // Proceed with the request
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error); // Reject the request on error
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, // Return response as is for successful requests
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        // Attempt to refresh the token
        const resultAction = await axiosInstance.post("/refresh-token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
          user.accessToken = resultAction.data.accessToken;
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden (User Blocked)
    if (error.response?.status === 403) {
      toast.error(
        '"Your account has been blocked. Please contact support or try logging in again."'
      );
      showCustomAlert("Blocked Account");

      localStorage.removeItem("user");
      window.location.href = "/login";
    } else {
      if(error.response.data.message){
        toast.error(error.response?.data?.message )
      }
    }
    return Promise.reject(error);
  }
);

export const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL,
  withCredentials: true,
});

export const googleAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_GOOGLE_USER_API_BASE_URL,
  withCredentials: true,
});

adminAxiosInstance.interceptors.request.use(
  (config) => {
    const admin = JSON.parse(localStorage.getItem("adminInfo"));
    if (admin) {
      const { adminAccessToken } = admin;
      if (adminAccessToken) {
        config.headers["Authorization"] = `Bearer ${adminAccessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

adminAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    toast.error(error.response.data.message);
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const resultAction = await adminAxiosInstance.post("/refresh-access-token");
        const admin = JSON.parse(localStorage.getItem("adminInfo"));
        
        if(admin){
          admin.adminAccessToken = resultAction.data.adminAccessToken;
          localStorage.setItem("adminInfo", JSON.stringify(admin));
        }
        return adminAxiosInstance(originalRequest);
      } catch (error) {
        console.error("Token refresh failed:", error);
        store.dispatch(logoutAdmin());
        return Promise.reject(error);
      }
    }
  }
);
