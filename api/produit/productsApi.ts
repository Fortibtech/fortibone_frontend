// src/api/productsApi.ts (ou dans deliveryApi.ts si tu préfères)

import axiosInstance from "../axiosInstance";

export interface ProductFournisseur {
  id: string;
  productId: string;
  sku: string;
  name: string;
  description?: string;
  variantImageUrl?: string | null;
  productImageUrl?: string | null;
  businessId: string;
  businessName: string;
  businessLogoUrl?: string | null;
  businessType: "FOURNISSEUR";
  price: number;
  currencyCode: string;
  averageRating: number;
  reviewCount: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ProductSearchResponse {
  data: ProductFournisseur[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAllProductFournisseurParams {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "PRICE_ASC" | "PRICE_DESC" | "RELEVANCE" | "DISTANCE";
  page?: number;
  limit?: number;
}

/**
 * Récupère tous les produits des fournisseurs avec filtres
 */
export const getAllProductFournisseur = async (
  params: GetAllProductFournisseurParams = {}
): Promise<ProductSearchResponse> => {
  try {
    const response = await axiosInstance.get<ProductSearchResponse>(
      "/products/search",
      {
        params: {
          businessType: "FOURNISSEUR", // Toujours filtré sur les fournisseurs
          search: params.search || undefined,
          minPrice: params.minPrice || undefined,
          maxPrice: params.maxPrice || undefined,
          sortBy: params.sortBy || undefined,
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des produits fournisseurs :",
      error.response?.data || error.message
    );
    throw error;
  }
};
