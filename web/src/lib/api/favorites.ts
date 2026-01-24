// Favorites API - Web version
// Aligned with mobile api/Users.ts and api/Products.ts

import axiosInstance from './axiosInstance';

// Type for a favorite item
export interface UserFavorite {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    categoryId?: string;
    price?: number;
    businessName?: string;
}

// API response for favorites
export interface GetFavoritesResponse {
    data: UserFavorite[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Parameters for fetching favorites
export interface GetFavoritesParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
}

/**
 * Get user's favorites with pagination and filters
 * Mobile reference: api/Users.ts - getFavoris
 */
export const getFavorites = async (
    params: GetFavoritesParams = {}
): Promise<GetFavoritesResponse> => {
    try {
        const { page = 1, limit = 20, search, categoryId } = params;

        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) query.append('search', search);
        if (categoryId) query.append('categoryId', categoryId);

        const response = await axiosInstance.get<GetFavoritesResponse>(
            `/users/me/favorites?${query.toString()}`
        );

        return response.data;
    } catch (error: any) {
        console.error('❌ Error getFavorites:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Unable to fetch favorites'
        );
    }
};

/**
 * Add a product to favorites
 * Mobile reference: api/Products.ts - addToFavorite
 */
export const addToFavorites = async (productId: string): Promise<string> => {
    try {
        const response = await axiosInstance.post<{ message: string }>(
            `/products/${productId}/favorite`
        );
        return response.data.message;
    } catch (error: any) {
        console.error('❌ Error addToFavorites:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Unable to add to favorites'
        );
    }
};

/**
 * Remove a product from favorites
 * Mobile reference: api/Products.ts - deleteFavoris
 */
export const deleteFavorite = async (productId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/products/${productId}/favorite`);
    } catch (error: any) {
        console.error('❌ Error deleteFavorite:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message || 'Unable to remove from favorites'
        );
    }
};
