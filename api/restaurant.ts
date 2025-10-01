// src/api/restaurant.ts
import axiosInstance from "./axiosInstance";

export interface RestaurantStats {
  totalReservations: number;
  totalDishOrders: number;
  popularDishes: any[];
  reservationsByPeriod: {
    period: string;
    totalReservations: number;
  }[];
  averageTableOccupancy: number;
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

// src/types/table.ts
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

export const getAvailableTables = async (
  businessId: string,
  date: string,
  duration: number = 120
): Promise<Table[]> => {
  const res = await axiosInstance.get(
    `/restaurants/${businessId}/tables/available`,
    {
      params: { date, duration },
    }
  );
  return res.data;
};

export interface MenuItemVariant {
  id: string;
  sku: string;
  barcode: string;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number;
  lotPrice: string;
  imageUrl: string | null;
  productId: string;
  product: {
    name: string;
  };
}

export interface MenuItem {
  id: string;
  quantity: number;
  menuId: string;
  variantId: string;
  variant: MenuItemVariant;
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  businessId: string;
  menuItems: MenuItem[];
}

export const getMenus = async (businessId: string): Promise<Menu[]> => {
  const res = await axiosInstance.get(`/restaurants/${businessId}/menus`);
  return res.data;
};
export interface TablePayload {
  name: string;
  capacity: number;
}
export interface TableResponse {
  id: string;
  name: string;
  capacity: number;
  isAvailable: boolean;
  businessId: string;
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

export interface UpdateTablePayload {
  name?: string;
  capacity?: number;
  isAvailable?: boolean;
}

export const updateRestaurantTable = async (
  businessId: string,
  tableId: string,
  payload: UpdateTablePayload
): Promise<TableResponse> => {
  try {
    const { data } = await axiosInstance.patch<TableResponse>(
      `/restaurants/${businessId}/tables/${tableId}`,
      payload
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de la mise à jour de la table :",
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
    console.error("❌ Erreur lors de la suppression de la table :", error.response?.data || error.message);
    throw error;
  }
};


export interface MenuItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateMenuInput {
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  items: MenuItemInput[];
}

// Response type si tu veux typer la réponse
export interface MenuItemResponse {
  id: string;
  quantity: number;
  menuId: string;
  variantId: string;
}

export interface CreateMenuResponse {
  id: string;
  name: string;
  description: string;
  price: string; // le backend renvoie string
  isActive: boolean;
  businessId: string;
  menuItems: MenuItemResponse[];
}

/**
 * Crée un nouveau menu pour un restaurant
 * @param businessId L'id du restaurant
 * @param data Données du menu
 * @returns Le menu créé
 */
export const createMenu = async (
  businessId: string,
  data: CreateMenuInput
): Promise<CreateMenuResponse> => {
  try {
    const response = await axiosInstance.post<CreateMenuResponse>(
      `/restaurants/${businessId}/menus`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur création menu :", error.response?.data || error);
    throw error;
  }
};