import axiosInstance from "../axiosInstance";

// src/types/sector.ts
export type BusinessType =
  | "COMMERCANT"
  | "FOURNISSEUR"
  | "RESTAURATEUR"
  | "LIVREUR";

export interface Sector {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  type: BusinessType;
  createdAt: string;
  updatedAt: string;
  _count?: {
    businesses: number;
  };
}

export const getAllSectores = async (
  type?: BusinessType
): Promise<Sector[]> => {
  try {
    const response = await axiosInstance.get<Sector[]>("/sectors", {
      params: type ? { type } : undefined,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors du chargement des secteurs :", error);
    throw error;
  }
};
