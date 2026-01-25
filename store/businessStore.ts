// src/store/businessStore.ts
import { Business } from "@/api";
import { create } from "zustand";

type BusinessState = {
  business: Business | null;
  version: number; // pour forcer le refresh des composants

  setBusiness: (business: Business | null) => void;
  bumpVersion: () => void; // force un re-render des composants qui utilisent "version"
};

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  version: 0,

  setBusiness: (business) =>
    set({
      business,
      version: 0, // reset version à chaque changement manuel
    }),

  bumpVersion: () => set((state) => ({ version: state.version + 1 })), // incrémente version pour forcer re-render
}));
