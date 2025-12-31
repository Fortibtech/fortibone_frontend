import axiosInstance from './axiosInstance';

export interface Sector {
    id: string;
    name: string;
    type: string;
    description?: string;
}

/**
 * Récupérer la liste des secteurs d'activité par type de business
 */
export const getSectors = async (businessType: string): Promise<Sector[]> => {
    try {
        const response = await axiosInstance.get('/sectors', {
            params: { type: businessType }
        });
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération secteurs:', error.response?.data || error.message);
        return [];
    }
};

/**
 * Récupérer tous les secteurs d'activité
 */
export const getAllSectors = async (): Promise<Sector[]> => {
    try {
        const response = await axiosInstance.get('/sectors');
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération secteurs:', error.response?.data || error.message);
        return [];
    }
};
