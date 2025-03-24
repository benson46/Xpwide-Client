import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAxiosInstance } from "../utils/axios";

// Async Thunks
export const adminLogin = createAsyncThunk(
  "admin/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await adminAxiosInstance.post("/login", formData);
      const adminData = response.data.admin;
      localStorage.setItem("adminInfo", JSON.stringify(adminData));
      return adminData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const adminId = localStorage.getItem('adminInfo')
      console.log(adminId)
      await adminAxiosInstance.post("/logout",adminId._id);
      return true; // Indicates a successful logout
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin Slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminInfo: localStorage.getItem("adminInfo")
      ? JSON.parse(localStorage.getItem("adminInfo"))
      : null,
    loading: false,
    logoutError: null, 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.adminInfo = action.payload;
        state.loading = false;
      })
      .addCase(adminLogin.rejected, (state) => {
        state.loading = false;
      })

      // Logout
      .addCase(adminLogout.pending, (state) => {
        state.loading = true;
        state.logoutError = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.adminInfo = null;
        localStorage.removeItem("adminInfo"); // Clear local storage on successful logout
        state.loading = false;
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.loading = false;
        state.logoutError = action.payload; // Capture the logout error message
      });
  },
});

export default adminSlice.reducer;
