import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — read token fresh from Redux store on every request
// We export a setter so the store can inject itself after creation
let _store = null;
export const injectStore = (store) => { _store = store; };

api.interceptors.request.use(
  (config) => {
    // Read from Redux store first, fall back to localStorage
    // Using || ensures both are checked even if _store exists but token is null
    const token = _store?.getState().auth.token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize error messages only
// Do NOT auto-redirect here — let components handle navigation
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
