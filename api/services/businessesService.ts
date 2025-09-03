import axiosInstance from "../axiosInstance";
import { cacheManager } from "../cache";
import { SelectedBusinessManager } from "../selectedBusinessManager";
import {
  Business,
  BusinessFilters,
  CreateBusinessData,
  PaginatedResponse
} from "../types";

export class BusinessesService {
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  static async createBusiness(data: CreateBusinessData): Promise<Business> {
    try {
      const response = await axiosInstance.post<Business>("/businesses", data);
      
      // Invalider le cache des listes
      await cacheManager.invalidatePattern("businesses_list");
      
      console.log("✅ Entreprise créée:", response.data.name);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'entreprise:", error);
      throw error;
    }
  }

  static async getBusinesses(filters: BusinessFilters = {}): Promise<PaginatedResponse<Business>> {
    const cacheKey = `businesses_list_${JSON.stringify(filters)}`;
    
    // Vérifier le cache
    const cachedData = await cacheManager.get<PaginatedResponse<Business>>(cacheKey);
    if (cachedData) {
      console.log("📦 Données récupérées du cache:", cacheKey);
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<PaginatedResponse<Business>>("/users/me/businesses", {
        params: filters
      });
      
      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      console.log("✅ Entreprises récupérées:", response.data.data.length);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des entreprises:", error);
      throw error;
    }
  }

  static async getBusinessById(id: string): Promise<Business> {
    const cacheKey = `business_${id}`;
    
    // Vérifier le cache
    const cachedData = await cacheManager.get<Business>(cacheKey);
    if (cachedData) {
      console.log("📦 Entreprise récupérée du cache:", cachedData.name);
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Business>(`/businesses/${id}`);
      
      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      console.log("✅ Entreprise récupérée:", response.data.name);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'entreprise:", error);
      throw error;
    }
  }

  static async updateBusiness(id: string, data: Partial<CreateBusinessData>): Promise<Business> {
    try {
      const response = await axiosInstance.patch<Business>(`/businesses/${id}`, data);
      
      // Invalider les caches
      await cacheManager.invalidate(`business_${id}`);
      await cacheManager.invalidatePattern("businesses_list");
      
      // Mettre à jour l'entreprise sélectionnée si c'est celle-ci
      const selectedBusiness = await SelectedBusinessManager.getSelectedBusiness();
      if (selectedBusiness?.id === id) {
        await SelectedBusinessManager.setSelectedBusiness(response.data);
      }
      
      console.log("✅ Entreprise mise à jour:", response.data.name);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'entreprise:", error);
      throw error;
    }
  }

  static async deleteBusiness(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/businesses/${id}`);
      
      // Invalider les caches
      await cacheManager.invalidate(`business_${id}`);
      await cacheManager.invalidatePattern("businesses_list");
      
      // Supprimer de la sélection si c'est celle-ci
      const selectedBusiness = await SelectedBusinessManager.getSelectedBusiness();
      if (selectedBusiness?.id === id) {
        await SelectedBusinessManager.clearSelectedBusiness();
      }
      
      console.log("✅ Entreprise supprimée");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'entreprise:", error);
      throw error;
    }
  }

  static async uploadLogo(id: string, file: any): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await axiosInstance.post(`/businesses/${id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Invalider le cache de l'entreprise
      await cacheManager.invalidate(`business_${id}`);
      
      console.log("✅ Logo uploadé");
    } catch (error) {
      console.error("❌ Erreur lors de l'upload du logo:", error);
      throw error;
    }
  }

  static async uploadCover(id: string, file: any): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await axiosInstance.post(`/businesses/${id}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Invalider le cache de l'entreprise
      await cacheManager.invalidate(`business_${id}`);
      
      console.log("✅ Image de couverture uploadée");
    } catch (error) {
      console.error("❌ Erreur lors de l'upload de l'image de couverture:", error);
      throw error;
    }
  }

  // Méthodes utilitaires pour la gestion des entreprises sélectionnées
  static async selectBusiness(business: Business): Promise<void> {
    await SelectedBusinessManager.setSelectedBusiness(business);
  }

  static async getSelectedBusiness(): Promise<Business | null> {
    return await SelectedBusinessManager.getSelectedBusiness();
  }

  static async clearSelectedBusiness(): Promise<void> {
    await SelectedBusinessManager.clearSelectedBusiness();
  }
}
