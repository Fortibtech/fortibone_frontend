// src/api/inventory.ts
import { AxiosError } from "axios";
import axiosInstance from "./axiosInstance";

// ✅ Interface pour les erreurs réseau
interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

// ✅ Interfaces pour les données de l'API
export interface Attribute {
  id: string;
  name: string;
  categoryId: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  variantId: string;
  attributeId: string;
  attribute: Attribute;
}

export interface Product {
  id: string; // Ajout de l'ID pour plus de cohérence
  name: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string | null;
  price: string; // Considérer un type `number` si c'est un prix numérique
  purchasePrice: string; // Idem
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number | null;
  lotPrice: string | null; // Idem
  imageUrl: string;
  productId: string;
  product: Product;
  attributeValues: AttributeValue[];
}

export interface InventoryResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ Fonction pour récupérer l’inventaire d’une entreprise
export const getBusinessInventory = async (
  businessId: string,
  page: number = 1,
  limit: number = 20
): Promise<InventoryResponse> => {
  try {
    const response = await axiosInstance.get<InventoryResponse>(
      `/inventory/businesses/${businessId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error(
      "❌ Erreur lors de la récupération de l'inventaire :",
      err.message
    );
    throw new Error(`Failed to fetch inventory: ${err.message}`);
  }
};

// ✅ Interface pour le payload d’ajustement de stock
export interface AdjustPayload {
  quantityChange: number;
  type: "LOSS" | "GAIN" | "ADJUSTMENT";
  reason?: string;
}

// ✅ Fonction pour ajuster la quantité d’un variant
export const adjustVariantStock = async (
  variantId: string,
  payload: AdjustPayload
): Promise<InventoryItem> => {
  try {
    const response = await axiosInstance.post<InventoryItem>(
      `/inventory/variants/${variantId}/adjust`,
      payload
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error("❌ Erreur lors de l'ajustement du stock :", err.message);
    throw new Error(`Failed to adjust stock: ${err.message}`);
  }
};

// ✅ Interfaces pour l’historique des mouvements
export interface PerformedBy {
  id: string;
  firstName: string;
}

export interface OrderInfo {
  id: string;
  orderNumber: string;
}

export interface InventoryMovement {
  id: string;
  type: "LOSS" | "GAIN" | "SALE" | "ADJUSTMENT";
  quantityChange: number;
  newQuantity: number;
  reason: string | null;
  createdAt: string; // Considérer `Date` si parsing côté client
  variantId: string;
  businessId: string;
  orderId: string | null;
  performedById: string;
  performedBy: PerformedBy;
  order: OrderInfo | null;
}

// ✅ Fonction pour récupérer l’historique d’un variant
export const getVariantHistory = async (
  variantId: string
): Promise<InventoryMovement[]> => {
  try {
    const response = await axiosInstance.get<InventoryMovement[]>(
      `/inventory/variants/${variantId}/history`
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error(
      "❌ Erreur lors de la récupération de l'historique :",
      err.message
    );
    throw new Error(`Failed to fetch variant history: ${err.message}`);
  }
};

// ✅ Interface pour le payload d’ajout de lot
export interface BatchPayload {
  quantity: number;
  expirationDate: string; // Format "YYYY-MM-DD"
}

// ✅ Interface pour un lot
export interface Batch {
  id: string;
  quantity: number;
  expirationDate: string; // Format "YYYY-MM-DD"
  variantId: string;
  createdAt: string; // Considérer `Date` si parsing côté client
  updatedAt: string; // Idem
  variant?: InventoryItem; // Optionnel : infos sur la variante liée
}

// ✅ Fonction pour ajouter un nouveau lot de stock
export const addVariantBatch = async (
  variantId: string,
  payload: BatchPayload
): Promise<InventoryItem> => {
  try {
    const response = await axiosInstance.post<InventoryItem>(
      `/inventory/variants/${variantId}/batches`,
      payload
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error("❌ Erreur lors de l’ajout d’un lot :", err.message);
    throw new Error(`Failed to add batch: ${err.message}`);
  }
};

// ✅ Fonction pour lister les produits qui expirent bientôt
export const getExpiringSoonProducts = async (
  businessId: string,
  days: number = 30
): Promise<Batch[]> => {
  try {
    const response = await axiosInstance.get<Batch[]>(
      `/inventory/businesses/${businessId}/expiring-soon`,
      {
        params: { days },
      }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error(
      "❌ Erreur lors de la récupération des produits expirants :",
      err.message
    );
    throw new Error(`Failed to fetch expiring products: ${err.message}`);
  }
};

// ✅ Interface pour la réponse d’enregistrement des pertes
export interface RecordExpiredLossesResponse {
  message: string;
  lossesRecorded: number;
}

// ✅ Fonction pour enregistrer les pertes de produits périmés
export const recordExpiredLosses = async (
  businessId: string
): Promise<RecordExpiredLossesResponse> => {
  try {
    const response = await axiosInstance.post<RecordExpiredLossesResponse>(
      `/inventory/businesses/${businessId}/record-expired-losses`
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error(
      "❌ Erreur lors de l’enregistrement des pertes :",
      err.message
    );
    throw new Error(`Failed to record expired losses: ${err.message}`);
  }
};
