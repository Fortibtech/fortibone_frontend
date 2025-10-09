import axiosInstance from "./axiosInstance";
export interface Wallet {
  id: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  currencyId: string;
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
export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PAYMENT"
  | "REFUND"
  | "ADJUSTMENT";

export interface WalletTransaction {
  id: string;
  amount: number;
  currencyCode: string;
  provider: string;
  providerTransactionId: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
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

export interface TransactionQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string; // format YYYY-MM-DD
  endDate?: string; // format YYYY-MM-DD
}

/**
 * 🔹 Récupère la liste paginée des transactions du portefeuille
 */
export const GetWalletTransactions = async (
  params?: TransactionQueryParams
): Promise<WalletTransactionResponse | null> => {
  try {
    const response = await axiosInstance.get("/wallet/transactions", {
      params,
    });
    console.log("✅ Transactions récupérées :", response.data);
    return response.data as WalletTransactionResponse;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des transactions :",
      error.response?.data || error.message
    );
    return null;
  }
};

export enum DepositMethodEnum {
  STRIPE = "STRIPE",
  MVOLA = "MVOLA",
  MANUAL = "MANUAL",
}
export type DepositMethod = keyof typeof DepositMethodEnum;
export interface DepositRequest {
  amount: number;
  method: DepositMethodEnum;
  phoneNumber?: string;
}

export interface DepositResponse {
  clientSecret?: string; // STRIPE uniquement
  redirectUrl?: string; // éventuellement pour d'autres passerelles
  transactionId?: string;
  method?: DepositMethod;
  status: "PENDING" | "FAILED" | "COMPLETED";
  message?: string;
}

/**
 * 🔹 Initie un dépôt pour recharger le portefeuille
 */
export const DepositWallet = async (
  payload: DepositRequest
): Promise<DepositResponse> => {
  if (!payload.amount || payload.amount <= 0) {
    return { status: "FAILED", message: "Montant invalide" };
  }

  try {
    const { data } = await axiosInstance.post("/wallet/deposit", payload);
    console.log(`✅ Dépôt initié via ${payload.method} :`, data);

    return data as DepositResponse;
  } catch (error: any) {
    console.error(
      `❌ Erreur lors du dépôt (${payload.method}) :`,
      error.response?.data || error.message
    );

    return {
      status: "FAILED",
      message:
        error.response?.data?.message || "Erreur de connexion au serveur",
    };
  }
};
