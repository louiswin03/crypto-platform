/**
 * Rate Limiting simple basé sur la mémoire
 * Pour production, considérer Redis ou une solution externe comme Upstash
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Map pour stocker les compteurs par IP
const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyer les anciennes entrées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Nombre maximum de requêtes autorisées dans la fenêtre de temps
   */
  maxRequests: number

  /**
   * Fenêtre de temps en millisecondes
   * Par défaut: 60000 (1 minute)
   */
  windowMs?: number

  /**
   * Clé personnalisée pour identifier l'utilisateur
   * Par défaut: utilise l'IP
   */
  keyGenerator?: (identifier: string) => string
}

export interface RateLimitResult {
  /**
   * Si la requête est autorisée
   */
  allowed: boolean

  /**
   * Nombre de requêtes restantes
   */
  remaining: number

  /**
   * Timestamp quand le compteur sera réinitialisé
   */
  resetTime: number

  /**
   * Temps d'attente en millisecondes avant de réessayer (si bloqué)
   */
  retryAfter?: number
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 *
 * @param identifier - Identifiant unique (IP, userId, etc.)
 * @param config - Configuration du rate limiting
 * @returns Résultat indiquant si la requête est autorisée
 *
 * @example
 * ```ts
 * const result = checkRateLimit('192.168.1.1', { maxRequests: 10, windowMs: 60000 })
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: 'Trop de requêtes, réessayez plus tard' },
 *     { status: 429, headers: { 'Retry-After': String(Math.ceil(result.retryAfter! / 1000)) } }
 *   )
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const {
    maxRequests,
    windowMs = 60000, // 1 minute par défaut
    keyGenerator = (id: string) => id
  } = config

  const key = keyGenerator(identifier)
  const now = Date.now()

  // Récupérer ou créer l'entrée
  let entry = rateLimitStore.get(key)

  // Si l'entrée n'existe pas ou a expiré, créer une nouvelle
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: entry.resetTime
    }
  }

  // Incrémenter le compteur
  entry.count++

  // Vérifier si la limite est atteinte
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: entry.resetTime - now
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Extrait l'adresse IP de la requête
 * Gère les proxies et load balancers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(headers: Headers): string {
  // Vercel forwarded IP
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Autres headers
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Configuration prédéfinie pour différents types d'endpoints
 */
export const RATE_LIMIT_PRESETS = {
  /**
   * Pour les endpoints d'authentification (login, register)
   * 5 tentatives par minute
   */
  AUTH: {
    maxRequests: 5,
    windowMs: 60000
  },

  /**
   * Pour les endpoints de reset password
   * 3 tentatives par 15 minutes
   */
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 15 * 60000
  },

  /**
   * Pour les endpoints API standards
   * 60 requêtes par minute
   */
  API: {
    maxRequests: 60,
    windowMs: 60000
  },

  /**
   * Pour les endpoints de données en temps réel
   * 120 requêtes par minute
   */
  REALTIME: {
    maxRequests: 120,
    windowMs: 60000
  }
} as const
