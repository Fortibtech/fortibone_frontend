// src/store/onboardingStore.ts
import { create } from "zustand";

export type AccountType = "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
export type CommerceType = "PHYSICAL" | "ONLINE" | "HYBRID";
export type PriceRange = "ENTRY_LEVEL" | "MID_RANGE" | "HIGH_END" | "LUXURY";
export type Civility = "MR" | "MME" | "MLLE" | "OTHER";

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
  // Champs communs et obligatoires
  name: string;
  description: string;
  type: AccountType;
  address: string;
  latitude: number;
  longitude: number;
  currencyId: string;
  activitySector: string;
  commerceType: CommerceType;

  // Contact & infos légales
  postalCode?: string;
  siret?: string;
  websiteUrl?: string;
  businessEmail?: string;
  phoneNumber?: string;

  // Contact personne référente
  contactFirstName?: string;
  contactLastName?: string;
  contactCivility?: Civility;
  contactFunction?: string;

  // Images (URI locales → upload après création)
  logoUrl?: string;
  coverImageUrl?: string;

  // Champs COMMERCANT / RESTAURATEUR
  priceRange?: PriceRange;
  productCategories?: string[];
  detailedDescription?: string;

  // Champs spécifiques FOURNISSEUR
  productionVolume?: string;
  deliveryZones?: string[];
  avgDeliveryTime?: string;
  paymentConditions?: string[];
  minOrderQuantity?: number;
  sampleAvailable?: boolean;

  // Réseaux sociaux
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    twitter?: string;
  };

  // Références clients (surtout FOURNISSEUR)
  clientReferences?: string;
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
  accountType: AccountType | "";
  personalData: FormData;
  businessData: CreateBusinessData;
  logoImage: string | null; // URI locale du logo (ImagePicker)
  coverImage: string | null; // URI locale de la couverture
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
  setAccountType: (type: AccountType | "") => void;
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

export const initialBusinessData: CreateBusinessData = {
  name: "",
  description: "",
  type: "COMMERCANT",
  address: "",
  latitude: 4.0511, // Yaoundé par défaut (Cameroun)
  longitude: 9.7679,
  currencyId: "",
  activitySector: "",
  commerceType: "PHYSICAL",

  // Tout le reste optionnel → vide
  postalCode: "",
  siret: "",
  websiteUrl: "",
  businessEmail: "",
  phoneNumber: "",
  contactFirstName: "",
  contactLastName: "",
  contactCivility: undefined,
  contactFunction: "",
  logoUrl: undefined,
  coverImageUrl: undefined,
  priceRange: undefined,
  productCategories: [],
  detailedDescription: "",
  socialLinks: {},
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
      businessData:
        type === "" ? state.businessData : { ...state.businessData, type },
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
