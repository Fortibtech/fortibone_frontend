// src/types/orders.ts
import axiosInstance from "../axiosInstance";
export type OrderStatus =
  | "PENDING"
  | "PENDING_PAYMENT"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "PENDING_APPROVAL"
  | "PENDING_REFUND"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "ARCHIVED";

export type OrderType = "SALE" | "PURCHASE" | "RESERVATION";

export interface OrderLine {
  id: string;
  quantity: number;
  price: number; // EN CENTIMES
  variantId: string;
  variant: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number; // EN CENTIMES
  notes?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
  transactionId?: string;
  tableId?: string;
  reservationDate?: string;
  createdAt: string;

  business: {
    id: string;
    name: string;
  };

  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };

  lines: OrderLine[];

  statusHistory: Array<{
    id: string;
    status: OrderStatus;
    notes?: string;
    timestamp: string;
    triggeredBy: any;
  }>;

  deliveryRequest?: any;
  invoice?: any;
}

export interface OrderPaginatedResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetOrdersFilters {
  search?: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
  type?: OrderType;
  customerId?: string;
  variantId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Récupère les commandes d'un restaurant
 * GET /businesses/{businessId}/orders
 */
export const getOrdersByRestaurant = async (
  businessId: string,
  filters: GetOrdersFilters = {}
): Promise<OrderPaginatedResponse> => {
  try {
    const response = await axiosInstance.get(
      `/businesses/${businessId}/orders`,
      { params: filters }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur getOrdersByRestaurant :", {
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 403) {
      throw new Error("Accès interdit — vous n’êtes pas propriétaire.");
    }

    throw new Error(
      error.response?.data?.message || "Erreur lors du chargement des commandes"
    );
  }
};
