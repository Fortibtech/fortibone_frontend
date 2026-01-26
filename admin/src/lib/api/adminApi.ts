// Admin Analytics API - Global supervision endpoints
import axiosInstance from './axiosInstance';

// ==================== INTERFACES ====================

export interface GlobalStats {
    totalUsers: number;
    totalBusinesses: number;
    totalTransactions: number;
    totalVolume: number;
    usersByType: {
        particuliers: number;
        commercants: number;
        fournisseurs: number;
        restaurateurs: number;
        livreurs: number;
    };
}

export interface BusinessType {
    COMMERCANT: number;
    FOURNISSEUR: number;
    RESTAURATEUR: number;
    LIVREUR: number;
}

export interface Business {
    id: string;
    name: string;
    type: 'COMMERCANT' | 'FOURNISSEUR' | 'RESTAURATEUR' | 'LIVREUR';
    description?: string;
    address?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    rating?: number;
    isVerified?: boolean;
    createdAt: string;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profileImageUrl?: string;
    createdAt: string;
    businesses?: Business[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

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
}

// ==================== API FUNCTIONS ====================

/**
 * Get all businesses (paginated)
 */
export const getAllBusinesses = async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
}): Promise<PaginatedResponse<Business>> => {
    try {
        const response = await axiosInstance.get('/businesses', { params });
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur fetch businesses:', error.message);
        // Fallback for limited backend
        return {
            data: [],
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            totalPages: 0
        };
    }
};

/**
 * Get business count by type
 */
export const getBusinessCountByType = async (): Promise<BusinessType> => {
    try {
        const [commercants, fournisseurs, restaurateurs, livreurs] = await Promise.all([
            axiosInstance.get('/businesses', { params: { type: 'COMMERCANT', limit: 1 } }),
            axiosInstance.get('/businesses', { params: { type: 'FOURNISSEUR', limit: 1 } }),
            axiosInstance.get('/businesses', { params: { type: 'RESTAURATEUR', limit: 1 } }),
            axiosInstance.get('/businesses', { params: { type: 'LIVREUR', limit: 1 } }),
        ]);

        return {
            COMMERCANT: commercants.data.total || 0,
            FOURNISSEUR: fournisseurs.data.total || 0,
            RESTAURATEUR: restaurateurs.data.total || 0,
            LIVREUR: livreurs.data.total || 0,
        };
    } catch (error: any) {
        console.error('❌ Erreur fetch business counts:', error.message);
        return { COMMERCANT: 0, FOURNISSEUR: 0, RESTAURATEUR: 0, LIVREUR: 0 };
    }
};

/**
 * Get analytics overview for a specific business
 */
export const getBusinessAnalytics = async (
    businessId: string,
    startDate?: string,
    endDate?: string
): Promise<AnalyticsOverview> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await axiosInstance.get(
            `/businesses/${businessId}/analytics/overview${params.toString() ? `?${params.toString()}` : ''}`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur fetch analytics:', error.message);
        throw error;
    }
};

/**
 * Get global platform statistics
 * Note: This aggregates data from multiple endpoints
 */
export const getGlobalStats = async (): Promise<GlobalStats> => {
    try {
        // Fetch all businesses to count
        const allBusinesses = await axiosInstance.get('/businesses', { params: { limit: 1 } });
        const businessCounts = await getBusinessCountByType();

        const totalBusinesses = allBusinesses.data.total || 0;

        // Calculate user approximation based on business owners + estimated particuliers
        const totalProfessionals =
            businessCounts.COMMERCANT +
            businessCounts.FOURNISSEUR +
            businessCounts.RESTAURATEUR +
            businessCounts.LIVREUR;

        // Estimate particuliers as 3x professionals (typical ratio)
        const estimatedParticuliers = totalProfessionals * 3;

        return {
            totalUsers: totalProfessionals + estimatedParticuliers,
            totalBusinesses,
            totalTransactions: 0, // Would need specific endpoint
            totalVolume: 0, // Would need specific endpoint
            usersByType: {
                particuliers: estimatedParticuliers,
                commercants: businessCounts.COMMERCANT,
                fournisseurs: businessCounts.FOURNISSEUR,
                restaurateurs: businessCounts.RESTAURATEUR,
                livreurs: businessCounts.LIVREUR,
            },
        };
    } catch (error: any) {
        console.error('❌ Erreur fetch global stats:', error.message);
        // Fallback for limited backend (Careers only)
        return {
            totalUsers: 0,
            totalBusinesses: 0,
            totalTransactions: 0,
            totalVolume: 0,
            usersByType: {
                particuliers: 0,
                commercants: 0,
                fournisseurs: 0,
                restaurateurs: 0,
                livreurs: 0,
            },
        };
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur fetch current user:', error.message);
        return null;
    }
};

/**
 * Get user's businesses
 */
export const getMyBusinesses = async (): Promise<Business[]> => {
    try {
        const response = await axiosInstance.get('/users/me/businesses');
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur fetch my businesses:', error.message);
        return [];
    }
};
