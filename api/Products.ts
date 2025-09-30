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




// Type pour une variante de produit
export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number | null;
  lotPrice: number | null;
  imageUrl: string | null;
  productId: string;
  attributeValues: {
    id: string;
    value: string;
    variantId: string;
    attributeId: string;
    attribute: {
      id: string;
      name: string;
      categoryId: string;
    };
  }[];
}

// Type pour un produit
export interface Produit {
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
  category: {
    id: string;
    name: string;
  };
}

// Type de la réponse API
export interface GetProductsByBusinessResponse {
  data: Produit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fonction pour récupérer les produits d’un business
export const getProductsByBusiness = async (
  businessId: string,
  options: { page?: number; limit?: number } = {}
): Promise<GetProductsByBusinessResponse> => {
  try {
    const { page = 1, limit = 10 } = options;

    const response = await axiosInstance.get<GetProductsByBusinessResponse>(
      `/businesses/${businessId}/products`,
      {
        params: { page, limit },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getProductsByBusiness:", error.response || error);
    throw error;
  }
};