import axiosInstance from "../axiosInstance";
import { cacheManager } from "../cache";
import { Currency } from "../types";

export class CurrencyService {
  private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 heure (les devises changent peu)

  static async getCurrencies(): Promise<Currency[]> {
    const cacheKey = "currencies_list";
    
    // Vérifier le cache
    const cachedData = await cacheManager.get<Currency[]>(cacheKey);
    if (cachedData) {
      console.log("📦 Devises récupérées du cache");
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<Currency[]>("/currencies");
      
      // Mettre en cache avec TTL plus long
      await cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
      
      console.log("✅ Devises récupérées:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des devises:", error);
      throw error;
    }
  }

  static async getCurrencyByCode(code: string): Promise<Currency | null> {
    const currencies = await this.getCurrencies();
    return currencies.find(currency => currency.code === code) || null;
  }

  static async getCurrencyById(id: string): Promise<Currency | null> {
    const currencies = await this.getCurrencies();
    return currencies.find(currency => currency.id === id) || null;
  }
}
