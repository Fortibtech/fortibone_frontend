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
      `/restaurants/${businessId}/analytics/restaurant`
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
    console.error(
      "❌ Erreur lors de la suppression de la table :",
      error.response?.data || error.message
    );
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

export const getVariants = async (businessId: string) => {
  try {
    const res = await axiosInstance.get(`/restaurants/${businessId}/menus`);

    const menus = res.data;
    const variantsMap = new Map<string, string>();

    menus.forEach((menu: any) => {
      menu.menuItems.forEach((item: any) => {
        const variantId = item?.variantId;
        const name = item?.variant?.product?.name || "Produit inconnu";
        if (variantId && !variantsMap.has(variantId)) {
          variantsMap.set(variantId, name);
        }
      });
    });

    // conversion en tableau exploitable côté UI
    const variants = Array.from(variantsMap, ([variantId, name]) => ({
      variantId,
      name,
    }));

    return variants;
  } catch (error: any) {
    console.error(
      "❌ Erreur getVariants :",
      error.response?.data || error.message
    );
    throw error;
  }
};
/**
 * Crée un nouveau menu pour un restaurant
 * @param businessId L'id du restaurant
 * @param data Données du menu
 * @returns Le menu créé
 */
/**
 * 🔹 Crée un nouveau menu avec un variantId existant
 * Exemple d’utilisation :
 * await createMenu({ name: "Menu du Soir", description: "Couscous royal", price: 25, variantId })
 */
export const createMenu = async ({
  name,
  description,
  price,
  variantId,
  businessId,
}: {
  name: string;
  description: string;
  price: number;
  variantId: string;
  businessId: string;
}) => {
  try {
    const body = {
      name,
      description,
      price,
      isActive: true,
      items: [
        {
          variantId,
          quantity: 1,
        },
      ],
    };

    const res = await axiosInstance.post(
      `/restaurants/${businessId}/menus`,
      body
    );

    console.log("✅ Menu créé avec succès :", res.data);
    return res.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur createMenu :",
      error.response?.data || error.message
    );
    throw error;
  }
};
/**
 * 🔹 Supprime un menu spécifique d’un restaurant
 * @param businessId ID du restaurant
 * @param menuId ID du menu à supprimer
 * @returns Message de confirmation
 */
export const deleteMenu = async (businessId: string, menuId: string) => {
  try {
    const res = await axiosInstance.delete(
      `/restaurants/${businessId}/menus/${menuId}`
    );

    console.log("✅ Menu supprimé :", res.data);
    return res.data; // { message: "Menu supprimé avec succès." }
  } catch (error: any) {
    console.error(
      "❌ Erreur deleteMenu :",
      error.response?.data || error.message
    );
    throw error;
  }
};

/** ---------- Types ---------- */
export interface Variant {
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string | null;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number | null;
  lotPrice: number | null;
  imageUrl: string | null;
  productId: string;
  product: {
    name: string;
  };
}

export interface UpdatedMenuResponse {
  id: string;
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  businessId: string;
  menuItems: MenuItem[];
}

/** ---------- Fonction principale ---------- */
/**
 * Met à jour un menu existant
 * @param businessId ID du restaurant
 * @param menuId ID du menu
 * @param data Champs à modifier
 * @throws Error si les paramètres sont invalides ou si la requête échoue
 * @returns Menu mis à jour avec ses variantes
 */
export const updateMenu = async (
  businessId: string,
  menuId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    isActive?: boolean;
  }
): Promise<UpdatedMenuResponse> => {
  if (!businessId || !menuId) {
    throw new Error("businessId et menuId sont requis");
  }
  if (Object.keys(data).length === 0) {
    throw new Error("Aucun champ à mettre à jour");
  }

  try {
    // Validation du prix si présent
    if (data.price !== undefined && isNaN(Number(data.price))) {
      throw new Error("Le prix doit être un nombre valide");
    }

    const res = await axiosInstance.patch(
      `/restaurants/${businessId}/menus/${menuId}`,
      data
    );

    console.log("✅ Menu mis à jour :", res.data);
    return res.data as UpdatedMenuResponse;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("❌ Erreur updateMenu :", errorMessage);
    throw new Error(`Échec de la mise à jour du menu : ${errorMessage}`);
  }
};
