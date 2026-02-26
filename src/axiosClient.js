import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-ong-qarl.onrender.com/api';

const axiosClient = axios.create({
  baseURL: API_URL,  // ← VITE_API_URL!
  timeout: 15000,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Bearer token + 401 logout (efa soa)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("user");
      window.location.hash = "home";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
