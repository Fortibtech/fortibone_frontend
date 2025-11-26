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
    console.log("📦 Payload envoyé :", payload);

    const response = await axiosInstance.post<CreateOrderResponse>(
      "/orders",
      payload
    );

    console.log("✅ Order créée :", response.data);
    return response.data;
  } catch (error: any) {
    console.log("❌ Erreur createOrder :", error.response?.data || error);
    throw error;
  }
}
