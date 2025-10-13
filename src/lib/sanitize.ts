/**
 * Utilitaires de sanitization pour prévenir les attaques XSS
 */

/**
 * Échappe les caractères HTML dangereux
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/**
 * Supprime tous les tags HTML d'une chaîne
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

/**
 * Nettoie une chaîne pour utilisation dans une URL
 */
export function sanitizeUrl(url: string): string {
  // Autoriser uniquement http:// et https://
  if (!url.match(/^https?:\/\//i)) {
    return ''
  }

  // Bloquer javascript: et data: URLs
  if (url.match(/^(javascript|data|vbscript):/i)) {
    return ''
  }

  return url
}

/**
 * Valide et nettoie une adresse email
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, '')
}

/**
 * Nettoie une chaîne alphanumérique (pour usernames, etc.)
 */
export function sanitizeAlphanumeric(text: string, allowSpaces: boolean = false): string {
  if (allowSpaces) {
    return text.replace(/[^a-zA-Z0-9\s-_]/g, '').trim()
  }
  return text.replace(/[^a-zA-Z0-9-_]/g, '')
}

/**
 * Limite la longueur d'une chaîne
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength)
}

/**
 * Nettoie un objet JSON en échappant les valeurs string
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = escapeHtml(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? escapeHtml(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) :
        item
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Valide et nettoie les inputs de formulaire
 */
export interface SanitizeOptions {
  maxLength?: number
  allowHtml?: boolean
  trim?: boolean
}

export function sanitizeInput(
  input: string,
  options: SanitizeOptions = {}
): string {
  const {
    maxLength = 1000,
    allowHtml = false,
    trim = true
  } = options

  let sanitized = input

  // Trim
  if (trim) {
    sanitized = sanitized.trim()
  }

  // Supprimer HTML si non autorisé
  if (!allowHtml) {
    sanitized = escapeHtml(sanitized)
  }

  // Limiter la longueur
  sanitized = truncate(sanitized, maxLength)

  return sanitized
}

/**
 * Validation SQL injection basique (utilisé comme couche supplémentaire)
 * Note: Utiliser TOUJOURS des requêtes préparées comme protection principale
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\*\/|\/\*)/,
    /('|(;))/,
    /(UNION|OR|AND)\s+\d+\s*=\s*\d+/i
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Nettoie les paramètres de recherche
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/['"]/g, '') // Supprimer quotes
    .slice(0, 200) // Limiter à 200 caractères
}
