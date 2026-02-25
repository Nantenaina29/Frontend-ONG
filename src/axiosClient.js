    import axios from "axios";

    const axiosClient = axios.create({
      // Ity no baseURL ho an'ny fonction rehetra (Login, Register, sns.)
      baseURL: 'https://backend-ong-qarl.onrender.com/api', 
      withCredentials: true,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest", 
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