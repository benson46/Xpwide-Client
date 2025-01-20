import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance, googleAxiosInstance } from "../utils/axios";
import { toast } from "react-hot-toast";

// Async Thunks
export const login = createAsyncThunk(
  "user/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", formData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "login failed");
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (googleToken, { rejectWithValue }) => {
    try {
      const response = await googleAxiosInstance.post("/login-google", { token: googleToken });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
      return rejectWithValue(error.response?.data?.message || "Google login failed");
    }
  }
);



// userSlice.js
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    isAuthenticated : false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      toast.success("Logged out successfully");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login reducer
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload; 
        state.loading = false;
        state.isAuthenticated=true;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      });

      builder
      // Google Login reducer
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload; 
        state.loading = false;
        state.isAuthenticated=true
      })
      .addCase(googleLogin.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
