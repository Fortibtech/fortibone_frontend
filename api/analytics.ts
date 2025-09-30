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
  currentInventoryValue: string;
  totalMembers: number;
  uniqueCustomers: number;
  averageBusinessRating: number;
  totalBusinessReviews: number;
}

// 📌 Fonction GET /analytics/overview
export const getAnalyticsOverview = async (
  businessId: string
): Promise<AnalyticsOverview> => {
  try {
    const response = await axiosInstance.get(
      `/businesses/${businessId}/analytics/overview`
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
  totalItems: number; // nombre d’articles vendus sur la période
}

// ✅ Type pour topSellingProducts
export interface TopSellingProduct {
  variantId: string;
  sku: string;
  productName: string;
  variantImageUrl: string;
  totalQuantitySold: number;
  totalRevenue: number;
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

// 📌 Fonction GET /analytics/sales
export const getSales = async (businessId: string): Promise<SalesResponse> => {
  try {
    const response = await axiosInstance.get(
      `/businesses/${businessId}/analytics/sales`
    );
    return response.data as SalesResponse;
  } catch (error: any) {
    console.error("❌ Erreur lors du fetch sales analytics :", error.message);
    throw error;
  }
};
export interface LossByMovementType {
  movementType: string;
  totalQuantity: number;
  totalValue: string;
}

export interface InventoryResponse {
  currentInventoryValue: string;
  totalUnitsInStock: number;
  productsLowStock: any[]; // tu peux créer un type plus précis si besoin
  expiringProducts: any[];
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
