// src/api/axiosInstance.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// ✅ Définir la base URL
// "https://dash.fortibtech.com";
const API_URL = "https://dash.fortibtech.com";

// ✅ Créer une instance Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Intercepteur pour ajouter le token
axiosInstance.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur pour gérer les erreurs (ex: token expiré)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - rediriger vers login si nécessaire
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
