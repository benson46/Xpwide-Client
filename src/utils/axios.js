import axios from "axios";
import { showErrorToast } from "./toastUtils";
import { showCustomAlert } from "./customAlert";

// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/user",
  withCredentials: true, // Send cookies to the server
});

// Add a request interceptor to axiosInstance
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const email = user.email
    console.log(email)
    const authToken = user.accessToken;
    console.log(authToken)

    if (!email) {
      console.warn("User email not found in localStorage");
    } else {
      config.headers["User-Email"] = email; // Add email to headers
    }

    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`; // Add token to headers if available
    }

    return config; // Proceed with the request
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error); // Reject the request on error
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response, // Return response as is for successful requests
  (error) => {
    console.error("Response error:", error);

    // Handle 403 Forbidden (User Blocked) response
    if (error.response?.status === 403) {
      // Show a custom alert
      showCustomAlert(
        "Blocked Account",
        "Your account has been blocked. Please contact support or try logging in again."
      );

      // Clear sensitive data from localStorage
      localStorage.removeItem("user");

      // Redirect to the login page
      window.location.href = "/login"; // Adjust the path as per your app's routing
    } else {
      // Handle other errors with a toast
      showErrorToast(error.response?.data?.message || "An unexpected error occurred");
    }

    return Promise.reject(error); // Reject the response on error
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
