import { Category } from "@/types/category";
import axiosInstance from "./axiosInstance";

// ✅ Fonction pour récupérer toutes les catégories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get("/categories");
    return response.data; // l’API renvoie directement les catégories
  } catch (error: any) {
    console.error(
      "❌ Erreur getCategories:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Récupère les détails d'une catégorie par son ID
 * @param id string
 * @returns Category
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await axiosInstance.get<Category>(`/categories/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur getCategoryById :",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
      "Erreur lors de la récupération de la catégorie"
    );
  }
};
