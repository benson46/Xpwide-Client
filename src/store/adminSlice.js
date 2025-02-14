import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAxiosInstance } from "../utils/axios";

// Async Thunks
export const adminLogin = createAsyncThunk(
  "admin/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await adminAxiosInstance.post("/login", formData);
      const adminData = response.data.admin;
      console.log('hello:',adminData)
      localStorage.setItem("adminInfo", JSON.stringify(adminData));

      return adminData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);


// admin Slice
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminInfo: localStorage.getItem("adminInfo")
      ? JSON.parse(localStorage.getItem("adminInfo"))
      : null,
    loading: false,
  },
  reducers: {
    logoutAdmin: (state) => {
      state.adminInfo = null;
      localStorage.removeItem("adminInfo");
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.adminInfo = action.payload;
        state.loading = false;
      })
      .addCase(adminLogin.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
