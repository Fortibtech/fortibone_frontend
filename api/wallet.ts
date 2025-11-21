import axiosInstance from "./axiosInstance";

// ---------- Types ----------

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PAYMENT"
  | "REFUND"
  | "ADJUSTMENT"
  | "TRANSFER";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface WalletTransaction {
  id: string;
  amount: number;
  currencyCode: string;
  provider: string;
  providerTransactionId: string;
  status: TransactionStatus;
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

// ---------- Fonction principale ----------

/**
 * Récupère l'historique paginé des transactions du wallet
 */
export const GetWalletTransactions = async ({
  page = 1,
  limit = 10,
  type,
  status,
  search,
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
  startDate?: string; // format YYYY-MM-DD
  endDate?: string; // format YYYY-MM-DD
}): Promise<WalletTransactionResponse> => {
  try {
    const response = await axiosInstance.get("/wallet/transactions", {
      params: {
        page,
        limit,
        type,
        status,
        search,
        startDate,
        endDate,
      },
    });

    return response.data as WalletTransactionResponse;
  } catch (error: any) {
    console.error(
      "❌ Erreur GetWalletTransactions:",
      error.response?.data || error
    );
    throw error;
  }
};

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
