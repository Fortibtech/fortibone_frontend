// web/src/lib/api/members.ts
// Aligné avec mobile (api/members.ts)

import axiosInstance from './axiosInstance';

// ==================== INTERFACES ====================

export interface MemberUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string;
}

export interface Member {
    id: string;
    role: string;
    userId: string;
    businessId: string;
    createdAt: string;
    user: MemberUser;
}

export interface MemberOverview {
    totalSalesProcessed: number;
    totalSalesOrdersProcessed: number;
    totalProductsSold: number;
    totalPurchaseAmountInitiated: number;
    totalPurchaseOrdersInitiated: number;
    totalReservationsManaged: number;
    totalInventoryAdjustments: number;
    totalLossesManaged: string;
}

export interface MemberSales {
    salesByPeriod: any[];
    topSellingProducts: any[];
    salesByProductCategory: any[];
}

export interface MemberInventoryMovements {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface MemberOrders {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ==================== FONCTIONS API ====================

/**
 * Récupérer les membres d'un business
 */
export const getMembers = async (businessId: string): Promise<Member[]> => {
    try {
        const response = await axiosInstance.get(`/businesses/${businessId}/members`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération membres:', error.message);
        throw error;
    }
};

/**
 * Récupérer les stats overview d'un membre
 */
export const getMemberOverview = async (
    businessId: string,
    memberId: string
): Promise<MemberOverview> => {
    try {
        const response = await axiosInstance.get<MemberOverview>(
            `/businesses/${businessId}/analytics/members/${memberId}/overview`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération overview membre:', error.message);
        throw error;
    }
};

/**
 * Récupérer les ventes d'un membre
 */
export const getMemberSales = async (
    businessId: string,
    memberId: string
): Promise<MemberSales> => {
    try {
        const response = await axiosInstance.get<MemberSales>(
            `/businesses/${businessId}/analytics/members/${memberId}/sales`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération ventes membre:', error.message);
        throw error;
    }
};

/**
 * Récupérer les mouvements d'inventaire d'un membre
 */
export const getMemberInventoryMovements = async (
    businessId: string,
    memberId: string
): Promise<MemberInventoryMovements> => {
    try {
        const response = await axiosInstance.get<MemberInventoryMovements>(
            `/businesses/${businessId}/analytics/members/${memberId}/inventory-movements`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération mouvements inventaire membre:', error.message);
        throw error;
    }
};

/**
 * Récupérer les commandes traitées par un membre
 */
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
        console.error('❌ Erreur récupération commandes membre:', error.message);
        throw error;
    }
};
