
import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://backend-ong-qarl.onrender.com/api', 
  withCredentials: true,
    headers: {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest", // Tena ilaina ity!
  }
  });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;