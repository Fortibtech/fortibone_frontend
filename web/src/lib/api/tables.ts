// web/src/lib/api/tables.ts
// API Tables Restaurant - Aligné fidèlement avec le mobile (api/menu/tableApi.ts)

import axiosInstance from './axiosInstance';

// ==================== TYPES ====================

export interface Table {
    id: string;
    name: string;
    capacity: number;
    isAvailable: boolean;
    businessId: string;
}

export interface TablePayload {
    name?: string;
    capacity?: number;
    isAvailable?: boolean;
}

export interface CreateTablePayload {
    name: string;
    capacity: number;
    isAvailable?: boolean;
}

export interface DeleteTableResponse {
    message: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Récupérer toutes les tables d'un restaurant
 */
export const getTables = async (restaurantId: string): Promise<Table[]> => {
    try {
        const response = await axiosInstance.get<Table[]>(`/restaurants/${restaurantId}/tables`);
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération tables:', error.message);
        throw error;
    }
};

/**
 * Créer une nouvelle table
 */
export const createRestaurantTable = async (
    businessId: string,
    payload: CreateTablePayload
): Promise<Table> => {
    try {
        const response = await axiosInstance.post<Table>(
            `/restaurants/${businessId}/tables`,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur création table:', error.message);
        throw error;
    }
};

/**
 * Mettre à jour une table
 */
export const updateRestaurantTable = async (
    businessId: string,
    tableId: string,
    payload: TablePayload
): Promise<Table> => {
    try {
        const response = await axiosInstance.patch<Table>(
            `/restaurants/${businessId}/tables/${tableId}`,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur mise à jour table:', error.message);
        throw error;
    }
};

/**
 * Supprimer une table
 */
export const deleteRestaurantTable = async (
    businessId: string,
    tableId: string
): Promise<DeleteTableResponse> => {
    try {
        const response = await axiosInstance.delete<DeleteTableResponse>(
            `/restaurants/${businessId}/tables/${tableId}`
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur suppression table:', error.message);
        throw error;
    }
};
