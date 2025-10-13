import AsyncStorage from "@react-native-async-storage/async-storage";
import { Business } from "./types";

const SELECTED_BUSINESS_KEY = "selected_business";

export class SelectedBusinessManager {
  static async setSelectedBusiness(business: Business): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_BUSINESS_KEY, JSON.stringify(business));
      console.log("✅ Entreprise sélectionnée stockée:", business);
    } catch (error) {
      console.error("❌ Erreur lors du stockage de l'entreprise:", error);
      throw error;
    }
  }

  static async getSelectedBusiness(): Promise<Business | null> {
    try {
      const businessData = await AsyncStorage.getItem(SELECTED_BUSINESS_KEY);
      if (businessData) {
        const business = JSON.parse(businessData) as Business;
        console.log("✅ Entreprise récupérée:", business);
        return business;
      }
      return null;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'entreprise:", error);
      return null;
    }
  }

  static async clearSelectedBusiness(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SELECTED_BUSINESS_KEY);
      console.log("✅ Entreprise sélectionnée supprimée");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'entreprise:", error);
      throw error;
    }
  }

  static async isBusinessSelected(): Promise<boolean> {
    const business = await this.getSelectedBusiness();
    return business !== null;
  }
}