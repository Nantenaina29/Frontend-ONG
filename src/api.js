
import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-ong-qarl.onrender.com",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest", // Tena ilaina ho an'ny Laravel
  }
});

export default api;