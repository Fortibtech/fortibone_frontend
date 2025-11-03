import { create } from "zustand";

interface OnboardingData {
  // Étape 1
  accountType: string;

  // Étape 2
  prenom: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  sexe: string;
  dateNaissance: string;

  // Étape 3
  businessName: string;
  businessType: string;
  businessSector: string;
  address: string;
  website?: string;
  description?: string;

  // Étape 4
  password: string;

  // OTP
  otp: string;

  // Métadonnées
  completedSteps: number[];
  currentStep: number;
}

interface OnboardingStore extends OnboardingData {
  setData: (data: Partial<OnboardingData>) => void;
  completeStep: (step: number) => void;
  reset: () => void;
}

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
  businessName: "",
  businessType: "",
  businessSector: "",
  address: "",
  website: "",
  description: "",
  password: "",
  otp: "",
  completedSteps: [],
  currentStep: 1,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,

  setData: (data) => set((state) => ({ ...state, ...data })),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: [...new Set([...state.completedSteps, step])],
    })),

  reset: () => set(initialState),
}));
