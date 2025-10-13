/**
 * Gestion du consentement des cookies (RGPD compliant)
 */

export interface CookiePreferences {
  necessary: boolean // Toujours true (requis pour le fonctionnement)
  functional: boolean // localStorage, préférences
  analytics: boolean // Pas utilisé actuellement
  marketing: boolean // Pas utilisé actuellement
  timestamp: number
}

const CONSENT_KEY = 'cookie-consent'
const CONSENT_VERSION = '1.0' // Incrémenter si les cookies changent

/**
 * Vérifie si l'utilisateur a déjà donné son consentement
 */
export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) return false

    const parsed = JSON.parse(consent)
    return parsed.version === CONSENT_VERSION
  } catch {
    return false
  }
}

/**
 * Récupère les préférences de cookies
 */
export function getConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  try {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) return null

    const parsed = JSON.parse(consent)
    if (parsed.version !== CONSENT_VERSION) return null

    return parsed.preferences
  } catch {
    return null
  }
}

/**
 * Sauvegarde les préférences de cookies
 */
export function saveConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return

  const data = {
    version: CONSENT_VERSION,
    preferences,
    savedAt: new Date().toISOString()
  }

  localStorage.setItem(CONSENT_KEY, JSON.stringify(data))

  // Déclencher un événement custom pour notifier les composants
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: preferences }))
}

/**
 * Accepter tous les cookies
 */
export function acceptAllCookies(): void {
  const preferences: CookiePreferences = {
    necessary: true,
    functional: true,
    analytics: false, // Pas utilisé actuellement
    marketing: false, // Pas utilisé actuellement
    timestamp: Date.now()
  }

  saveConsent(preferences)
}

/**
 * Refuser les cookies optionnels (garder seulement les nécessaires)
 */
export function rejectOptionalCookies(): void {
  const preferences: CookiePreferences = {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    timestamp: Date.now()
  }

  saveConsent(preferences)

  // Nettoyer localStorage si refusé
  cleanupLocalStorage()
}

/**
 * Nettoie le localStorage des données non nécessaires
 */
function cleanupLocalStorage(): void {
  if (typeof window === 'undefined') return

  // Garder les clés strictement nécessaires (RGPD autorise sans consentement)
  const essentialKeys = [
    CONSENT_KEY,
    'auth-token', // JWT nécessaire pour l'authentification
    'auth_token', // Alternative
    'token'       // Alternative
  ]

  // Nettoyer seulement les données fonctionnelles (préférences UI uniquement)
  // Note: portfolio, strategies, et watchlists sont en BDD, pas en localStorage
  const functionalKeys = [
    'language',
    'theme',
    'cryptos-view-mode', // Mode d'affichage (grille vs watchlist)
    'user-preferences'
  ]

  functionalKeys.forEach(key => {
    localStorage.removeItem(key)
  })

  console.log('⚠️ Cookies fonctionnels refusés. Préférences nettoyées (authentification conservée).')
}

/**
 * Révoquer le consentement
 */
export function revokeConsent(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CONSENT_KEY)
}
