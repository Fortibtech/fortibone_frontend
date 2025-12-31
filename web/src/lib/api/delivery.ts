// web/src/lib/api/delivery.ts
// API Livraison - Aligné fidèlement avec le mobile (api/delivery/deliveryApi.ts)

import axiosInstance from './axiosInstance';

// ==================== TYPES ====================

export type FeePayer = 'SENDER' | 'RECEIVER';
export type VehicleType = 'MOTO' | 'VELO' | 'SCOOTER' | 'VOITURE' | 'CAMIONNETTE' | 'CAMION' | 'DRONE' | 'AUTRE';
export type DeliveryRequestStatus = 'PENDING' | 'ACTIVE' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED' | 'ACCEPTED' | 'REJECTED';

export interface BusinessMini {
    id: string;
    name: string;
    type: 'COMMERCANT' | 'RESTAURATEUR' | 'FOURNISSEUR';
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
    notes?: string;
}

export interface IncomingDeliveryRequest {
    id: string;
    status: DeliveryRequestStatus;
    pickupAddress: string;
    deliveryAddress: string;
    deliveryNotes?: string;
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

export interface DeliveryRequest {
    id: string;
    status: string;
    pickupAddress: string;
    deliveryAddress: string;
    distanceMeters: number;
    estimatedCost: number | string;
    feePayer: FeePayer;
    createdAt: string;
    orderId: string;
    carrier: any;
    sender: any;
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

export interface CreateVehiclePayload {
    name: string;
    type: VehicleType;
    licensePlate: string;
    brand: string;
    model: string;
    capacity: string;
}

export interface UpdateVehiclePayload {
    name?: string;
    type?: VehicleType;
    licensePlate?: string;
    brand?: string;
    model?: string;
    capacity?: string;
    isActive?: boolean;
}

export interface DashboardData {
    isOnline: boolean;
    totalDeliveries: number;
    pendingRequests: number;
    activeDeliveries: number;
}

export interface CompleteDeliveryPayload {
    deliveryCode: string;
}

export interface Tariff {
    id: string;
    businessId: string;
    name: string;
    description?: string;
    basePrice: number | string;
    pricePerKm: number | string;
    minDistance: number;
    maxDistance: number;
    vehicleType?: VehicleType;
    createdAt: string;
    updatedAt: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Récupérer le dashboard livreur filtré
 */
export const getFilteredDashboard = async (businessId: string): Promise<DashboardData> => {
    try {
        const response = await axiosInstance.get(`/delivery/businesses/${businessId}/dashboard`);
        const data = response.data;
        return {
            isOnline: data.isOnline,
            totalDeliveries: data.totalDeliveries,
            pendingRequests: data.pendingRequests,
            activeDeliveries: data.activeDeliveries,
        };
    } catch (error) {
        console.error('❌ Erreur récupération dashboard livreur:', error);
        throw error;
    }
};

/**
 * Mettre à jour le statut en ligne/hors ligne
 */
export const updateDeliveryStatus = async (
    businessId: string,
    isOnline: boolean
): Promise<{ businessId: string; isOnline: boolean }> => {
    try {
        const response = await axiosInstance.patch(
            `/delivery/businesses/${businessId}/status`,
            { isOnline }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur changement statut livreur:', error);
        throw error;
    }
};

/**
 * Récupérer les demandes de livraison entrantes (en attente)
 */
export const getIncomingDeliveryRequests = async (
    businessId: string
): Promise<IncomingDeliveryRequest[]> => {
    try {
        const response = await axiosInstance.get<IncomingDeliveryRequest[]>(
            `/delivery/businesses/${businessId}/requests/incoming`
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement demandes entrantes:', error);
        throw error;
    }
};

/**
 * Récupérer les demandes de livraison actives (en cours)
 */
export const getActiveDeliveryRequests = async (
    businessId: string
): Promise<IncomingDeliveryRequest[]> => {
    try {
        const response = await axiosInstance.get(
            `/delivery/businesses/${businessId}/requests/active`
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur chargement demandes actives:', error);
        throw error;
    }
};

/**
 * Accepter une livraison
 */
export const acceptDelivery = async (
    requestId: string,
    vehicleId?: string
): Promise<DeliveryRequest> => {
    try {
        const url = `/delivery/requests/${requestId}/accept${vehicleId ? `?vehicleId=${vehicleId}` : ''}`;
        const response = await axiosInstance.patch(url);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur acceptation livraison:', error);
        throw error;
    }
};

/**
 * Refuser une livraison
 */
export const rejectDeliveryRequest = async (requestId: string): Promise<DeliveryRequest> => {
    try {
        const response = await axiosInstance.patch(`/delivery/requests/${requestId}/reject`);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur refus livraison:', error);
        throw error;
    }
};

/**
 * Confirmer le retrait du colis
 */
export const pickupDeliveryRequest = async (requestId: string): Promise<DeliveryRequest> => {
    try {
        const response = await axiosInstance.patch(`/delivery/requests/${requestId}/pickup`);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur confirmation retrait:', error);
        throw error;
    }
};

/**
 * Valider la livraison (avec code de sécurité)
 */
export const completeDelivery = async (
    requestId: string,
    payload: CompleteDeliveryPayload
): Promise<DeliveryRequest> => {
    try {
        const response = await axiosInstance.post(
            `/delivery/requests/${requestId}/complete`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur validation livraison:', error);
        throw error;
    }
};

/**
 * Récupérer les véhicules d'une entreprise livreur
 */
export const getBusinessVehicles = async (businessId: string): Promise<Vehicle[]> => {
    try {
        const response = await axiosInstance.get<Vehicle[]>(
            `/delivery/businesses/${businessId}/vehicles`
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur récupération véhicules:', error);
        throw error;
    }
};

/**
 * Créer un nouveau véhicule
 */
export const createVehicle = async (
    businessId: string,
    payload: CreateVehiclePayload
): Promise<Vehicle> => {
    try {
        const response = await axiosInstance.post(
            `/delivery/businesses/${businessId}/vehicles`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur création véhicule:', error);
        throw error;
    }
};

/**
 * Mettre à jour un véhicule
 */
export const updateVehicle = async (
    vehicleId: string,
    payload: UpdateVehiclePayload
): Promise<Vehicle> => {
    try {
        const response = await axiosInstance.patch(
            `/delivery/vehicles/${vehicleId}`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur mise à jour véhicule:', error);
        throw error;
    }
};

/**
 * Supprimer un véhicule
 */
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/delivery/vehicles/${vehicleId}`);
    } catch (error) {
        console.error('❌ Erreur suppression véhicule:', error);
        throw error;
    }
};

/**
 * Récupérer les tarifs d'une entreprise livreur
 */
export const getTariffs = async (businessId: string): Promise<Tariff[]> => {
    try {
        const response = await axiosInstance.get(`/delivery/businesses/${businessId}/tariffs`);
        // Gestion du bug backend (tarrifs vs tariffs)
        const data = response.data;
        const tariffs = data.tariffs ?? data.tarrifs;

        if (Array.isArray(tariffs)) {
            return tariffs;
        }
        return [];
    } catch (error) {
        console.error('❌ Erreur récupération tarifs:', error);
        return [];
    }
};
