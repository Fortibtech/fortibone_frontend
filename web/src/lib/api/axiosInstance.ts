import axios from 'axios';

// ✅ Définir la base URL (aligné sur Mobile / .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dash.fortibtech.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Intercepteur pour ajouter le token (Source de vérité Mobile adaptée au Web avec localStorage)
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Optionnel: redirection vers login si nécessaire
        // window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
