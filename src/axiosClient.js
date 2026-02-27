import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://backend-ong-w5t4.onrender.com/api',
  timeout: 15000, // Ampitomboina ho 30s satria mi-sleep ny Render (Cold Start)
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// TSY MAINTSY: Ampitaina isaky ny requete ny Token avy ao amin'ny localStorage
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;