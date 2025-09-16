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
    console.log("🔑 Token intercepté :", token); // <-- ici tu vois le token
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
      console.log("⚠️ Token expiré ou invalide");
      // → ici tu peux rediriger vers le login, ou gérer un refreshToken
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
