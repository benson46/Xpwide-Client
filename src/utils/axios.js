import axios from "axios";
import { showErrorToast } from "./toastUtils";
import { showCustomAlert } from "./customAlert";
import store from '../store/store'
import { logout } from "../store/adminSlice";
// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/user",
  withCredentials: true, // Send cookies to the server
});

// Add a request interceptor to axiosInstance
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const email = user?.email || "";
    console.log(email)
    const authToken = user?.accessToken || null;
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



adminAxiosInstance.interceptors.request.use(
  (config) => {
    const admin = JSON.parse(localStorage.getItem('adminInfo'));
   if(admin){
    const { accessToken } =  admin;
    if(accessToken){
      config.headers['Authorization'] = `Bearer ${accessToken}`
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
    console.log(error)
    if( error.response.status === 401 && !originalRequest._retry){
      try {
        const resultAction = await adminAxiosInstance.post('/refresh-access-token');
        console.log('ivda ethia')

        const admin =JSON.parse( localStorage.getItem('adminInfo'));
        console.log(admin)
        admin.accessToken = resultAction.data.accessToken;

        localStorage.setItem('adminInfo', JSON.stringify(admin));
        return adminAxiosInstance(originalRequest);

      } catch (error) {
        store.dispatch(logout());
        return Promise.reject(error)
      }
    }
  }
)