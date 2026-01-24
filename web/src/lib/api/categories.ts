import axiosInstance from './axiosInstance';

export interface CategoryAttribute {
    id: string;
    name: string;
    type: string; // e.g. TEXT, NUMBER, SELECT
    options?: string[]; // for SELECT type
    required?: boolean;
}

export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    attributes?: CategoryAttribute[];
}

/**
 * Récupérer toutes les catégories de produits
 */
export const getAllCategories = async (): Promise<ProductCategory[]> => {
    try {
        const response = await axiosInstance.get('/categories');
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération catégories:', error.response?.data || error.message);
        return [];
    }
};
