// src/api/restaurant.ts
import axiosInstance from "./axiosInstance";

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

    return res.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur createMenu :",
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
