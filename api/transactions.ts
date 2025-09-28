// src/api/transactions.ts
import axiosInstance from "./axiosInstance";

// ✅ Type de l'ordre d'une transaction
export interface Order {
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

// ✅ Type d'une transaction
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
  order: Order;
}

// ✅ Réponse de l'API
export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ✅ Récupérer MES transactions
export const getTransactions = async (
  page = 1,
  limit = 10
): Promise<TransactionsResponse> => {
  const { data } = await axiosInstance.get<TransactionsResponse>(
    `/payments/my-transactions`,
    { params: { page, limit } }
  );
  return data;
};

// ✅ Récupérer transactions d’une entreprise
export const getTransactionsByBusiness = async (
  businessId: string,
  page = 1,
  limit = 10
): Promise<TransactionsResponse> => {
  const { data } = await axiosInstance.get<TransactionsResponse>(
    `/payments/businesses/${businessId}/transactions`,
    { params: { page, limit } }
  );
  return data;
};
