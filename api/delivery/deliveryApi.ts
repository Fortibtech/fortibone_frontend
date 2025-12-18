import axiosInstance from "@/api/axiosInstance";
export type FeePayer = "SENDER" | "RECEIVER";
export interface CreateEstimationPayload {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  carrierId: string;
}
// src/types/delivery.ts

export type DeliveryRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED";

export interface BusinessMini {
  id: string;
  name: string;
  type: "COMMERCANT" | "RESTAURATEUR" | "FOURNISSEUR";
  logoUrl?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  businessEmail?: string | null;
  isVerified: boolean;
}

export interface OrderMini {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
}

export interface IncomingDeliveryRequest {
  id: string;
  status: DeliveryRequestStatus;
  pickupAddress: string;
  deliveryAddress: string;
  distanceMeters: number;
  estimatedCost: string;
  feePayer: FeePayer;
  deliveryCode: string;

  orderId: string;
  carrierId: string;
  senderId: string;

  createdAt: string;
  updatedAt: string;

  assignedVehicleId: string | null;

  sender: BusinessMini;
  order: OrderMini;
}

export interface DeliveryEstimationResponse {
  carrierId: string;
  tariffName: string;
  distanceMeters: number;
  distanceKm: number;
  costBreakdown: {
    basePrice: number;
    pricePerKm: number;
    distanceCost: number;
  };
  totalCost: number;
  currency: string;
}
export interface DeliveryParty {
  id: string;
  name: string;
  ownerId: string;
}

export interface DeliveryOrderInfo {
  id: string;
  orderNumber: string;
  totalAmount: string;
}

export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "CANCELLED";

export interface DeliveryRequest {
  id: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  distanceMeters: number;
  estimatedCost: string;
  feePayer: FeePayer;
  deliveryCode: string;
  orderId: string;
  carrierId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  assignedVehicleId: string | null;
  carrier: DeliveryParty;
  sender: DeliveryParty;
  order: DeliveryOrderInfo;
}

export type UpdateDeliveryStatusPayload = {
  isOnline: boolean;
};

export type UpdateDeliveryStatusResponse = {
  businessId: string;
  isOnline: boolean;
};
export interface CreateDeliveryRequestPayload {
  orderId: string; // UUID
  carrierId: string; // UUID (entreprise LIVREUR)
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  distanceMeters: number;
  estimatedCost: number;
  feePayer: FeePayer;
}
export type DashboardData = {
  isOnline: boolean;
  totalDeliveries: number;
  pendingRequests: number;
  activeDeliveries: number;
};

export interface Tariff {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  basePrice: number;
  pricePerKm: number;
  minDistance: number;
  maxDistance: number;
  createdAt: string;
  updatedAt: string;
}

export interface TariffListResponse {
  tariffs?: Tariff[];
  tarrifs?: Tariff[] | Record<string, any>; // On accepte aussi un objet vide {} à cause du bug backend
}

export const createEstimation = async (
  payload: CreateEstimationPayload
): Promise<DeliveryEstimationResponse> => {
  try {
    const response = await axiosInstance.post<DeliveryEstimationResponse>(
      "/delivery/estimate",
      payload
    );

    return response.data;
  } catch (error: any) {
    // Gestion claire des erreurs business
    if (error.response?.status === 404) {
      throw new Error("Aucun tarif disponible pour cette distance");
    }

    if (error.response?.status === 400) {
      throw new Error("Données invalides pour l’estimation");
    }

    throw new Error("Erreur lors de l’estimation de livraison");
  }
};
export const getFilteredDashboard = async (
  businessId: string
): Promise<DashboardData> => {
  try {
    const response = await axiosInstance.get(
      `/delivery/businesses/${businessId}/dashboard`
    );

    const data = response.data;

    // On ne garde que les champs nécessaires
    const filteredData: DashboardData = {
      isOnline: data.isOnline,
      totalDeliveries: data.totalDeliveries,
      pendingRequests: data.pendingRequests,
      activeDeliveries: data.activeDeliveries,
    };

    return filteredData;
  } catch (error) {
    console.error("Erreur lors de la récupération du dashboard :", error);
    throw error;
  }
};
export const updateDeliveryStatus = async (
  businessId: string,
  payload: UpdateDeliveryStatusPayload
): Promise<UpdateDeliveryStatusResponse> => {
  try {
    const response = await axiosInstance.patch<UpdateDeliveryStatusResponse>(
      `/delivery/businesses/${businessId}/status`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error("❌ Erreur changement statut livreur :", error);
    throw error;
  }
};

export class DeliveryService {
  static async getListTariffs(businessId: string): Promise<Tariff[]> {
    if (!businessId) {
      throw new Error("businessId requis pour charger les tarifs");
    }

    try {
      const response = await axiosInstance.get<TariffListResponse>(
        `/delivery/businesses/${businessId}/tariffs`
      );

      // Récupération brute : on prend tariffs ou tarrifs (bug d'orthographe connu)
      let rawData = response.data.tariffs ?? response.data.tarrifs;

      let tariffs: Tariff[] = [];

      // === GESTION ROBUSTE DES CAS POSSIBLES ===
      if (Array.isArray(rawData)) {
        // Cas normal : tableau de tarifs
        tariffs = rawData;
      } else if (rawData && typeof rawData === "object") {
        // Cas bug backend : { tarrifs: {} } ou { tariffs: {} }
        // On considère qu'il n'y a aucun tarif
        tariffs = [];
      } else {
        // Cas null, undefined, ou autre → tableau vide
        tariffs = [];
      }

      console.log(
        `📦 Tarifs récupérés pour ${businessId}:`,
        tariffs.length,
        tariffs
      );

      return tariffs;
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des tarifs:", error);
      // En cas d'erreur réseau ou HTTP, on retourne un tableau vide pour éviter le crash
      return [];
    }
  }

  static async createDeliveryRequest(
    payload: CreateDeliveryRequestPayload
  ): Promise<DeliveryRequest> {
    // garde-fous minimum
    if (!payload.orderId || !payload.carrierId) {
      throw new Error("orderId et carrierId sont requis");
    }

    const response = await axiosInstance.post<DeliveryRequest>(
      "/delivery/requests",
      payload
    );

    console.log("🚚 Livraison créée :", response.data.id);

    return response.data;
  }
}

export const getIncomingDeliveryRequests = async (
  businessId: string
): Promise<IncomingDeliveryRequest[]> => {
  try {
    const response = await axiosInstance.get<IncomingDeliveryRequest[]>(
      `/delivery/businesses/${businessId}/requests/incoming`
    );

    return response.data;
  } catch (error) {
    console.error("❌ Erreur chargement demandes entrantes :", error);
    throw error;
  }
};
