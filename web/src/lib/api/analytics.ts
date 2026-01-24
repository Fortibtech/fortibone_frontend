// src/lib/api/analytics.ts
// Réplication exacte du mobile api/analytics.ts

import axiosInstance from "./axiosInstance";

// ==================== INTERFACES ANALYTICS ====================

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

export interface SalesByPeriod {
    period: string; // ex: "2025-09"
    totalAmount: number;
    totalItems: number;
}

export interface SalesByProductCategory {
    categoryId: string;
    categoryName: string;
    totalRevenue: number;
    totalItemsSold: number;
}

export interface TopSellingProduct {
    variantId: string;
    sku: string;
    productName: string;
    variantImageUrl: string;
    totalQuantitySold: number;
    totalRevenue: number;
    revenuePercentage?: number;
}

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

// ==================== INTERFACES INVENTORY ====================

export interface ProductLowStock {
    variantId: string;
    sku: string;
    productName: string;
    quantityInStock: number;
    alertThreshold: number;
}

export interface ExpiringProduct {
    batchId: string;
    variantId: string;
    productName: string;
    quantity: number;
    expirationDate: string;
}

export interface LossByMovementType {
    movementType: string;
    totalQuantity: number;
    totalValue: number;
}

export interface InventoryResponse {
    currentInventoryValue: number;
    totalUnitsInStock: number;
    productsLowStock: ProductLowStock[];
    expiringProducts: ExpiringProduct[];
    lossesByMovementType: LossByMovementType[];
}

// ==================== INTERFACES CUSTOMERS ====================

export interface TopCustomer {
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    totalOrdersPlaced: number;
    totalAmountSpent: string;
}

export interface TopCustomersResponse {
    topCustomers: TopCustomer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ==================== INTERFACES ORDERS ====================

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
    variant?: any;
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

// ==================== INTERFACES RESTAURANT ====================

export interface PopularDish {
    variantId: string;
    dishName: string;
    dishImageUrl?: string;
    totalQuantityOrdered: number;
    totalRevenue: string | number;
}

export interface ReservationByPeriod {
    period: string;
    totalReservations: number;
}

export interface RestaurantAnalyticsResponse {
    totalReservations: number;
    totalDishOrders: number;
    popularDishes: PopularDish[];
    reservationsByPeriod: ReservationByPeriod[];
    averageTableOccupancy: number;
}

export interface GetRestaurantAnalyticsParams {
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    unit?: "DAY" | "WEEK" | "MONTH" | "YEAR";
}

// ==================== FONCTIONS API ====================

/**
 * GET /businesses/{businessId}/analytics/overview
 */
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
            `/businesses/${businessId}/analytics/overview${params.toString() ? `?${params.toString()}` : ""
            }`
        );
        return response.data as AnalyticsOverview;
    } catch (error: any) {
        console.error("❌ Erreur fetch analytics overview:", error.message);
        throw error;
    }
};

/**
 * GET /businesses/{businessId}/analytics/sales
 */
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
            `/businesses/${businessId}/analytics/sales${queryParams.toString() ? `?${queryParams.toString()}` : ""
            }`
        );
        return response.data as SalesResponse;
    } catch (error: any) {
        console.error("❌ Erreur fetch sales analytics:", error.message);
        throw error;
    }
};

/**
 * GET /businesses/{businessId}/analytics/inventory
 */
export const getInventory = async (
    businessId: string
): Promise<InventoryResponse> => {
    try {
        const response = await axiosInstance.get(
            `/businesses/${businessId}/analytics/inventory`
        );
        return response.data as InventoryResponse;
    } catch (error: any) {
        console.error("❌ Erreur fetch inventory analytics:", error.message);
        throw error;
    }
};

/**
 * GET /businesses/{businessId}/analytics/customers
 */
export const getTopCustomers = async (
    businessId: string,
    page: number = 1,
    limit: number = 10
): Promise<TopCustomersResponse> => {
    const response = await axiosInstance.get(
        `/businesses/${businessId}/analytics/customers?page=${page}&limit=${limit}`
    );
    return response.data;
};

/**
 * GET /businesses/{businessId}/orders (avec filtres)
 */
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
        if (params?.minAmount) queryParams.append("minAmount", params.minAmount.toString());
        if (params?.maxAmount) queryParams.append("maxAmount", params.maxAmount.toString());

        const response = await axiosInstance.get(
            `/businesses/${businessId}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""
            }`
        );
        return response.data as OrdersResponse;
    } catch (error: any) {
        console.error("❌ Erreur fetch orders:", error.message);
        throw error;
    }
};

/**
 * Utilitaire: Nombre de commandes en attente de paiement
 */
export const getPendingOrdersCount = async (
    businessId: string,
    type: OrderType = "SALE"
): Promise<number> => {
    try {
        const response = await getOrders(businessId, {
            status: "PENDING_PAYMENT",
            type,
            limit: 1,
        });
        return response.total;
    } catch (error: any) {
        console.error("❌ Erreur fetch pending orders count:", error.message);
        return 0;
    }
};

/**
 * Utilitaire: Nombre d'achats en cours (PENDING, PROCESSING, CONFIRMED)
 */
export const getProcessingPurchasesCount = async (
    businessId: string
): Promise<{ count: number; totalItems: number }> => {
    try {
        const response = await getOrders(businessId, {
            type: "PURCHASE",
            limit: 100,
        });

        const processingOrders = response.data.filter(
            (order) =>
                order.status === "PENDING" ||
                order.status === "PROCESSING" ||
                order.status === "CONFIRMED"
        );

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
        console.error("❌ Erreur fetch processing purchases:", error.message);
        return { count: 0, totalItems: 0 };
    }
};

/**
 * GET /businesses/{businessId}/analytics/restaurant
 */
export const getRestaurantAnalytics = async (
    businessId: string,
    params?: GetRestaurantAnalyticsParams
): Promise<RestaurantAnalyticsResponse> => {
    try {
        const response = await axiosInstance.get<RestaurantAnalyticsResponse>(
            `/businesses/${businessId}/analytics/restaurant`,
            { params }
        );
        return response.data;
    } catch (error: any) {
        if (error.response) {
            const status = error.response.status;
            if (status === 400) {
                throw new Error("Cette entreprise n'est pas configurée comme un restaurant.");
            }
            if (status === 403) {
                throw new Error("Accès interdit : vous n'avez pas les privilèges nécessaires.");
            }
            if (status === 404) {
                throw new Error("Entreprise non trouvée.");
            }
            throw new Error(
                error.response.data?.message ||
                `Erreur ${status} lors de la récupération des analytics restaurant`
            );
        }
        throw new Error("Erreur réseau ou serveur indisponible.");
    }
};
