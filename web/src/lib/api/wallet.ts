import axiosInstance from './axiosInstance';

// Types
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'ADJUSTMENT' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WalletTransaction {
    id: string;
    amount: number;
    currencyCode: string;
    provider: string;
    providerTransactionId: string;
    status: TransactionStatus;
    type?: TransactionType;  // API returns this field
    description?: string;    // API returns this field
    metadata: Record<string, any>;
    createdAt: string;
    orderId?: string;
}

export interface WalletTransactionResponse {
    data: WalletTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface WalletCurrency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number;
}

export interface Wallet {
    id: string;
    balance: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    currencyId: string;
    currency: WalletCurrency;
}

export interface DepositPayload {
    amount: number;
    method: 'STRIPE' | 'KARTAPAY';
    metadata: {
        note?: string;
        paymentMethodId?: string;
        phoneNumber?: string;
    };
}

export interface WithdrawPayload {
    amount: number;
    method: 'STRIPE' | 'KARTAPAY';
    metadata?: {
        mobileMoneyNumber?: string;
        note?: string;
    };
}

export interface TransferRequest {
    amount: number;
    recipientIdentifier: string;
}

// API Functions
export const getWallet = async (): Promise<Wallet | null> => {
    try {
        const response = await axiosInstance.get<Wallet>('/wallet');
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération wallet:', error.response?.data || error.message);
        return null;
    }
};

export const getWalletTransactions = async (params: {
    page?: number;
    limit?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
}): Promise<WalletTransactionResponse> => {
    try {
        const response = await axiosInstance.get('/wallet/transactions', { params });
        return response.data as WalletTransactionResponse;
    } catch (error: any) {
        console.error('Erreur transactions:', error.response?.data || error);
        throw error;
    }
};

export const createDeposit = async (payload: DepositPayload) => {
    try {
        const response = await axiosInstance.post('/wallet/deposit', payload);
        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message,
        };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || 'Erreur inconnue';
        if (error.response?.status === 401) {
            throw new Error('TOKEN_EXPIRED');
        }
        throw new Error(msg);
    }
};

export const createWithdraw = async (payload: WithdrawPayload) => {
    try {
        const cleanPayload: any = {
            amount: payload.amount,
            method: payload.method,
        };

        if (payload.method === 'KARTAPAY' && payload.metadata) {
            cleanPayload.metadata = {};
            if (payload.metadata.mobileMoneyNumber) {
                cleanPayload.metadata.mobileMoneyNumber = payload.metadata.mobileMoneyNumber;
            }
            if (payload.metadata.note) {
                cleanPayload.metadata.note = payload.metadata.note;
            }
            if (Object.keys(cleanPayload.metadata).length === 0) {
                delete cleanPayload.metadata;
            }
        }

        const response = await axiosInstance.post('/wallet/withdraw', cleanPayload);
        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message,
        };
    } catch (error: any) {
        const status = error.response?.status;
        const serverMessage = error.response?.data?.message || error.message || 'Erreur inconnue';

        if (status === 401) {
            throw new Error('TOKEN_EXPIRED');
        }

        return {
            success: false,
            message: Array.isArray(serverMessage) ? serverMessage[0] : serverMessage,
            onboardingUrl: error.response?.data?.onboardingUrl,
        };
    }
};

export const transferMoney = async (amount: number, recipientIdentifier: string) => {
    if (amount <= 0) {
        throw new Error('Le montant doit être supérieur à 0');
    }

    const payload: TransferRequest = {
        amount,
        recipientIdentifier: recipientIdentifier.trim(),
    };

    try {
        const response = await axiosInstance.post('/wallet/transfer', payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 400) {
            throw new Error(error.response.data?.message || 'Solde insuffisant ou destinataire invalide');
        }
        if (error.response?.status === 404) {
            throw new Error('Destinataire non trouvé');
        }
        if (error.response?.status === 401) {
            throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(error.response?.data?.message || 'Échec du transfert');
    }
};
