// web/src/lib/api/menus.ts
// API Menus Restaurant - Aligné fidèlement avec le mobile (api/menu/menuApi.ts)

import axiosInstance from './axiosInstance';

// ==================== TYPES ====================

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
    description: string | null;
    price: string; // String comme le backend
    isActive: boolean;
    imageUrl: string | null;
    businessId: string;
    menuItems: MenuItem[];
}

export interface CreateMenuInput {
    name: string;
    description?: string;
    price: number; // En centimes
    isActive: boolean;
    items?: Array<{ variantId: string; quantity: number }>;
}

export interface UpdateMenuInput {
    name?: string;
    description?: string | null;
    price?: number;
    isActive?: boolean;
}

// ==================== API FUNCTIONS ====================

/**
 * Récupérer tous les menus d'un restaurant
 */
export const getMenus = async (businessId: string): Promise<Menu[]> => {
    try {
        const response = await axiosInstance.get<Menu[]>(`/restaurants/${businessId}/menus`);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur récupération menus:', error);
        throw error;
    }
};

/**
 * Créer un nouveau menu
 */
export const createMenu = async (
    businessId: string,
    payload: CreateMenuInput
): Promise<Menu> => {
    try {
        const response = await axiosInstance.post<Menu>(
            `/restaurants/${businessId}/menus`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur création menu:', error);
        throw error;
    }
};

/**
 * Mettre à jour un menu
 */
export const updateMenu = async (
    businessId: string,
    menuId: string,
    payload: UpdateMenuInput
): Promise<Menu> => {
    try {
        if (Object.keys(payload).length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }
        const response = await axiosInstance.patch<Menu>(
            `/restaurants/${businessId}/menus/${menuId}`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur mise à jour menu:', error);
        throw error;
    }
};

/**
 * Supprimer un menu
 */
export const deleteMenu = async (
    businessId: string,
    menuId: string
): Promise<{ message: string }> => {
    try {
        const response = await axiosInstance.delete<{ message: string }>(
            `/restaurants/${businessId}/menus/${menuId}`
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur suppression menu:', error);
        throw error;
    }
};

/**
 * Upload ou mise à jour de l'image d'un menu
 */
export const uploadMenuImage = async (
    businessId: string,
    menuId: string,
    file: File
): Promise<Menu> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post<Menu>(
            `/restaurants/${businessId}/menus/${menuId}/image`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 45000,
            }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erreur upload image menu:', error);
        throw error;
    }
};
