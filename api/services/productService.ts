import axiosInstance from "../axiosInstance";
import { cacheManager } from "../cache";
import {
  CreateProductData,
  CreateVariantData,
  PaginatedResponse,
  Product,
  ProductSearchFilters,
  ProductVariant,
  UpdateVariantData
} from "../types";

export class ProductService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // ========== MÉTHODES EXISTANTES MISES À JOUR ==========

  static async searchProducts(filters: ProductSearchFilters = {}): Promise<PaginatedResponse<Product>> {
    const cacheKey = `products_search_${JSON.stringify(filters)}`;

    // Vérifier le cache
    const cachedData = await cacheManager.get<PaginatedResponse<Product>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<PaginatedResponse<Product>>("/products/search", {
        params: filters
      });

      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche de produits:", error);
      throw error;
    }
  }

  static async createProduct(businessId: string, data: CreateProductData): Promise<Product> {
    try {
      const response = await axiosInstance.post<Product>(`/businesses/${businessId}/products`, data);

      // Invalider les caches liés
      await cacheManager.invalidatePattern("products_search");
      await cacheManager.invalidatePattern(`business_products_${businessId}`);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création du produit:", error);
      throw error;
    }
  }

  static async getBusinessProducts(
    businessId: string,
    filters: { search?: string; page?: number; limit?: number; categoryId?: string } = {}
  ): Promise<PaginatedResponse<Product>> {
    const cacheKey = `business_products_${businessId}_${JSON.stringify(filters)}`;

    // Vérifier le cache
    const cachedData = await cacheManager.get<PaginatedResponse<Product>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<PaginatedResponse<Product>>(`/businesses/${businessId}/products`, {
        params: filters
      });

      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des produits de l'entreprise:", error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    const cacheKey = `product_${id}`;

    // Vérifier le cache
    const cachedData = await cacheManager.get<Product>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Product>(`/products/${id}`);

      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du produit:", error);
      throw error;
    }
  }

  static async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    try {
      const response = await axiosInstance.patch<Product>(`/products/${id}`, data);

      // Invalider les caches
      await cacheManager.invalidate(`product_${id}`);
      await cacheManager.invalidatePattern("products_search");
      await cacheManager.invalidatePattern(`business_products_${response.data.businessId}`);

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du produit:", error);
      throw error;
    }
  }

  static async uploadProductImage(id: string, file: any): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axiosInstance.post(`/products/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Invalider le cache du produit
      await cacheManager.invalidate(`product_${id}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'upload de l'image du produit:", error);
      throw error;
    }
  }

  // ========== NOUVELLES MÉTHODES POUR LES VARIANTES ==========

  /**
   * Créer une nouvelle variante pour un produit
   */
  static async createVariant(productId: string, data: CreateVariantData): Promise<ProductVariant> {
    try {
      const response = await axiosInstance.post<ProductVariant>(`/products/${productId}/variants`, data);

      // Invalider les caches liés au produit
      await cacheManager.invalidate(`product_${productId}`);
      await cacheManager.invalidatePattern("products_search");

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création de la variante:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour une variante existante
   */
  static async updateVariant(variantId: string, data: UpdateVariantData): Promise<ProductVariant> {
    try {
      const response = await axiosInstance.patch<ProductVariant>(`/variants/${variantId}`, data);

      // Invalider les caches liés au produit
      await cacheManager.invalidate(`product_${response.data.productId}`);
      await cacheManager.invalidatePattern("products_search");

      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de la variante:", error);
      throw error;
    }
  }

  /**
   * Supprimer une variante
   */
  static async deleteVariant(variantId: string): Promise<void> {
    try {
      // Récupérer d'abord l'info de la variante pour invalider le cache du produit
      const variant = await axiosInstance.get<ProductVariant>(`/variants/${variantId}`);
      const productId = variant.data.productId;

      await axiosInstance.delete(`/variants/${variantId}`);

      // Invalider les caches liés au produit
      await cacheManager.invalidate(`product_${productId}`);
      await cacheManager.invalidatePattern("products_search");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la variante:", error);
      throw error;
    }
  }

  /**
   * Supprimer un produit et toutes ses variantes
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      // Récupérer d'abord l'info du produit pour invalider les bons caches
      const product = await axiosInstance.get<Product>(`/products/${productId}`);
      const businessId = product.data.businessId;

      await axiosInstance.delete(`/products/${productId}`);

      // Invalider tous les caches liés
      await cacheManager.invalidate(`product_${productId}`);
      await cacheManager.invalidatePattern("products_search");
      await cacheManager.invalidatePattern(`business_products_${businessId}`);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du produit:", error);
      throw error;
    }
  }

  /**
   * Upload d'une image pour une variante spécifique
   */
  static async uploadVariantImage(variantId: string, file: any): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axiosInstance.post(`/variants/${variantId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Récupérer l'info de la variante pour invalider le cache du produit
      const variant = await axiosInstance.get<ProductVariant>(`/variants/${variantId}`);
      await cacheManager.invalidate(`product_${variant.data.productId}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'upload de l'image de la variante:", error);
      throw error;
    }
  }

  // ========== MÉTHODES UTILITAIRES ==========

  /**
   * Obtenir toutes les variantes d'un produit
   */
  static async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      const product = await this.getProductById(productId);
      return product.variants;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des variantes:", error);
      throw error;
    }
  }

  /**
   * Obtenir une variante spécifique par son ID
   */
  static async getVariantById(variantId: string): Promise<ProductVariant> {
    try {
      const response = await axiosInstance.get<ProductVariant>(`/variants/${variantId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de la variante:", error);
      throw error;
    }
  }

  /**
   * Calculer le stock total d'un produit (somme de toutes les variantes)
   */
  static getTotalStock(product: Product): number {
    return product.variants.reduce((total, variant) => total + variant.quantityInStock, 0);
  }

  /**
   * Obtenir la variante la moins chère d'un produit
   */
  static getCheapestVariant(product: Product): ProductVariant | null {
    if (!product.variants.length) return null;

    return product.variants.reduce((cheapest, current) => {
      return parseFloat(current.price) < parseFloat(cheapest.price) ? current : cheapest;
    });
  }

  /**
   * Obtenir la variante la plus chère d'un produit
   */
  static getMostExpensiveVariant(product: Product): ProductVariant | null {
    if (!product.variants.length) return null;

    return product.variants.reduce((expensive, current) => {
      return parseFloat(current.price) > parseFloat(expensive.price) ? current : expensive;
    });
  }
}