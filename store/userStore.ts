// src/store/userStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile as fetchProfileFromAPI } from "@/api/authService";

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

  // ✅ setters
  setEmail: (email: string) => void;
  setToken: (token: string) => Promise<void>;
  setOtp: (otp: string) => void;
  setUserProfile: (profile: UserProfile) => void;

  // 🔑 actions
  hydrateTokenAndProfile: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  email: null,
  token: null,
  otp: null,
  userProfile: null,

  setEmail: (email: string) => set({ email }),
  setToken: async (token: string) => {
    set({ token });
    await AsyncStorage.setItem("access_token", token);
  },
  setOtp: (otp: string) => set({ otp }),
  setUserProfile: (profile: UserProfile) => set({ userProfile: profile }),

  // 🔹 Hydrate token + profil au démarrage
  hydrateTokenAndProfile: async () => {
    try {
      const savedToken = await AsyncStorage.getItem("access_token");
      if (savedToken) {
        set({ token: savedToken });
        console.log("🔑 Token hydraté :", savedToken);

        // 🔹 Hydrate le profil si possible
        const profile = await fetchProfileFromAPI();
        set({ userProfile: profile });
        console.log("🚀 Profil hydraté :", profile);
      }
    } catch (e) {
      console.error("Erreur hydratation store :", e);
      await get().logout();
    }
  },

  // 🔹 Rafraîchir le profil depuis l'API
  refreshProfile: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const profile = await fetchProfileFromAPI();
      set({ userProfile: profile });
    } catch (e) {
      console.error("Erreur refreshProfile :", e);
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("access_token");
    set({ email: null, token: null, otp: null, userProfile: null });
  },
}));
