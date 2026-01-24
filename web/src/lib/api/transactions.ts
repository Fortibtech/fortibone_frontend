// web/src/lib/api/transactions.ts
// Aligné avec mobile (api/transactions.ts)

import axiosInstance from './axiosInstance';

// ==================== INTERFACES ====================

export interface TransactionOrder {
    id: string;
    orderNumber: string;
    type: string;
    business: {
        id: string;
        name: string;
    };
    customer: {
        id: string;
        firstName: string;
    };
}

export interface Transaction {
    id: string;
    amount: string;
    currencyCode: string;
    provider: string;
    providerTransactionId: string;
    status: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    order: TransactionOrder;
}

export interface TransactionsResponse {
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ==================== FONCTIONS API ====================

/**
 * Récupérer MES transactions
 */
export const getTransactions = async (
    page = 1,
    limit = 10
): Promise<TransactionsResponse> => {
    try {
        const response = await axiosInstance.get<TransactionsResponse>(
            '/payments/my-transactions',
            { params: { page, limit } }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération transactions:', error.message);
        throw error;
    }
};

/**
 * Récupérer transactions d'une entreprise
 */
export const getTransactionsByBusiness = async (
    businessId: string,
    page = 1,
    limit = 10
): Promise<TransactionsResponse> => {
    try {
        const response = await axiosInstance.get<TransactionsResponse>(
            `/payments/businesses/${businessId}/transactions`,
            { params: { page, limit } }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération transactions business:', error.message);
        throw error;
    }
};
