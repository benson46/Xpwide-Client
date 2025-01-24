import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/user",
  withCredentials: true, // send cookies to the server
});

// Request Interceptor for Adding Authorization Token
axiosInstance.interceptors.request.use((config) => {
  // Add access token from localStorage
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response Interceptor for Handling API Responses
axiosInstance.interceptors.response.use(
  async (response) => {
    // Handle blocked users
    const user = response?.data?.user;
    if (user && user.isBlocked) {
      console.error("User is blocked. Redirecting to login.");
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(new Error("User is blocked"));
    }

    if(user && !user.accessToken){
      const refreshResponse = await axiosInstance.get('/token',{},{withCredentials:true});
      const newAccessToken = refreshResponse
      console.log(newAccessToken)
    }

    // Return the response if everything is fine
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle access token expiration or invalid token
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Access token not provided" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark this request as retried to avoid infinite loops
      try {
        console.log("Attempting to refresh access token...");
        const refreshResponse = await axiosInstance.post("/token", {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;
        console.log(newAccessToken)

        // Update localStorage with the new token
        localStorage.setItem("accessToken", newAccessToken);

        // Update the original request with the new token and retry it
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed. Redirecting to login.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 errors for blocked users or other cases
    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "User is blocked."
    ) {
      console.error("User is blocked. Redirecting to login.");
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(new Error("User is blocked"));
    }

    // For other errors, simply reject the promise
    return Promise.reject(error);
  }
);


export const adminAxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true,
});

adminAxiosInstance.interceptors.response.use(
  async (response) => {
    const admin = response?.data?.admin;
    console.log(admin);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
      } catch (refreshError) {
        console.log(error);
      }
    }
  }
);

export const googleAxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/google",
  withCredentials: true,
});
