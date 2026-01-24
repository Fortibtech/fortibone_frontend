// src/api/tariffApi.ts
import axiosInstance from "@/api/axiosInstance";

// ================= Types =================

export type VehicleType =
  | "MOTO"
  | "VELO"
  | "SCOOTER"
  | "VOITURE"
  | "CAMIONNETTE"
  | "CAMION"
  | "DRONE"
  | "AUTRE";

export interface Tariff {
  id: string;
  name: string;
  basePrice: string; // ⚠️ l’API renvoie des strings
  pricePerKm: string; // ⚠️ l’API renvoie des strings
  minDistance: number;
  maxDistance: number;
  vehicleType: VehicleType | null;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTariffPayload {
  name: string;
  basePrice: number;
  pricePerKm: number;
  minDistance: number;
  maxDistance: number;
  vehicleType?: VehicleType | null;
}

// ================= API =================

/**
 * Créer un tarif pour une entreprise livreur
 */
export const createTariff = async (
  businessId: string,
  data: CreateTariffPayload
): Promise<Tariff> => {
  const res = await axiosInstance.post(
    `/delivery/businesses/${businessId}/tariffs`,
    data
  );

  return res.data;
};

/**
 * Supprimer un tarif
 */
export const deleteTariff = async (tariffId: string): Promise<void> => {
  await axiosInstance.delete(`/delivery/tariffs/${tariffId}`);
};

export interface UpdateTariffPayload {
  name: string;
  basePrice: number;
  pricePerKm: number;
  minDistance: number;
  maxDistance: number;
  vehicleType?: string | null; // ex: "MOTO"
}

/**
 * Mettre à jour un tarif existant
 */
export const updateTariff = async (
  tariffId: string,
  payload: UpdateTariffPayload
): Promise<Tariff> => {
  const res = await axiosInstance.patch(
    `/delivery/tariffs/${tariffId}`,
    payload
  );

  return res.data;
};


