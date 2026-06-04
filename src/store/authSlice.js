import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Use env variable so auth works in both local and production
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const loginUser = createAsyncThunk('auth/login', 
    async({email, password},{rejectWithValue}) => {
        try {
            const res = await axios.post(`${API_BASE}/auth/login`, {
                email, password
            })
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            return res.data;
        } catch(err) {
            return rejectWithValue(err.response?.data?.message || "Login failed");
        }
    }
)
// Async thunk — Register
export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ firstName, lastName, email, password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${API_BASE}/auth/register`, {
                firstName, lastName, email, password
            });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Register failed");
        }
    }
);
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        loading: false, 
        error: null
    },
    reducers: { 
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');    
        },
        forceLogout: (state) => {
            // Called when a 401 is received — clears state without touching localStorage
            // (localStorage is already cleared by the api interceptor)
            state.user = null;
            state.token = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                // Always keep localStorage in sync with Redux
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed";
            })  
            //Register
            .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null; })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user    = action.payload.user;
                state.token   = action.payload.token;
                // Always keep localStorage in sync with Redux
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(registerUser.rejected,  (state, action) => {
                state.loading = false;
                state.error   = action.payload;
            });      

    }
});
export const { logout, clearError, forceLogout } = authSlice.actions;  

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token; 
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsLoggedIn = (state) => !!state.auth.token;

export default authSlice.reducer;    