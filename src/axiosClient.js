import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", 
  }
});

// INTERCEPTOR SIMPLES - TSY MISY TRY/CATCH
axiosClient.interceptors.request.use(async (config) => {
  // CSRF COOKIE HO AN'NY POST/PUT/DELETE (Sanctum)
  const method = config.method?.toLowerCase();
  if (['post', 'put', 'delete', 'patch'].includes(method)) {
    // GET CSRF COOKIE - 204 normal raha efa misy
    await axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
  }

  // API TOKEN raha misy (backup)
  const token = localStorage.getItem("ACCESS_TOKEN"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // API PREFIX
  if (!config.url.includes('/sanctum/csrf-cookie') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }

  return config;
});

export default axiosClient;
