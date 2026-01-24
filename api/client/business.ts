// src/api/business.ts
import axiosInstance from "../axiosInstance";

// ✅ Interfaces Product & Variants
export interface ProductAttribute {
  id: string;
  name: string;
  categoryId: string;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
  variantId: string;
  attributeId: string;
  attribute: ProductAttribute;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number | null;
  lotPrice: string | null;
  imageUrl: string;
  productId: string;
  attributeValues: ProductAttributeValue[];
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  salesUnit: string;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  businessId: string;
  categoryId: string;
  variants: ProductVariant[];
  category: ProductCategory;
}

// ✅ Réponse de l'API Products
export interface GetProductsByBusinessResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== TYPES ====================

export interface Business {
  id: string;
  name: string;
  description: string;
  type: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR" | "LIVREUR";
  logoUrl: string;
  coverImageUrl: string;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  currencyId: string;
  averageRating: number;
  activitySector: string;
  reviewCount: number;
  ownerId: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Réponse de l'API Businesses
export interface GetBusinessesResponse {
  data: Business[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  // Ancienne structure (pour compatibilité)
  totalPages?: number;
  totalItems?: number;
  currentPage?: number;
}

// Types des paramètres de filtrage
export type BusinessType =
  | "COMMERCANT"
  | "FOURNISSEUR"
  | "RESTAURATEUR"
  | "LIVREUR";

export interface GetBusinessesParams {
  search?: string; // Recherche par nom ou description
  type?: BusinessType; // Filtrer par type
  page?: number; // Numéro de page (défaut: 1)
  limit?: number; // Éléments par page (défaut: 10)
  latitude?: number; // Latitude pour recherche proximité
  longitude?: number; // Longitude pour recherche proximité
  radius?: number; // Rayon en km (défaut: 10)
}

// ==================== FONCTION ====================

/**
 * Récupère la liste des entreprises avec filtres optionnels
 * @param params - Paramètres de filtrage et pagination
 * @returns Liste d'entreprises avec métadonnées de pagination
 *
 * @example
 * // Toutes les entreprises (défaut)
 * const businesses = await getBusinesses();
 *
 * @example
 * // Restaurants uniquement
 * const restaurants = await getBusinesses({ type: "RESTAURATEUR" });
 *
 * @example
 * // Recherche de proximité
 * const nearby = await getBusinesses({
 *   latitude: -11.7085,
 *   longitude: 43.2551,
 *   radius: 5
 * });
 *
 * @example
 * // Recherche textuelle avec pagination
 * const results = await getBusinesses({
 *   search: "Pizza",
 *   page: 2,
 *   limit: 20
 * });
 */
export async function getBusinesses(
  params?: GetBusinessesParams
): Promise<GetBusinessesResponse> {
  try {
    // Construction des query parameters
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.type) {
      queryParams.append("type", params.type);
    }
    if (params?.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.latitude !== undefined) {
      queryParams.append("latitude", params.latitude.toString());
    }
    if (params?.longitude !== undefined) {
      queryParams.append("longitude", params.longitude.toString());
    }
    if (params?.radius !== undefined) {
      queryParams.append("radius", params.radius.toString());
    }

    // Construction de l'URL avec query string
    const url = `/businesses${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axiosInstance.get<GetBusinessesResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getBusinesses:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
}

export async function getBusinessesRestaurant(): Promise<GetBusinessesResponse> {
  try {
    const response = await axiosInstance.get<GetBusinessesResponse>(
      "/businesses?type=RESTAURATEUR"
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getBusinesses:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
}

// ✅ Fonction pour récupérer les produits d'un business
export async function getProductsByBusiness(
  businessId: string
): Promise<GetProductsByBusinessResponse> {
  try {
    const response = await axiosInstance.get<GetProductsByBusinessResponse>(
      `/businesses/${businessId}/products`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getProductsByBusiness:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
}
