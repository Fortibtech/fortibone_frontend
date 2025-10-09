import axiosInstance from "./axiosInstance";

/**
 * 🔹 Représente la devise du wallet
 */
export interface WalletCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

/**
 * 🔹 Représente un portefeuille utilisateur
 */
export interface Wallet {
  id: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  currencyId: string;
  currency: WalletCurrency; // <-- ajouté pour refléter la nouvelle réponse API
}

/**
 * 🔹 Récupère le portefeuille de l'utilisateur connecté
 * @returns Les informations du wallet ou null si erreur
 */
export const GetWallet = async (): Promise<Wallet | null> => {
  try {
    const response = await axiosInstance.get<Wallet>("/wallet");
    console.log("💰 Wallet récupéré :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération du wallet :",
      error.response?.data || error.message
    );
    return null;
  }
};

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PAYMENT"
  | "REFUND"
  | "ADJUSTMENT";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface WalletTransaction {
  id: string;
  amount: number;
  currencyCode: string;
  provider: string; // STRIPE, MVOLA, MANUAL...
  providerTransactionId: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  orderId?: string | null;
}

export interface WalletTransactionResponse {
  data: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
/**
 * 🔹 Récupère l'historique des transactions du portefeuille
 */
export const GetWalletTransactions = async ({
  search,
  page = 1,
  limit = 10,
  type,
  status,
  startDate,
  endDate,
}: {
  search?: string;
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}): Promise<WalletTransactionResponse | null> => {
  try {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (type) params.append("type", type);
    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get<WalletTransactionResponse>(
      `/wallet/transactions?${params.toString()}`
    );

    console.log("📜 Transactions récupérées :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des transactions :",
      error.response?.data || error.message
    );
    return null;
  }
};

// 🔹 Enum pour les méthodes supportées
export enum DepositMethodEnum {
  STRIPE = "STRIPE",
  MVOLA = "MVOLA",
  MANUAL = "MANUAL",
}

// 🔹 Types pour les données supplémentaires
interface StripeMetadata {
  paymentMethodId: string;
  note?: string;
}

interface MvolaMetadata {
  phoneNumber: string;
  note?: string;
}

type DepositMetadata = StripeMetadata | MvolaMetadata | undefined;

// 🔹 Payload principal
export interface DepositPayload {
  amount: number;
  method: DepositMethodEnum;
  metadata?: DepositMetadata;
}

// 🔹 Réponse typée de l’API
export interface DepositResponse {
  transactionId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  message?: string;
}

// 🔹 Fonction principale
export const DepositWallet = async (
  payload: DepositPayload
): Promise<DepositResponse> => {
  try {
    console.log("💳 Envoi dépôt :", payload);
    const { data } = await axiosInstance.post("/wallet/deposit", payload);
    console.log("✅ Réponse dépôt :", data);
    return data;
  } catch (error: any) {
    console.error("❌ Erreur dépôt :", error?.response?.data || error.message);
    return {
      status: "FAILED",
      message: error?.response?.data?.message || "Erreur serveur",
    };
  }
};
