// src/api/Reviews.ts
import axiosInstance from "@/api/axiosInstance";

// Définis les types pour plus de sûreté
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

/**
 * GET /products/{id}/reviews
 * Liste paginée des avis d’un produit
 */
export async function getAllReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<ReviewsResponse> {
  try {
    const response = await axiosInstance.get<ReviewsResponse>(
      `/products/${productId}/reviews`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des avis :", error);
    throw error;
  }
}

export interface CreateReviewPayload {
  rating: number; // 1 à 5
  comment: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  productId: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
}

export interface CreateReviewResponse {
  data: ProductReview;
}

/**
 * POST /products/{id}/reviews
 * Laisser un avis sur un produit
 */
export async function createReview(
  productId: string,
  payload: CreateReviewPayload
): Promise<CreateReviewResponse> {
  try {
    const response = await axiosInstance.post<CreateReviewResponse>(
      `/products/${productId}/reviews`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la création de l'avis :", error);
    throw error;
  }
}
