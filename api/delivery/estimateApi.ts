import axiosInstance from "../axiosInstance";

export interface EstimateBody {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  carrierId: string;
}

export interface EstimateOption {
  tariffId: string;
  tariffName: string;
  vehicleType: string;
  totalCost: number;
  currency: string;
}

export interface EstimateResponse {
  carrierId: string;
  distanceKm: number;
  distanceMeters: number;
  options: EstimateOption[];
}

export const createDeliveryEstimate = async (
  data: EstimateBody
): Promise<EstimateResponse> => {
  try {
    const response = await axiosInstance.post<EstimateResponse>(
      "/delivery/estimate",
      data
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de l'estimation :",
      error.response?.data || error.message
    );
    throw error;
  }
};

export interface CreateDeliveryRequestBody {
  orderId: string;
  carrierId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  distanceMeters: number;
  estimatedCost: number;
  feePayer: "SENDER" | "RECEIVER";
  tariffId: string;
}

export interface Carrier {
  id: string;
  name: string;
  ownerId: string;
}

export interface Sender {
  id: string;
  name: string;
  ownerId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: string;
}

export interface DeliveryRequestResponse {
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
  carrier: Carrier;
  sender: Sender;
  order: Order;
}

export const createDeliveryRequest = async (
  data: CreateDeliveryRequestBody
): Promise<DeliveryRequestResponse> => {
  try {
    const response = await axiosInstance.post<DeliveryRequestResponse>(
      "/delivery/requests",
      data
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la création de la livraison :",
      error.response?.data || error.message
    );
    throw error;
  }
};
