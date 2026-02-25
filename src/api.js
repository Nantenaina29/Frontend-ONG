import axios from "axios";

const api = axios.create({
  // Hamarino fa tsy misy "/" eo amin'ny farany
  baseURL: "https://backend-ong-qarl.onrender.com", 
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json", // Manery ny Laravel hamerina JSON fa tsy pejy HTML
    "Content-Type": "application/json",
  }
});

export default api;