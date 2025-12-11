import axiosInstance from "../axiosInstance";

export interface Table {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
  businessId: string;
}

// ✅ Récupérer toutes les tables d’un restaurant
export const getTables = async (restaurantId: string): Promise<Table[]> => {
  try {
    const response = await axiosInstance.get<Table[]>(
      `/restaurants/${restaurantId}/tables`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la récupération des tables:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export interface TableResponse {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
  businessId: string;
  // Tu peux même ajouter createdAt / updatedAt si l’API les renvoie
}
export interface TablePayload {
  name: string;
  capacity: number;
  isAvailable: boolean;
}

export const createRestaurantTable = async (
  businessId: string,
  payload: TablePayload
): Promise<TableResponse> => {
  try {
    const { data } = await axiosInstance.post<TableResponse>(
      `/restaurants/${businessId}/tables`,
      payload
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la création de la table :",
      error.response?.data || error.message
    );
    throw error;
  }
};
export interface DeleteTableResponse {
  message: string; // "Table supprimée avec succès."
}

export const deleteRestaurantTable = async (
  businessId: string,
  tableId: string
): Promise<DeleteTableResponse> => {
  try {
    const { data } = await axiosInstance.delete<DeleteTableResponse>(
      `/restaurants/${businessId}/tables/${tableId}`
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la suppression de la table :",
      error.response?.data || error.message
    );
    throw error;
  }
};
export interface PopularDish {
  dishId: string;
  name: string;
  totalOrders: number;
  revenue?: number;
}

export interface ReservationByPeriod {
  period: string; // "2025-04", "Lundi", etc.
  totalReservations: number;
}

export interface RestaurantStats {
  totalReservations: number;
  totalDishOrders: number;
  popularDishes: PopularDish[];
  reservationsByPeriod: ReservationByPeriod[];
  averageTableOccupancy: number;

  // Ces champs n'existent PAS encore côté API → on les ajoute en "optionnel"
  // et on les calcule côté front en attendant
  pendingOrders?: number;
  inPreparationOrders?: number;
  readyOrders?: number;
  monthlyRevenue?: number; // CA réel (si backend l'ajoute plus tard)
}
// ✅ Récupérer les stats restaurant d'un business RESTAURATEUR
export const getStatRestaurant = async (
  businessId: string
): Promise<RestaurantStats> => {
  try {
    const response = await axiosInstance.get<RestaurantStats>(
      `/businesses/${businessId}/analytics/restaurant`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.warn(
        "⚠️ Cet endpoint n'est disponible que pour les entreprises RESTAURATEUR"
      );
      return Promise.reject(error.response.data);
    }
    console.error(
      "❌ Erreur lors de la récupération des stats restaurant :",
      error.message
    );
    throw error;
  }
};
// Types

/**
 * Met à jour une table existante
 * PATCH /restaurants/{businessId}/tables/{tableId}
 */
export const updateRestaurantTable = async (
  businessId: string,
  tableId: string,
  payload: TablePayload
): Promise<TableResponse> => {
  try {
    const response = await axiosInstance.patch<TableResponse>(
      `/restaurants/${businessId}/tables/${tableId}`,
      payload
    );

    console.log("Table mise à jour avec succès :", response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Erreur lors de la mise à jour de la table";

    console.error("Erreur updateRestaurantTable :", {
      businessId,
      tableId,
      payload,
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage,
    });

    // Erreurs fréquentes
    if (error.response?.status === 404) {
      throw new Error("Table introuvable");
    }
    if (error.response?.status === 403) {
      throw new Error("Vous n'avez pas la permission de modifier cette table");
    }
    if (error.response?.status === 400) {
      throw new Error("Données invalides");
    }

    throw new Error(errorMessage);
  }
};
