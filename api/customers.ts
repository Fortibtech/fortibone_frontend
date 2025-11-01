// src/api/customers.ts
import { CustomerDetailResponse } from "@/types/customers";
import axiosInstance from "./axiosInstance";

/**
 * Récupère les détails analytiques d'un client spécifique
 * @param businessId - ID de l'entreprise
 * @param customerId - ID du client
 * @returns Détails du client + stats + commandes récentes
 */
export const getCustomerDetailById = async (
  businessId: string,
  customerId: string
): Promise<CustomerDetailResponse> => {
  try {
    const response = await axiosInstance.get<any>(
      `/businesses/${businessId}/analytics/customers/${customerId}`
    );

    const raw = response.data;

    return {
      customerInfo: raw.customerInfo,
      stats: {
        totalSalesAmount: Number(raw.stats.totalSalesAmount) || 0,
        totalOrders: Number(raw.stats.totalOrders) || 0,
        averageOrderValue: Number(raw.stats.averageOrderValue) || 0,
        lastOrderDate: raw.stats.lastOrderDate || null,
      },
      recentOrders: (raw.recentOrders || []).map((order: any) => ({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        totalAmount: Number(order.totalAmount) || 0,
        status: order.status,
        products: order.products || [],
      })),
    };
  } catch (error: any) {
    // Gestion fine des erreurs
    if (error.response?.status === 404) {
      throw new Error("Client ou entreprise non trouvé");
    }
    if (error.response?.status === 403) {
      throw new Error("Accès interdit : vous n'avez pas les droits");
    }
    if (error.response?.status === 401) {
      throw new Error("Session expirée, veuillez vous reconnecter");
    }

    // Erreur générique
    throw new Error(
      error.response?.data?.message ||
        "Impossible de charger les détails du client"
    );
  }
};
