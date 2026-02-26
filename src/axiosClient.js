import axios from "axios";

const axiosClient = axios.create({
  // 🎯 BACKEND URL DIRECT (tsy /api - Laravel routes)
  baseURL: 'https://backend-ong-qarl.onrender.com/api',
  timeout: 15000,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// 🔐 BEARER TOKEN HO AN'NY PROTECTED ROUTES
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚪 401 AUTO-LOGOUT + CLEANUP
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      console.log('🔐 Token expired - auto-logout');
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("user");
      window.location.hash = "home";  // ← Frontend navigation ihany!
    }
    return Promise.reject(error);
  }
);


export default axiosClient;
