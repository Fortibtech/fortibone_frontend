// src/store/businessStore.ts
import { Business } from "@/api";
import { create } from "zustand";



type BusinessState = {
  business: Business | null;
  // on stocke tout l'objet, pas juste l'ID
  version: number; // pour forcer le refresh des écrans

  setBusiness: (business: Business | null) => void;
  bumpVersion: () => void; // utile si tu veux forcer un refresh manuel
};

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  version: 0,

  setBusiness: (business) =>
    set({
      business,
      version: 0, // reset version à chaque changement
    }),

  bumpVersion: () => set((state) => ({ version: state.version + 1 })),
}));
