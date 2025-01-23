import axios from "axios";
import { showErrorToast } from './toastUtils';
import { showCustomAlert } from './customAlert';

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/user",
    withCredentials: true, // send cookies to the server
});

axiosInstance.interceptors.response.use(
    async (response) => {
      // Check if the user data is included in the response
      const user = response?.data?.user;
  
      // If the user is blocked, redirect them to the login page
      if (user && user.isBlocked) {
        console.error("User is blocked. Redirecting to login.");
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(new Error("User is blocked"));
      }
  
      // Otherwise, return the response
      return response;
    },
    (error) => {
      // Handle other errors (e.g., token refresh)
      return Promise.reject(error);
    }
  );

  
  
export const adminAxiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    withCredentials: true,
});

export const googleAxiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/google",
    withCredentials: true,
});
