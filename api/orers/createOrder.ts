// src/api/orders/createOrder.ts
import axiosInstance from "../axiosInstance";

// 1️⃣ Types EXACTS du payload attendu par l’API
export type OrderType = "SALE" | "PURCHASE";

export interface OrderLine {
  variantId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  type: OrderType;
  businessId: string;
  supplierBusinessId?: string | null;
  notes?: string | null;
  tableId?: string | null;
  reservationDate?: string | null;
  lines: OrderLine[];
  useWallet: boolean;
  shippingFee: number;
  discountAmount: number;
}

// 2️⃣ Réponse de l’API (tu peux l’enrichir si nécessaire)
export interface CreateOrderResponse {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  lines: any[];
  // ... tu peux ajouter d’autres champs si tu veux typer plus
}

// 3️⃣ Fonction createOrder
export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  try {
    const response = await axiosInstance.post<CreateOrderResponse>(
      "/orders",
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur createOrder:", error.response?.data || error.message);
    throw error;
  }
}
// Type pour un item dans le panier
export interface CheckoutItem {
  variantId: string;
  quantity: number;
}

// Payload complet pour le checkout multi-vendeurs
export interface CheckoutPayload {
  items: CheckoutItem[];
  notes?: string;
  useWallet?: boolean; // false par défaut → paiement manuel après
}

// Réponse : tableau de commandes créées (une par vendeur)
export interface CheckoutOrder {
  id: string;
  orderNumber: string;
  type: "SALE" | "PURCHASE" | "RESERVATION";
  status: string;
  totalAmount: number;
  notes?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
  business: {
    id: string;
    name: string;
  };
  lines: Array<{
    id: string;
    quantity: number;
    price: number;
    variantId: string;
    variant: any;
  }>;
  // ... autres champs possibles (deliveryRequest, invoice, etc.)
}

// Fonction pour passer le checkout multi-vendeurs
export const passMultipleOrders = async (
  payload: CheckoutPayload
): Promise<CheckoutOrder[]> => {
  try {
    const response = await axiosInstance.post<CheckoutOrder[]>(
      "/orders/checkout",
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du checkout multi-vendeurs :",
      error.response?.data || error.message
    );

    // Gestion spécifique des erreurs courantes
    const serverError = error.response?.data;
    if (serverError?.message) {
      // Ex: stock insuffisant, solde wallet trop bas, etc.
      throw new Error(
        Array.isArray(serverError.message)
          ? serverError.message.join("\n")
          : serverError.message
      );
    }

    throw new Error("Impossible de valider le panier. Veuillez réessayer.");
  }
};
