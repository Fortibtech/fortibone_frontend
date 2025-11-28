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

export interface DepositPayload {
  amount: number;
  method: "STRIPE" | "KARTAPAY";
  metadata: {
    note?: string;
    paymentMethodId?: string; // pour Stripe
    phoneNumber?: string; // pour MVola
  };
}

export interface DepositResponse {
  success: boolean;
  data?: {
    clientSecret?: string; // Stripe si 3DS requis
    paymentIntentId?: string;
    status?: string;
    redirectUrl?: string; // MVola (si redirection)
    reference?: string; // MVola
  };
  message?: string;
}

/**
 * Fonction générique pour initier un dépôt (Stripe ou MVola)
 */
export const createDeposit = async (
  payload: DepositPayload
): Promise<DepositResponse> => {
  try {
    const response = await axiosInstance.post("/wallet/deposit", payload);

    // Ton API renvoie probablement { success: true, data: {...} }
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error("Erreur createDeposit :", error.response?.data || error);

    const msg =
      error.response?.data?.message || error.message || "Erreur inconnue";

    // Gestion spécifique des erreurs connues
    if (error.response?.status === 401) {
      // Tu peux throw une erreur custom pour déclencher logout
      throw new Error("TOKEN_EXPIRED");
    }

    if (error.response?.status === 400) {
      throw new Error(msg || "Montant ou données invalides");
    }

    if (error.response?.status >= 500) {
      throw new Error("Service indisponible, réessayez plus tard");
    }

    throw new Error(msg);
  }
};
