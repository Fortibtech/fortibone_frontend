// src/api/products.ts
import axiosInstance from "./axiosInstance";

// 🔹 Type pour un produit retourné par l’API
export interface Product {
  id: string;
  price: string; // parfois c'est string, parfois number -> dépend du backend
  sku: string;
  image_url: string | null;
  name: string;
  productImageUrl: string | null;
  businessName: string;
  convertedPrice: number;
}

// 🔹 Type pour la réponse de l’API
export interface ProductSearchResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 🔹 Type pour les filtres optionnels
export interface ProductSearchParams {
  search?: string;
  categoryId?: string;
  businessType?: "COMMERCANT" | "FOURNISSEUR" | "RESTAURATEUR";
  minPrice?: number;
  maxPrice?: number;
  currencyCode?: string; // ex: "EUR", "XAF"
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "PRICE_ASC" | "PRICE_DESC" | "DISTANCE" | "RELEVANCE";
  page?: number;
  limit?: number;
}

/**
 * 🔹 Fonction pour récupérer les produits (avec filtres optionnels)
 */
export const getAllProductsLike = async (
  params: ProductSearchParams = {}
): Promise<ProductSearchResponse> => {
  const response = await axiosInstance.get<ProductSearchResponse>(
    "/products/search",
    { params }
  );
  return response.data;
};
