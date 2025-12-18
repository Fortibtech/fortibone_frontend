import axiosInstance from "../axiosInstance";
import { cacheManager } from "../cache";
import { SelectedBusinessManager } from "../selectedBusinessManager";
import { Business, BusinessFilters, CreateBusinessData } from "../types";
export interface CarrierOption {
  id: string;
  name: string;
  type: string;
}

// Types pour les nouveaux endpoints
export interface AddMemberData {
  email: string;
  role: "MEMBER" | "ADMIN";
}
export interface UpdateMemberRoleData {
  role: "MEMBER" | "ADMIN" | "OWNER";
}
export interface BusinessMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "MEMBER" | "ADMIN" | "OWNER";
  joinedAt: string;
}

export interface OpeningHour {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  openTime: string; // Format "HH:mm"
  closeTime: string; // Format "HH:mm"
}

export interface UpdateOpeningHoursData {
  hours: OpeningHour[];
}

export class BusinessesService {
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  static async createBusiness(data: CreateBusinessData): Promise<Business> {
    try {
      const response = await axiosInstance.post<Business>("/businesses", data);

      // Invalider le cache des listes
      await cacheManager.invalidatePattern("businesses_list");
      await cacheManager.invalidatePattern("user_businesses");

      console.log("✅ Entreprise créée:", response.data.name);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'entreprise:", error);
      throw error;
    }
  }

  static async getBusinesses(
    filters: BusinessFilters = {}
  ): Promise<Business[]> {
    const cacheKey = `user_businesses_${JSON.stringify(filters)}`;

    // Vérifier le cache
    const cachedData = await cacheManager.get<Business[]>(cacheKey);
    if (cachedData) {
      console.log("📦 Données récupérées du cache:", cacheKey);
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Business[]>(
        "/users/me/businesses",
        {
          params: filters,
        }
      );

      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

      console.log("✅ Entreprises récupérées:", response.data.length);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des entreprises:",
        error
      );
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
      console.error(
        "❌ Erreur lors de la récupération de l'entreprise:",
        error
      );
      throw error;
    }
  }

  static async getCarriers(): Promise<CarrierOption[]> {
    const cacheKey = "user_carriers_livreur_min";

    const cached = await cacheManager.get<CarrierOption[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axiosInstance.get<Business[]>(
        "/users/me/businesses",
        {
          params: { type: "LIVREUR" },
        }
      );

      const carriers: CarrierOption[] = response.data.map((b) => ({
        id: b.id,
        name: b.name,
        type: b.type,
      }));

      await cacheManager.set(cacheKey, carriers, this.CACHE_TTL);
      return carriers;
    } catch (error) {
      console.error("❌ Erreur chargement livreurs:", error);
      throw error;
    }
  }
  static async getRestaurants(): Promise<Business[]> {
    return this.getBusinesses({ type: "RESTAURATEUR" });
  }

  static async updateBusiness(
    id: string,
    data: Partial<CreateBusinessData>
  ): Promise<Business> {
    try {
      const response = await axiosInstance.patch<Business>(
        `/businesses/${id}`,
        data
      );

      // Invalider les caches
      await cacheManager.invalidate(`business_${id}`);
      await cacheManager.invalidatePattern("businesses_list");
      await cacheManager.invalidatePattern("user_businesses");

      // Mettre à jour l'entreprise sélectionnée si c'est celle-ci
      const selectedBusiness =
        await SelectedBusinessManager.getSelectedBusiness();
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
      await cacheManager.invalidatePattern("user_businesses");

      // Supprimer de la sélection si c'est celle-ci
      const selectedBusiness =
        await SelectedBusinessManager.getSelectedBusiness();
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
      formData.append("file", file);

      await axiosInstance.post(`/businesses/${id}/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
      formData.append("file", file);

      await axiosInstance.post(`/businesses/${id}/cover`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Invalider le cache de l'entreprise
      await cacheManager.invalidate(`business_${id}`);

      console.log("✅ Image de couverture uploadée");
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'upload de l'image de couverture:",
        error
      );
      throw error;
    }
  }

  // === GESTION DES MEMBRES ===

  static async addMember(
    businessId: string,
    data: AddMemberData
  ): Promise<BusinessMember> {
    try {
      const response = await axiosInstance.post<BusinessMember>(
        `/businesses/${businessId}/members`,
        data
      );

      // Invalider le cache des membres
      await cacheManager.invalidate(`business_members_${businessId}`);

      console.log("✅ Membre ajouté:", data.email);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du membre:", error);
      throw error;
    }
  }

  static async getMembers(businessId: string): Promise<BusinessMember[]> {
    const cacheKey = `business_members_${businessId}`;

    // Vérifier le cache
    const cachedData = await cacheManager.get<BusinessMember[]>(cacheKey);
    if (cachedData) {
      console.log("📦 Membres récupérés du cache");
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<BusinessMember[]>(
        `/businesses/${businessId}/members`
      );

      // Mettre en cache
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);

      console.log("✅ Membres récupérés:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des membres:", error);
      throw error;
    }
  }

  static async updateMemberRole(
    businessId: string,
    memberId: string,
    data: UpdateMemberRoleData
  ): Promise<BusinessMember> {
    try {
      const response = await axiosInstance.post<BusinessMember>(
        `/businesses/${businessId}/members/${memberId}`,
        data
      );

      // Invalider le cache des membres
      await cacheManager.invalidate(`business_members_${businessId}`);

      console.log("✅ Rôle du membre mis à jour:", data.role);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du rôle:", error);
      throw error;
    }
  }

  static async removeMember(
    businessId: string,
    memberId: string
  ): Promise<void> {
    try {
      await axiosInstance.delete(
        `/businesses/${businessId}/members/${memberId}`
      );

      // Invalider le cache des membres
      await cacheManager.invalidate(`business_members_${businessId}`);

      console.log("✅ Membre supprimé");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du membre:", error);
      throw error;
    }
  }

  // === GESTION DES HORAIRES D'OUVERTURE ===

  static async updateOpeningHours(
    businessId: string,
    data: UpdateOpeningHoursData
  ): Promise<void> {
    try {
      await axiosInstance.put(`/businesses/${businessId}/opening-hours`, data);

      // Invalider le cache de l'entreprise
      await cacheManager.invalidate(`business_${businessId}`);

      console.log("✅ Horaires d'ouverture mis à jour");
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour des horaires:", error);
      throw error;
    }
  }

  // === MÉTHODES UTILITAIRES POUR LA GESTION DES ENTREPRISES SÉLECTIONNÉES ===

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
