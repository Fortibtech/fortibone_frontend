import axiosInstance from "@/api/axiosInstance";
export type FeePayer = "SENDER" | "RECEIVER";
export type VehicleType =
  | "MOTO"
  | "VELO"
  | "SCOOTER"
  | "VOITURE"
  | "CAMIONNETTE"
  | "CAMION"
  | "DRONE"
  | "AUTRE";

// src/types/delivery.ts

export type DeliveryRequestStatus =
  | "PENDING"
  | "ACTIVE"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELLED"
  | "ACCEPTED"
  | "REJECTED";
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
  | "CANCELLED"
  | "ACCEPTED"
  | "PICKED_UP"
  | "REJECTED";

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
export const getActiveDeliveryRequests = async (
  businessId: string
): Promise<DeliveryRequest[]> => {
  const res = await axiosInstance.get(
    `/delivery/businesses/${businessId}/requests/active`
  );
  return res.data;
};

// ================= TYPES =================

export interface Tariffs {
  id: string;
  name: string;
  basePrice: string; // ⚠️ l’API renvoie des strings
  pricePerKm: string; // ⚠️ l’API renvoie des strings
  minDistance: number;
  maxDistance: number;
  vehicleType: string | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

// ================= API =================

/**
 * Récupérer la liste des tarifs d'une entreprise livreur
 */
export const getTariffs = async (businessId: string): Promise<Tariffs[]> => {
  const res = await axiosInstance.get(
    `/delivery/businesses/${businessId}/tariffs`
  );

  return res.data;
};

// types/vehicle.ts

export interface CreateVehiclePayload {
  name: string;
  type: VehicleType;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  brand: string;
  model: string;
  capacity: string;
  isActive: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export const createVehicle = async (
  businessId: string,
  payload: CreateVehiclePayload
): Promise<Vehicle> => {
  try {
    const res = await axiosInstance.post(
      `/delivery/businesses/${businessId}/vehicles`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Erreur lors de la création du véhicule :", error);
    throw error;
  }
};
export const getBusinessVehicles = async (
  businessId: string
): Promise<Vehicle[]> => {
  try {
    const response = await axiosInstance.get<Vehicle[]>(
      `/delivery/businesses/${businessId}/vehicles`
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des véhicules :", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/delivery/vehicles/${vehicleId}`);
  } catch (error) {
    console.error("Erreur lors de la suppression du véhicule :", error);
    throw error;
  }
};

// Payload pour la mise à jour
export interface UpdateVehiclePayload {
  name?: string;
  type?: VehicleType;
  licensePlate?: string;
  brand?: string;
  model?: string;
  capacity?: string;
  isActive?: boolean;
}

/**
 * Met à jour un véhicule existant
 * @param vehicleId - ID du véhicule
 * @param data - Données à mettre à jour
 * @returns Vehicle mis à jour
 */
export const updateVehicle = async (
  vehicleId: string,
  data: UpdateVehiclePayload
): Promise<Vehicle> => {
  const res = await axiosInstance.patch(
    `/delivery/vehicles/${vehicleId}`,
    data
  );
  return res.data;
};

// ================= Types =================

export interface CompleteDeliveryPayload {
  deliveryCode: string; // code fourni par le client
}

// ================= API =================

/**
 * Valider la livraison finale (rôle: Livreur)
 * Le livreur envoie le code de sécurité pour confirmer la livraison.
 */
export const completeDelivery = async (
  requestId: string,
  payload: CompleteDeliveryPayload
): Promise<DeliveryRequest> => {
  const res = await axiosInstance.post(
    `/delivery/requests/${requestId}/complete`,
    payload
  );

  return res.data;
};

// ================= API =================

/**
 * Refuser une course (rôle: Livreur)
 */
export const rejectDeliveryRequest = async (
  requestId: string
): Promise<DeliveryRequest> => {
  const res = await axiosInstance.patch(
    `/delivery/requests/${requestId}/reject`
  );

  return res.data;
};

export interface CreateEstimationPayload {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  carrierId: string;
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
export interface AcceptDeliveryResponse {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  distanceMeters: number;
  estimatedCost: string;
  feePayer: "SENDER" | "RECEIVER";
  deliveryCode: string;
  orderId: string;
  carrierId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  tariffId: string;
  assignedVehicleId: string | null;
  carrier: {
    id: string;
    name: string;
    ownerId: string;
  };
  sender: {
    id: string;
    name: string;
    ownerId: string;
  };
  order: {
    id: string;
    orderNumber: string;
    totalAmount: string;
  };
}

/**
 * Accepter une livraison
 * @param id ID de la demande de livraison
 * @param vehicleId ID du véhicule utilisé (optionnel)
 */
export const acceptDelivery = async (
  id: string,
  vehicleId?: string
): Promise<AcceptDeliveryResponse> => {
  try {
    const url = `/delivery/requests/${id}/accept${
      vehicleId ? `?vehicleId=${vehicleId}` : ""
    }`;
    const response = await axiosInstance.patch<AcceptDeliveryResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de l'acceptation de la livraison :",
      error.response?.data || error.message
    );
    throw error;
  }
};

export interface DeliveryRequest {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  distanceMeters: number;
  estimatedCost: number;
  feePayer: FeePayer;
  createdAt: string;
  orderId: string;
  carrier: any;
  sender: any;
}

// ✅ Confirmer la récupération du colis
export const pickupDeliveryRequest = async (
  id: string
): Promise<DeliveryRequest> => {
  try {
    const response = await axiosInstance.patch<DeliveryRequest>(
      `/delivery/requests/${id}/pickup`
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur pickupDeliveryRequest:", error?.response || error);
    throw error;
  }
};
