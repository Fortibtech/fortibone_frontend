// web/src/lib/api/customers.ts
// Aligné avec mobile (api/customers.ts)

import axiosInstance from './axiosInstance';

// ==================== INTERFACES ====================

export interface CustomerInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImageUrl?: string | null;
}

export interface CustomerStats {
    totalSalesAmount: number;
    totalOrders: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
}

export interface CustomerOrder {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    products: string[];
}

export interface CustomerDetailResponse {
    customerInfo: CustomerInfo;
    stats: CustomerStats;
    recentOrders: CustomerOrder[];
}

// ==================== FONCTIONS API ====================

/**
 * Récupère les détails analytiques d'un client spécifique
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
        if (error.response?.status === 404) {
            throw new Error('Client ou entreprise non trouvé');
        }
        if (error.response?.status === 403) {
            throw new Error("Accès interdit : vous n'avez pas les droits");
        }
        if (error.response?.status === 401) {
            throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(
            error.response?.data?.message || 'Impossible de charger les détails du client'
        );
    }
};
