// src/api/members.ts
import axiosInstance from "./axiosInstance";

// --------------------
// Interfaces
// --------------------
export interface Member {
  id: string;
  role: string;
  userId: string;
  businessId: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string;
  };
}

export interface Overview {
  totalSalesProcessed: number;
  totalSalesOrdersProcessed: number;
  totalProductsSold: number;
  totalPurchaseAmountInitiated: number;
  totalPurchaseOrdersInitiated: number;
  totalReservationsManaged: number;
  totalInventoryAdjustments: number;
  totalLossesManaged: string;
}

export interface Sales {
  salesByPeriod: any[];
  topSellingProducts: any[];
  salesByProductCategory: any[];
}

export interface InventoryMovements {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --------------------
// API calls
// --------------------

// ✅ Récupérer les membres d’un business
export const getMember = async (businessId: string): Promise<Member[]> => {
  try {
    const response = await axiosInstance.get(
      `/businesses/${businessId}/members`
    );
    return response.data; // tableau de membres
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des membres :",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Récupérer les stats overview d’un membre
export const getMemberOverview = async (
  businessId: string,
  memberId: string
): Promise<Overview> => {
  try {
    const response = await axiosInstance.get<Overview>(
      `/businesses/${businessId}/analytics/members/${memberId}/overview`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération de l'overview :",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Récupérer les ventes d’un membre
export const getMemberSales = async (
  businessId: string,
  memberId: string
): Promise<Sales> => {
  try {
    const response = await axiosInstance.get<Sales>(
      `/businesses/${businessId}/analytics/members/${memberId}/sales`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des ventes :",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ✅ Récupérer les mouvements d’inventaire d’un membre
export const getMemberInventoryMovements = async (
  businessId: string,
  memberId: string
): Promise<InventoryMovements> => {
  try {
    const response = await axiosInstance.get<InventoryMovements>(
      `/businesses/${businessId}/analytics/members/${memberId}/inventory-movements`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des mouvements d’inventaire :",
      error.response?.data || error.message
    );
    throw error;
  }
};

// --------------------
// Orders d’un membre
// --------------------
export interface MemberOrders {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ Récupérer les commandes traitées par un membre
export const getMemberOrders = async (
  businessId: string,
  memberId: string
): Promise<MemberOrders> => {
  try {
    const response = await axiosInstance.get<MemberOrders>(
      `/businesses/${businessId}/analytics/members/${memberId}/orders`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des commandes :",
      error.response?.data || error.message
    );
    throw error;
  }
};
