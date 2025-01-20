import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAxiosInstance } from "../utils/axios";
import { toast } from "react-hot-toast";

// Async Thunks
export const adminLogin = createAsyncThunk(
  "admin/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await adminAxiosInstance.post("/login", formData);
      return response.data.admin;
    } catch (error) {
      toast.error(error.response?.data?.message || "login failed");
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  }
);

// admin Slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admin: null,
    loading: false,
  },
  reducers: {
    logout: (state) => {
      state.admin = null;
      toast.success("Logged out successfully");
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.loading = false;
      })
      .addCase(adminLogin.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;
