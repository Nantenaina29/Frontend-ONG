import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'https://backend-ong-qarl.onrender.com/api',
  timeout: 15000,
  withCredentials: true, // <--- TSY MAINTSY MISY IO satria supports_credentials = true
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

export default axiosClient;