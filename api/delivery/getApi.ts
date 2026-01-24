// src/api/livreur.api.ts

import axiosInstance from "../axiosInstance";


/* ======================================================
   TYPES
====================================================== */

// Owner du business
export interface BusinessOwner {
  id: string;
  firstName: string;
  lastName: string;
}

// Business de type LIVREUR (verrouillé)
export interface Livreur {
  id: string;
  name: string;
  description: string | null;
  type: "LIVREUR"; // 🔒 FORCÉ
  logoUrl: string | null;
  coverImageUrl: string | null;
  address: string | null;
  phoneNumber: string | null;
  businessEmail: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  activitySector: string | null;
  commerceType: "PHYSICAL" | "HYBRID";
  currencyId: string;
  averageRating: number;
  reviewCount: number;
  isOnline: boolean;
  ownerId: string;
  acceptsCashOnDelivery: boolean;
  sectorId: string | null;
  owner: BusinessOwner;
}

// Réponse paginée API
export interface PaginatedLivreurResponse {
  data: Livreur[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paramètres autorisés (sans type volontairement)
export interface GetLivreurParams {
  page?: number;
  limit?: number;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isOnline?: boolean;
}

/* ======================================================
   API
====================================================== */

/**
 * Récupérer la liste des LIVREURS
 * - type=LIVREUR est forcé
 * - pagination incluse
 * - filtres optionnels
 */
export const getLivreurs = async (
  params?: GetLivreurParams
): Promise<PaginatedLivreurResponse> => {
  const { data } = await axiosInstance.get<PaginatedLivreurResponse>(
    "/businesses",
    {
      params: {
        type: "LIVREUR", // 🔒 impossible à modifier
        page: params?.page ?? 1,
        limit: params?.limit ?? 100,
        search: params?.search,
        latitude: params?.latitude,
        longitude: params?.longitude,
        radius: params?.radius,
        isOnline: params?.isOnline,
      },
    }
  );

  return data;
};

/* ======================================================
   HELPERS (optionnels mais utiles)
====================================================== */

/**
 * Récupérer uniquement les livreurs en ligne
 */
export const getOnlineLivreurs = async () => {
  const response = await getLivreurs({ isOnline: true });
  return response.data;
};

/**
 * Récupérer un livreur par ID (depuis la liste)
 */
export const findLivreurById = (
  livreurs: Livreur[],
  livreurId: string
): Livreur | undefined => {
  return livreurs.find((l) => l.id === livreurId);
};
