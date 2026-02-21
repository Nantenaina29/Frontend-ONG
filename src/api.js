import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // ⚠ tsy asiana /api
  withCredentials: true,            // ⚠ très important pour cookie/session
});

export default api;
