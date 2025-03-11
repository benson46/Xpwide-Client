import axios from "axios";
import { showCustomAlert } from "./customAlert";
import store from "../store/store";
import { adminLogout} from "../store/adminSlice";
import { logout } from "../store/userSlice";
import toast from "react-hot-toast";
// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_USER_API_BASE_URL,
  withCredentials: true, // Send cookies to the server
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
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
        store.dispatch(logout());
        localStorage.removeItem('user')
        window.location.href = "/login"
      } catch (logoutError) {
        console.error("Failed to logout after 401 error",logoutError)
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
      if (error.response.data.message) {
        toast.error(error.response?.data?.message);
      }
    }
    return Promise.reject(error);
  }
);

export const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL,
  withCredentials: true,
});


adminAxiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);
adminAxiosInstance.interceptors.response.use(
  (response) => response, // Pass the response as is if no error
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to unauthorized access (401) and not retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to prevent an infinite loop

      try {
        // Dispatch the logout action to clear admin info and logout
        store.dispatch(adminLogout());
        localStorage.removeItem('adminInfo')

        // Optionally, redirect to the login page (if using react-router-dom)
        window.location.href = "/admin";
      } catch (logoutError) {
        console.error("Failed to logout after 401 error:", logoutError);
      }
    }

    // Reject the promise with the error
    return Promise.reject(error);
  }
);


export const googleAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_GOOGLE_USER_API_BASE_URL,
  withCredentials: true,
});