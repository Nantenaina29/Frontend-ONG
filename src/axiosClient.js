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

axiosClient.interceptors.request.use(async (config) => {
  // CSRF HO AN'NY PROTECTED API ROUTES IHANY
  const method = config.method?.toLowerCase();
  if (['post', 'put', 'delete', 'patch'].includes(method) && 
      config.url.startsWith('/api') &&  // ← API ROUTES IHANY
      !config.url.includes('/sanctum/csrf-cookie')) {
    
    await axios.get(`${import.meta.env.VITE_API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    }).catch(() => {});
  }

  // API PREFIX HO API ROUTES IHANY
  if (!config.url.includes('/sanctum/csrf-cookie') && 
      !config.url.includes('/register') && 
      !config.url.includes('/login') &&
      !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }

  return config;
});


export default axiosClient;
