// src/api/menu/menuApi.ts

import axiosInstance from "@/api/axiosInstance";

/* ==========================================
   TYPES RÉELS – 100% conformes à ton API
   ========================================== */

/* ==========================================
   INPUTS – Ce que tu envoies au backend
   ========================================== */

export interface CreateMenuInput {
  name: string;
  description?: string;
  price: number; // ← tu envoies en centimes (ex: 50000)
  isActive: boolean;
  items?: Array<{ variantId: string; quantity: number }>;
}

/* ==========================================
   FONCTIONS API – Corrigées & optimisées
   ========================================== */
/**
 * Structure exacte renvoyée par ton API
 *
 *
 */

export interface MenuItemVariant {
  id: string;
  sku: string;
  barcode: string | null;
  price: string;
  purchasePrice: string;
  quantityInStock: number;
  alertThreshold: number | null;
  itemsPerLot: number | null;
  lotPrice: string | null;
  imageUrl: string | null;
  createdAt: string;
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
  description: string | null;
  price: string; // ⚠️ string côté API
  isActive: boolean;
  imageUrl: string | null;
  businessId: string;
  menuItems: MenuItem[];
}
// Récupérer tous les menus d’un restaurant
export const getMenus = async (businessId: string): Promise<Menu[]> => {
  const { data } = await axiosInstance.get<Menu[]>(
    `/restaurants/${businessId}/menus`
  );
  return data;
};


// Créer un menu
export const createMenu = async (
  businessId: string,
  payload: CreateMenuInput
): Promise<Menu> => {
  const { data } = await axiosInstance.post<Menu>(
    `/restaurants/${businessId}/menus`,
    payload
  );
  return data;
};

export interface UpdateMenuInput {
  name?: string;
  description?: string | null;
  price?: number; // ← toujours en centimes
  isActive?: boolean;
}
// Mettre à jour un menu
export const updateMenu = async (
  businessId: string,
  menuId: string,
  payload: UpdateMenuInput
): Promise<Menu> => {
  if (Object.keys(payload).length === 0) {
    throw new Error("Aucune donnée à mettre à jour");
  }

  const { data } = await axiosInstance.patch<Menu>(
    `/restaurants/${businessId}/menus/${menuId}`,
    payload
  );
  return data;
};

// Supprimer un menu
export const deleteMenu = async (
  businessId: string,
  menuId: string
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete<{ message: string }>(
    `/restaurants/${businessId}/menus/${menuId}`
  );
  return data;
};

// Upload / mise à jour de l’image d’un menu
export const uploadImageMenu = async (
  businessId: string,
  menuId: string,
  imageUri: string
): Promise<Menu> => {
  if (!imageUri) throw new Error("Aucune image sélectionnée");

  const formData = new FormData();
  const uriParts = imageUri.split(".");
  const fileType = uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
  const mimeType = fileType === "png" ? "image/png" : "image/jpeg";

  formData.append("file", {
    uri: imageUri,
    name: `menu_${menuId}_${Date.now()}.${fileType}`,
    type: mimeType,
  } as any);

  const { data } = await axiosInstance.post<Menu>(
    `/restaurants/${businessId}/menus/${menuId}/image`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 45_000,
    }
  );

  return data;
};
