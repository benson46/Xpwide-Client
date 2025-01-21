import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAxiosInstance, axiosInstance, googleAxiosInstance } from "../utils/axios";
import toast from "react-hot-toast";

const initialState = {
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))  : null,
  loading: false,
  isAuthenticated: !!localStorage.getItem("user"),
};

export const login = createAsyncThunk(
  "user/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/login", formData);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message)
      return rejectWithValue(error.response?.data?.message || "Login failed");
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
      return rejectWithValue(error.response?.data?.message || "Google login failed");
    }
  }
);



export const logout = createAsyncThunk(
  "user/logout",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/logout", { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);


export const checkUserStatus = createAsyncThunk(
  "user/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))._id;
      const response = await adminAxiosInstance.get(`/check-status?userId=${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error checking status");
    }
  }
);




const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload;
        if (user.isBlocked) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("user");
        } else {
          state.user = user;
          state.isAuthenticated = true;
          localStorage.setItem("user", JSON.stringify(user));
        }
        state.loading = false;
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        const user = action.payload;
        if (user.isBlocked) {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("user");
        } else {
          state.user = user;
          state.isAuthenticated = true;
          localStorage.setItem("user", JSON.stringify(user));
        }
        state.loading = false;
      })
      .addCase(googleLogin.rejected, (state) => {
        state.loading = false;
      });
      
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem("user");
        state.loading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });
      builder
      .addCase(checkUserStatus.fulfilled, (state, action) => {
        // If user is blocked, clear the user session
        if (action.payload.message === "User is blocked") {
          state.user = null;
          state.isAuthenticated = false;
          localStorage.removeItem("user");
          toast.error("Your account is blocked.");
        }
      })
      .addCase(checkUserStatus.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default userSlice.reducer;
