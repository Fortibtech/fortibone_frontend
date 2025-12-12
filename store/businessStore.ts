// src/store/businessStore.ts  (ou @/store/businessStore.ts)
import { create } from "zustand";

type BusinessState = {
  currentBusinessId: string | null;
  setBusinessId: (id: string | null) => void;
  // Pour forcer le reset de tous les écrans
  version: number;
  bumpVersion: () => void;
};

export const useBusinessStore = create<BusinessState>((set) => ({
  currentBusinessId: null,
  version: 0,

  setBusinessId: (id) => set({ currentBusinessId: id, version: 0 }),

  bumpVersion: () => set((state) => ({ version: state.version + 1 })),
}));
