import axiosInstance from './axiosInstance';

export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    exchangeRate: number;
}

/**
 * Récupérer la liste de toutes les devises disponibles
 */
export const getCurrencies = async (): Promise<Currency[]> => {
    try {
        const response = await axiosInstance.get('/currency');
        return response.data;
    } catch (error: any) {
        console.error('Erreur récupération devises:', error.response?.data || error.message);
        return [];
    }
};

/**
 * Récupérer le symbole d'une devise par son ID
 */
export const getCurrencySymbolById = async (currencyId: string): Promise<string> => {
    try {
        const currencies = await getCurrencies();
        const currency = currencies.find(c => c.id === currencyId);
        return currency?.symbol || 'KMF';
    } catch (error) {
        console.error('Erreur récupération symbole:', error);
        return 'KMF';
    }
};
