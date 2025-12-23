import AsyncStorage from "@react-native-async-storage/async-storage";
class CacheManager {
  private memoryCache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  async set(
    key: string,
    data: any,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Cache en mémoire pour accès rapide
    this.memoryCache.set(key, cacheData);

    // Cache persistant pour les données importantes
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Erreur lors du stockage en cache persistant:", error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Vérifier d'abord le cache mémoire
    const memoryData = this.memoryCache.get(key);
    if (memoryData && this.isValid(memoryData)) {
      return memoryData.data as T;
    }

    // Ensuite le cache persistant
    try {
      const storedData = await AsyncStorage.getItem(`cache_${key}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (this.isValid(parsedData)) {
          // Remettre en cache mémoire
          this.memoryCache.set(key, parsedData);
          return parsedData.data as T;
        }
      }
    } catch (error) {
      console.warn("Erreur lors de la lecture du cache persistant:", error);
    }

    return null;
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn("Erreur lors de la suppression du cache:", error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Invalider le cache mémoire
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalider le cache persistant
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) => key.startsWith("cache_") && key.includes(pattern)
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn(
        "Erreur lors de la suppression du cache par pattern:",
        error
      );
    }
  }

  private isValid(cacheData: { timestamp: number; ttl: number }): boolean {
    return Date.now() - cacheData.timestamp < cacheData.ttl;
  }
  async clearAll(): Promise<void> {
    // Vider le cache mémoire
    this.memoryCache.clear();

    // Vider tout le cache persistant
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith("cache_"));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn("Erreur lors du clear complet du cache:", error);
    }
  }
}

export const cacheManager = new CacheManager();
