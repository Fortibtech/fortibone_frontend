// src/api/business.ts
import axiosInstance from "../axiosInstance";

// ✅ Structure Business réelle
export interface Business {
  id: string;
  name: string;
  description: string;
  type: "COMMERCANT" | "AUTRE_TYPE" | string;
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

// ✅ Réponse de l'API Businesses
export interface GetBusinessesResponse {
  data: Business[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

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

// ✅ Fonction pour récupérer les businesses
export async function getBusinesses(): Promise<GetBusinessesResponse> {
  try {
    const response = await axiosInstance.get<GetBusinessesResponse>(
      "/businesses"
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
