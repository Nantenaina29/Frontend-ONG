import axios from "axios";

const axiosClient = axios.create({
  // Tsy asiana /api eto mba handehanan'ny CSRF mivantana
  baseURL: 'https://backend-ong-qarl.onrender.com', 
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", 
  }
});

axiosClient.interceptors.request.use((config) => {
  // 1. Manampy Token raha misy
  const token = localStorage.getItem("ACCESS_TOKEN"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. LOGIQUE AUTOMATIQUE:
  // Raha tsy csrf-cookie no antsoina, dia asiana "/api" eo alohan'ny URL
  // Izany dia miantoka fa ny membres, login, sns dia mbola mandeha foana
  if (!config.url.includes('/sanctum/csrf-cookie') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }

  return config;
});

export default axiosClient;