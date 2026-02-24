import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-ong-qarl.onrender.com", // Ny URL-ny Render fa tsy localhost intsony
  withCredentials: true,
});

export default api;