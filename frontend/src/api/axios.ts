import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Format network errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      error.message = "Backend server unreachable. Make sure backend is running on http://localhost:5000";
    }
    return Promise.reject(error);
  }
);

export default API;