import axiosInstance from "../axiosInstance";
import { cacheManager } from "../cache";
import {
    CreateProductData,
    PaginatedResponse,
    Product,
    ProductSearchFilters
} from "../types";

export class ProductService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async searchProducts(filters: ProductSearchFilters = {}): Promise<PaginatedResponse<Product>> {
    const cacheKey = `products_search_${JSON.stringify(filters)}`;
    
    // Vérifier le cache
    const cachedData = await cacheManager.get<PaginatedResponse<Product>>(cacheKey);
    if (cachedData) {
      console.log("📦 Résultats de recherche récupérés du cache");
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<PaginatedResponse<Product>>("/products/search", {
        params: filters
      });
      
      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      console.log("✅ Produits trouvés:", response.data.data.length);
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
      
      console.log("✅ Produit créé:", response.data.name);
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
      console.log("📦 Produits de l'entreprise récupérés du cache");
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<PaginatedResponse<Product>>(`/businesses/${businessId}/products`, {
        params: filters
      });
      
      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      console.log("✅ Produits de l'entreprise récupérés:", response.data.data.length);
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
      console.log("📦 Produit récupéré du cache:", cachedData.name);
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Product>(`/products/${id}`);
      
      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      console.log("✅ Produit récupéré:", response.data.name);
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
      
      console.log("✅ Produit mis à jour:", response.data.name);
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
      
      console.log("✅ Image du produit uploadée");
    } catch (error) {
      console.error("❌ Erreur lors de l'upload de l'image du produit:", error);
      throw error;
    }
  }
}