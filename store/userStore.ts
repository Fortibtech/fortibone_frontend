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
  _avatarVersion: number; // <-- pour forcer le refresh d'image
  // setters
  setEmail: (email: string) => void;
  setToken: (token: string) => Promise<void>;
  setOtp: (otp: string) => void;
  setUserProfile: (profile: UserProfile) => void;

  // actions
  hydrateTokenAndProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  bumpAvatarVersion: () => void; // <-- nouvelle action
}

export const useUserStore = create<UserStore>((set, get) => ({
  email: null,
  token: null,
  otp: null,
  userProfile: null,
  _avatarVersion: 0,

  setEmail: (email: string) => set({ email }),
  setToken: async (token: string) => {
    set({ token });
    await AsyncStorage.setItem("access_token", token);
  },
  setOtp: (otp: string) => set({ otp }),

  // Mise à jour du profil → on incrémente automatiquement la version d'avatar

  setUserProfile: (profile: UserProfile) =>
    set({
      userProfile: profile,
      _avatarVersion: get()._avatarVersion + 1,
    }),
  hydrateTokenAndProfile: async () => {
    try {
      const savedToken = await AsyncStorage.getItem("access_token");
      if (savedToken) {
        set({ token: savedToken });
        const response = await fetchProfileFromAPI(); // ← suppose que ça retourne { data: {...} }

        // TOUJOURS utiliser response.data (ou response selon ton API)
        const profile = response.data || response; // protection

        set({
          userProfile: profile,
          _avatarVersion: Date.now(), // force refresh au démarrage
        });
      }
    } catch (e) {
      console.error("Erreur hydratation store :", e);
      await get().logout();
    }
  },

  refreshProfile: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const response = await fetchProfileFromAPI();
      const profile = response.data || response;

      set({
        userProfile: profile,
        _avatarVersion: Date.now(),
      });
    } catch (e) {
      console.error("Erreur refreshProfile :", e);
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("access_token");
    set({
      email: null,
      token: null,
      otp: null,
      userProfile: null,
      _avatarVersion: 0,
    });
  },

  // Permet de forcer un refresh d'avatar sans toucher au profil (utile si besoin)
  bumpAvatarVersion: () =>
    set((state) => ({ _avatarVersion: state._avatarVersion + 1 })),
}));
