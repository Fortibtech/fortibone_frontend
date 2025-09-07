// src/api/products.ts
import { Products } from "@/types/Product";
import axiosInstance from "./axiosInstance";

// 🔹 Type pour un produit retourné par l’API
export interface Product {
  id: string;
  productId: string;
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

export const getProductById = async (id: string): Promise<Products> => {
  try {
    const response = await axiosInstance.get<Products>(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération du produit :", error);
    throw error;
  }
};
export const addToFavorite = async (productId: string): Promise<string> => {
  try {
    const response = await axiosInstance.post<{ message: string }>(
      `/products/${productId}/favorite`
    );
    return response.data.message; // "Produit ajouté aux favoris."
  } catch (error: any) {
    console.error("Erreur lors de l'ajout aux favoris :", error);
    throw error;
  }
};
export async function deleteFavoris(productId: string) {
  try {
    const response = await axiosInstance.delete(
      `/products/${productId}/favorite`
    );
    return response; // souvent { message: "Produit retiré avec succès" }
  } catch (error: any) {
    // Tu peux enrichir la gestion d'erreur selon ton besoin
    console.error("Erreur lors de la suppression du favori :", error);
    throw error;
  }
}
