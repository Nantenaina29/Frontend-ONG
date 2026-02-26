import axios from "axios";

const axiosClient = axios.create({
  baseURL: '/api',  // Vercel proxy
  timeout: 15000,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// BEARER TOKEN HO AN'NY PROTECTED ROUTES (CRITICAL!)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 AUTO-LOGOUT
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
