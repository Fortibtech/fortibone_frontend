// store/onboardingStore.ts
import { create } from "zustand";
import { CreateBusinessData } from "@/types/business"; // ← AJOUTE ÇA

interface OnboardingData {
  // ... tes champs actuels
  accountType: string;

  prenom: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  sexe: string;
  dateNaissance: string;

  // Remplace businessName, businessType, etc. par un objet complet
  businessData: CreateBusinessData;

  password: string;
  otp: string;

  completedSteps: number[];
  currentStep: number;
}

interface OnboardingStore extends OnboardingData {
  setData: (data: Partial<OnboardingData>) => void;
  updateBusinessData: (data: Partial<CreateBusinessData>) => void; // ← NOUVELLE FONCTION
  completeStep: (step: number) => void;
  reset: () => void;
}

const initialBusinessData: CreateBusinessData = {
  name: "",
  description: "",
  type: "COMMERCANT",
  address: "",
  phoneNumber: "",
  latitude: 4.0511,
  longitude: 9.7679,
  currencyId: "",
};

const initialState: OnboardingData = {
  accountType: "",
  prenom: "",
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  sexe: "",
  dateNaissance: "",
  businessData: initialBusinessData,
  password: "",
  otp: "",
  completedSteps: [],
  currentStep: 1,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,

  setData: (data) => set((state) => ({ ...state, ...data })),

  updateBusinessData: (data) =>
    set((state) => ({
      businessData: { ...state.businessData, ...data },
    })),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: [...new Set([...state.completedSteps, step])],
    })),

  reset: () => set(initialState),
}));

// EXPORTE LE TYPE POUR L'UTILISER PARTOUT
export type { CreateBusinessData };
