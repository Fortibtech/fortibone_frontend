// ----------------------
// API Function
import {
  CreateOrderPayload,
  CreateOrderResponse,
  GetBusinessOrdersParams,
  MyOrdersResponse,
} from "@/types/orders";
import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";

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
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    console.log("❌ ERREUR COMPLÈTE :", {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        data: axiosError.config?.data,
      },
    });
    throw error; // on rejette pour que ça remonte
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
// export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
//   try {
//     const { data } = await axiosInstance.get<OrderResponse>(
//       `/orders/${orderId}`
//     );
//     if (!data.id || !data.orderNumber) {
//       throw new Error("Réponse API invalide : id ou orderNumber manquant");
//     }
//     // TODO: Remplacer par une bibliothèque de journalisation structurée (ex: winston)
//     console.log("✅ Détails de la commande récupérés:", data);
//     return data;
//   } catch (error: any) {
//     // TODO: Remplacer par une bibliothèque de journalisation structurée
//     console.error(
//       "❌ Erreur lors de la récupération des détails de la commande:",
//       error.response?.data || error.message
//     );
//     throw new Error(
//       `Échec de la récupération des détails: ${
//         error.response?.data?.message || error.message
//       }`
//     );
//   }
// };
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
// === Types ===
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
}

export interface Business {
  id: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
}

export interface OrderLine {
  id: string;
  quantity: number;
  price: number; // ou string si ton API renvoie string
  variantId: string;
  variant: {
    id: string;
    name: string;
    sku?: string | null;
    product: {
      id: string;
      name: string;
      images?: string[];
    };
  };
}

export interface OrderResponse {
  id: string;
  profileImageUrl: string | null;
  orderNumber: string;
  type: "SALE" | "PURCHASE" | "RESERVATION";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  totalAmount: string; // ou number si tu veux convertir
  notes: string | null;
  createdAt: string;
  businessId: string;
  customerId: string;
  purchasingBusinessId: string | null;
  employeeId: string | null;
  tableNumber: string | null;
  reservationDate: string | null;
  lines: OrderLine[];
  customer: Customer;
  business: Business;
}

export interface UpdateOrderStatusPayload {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
}

// === Fonctions API ===
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  const { data } = await axiosInstance.get<OrderResponse>(`/orders/${orderId}`);
  return data;
};

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

/**
 * Payer une commande
 * POST https://dash.fortibtech.com/orders/{orderId}/pay
 */
export const payOrder = async (payload: {
  orderId: string;
  method: "STRIPE" | "KARTAPAY" | "WALLET";
  paymentMethodId?: string; // seulement pour STRIPE
  phoneNumber?: string; // seulement pour KARTAPAY
}): Promise<{
  success: boolean;
  clientSecret?: string; // renvoyé par le backend uniquement pour STRIPE (3D Secure ou confirmation)
  message?: string;
}> => {
  try {
    let body: any = {
      method: payload.method,
    };

    // Construction du metadata selon la méthode
    if (payload.method === "STRIPE") {
      if (!payload.paymentMethodId) {
        throw new Error("paymentMethodId requis pour Stripe");
      }
      body.metadata = {
        paymentMethodId: payload.paymentMethodId,
        note: "achat via carte bancaire",
      };
    } else if (payload.method === "KARTAPAY") {
      if (!payload.phoneNumber) {
        throw new Error("phoneNumber requis pour KARTAPAY");
      }
      body.metadata = {
        phoneNumber: payload.phoneNumber,
        note: "achat via mobile",
      };
    } else if (payload.method === "WALLET") {
      // Rien à ajouter → juste { "method": "WALLET" }
    }

    const response = await axiosInstance.post(
      `/orders/${payload.orderId}/pay`,
      body
    );

    return {
      success: true,
      clientSecret: response.data?.clientSecret || undefined,
      message: response.data?.message || "Paiement initié avec succès",
    };
  } catch (error: any) {
    console.error("Erreur payOrder :", error.response?.data || error.message);

    const msg =
      error.response?.data?.message ||
      error.message ||
      "Une erreur est survenue lors du paiement";

    throw new Error(msg);
  }
};

export { CreateOrderPayload };
