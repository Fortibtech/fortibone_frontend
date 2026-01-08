import axiosInstance from "../axiosInstance";
import { cacheManager } from "../cache";
import { Category, CategoryAttribute } from "../types";



export class CategoryService {
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes (les catégories changent peu)

  static async getCategories(): Promise<Category[]> {
    const cacheKey = "categories_list";
    
    // Vérifier le cache
    const cachedData = await cacheManager.get<Category[]>(cacheKey);
    if (cachedData) {
      console.log("📦 Catégories récupérées du cache");
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Category[]>("/categories");
      // Mettre en cache avec TTL plus long
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des catégories:", error);
      throw error;
    }
  }

  static async getCategoryById(id: string): Promise<Category> {
    const cacheKey = `category_${id}`;
    
    // Vérifier le cache
    const cachedData = await cacheManager.get<Category>(cacheKey);
    if (cachedData) {
      
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Category>(`/categories/${id}`);
      
      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de la catégorie:", error);
      throw error;
    }
  }

  static async getCategoryByName(name: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories();
      return categories.find(category => 
        category.name.toLowerCase().includes(name.toLowerCase())
      ) || null;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche de catégorie:", error);
      return null;
    }
  }

  static async searchCategories(searchTerm: string): Promise<Category[]> {
    try {
      const categories = await this.getCategories();
      if (!searchTerm.trim()) return categories;
      
      return categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error("❌ Erreur lors de la recherche de catégories:", error);
      return [];
    }
  }

  static async refreshCategories(): Promise<Category[]> {
    try {
      // Invalider le cache
      await cacheManager.invalidate("categories_list");
      
      // Recharger depuis l'API
      return await this.getCategories();
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement des catégories:", error);
      throw error;
    }
  }

  /**
   * Récupère les attributs d'une catégorie spécifique
   */
  static async getCategoryAttributes(categoryId: string): Promise<CategoryAttribute[]> {
    try {
      const category = await this.getCategoryById(categoryId);
      return category.attributes || [];
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des attributs:", error);
      return [];
    }
  }

  /**
   * Valide les attributs requis pour une catégorie
   */
  static validateCategoryAttributes(
    category: Category, 
    attributeValues: Record<string, string>
  ): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    category.attributes.forEach(attribute => {
      const value = attributeValues[attribute.id];
      
      if (attribute.required && (!value || !value.trim())) {
        errors[attribute.id] = `${attribute.name} est requis`;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
