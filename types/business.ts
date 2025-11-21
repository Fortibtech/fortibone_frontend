// types/business.ts  (ou @/types/business.ts)
export type BusinessType = "COMMERCANT" | "RESTAURATEUR" | "FOURNISSEUR";

export interface CreateBusinessData {
  name: string;
  description: string;
  type: BusinessType;
  address: string;
  phoneNumber: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  latitude: number;
  longitude: number;
  currencyId: string;
  activitySector?: "COMMERCANT" | "RESTAURATEUR";
}
