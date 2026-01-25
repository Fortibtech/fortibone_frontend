// src/store/userStore.ts
import { getProfile as fetchProfileFromAPI } from "@/api/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  profileType: "PARTICULIER" | "PRO";
  country: string;
  city: string;
  gender: string;
  dateOfBirth: string;
}

interface UserStore {
  email: string | null;
  token: string | null;
  otp: string | null;
  userProfile: UserProfile | null;
  _avatarVersion: number; // Timestamp pour forcer le refresh d'image

  // Actions
  setEmail: (email: string) => void;
  setToken: (token: string) => Promise<void>;
  setOtp: (otp: string) => void;
  setUserProfile: (profile: UserProfile) => void;

  hydrateTokenAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  bumpAvatarVersion: () => void; // Pour forcer le refresh après upload
}

export const useUserStore = create<UserStore>((set, get) => ({
  email: null,
  token: null,
  otp: null,
  userProfile: null,
  _avatarVersion: Date.now(), // On démarre avec un timestamp frais

  setEmail: (email: string) => set({ email }),

  setToken: async (token: string) => {
    set({ token });
    await AsyncStorage.setItem("access_token", token);
  },

  setOtp: (otp: string) => set({ otp }),

  // Mise à jour du profil → on force toujours un nouveau timestamp
  setUserProfile: (profile: UserProfile) =>
    set({
      userProfile: profile,
      _avatarVersion: Date.now(), // Toujours unique
    }),

  // Chargement au démarrage de l'app
  hydrateTokenAndProfile: async () => {
    try {
      const savedToken = await AsyncStorage.getItem("access_token");
      if (!savedToken) return;

      set({ token: savedToken });

      const response = await fetchProfileFromAPI();
      const profile = response?.data || response; // Protection selon ton API

      if (profile) {
        set({
          userProfile: profile,
          _avatarVersion: Date.now(), // Force refresh image au login
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'hydratation du profil :", error);
      // En cas d'erreur grave → on déconnecte
      await get().logout();
    }
  },

  // Rafraîchir le profil (ex: après modification)
  refreshProfile: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const response = await fetchProfileFromAPI();
      const profile = response?.data || response;

      if (profile) {
        set({
          userProfile: profile,
          _avatarVersion: Date.now(), // Image toujours à jour
        });
      }
    } catch (error) {
      console.error("Erreur refreshProfile :", error);
      // Ne pas déconnecter ici → juste log
    }
  },

  // Déconnexion
  logout: async () => {
    await AsyncStorage.removeItem("access_token");
    set({
      email: null,
      token: null,
      otp: null,
      userProfile: null,
      _avatarVersion: Date.now(), // Reset propre
    });
  },

  // À appeler après un upload d'avatar réussi
  bumpAvatarVersion: () => {
    set({ _avatarVersion: Date.now() });
  },
}));
