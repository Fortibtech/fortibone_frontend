// src/store/onboardingStore.ts
import { create } from "zustand";

export interface FormData {
  prenom: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  sexe: string;
  dateNaissance: string;
  password: string;
  confirmPassword: string;
}

export interface CreateBusinessData {
  name: string;
  description: string;
  type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  address: string;
  phoneNumber: string;
  logoUrl?: string;
  coverImageUrl?: string;
  latitude: number;
  longitude: number;
  currencyId: string;
  siret?: string;
  websiteUrl?: string;
  activitySector: string;
}

export interface Country {
  name: { common: string };
  flags: { png: string };
  cca2: string;
  idd: { root: string; suffixes: string[] };
  region: string;
}

interface OnboardingState {
  step: number;
  accountType: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR" | "";
  personalData: FormData;
  businessData: CreateBusinessData;
  logoImage: string | null;
  coverImage: string | null;
  selectedCountry: Country | null;
  selectedDate: Date | null;
  otp: string[];
  showPassword: boolean;
  showConfirmPassword: boolean;
  showGenderPicker: boolean;
  showDatePicker: boolean;
  showCountryPicker: boolean;
  showSectorPicker: boolean;
  showCurrencyPicker: boolean;

  // Actions
  setStep: (step: number) => void;
  setAccountType: (
    type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR" | ""
  ) => void;
  updatePersonalData: (data: Partial<FormData>) => void;
  updateBusinessData: (data: Partial<CreateBusinessData>) => void;
  setLogoImage: (uri: string | null) => void;
  setCoverImage: (uri: string | null) => void;
  setSelectedCountry: (country: Country | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setOtp: (otp: string[]) => void;
  togglePassword: () => void;
  toggleConfirmPassword: () => void;
  toggleGenderPicker: () => void;
  toggleDatePicker: () => void;
  toggleCountryPicker: () => void;
  toggleSectorPicker: () => void;
  toggleCurrencyPicker: () => void;
  reset: () => void;
}

const initialPersonalData: FormData = {
  prenom: "",
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  sexe: "",
  dateNaissance: "",
  password: "",
  confirmPassword: "",
};

const initialBusinessData: CreateBusinessData = {
  name: "",
  description: "",
  type: "COMMERCANT",
  address: "",
  phoneNumber: "",
  latitude: 0,
  longitude: 0,
  currencyId: "",
  siret: "",
  websiteUrl: "",
  activitySector: "",
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  accountType: "",
  personalData: initialPersonalData,
  businessData: initialBusinessData,
  logoImage: null,
  coverImage: null,
  selectedCountry: null,
  selectedDate: null,
  otp: ["", "", "", "", "", ""],
  showPassword: false,
  showConfirmPassword: false,
  showGenderPicker: false,
  showDatePicker: false,
  showCountryPicker: false,
  showSectorPicker: false,
  showCurrencyPicker: false,

  setStep: (step) => set({ step }),
  setAccountType: (type) =>
    set((state) => ({
      accountType: type,
      businessData: { ...state.businessData, type },
    })),
  updatePersonalData: (data) =>
    set((state) => ({
      personalData: { ...state.personalData, ...data },
    })),
  updateBusinessData: (data) =>
    set((state) => ({
      businessData: { ...state.businessData, ...data },
    })),
  setLogoImage: (uri) => set({ logoImage: uri }),
  setCoverImage: (uri) => set({ coverImage: uri }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setOtp: (otp) => set({ otp }),
  togglePassword: () => set((state) => ({ showPassword: !state.showPassword })),
  toggleConfirmPassword: () =>
    set((state) => ({ showConfirmPassword: !state.showConfirmPassword })),
  toggleGenderPicker: () =>
    set((state) => ({ showGenderPicker: !state.showGenderPicker })),
  toggleDatePicker: () =>
    set((state) => ({ showDatePicker: !state.showDatePicker })),
  toggleCountryPicker: () =>
    set((state) => ({ showCountryPicker: !state.showCountryPicker })),
  toggleSectorPicker: () =>
    set((state) => ({ showSectorPicker: !state.showSectorPicker })),
  toggleCurrencyPicker: () =>
    set((state) => ({ showCurrencyPicker: !state.showCurrencyPicker })),
  reset: () =>
    set({
      step: 1,
      accountType: "",
      personalData: initialPersonalData,
      businessData: initialBusinessData,
      logoImage: null,
      coverImage: null,
      selectedCountry: null,
      selectedDate: null,
      otp: ["", "", "", "", "", ""],
      showPassword: false,
      showConfirmPassword: false,
      showGenderPicker: false,
      showDatePicker: false,
      showCountryPicker: false,
      showSectorPicker: false,
      showCurrencyPicker: false,
    }),
}));
