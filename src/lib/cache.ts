// src/lib/cache.ts
/**
 * Système de cache centralisé pour toutes les APIs externes
 * Réduit drastiquement les appels API en stockant les données en mémoire
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()

  // Durées de cache par défaut (en millisecondes)
  static readonly DURATIONS = {
    VERY_SHORT: 30 * 1000,        // 30 secondes - données très volatiles
    SHORT: 1 * 60 * 1000,         // 1 minute - prix crypto temps réel
    MEDIUM: 5 * 60 * 1000,        // 5 minutes - market data, stats
    LONG: 30 * 60 * 1000,         // 30 minutes - données historiques
    VERY_LONG: 60 * 60 * 1000,    // 1 heure - données statiques
    DAY: 24 * 60 * 60 * 1000,     // 24 heures - données rarement mises à jour
  }

  /**
   * Récupérer une donnée du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Vérifier si le cache a expiré
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Stocker une donnée dans le cache
   */
  set<T>(key: string, data: T, duration: number = APICache.DURATIONS.MEDIUM): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration
    })
  }

  /**
   * Supprimer une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Obtenir une clé de cache formatée
   */
  static generateKey(...parts: (string | number)[]): string {
    return parts.join(':')
  }

  /**
   * Obtenir des statistiques du cache
   */
  getStats() {
    const now = Date.now()
    let activeEntries = 0
    let expiredEntries = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredEntries++
      } else {
        activeEntries++
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries,
      expiredEntries,
      memoryEstimate: `~${Math.round(this.cache.size * 0.5)}KB` // Estimation approximative
    }
  }

  /**
   * Nettoyer les entrées expirées (à appeler périodiquement)
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * Wrapper pour fetch avec cache automatique
   * Utilise la fonction pour générer la clé et effectuer le fetch
   */
  async fetchWithCache<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    duration: number = APICache.DURATIONS.MEDIUM
  ): Promise<T> {
    // Vérifier le cache d'abord
    const cached = this.get<T>(cacheKey)
    if (cached !== null) {
      return cached
    }

    // Sinon, fetcher les données
    const data = await fetchFunction()

    // Stocker dans le cache
    this.set(cacheKey, data, duration)

    return data
  }
}

// Instance singleton du cache
export const apiCache = new APICache()

// Nettoyer le cache toutes les 5 minutes pour éviter les fuites mémoire
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = apiCache.cleanup()
    if (cleaned > 0) {

    }
  }, 5 * 60 * 1000)
}

// Côté serveur : nettoyer le cache au démarrage et périodiquement
if (typeof window === 'undefined') {
  // Vider le cache au démarrage du serveur
  apiCache.clear()

  // Nettoyer toutes les 2 minutes côté serveur
  setInterval(() => {
    const cleaned = apiCache.cleanup()
    if (cleaned > 0) {

    }
  }, 2 * 60 * 1000)
}

// Export des types et constantes
export { APICache }
export type { CacheEntry }
