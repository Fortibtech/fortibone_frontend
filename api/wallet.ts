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

// api/wallet.ts ou types/wallet.ts

export type WithdrawMethod = "STRIPE" | "KARTAPAY";
// Tu peux garder "KARTAPAY" si tu veux rester cohérent avec le dépôt, mais je recommande de clarifier

export interface WithdrawPayload {
  amount: number;
  method: WithdrawMethod;
  metadata?: {
    mobileMoneyNumber?: string;
    note?: string;
  };
}

export interface WithdrawResponse {
  success: boolean;
  data?: {
    id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    amount: number;
    description?: string;
    createdAt: string;
  };
  message?: string;
  onboardingUrl?: string;
}

export const createWithdraw = async (
  payload: WithdrawPayload
): Promise<WithdrawResponse> => {
  try {
    // ON FORCE LE NETTOYAGE : on reconstruit l'objet à la main
    let cleanPayload: any = {
      amount: payload.amount,
      method: payload.method,
    };

    // On ajoute metadata UNIQUEMENT si c'est KARTAPAY et qu'il existe
    if (payload.method === "KARTAPAY" && payload.metadata) {
      cleanPayload.metadata = {
        ...(payload.metadata.mobileMoneyNumber && {
          mobileMoneyNumber: payload.metadata.mobileMoneyNumber,
        }),
        ...(payload.metadata.note && { note: payload.metadata.note }),
      };
      // Si metadata est vide après nettoyage → on le supprime
      if (Object.keys(cleanPayload.metadata).length === 0) {
        delete cleanPayload.metadata;
      }
    }
    // Pour STRIPE → on ne touche à rien → pas de metadata du tout

    const response = await axiosInstance.post("/wallet/withdraw", cleanPayload);

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error("Erreur createWithdraw :", error.response?.data || error);

    const status = error.response?.status;
    const serverMessage =
      error.response?.data?.message || error.message || "Erreur inconnue";

    if (status === 401) {
      throw new Error("TOKEN_EXPIRED");
    }

    if (status === 428) {
      return {
        success: false,
        message: Array.isArray(serverMessage)
          ? serverMessage[0]
          : serverMessage,
        onboardingUrl: error.response?.data?.onboardingUrl,
      };
    }

    return {
      success: false,
      message: Array.isArray(serverMessage) ? serverMessage[0] : serverMessage,
    };
  }
};

// Types basés sur la réponse réelle de l'API (pas sur la doc obsolète)
export interface TransferResponse {
  id: string;
  type: "TRANSFER";
  amount: string; // vient en string : "-100" ou "+100"
  status: "COMPLETED" | "PENDING" | "FAILED";
  description: string;
  createdAt: string;
  walletId: string;
  metadata: any | null;
  relatedOrderId: string | null;
  relatedPaymentTransactionId: string | null;
  transferPeerTransactionId: string; // ID de la transaction chez le destinataire
}

export interface TransferRequest {
  amount: number; // tu envoies un nombre positif
  recipientIdentifier: string; // email ou phone ou username
}

/**
 * Transfère de l'argent à un autre utilisateur FortiBone
 * @param amount Montant à envoyer (doit être > 0)
 * @param recipientIdentifier Email, téléphone ou identifiant du destinataire
 * @returns Les détails de la transaction de débit (côté expéditeur)
 */
export const transferMoney = async (
  amount: number,
  recipientIdentifier: string
): Promise<TransferResponse> => {
  if (amount <= 0) {
    throw new Error("Le montant doit être supérieur à 0");
  }

  const payload: TransferRequest = {
    amount, // l'API attend un nombre positif
    recipientIdentifier: recipientIdentifier.trim(),
  };

  try {
    const response = await axiosInstance.post<TransferResponse>(
      "/wallet/transfer",
      payload
    );

    return response.data;
  } catch (error: any) {
    // Gestion propre des erreurs fréquentes
    if (error.response?.status === 400) {
      const msg =
        error.response.data?.message ||
        "Solde insuffisant ou destinataire invalide";
      throw new Error(msg);
    }
    if (error.response?.status === 404) {
      throw new Error("Destinataire non trouvé");
    }
    if (error.response?.status === 401) {
      throw new Error("Session expirée, veuillez vous reconnecter");
    }

    // Erreur inconnue
    console.error("Erreur transfert :", error);
    throw new Error(
      error.response?.data?.message || "Échec du transfert, réessayez"
    );
  }
};
