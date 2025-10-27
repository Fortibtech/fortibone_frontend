// ----------------------
// API Function
import {
  CreateOrderPayload,
  CreateOrderResponse,
  GetBusinessOrdersParams,
  MyOrdersResponse,
  OrderResponse,
  UpdateOrderStatusPayload,
} from "@/types/orders";
import axiosInstance from "./axiosInstance";

// ----------------------
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  try {
    const response = await axiosInstance.post<CreateOrderResponse>(
      "/orders",
      payload
    );
    // TODO: Remplacer par une bibliothèque de journalisation structurée (ex: winston)
    console.log("✅ Commande créée:", response.data);

    // Validation basique de la réponse
    if (!response.data.id || !response.data.orderNumber) {
      throw new Error("Réponse API invalide: id ou orderNumber manquant");
    }

    return response.data;
  } catch (error: any) {
    // TODO: Remplacer par une bibliothèque de journalisation structurée
    console.error(
      "❌ Erreur lors de la création de la commande:",
      error.response?.data || error.message
    );
    throw new Error(
      `Échec de la création de la commande: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

export const getMyOrders = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  type?: "SALE" | "PURCHASE" | "RESERVATION";
}): Promise<MyOrdersResponse> => {
  try {
    const response = await axiosInstance.get<MyOrdersResponse>(
      "/orders/my-orders",
      { params: { page: 1, limit: 10, ...params } } // Valeurs par défaut
    );
    // Validation basique de la réponse
    if (!response.data.data || !Array.isArray(response.data.data)) {
      throw new Error(
        "Réponse API invalide : données manquantes ou incorrectes"
      );
    }
    // TODO: Remplacer par une bibliothèque de journalisation structurée (ex: winston)
    console.log("✅ Commandes récupérées:", response.data);
    return response.data;
  } catch (error: any) {
    // TODO: Remplacer par une bibliothèque de journalisation structurée
    console.error(
      "❌ Erreur lors de la récupération des commandes:",
      error.response?.data || error.message
    );
    throw new Error(
      `Échec de la récupération des commandes: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};
// ----------------------
// API: Get order by ID
// ----------------------
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  try {
    const { data } = await axiosInstance.get<OrderResponse>(
      `/orders/${orderId}`
    );
    if (!data.id || !data.orderNumber) {
      throw new Error("Réponse API invalide : id ou orderNumber manquant");
    }
    // TODO: Remplacer par une bibliothèque de journalisation structurée (ex: winston)
    console.log("✅ Détails de la commande récupérés:", data);
    return data;
  } catch (error: any) {
    // TODO: Remplacer par une bibliothèque de journalisation structurée
    console.error(
      "❌ Erreur lors de la récupération des détails de la commande:",
      error.response?.data || error.message
    );
    throw new Error(
      `Échec de la récupération des détails: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};
// ----------------------
// API: Lister commandes d'une entreprise
// ----------------------
export interface OrdersPaginatedResponse {
  data: OrderResponse[];
  totalPages: number;
  currentPage: number;
}

export const getBusinessOrders = async (
  businessId: string,
  params: GetBusinessOrdersParams = {}
): Promise<OrdersPaginatedResponse> => {
  try {
    const { data } = await axiosInstance.get<OrdersPaginatedResponse>(
      `/businesses/${businessId}/orders`,
      { params }
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getBusinessOrders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ----------------------
// API: Update order status
// ----------------------
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<OrderResponse> => {
  try {
    const { data } = await axiosInstance.patch<OrderResponse>(
      `/orders/${orderId}/status`,
      payload
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur updateOrderStatus:",
      error.response?.data || error.message
    );
    throw error;
  }
};
