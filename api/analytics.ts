// src/api/analytics.ts
import axiosInstance from "./axiosInstance";

// 📌 Définir le type de la réponse (facultatif mais conseillé avec TS)
export interface AnalyticsOverview {
  totalSalesAmount: number;
  totalSalesOrders: number;
  averageOrderValue: number;
  totalProductsSold: number;
  totalPurchaseAmount: number;
  totalPurchaseOrders: number;
  currentInventoryValue: number;
  totalMembers: number;
  uniqueCustomers: number;
  averageBusinessRating: number;
  totalBusinessReviews: number;
}

// 📌 Fonction GET /analytics/overview avec dates optionnelles
export const getAnalyticsOverview = async (
  businessId: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsOverview> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get(
      `/businesses/${businessId}/analytics/overview${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
    return response.data as AnalyticsOverview;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du fetch analytics overview :",
      error.message
    );
    throw error;
  }
};

// ✅ Type pour salesByPeriod
export interface SalesByPeriod {
  period: string; // ex: "2025-09"
  totalAmount: number; // montant total des ventes sur la période
  totalItems: number; // nombre d'articles vendus sur la période
}

// ✅ Type pour salesByProductCategory
export interface SalesByProductCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalItemsSold: number;
}

// ✅ Structure de la réponse globale
export interface SalesResponse {
  salesByPeriod: SalesByPeriod[];
  topSellingProducts: TopSellingProduct[];
  salesByProductCategory: SalesByProductCategory[];
}

export interface GetSalesParams {
  startDate?: string;
  endDate?: string;
  unit?: "DAY" | "WEEK" | "MONTH" | "YEAR";
}

// Mise à jour de l'interface TopSellingProduct
export interface TopSellingProduct {
  variantId: string;
  sku: string;
  productName: string;
  variantImageUrl: string;
  totalQuantitySold: number;
  totalRevenue: number;
  revenuePercentage?: number; // ✅ Ajout du pourcentage
}

// 📌 Fonction GET /analytics/sales avec paramètres
export const getSales = async (
  businessId: string,
  params?: GetSalesParams
): Promise<SalesResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.unit) queryParams.append("unit", params.unit);

    const response = await axiosInstance.get(
      `/businesses/${businessId}/analytics/sales${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
    return response.data as SalesResponse;
  } catch (error: any) {
    console.error("❌ Erreur lors du fetch sales analytics :", error.message);
    throw error;
  }
};

// ✅ Type pour les produits à stock bas
export interface ProductLowStock {
  variantId: string;
  sku: string;
  productName: string;
  quantityInStock: number;
  alertThreshold: number;
}

// ✅ Type pour les produits périmés/expirant
export interface ExpiringProduct {
  batchId: string;
  variantId: string;
  productName: string;
  quantity: number;
  expirationDate: string; // Format ISO 8601
}

// ✅ Type pour les pertes par type de mouvement
export interface LossByMovementType {
  movementType: string;
  totalQuantity: number;
  totalValue: number;
}

// ✅ Structure de la réponse inventory (sans any)
export interface InventoryResponse {
  currentInventoryValue: number;
  totalUnitsInStock: number;
  productsLowStock: ProductLowStock[];
  expiringProducts: ExpiringProduct[];
  lossesByMovementType: LossByMovementType[];
}

export const getInventory = async (
  businessId: string
): Promise<InventoryResponse> => {
  try {
    const response = await axiosInstance.get(
      `/businesses/${businessId}/analytics/inventory`
    );
    return response.data as InventoryResponse;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du fetch inventory analytics :",
      error.message
    );
    throw error;
  }
};

export type TopCustomer = {
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  totalOrdersPlaced: number;
  totalAmountSpent: string;
};

export type TopCustomersResponse = {
  topCustomers: TopCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getTopCustomers(
  businessId: string,
  page: number = 1,
  limit: number = 10
): Promise<TopCustomersResponse> {
  const res = await axiosInstance.get(
    `/businesses/${businessId}/analytics/customers?page=${page}&limit=${limit}`
  );
  return res.data;
}

// ✅ ==================== ORDERS ENDPOINT ====================

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
  | "PARTIALLY_REFUNDED";

export type OrderType = "SALE" | "PURCHASE" | "RESERVATION";

export type PaymentMethod = "STRIPE" | "CASH" | "CARD" | "TRANSFER";

export interface OrderLine {
  id: string;
  quantity: number;
  price: number;
  variantId: string;
  variant?: any; // Peut être typé plus précisément si besoin
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  paymentMethod?: PaymentMethod;
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
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetOrdersParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
  type?: OrderType;
  customerId?: string;
  variantId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// 📌 Fonction GET /businesses/{businessId}/orders
export const getOrders = async (
  businessId: string,
  params?: GetOrdersParams
): Promise<OrdersResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.customerId) queryParams.append("customerId", params.customerId);
    if (params?.variantId) queryParams.append("variantId", params.variantId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.minAmount)
      queryParams.append("minAmount", params.minAmount.toString());
    if (params?.maxAmount)
      queryParams.append("maxAmount", params.maxAmount.toString());

    const response = await axiosInstance.get(
      `/businesses/${businessId}/orders${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
    return response.data as OrdersResponse;
  } catch (error: any) {
    console.error("❌ Erreur lors du fetch orders :", error.message);
    throw error;
  }
};

// 📌 Fonction utilitaire pour obtenir le nombre de commandes en attente
export const getPendingOrdersCount = async (
  businessId: string,
  type: OrderType = "SALE"
): Promise<number> => {
  try {
    const response = await getOrders(businessId, {
      status: "PENDING_PAYMENT",
      type,
      limit: 1, // On ne récupère qu'une seule commande pour avoir le total
    });
    return response.total;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du fetch pending orders count :",
      error.message
    );
    return 0;
  }
};

// 📌 Fonction utilitaire pour obtenir le nombre d'achats en cours
export const getProcessingPurchasesCount = async (
  businessId: string
): Promise<{ count: number; totalItems: number }> => {
  try {
    const response = await getOrders(businessId, {
      type: "PURCHASE",
      limit: 100, // On récupère jusqu'à 100 commandes pour compter les items
    });

    // Filtrer les commandes en cours (PENDING, PROCESSING, CONFIRMED)
    const processingOrders = response.data.filter(
      (order) =>
        order.status === "PENDING" ||
        order.status === "PROCESSING" ||
        order.status === "CONFIRMED"
    );

    // Compter le nombre total d'articles
    const totalItems = processingOrders.reduce((sum, order) => {
      const orderItemsCount = order.lines.reduce(
        (lineSum, line) => lineSum + line.quantity,
        0
      );
      return sum + orderItemsCount;
    }, 0);

    return {
      count: processingOrders.length,
      totalItems,
    };
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du fetch processing purchases :",
      error.message
    );
    return { count: 0, totalItems: 0 };
  }
};
