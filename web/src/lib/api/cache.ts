// web/src/lib/api/cache.ts
// Adapté du mobile (api/cache.ts) pour le web
// Utilise localStorage au lieu de AsyncStorage

class CacheManager {
    private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
        const cacheData = {
            data,
            timestamp: Date.now(),
            ttl,
        };

        // Cache en mémoire pour accès rapide
        this.memoryCache.set(key, cacheData);

        // Cache persistant (localStorage pour le web)
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
            } catch (error) {
                console.warn('Erreur lors du stockage en cache persistant:', error);
            }
        }
    }

    async get<T>(key: string): Promise<T | null> {
        // Vérifier d'abord le cache mémoire
        const memoryData = this.memoryCache.get(key);
        if (memoryData && this.isValid(memoryData)) {
            return memoryData.data as T;
        }

        // Ensuite le cache persistant (localStorage)
        if (typeof window !== 'undefined') {
            try {
                const storedData = localStorage.getItem(`cache_${key}`);
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    if (this.isValid(parsedData)) {
                        // Remettre en cache mémoire
                        this.memoryCache.set(key, parsedData);
                        return parsedData.data as T;
                    }
                }
            } catch (error) {
                console.warn('Erreur lors de la lecture du cache persistant:', error);
            }
        }

        return null;
    }

    async invalidate(key: string): Promise<void> {
        this.memoryCache.delete(key);
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(`cache_${key}`);
            } catch (error) {
                console.warn('Erreur lors de la suppression du cache:', error);
            }
        }
    }

    async invalidatePattern(pattern: string): Promise<void> {
        // Invalider le cache mémoire
        for (const key of this.memoryCache.keys()) {
            if (key.includes(pattern)) {
                this.memoryCache.delete(key);
            }
        }

        // Invalider le cache persistant (localStorage)
        if (typeof window !== 'undefined') {
            try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('cache_') && key.includes(pattern)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            } catch (error) {
                console.warn('Erreur lors de la suppression du cache par pattern:', error);
            }
        }
    }

    private isValid(cacheData: { timestamp: number; ttl: number }): boolean {
        return Date.now() - cacheData.timestamp < cacheData.ttl;
    }

    async clearAll(): Promise<void> {
        // Vider le cache mémoire
        this.memoryCache.clear();

        // Vider tout le cache persistant
        if (typeof window !== 'undefined') {
            try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('cache_')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            } catch (error) {
                console.warn('Erreur lors du clear complet du cache:', error);
            }
        }
    }
}

export const cacheManager = new CacheManager();
