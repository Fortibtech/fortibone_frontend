// web/src/lib/api/reviews.ts
// Aligné avec mobile (api/Reviews.ts)

import axiosInstance from './axiosInstance';

// ==================== INTERFACES ====================

export interface ReviewAuthor {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
}

export interface ProductReview {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    productId: string;
    authorId: string;
    author: ReviewAuthor;
}

export interface ReviewsResponse {
    data: ProductReview[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateReviewPayload {
    rating: number; // 1 à 5
    comment: string;
}

// ==================== FONCTIONS API ====================

/**
 * GET /products/{id}/reviews
 * Liste paginée des avis d'un produit
 */
export const getAllReviews = async (
    productId: string,
    page = 1,
    limit = 10
): Promise<ReviewsResponse> => {
    try {
        const response = await axiosInstance.get<ReviewsResponse>(
            `/products/${productId}/reviews`,
            { params: { page, limit } }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur récupération avis:', error.message);
        throw error;
    }
};

/**
 * POST /products/{id}/reviews
 * Laisser un avis sur un produit
 */
export const createReview = async (
    productId: string,
    payload: CreateReviewPayload
): Promise<ProductReview> => {
    try {
        const response = await axiosInstance.post<ProductReview>(
            `/products/${productId}/reviews`,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erreur création avis:', error.message);
        throw error;
    }
};
