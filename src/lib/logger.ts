/**
 * Logger sécurisé qui protège les informations sensibles en production
 *
 * Usage:
 * import { logger } from '@/lib/logger'
 * logger.info('Message', { data })
 * logger.error('Erreur', error)
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Liste des clés sensibles à masquer
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apiKey',
  'apiSecret',
  'jwt',
  'sessionId',
  'cookie',
  'authorization',
  'privateKey',
  'accessToken',
  'refreshToken',
]

/**
 * Masque les données sensibles dans un objet
 */
function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'string') {
    // Masquer les tokens dans les strings (ex: "Bearer token123" -> "Bearer ***")
    return data.replace(/Bearer\s+[\w-]+/gi, 'Bearer ***')
      .replace(/token[=:]\s*[\w-]+/gi, 'token=***')
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item))
  }

  if (typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      const isSensitive = SENSITIVE_KEYS.some(sensitiveKey =>
        lowerKey.includes(sensitiveKey.toLowerCase())
      )

      if (isSensitive) {
        sanitized[key] = '***REDACTED***'
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeData(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  return data
}

/**
 * Formate un message de log avec contexte
 */
function formatMessage(level: string, message: string, context?: any): string {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level}]`

  if (!context) {
    return `${prefix} ${message}`
  }

  // En production, sanitiser les données
  const safeContext = isDevelopment ? context : sanitizeData(context)
  return `${prefix} ${message} ${JSON.stringify(safeContext)}`
}

/**
 * Logger sécurisé
 */
export const logger = {
  /**
   * Log de debug - uniquement en développement
   */
  debug(message: string, context?: any) {
    if (isDevelopment) {
      console.log(formatMessage('DEBUG', message, context))
    }
  },

  /**
   * Log d'information - uniquement en développement
   */
  info(message: string, context?: any) {
    if (isDevelopment) {
      console.log(formatMessage('INFO', message, context))
    }
  },

  /**
   * Log de warning - toujours loggé mais sanitisé en production
   */
  warn(message: string, context?: any) {
    const safeContext = isDevelopment ? context : sanitizeData(context)
    console.warn(formatMessage('WARN', message, safeContext))
  },

  /**
   * Log d'erreur - toujours loggé mais sanitisé en production
   */
  error(message: string, error?: any) {
    if (isDevelopment || isTest) {
      // En dev, logger tout
      console.error(formatMessage('ERROR', message, error))
    } else {
      // En production, logger uniquement le message d'erreur (pas la stack trace complète)
      const sanitizedError = error instanceof Error
        ? { message: error.message, name: error.name }
        : sanitizeData(error)
      console.error(formatMessage('ERROR', message, sanitizedError))
    }
  },

  /**
   * Log d'erreur critique - toujours loggé avec détails
   * À utiliser uniquement pour les erreurs qui nécessitent une intervention immédiate
   */
  critical(message: string, error?: any) {
    console.error(formatMessage('CRITICAL', message, error))
  },

  /**
   * Log de succès - uniquement en développement
   */
  success(message: string, context?: any) {
    if (isDevelopment) {
      console.log(formatMessage('SUCCESS', message, context))
    }
  },

  /**
   * Log de requête HTTP - uniquement en développement
   */
  http(method: string, path: string, status: number, context?: any) {
    if (isDevelopment) {
      console.log(formatMessage('HTTP', `${method} ${path} ${status}`, context))
    }
  },
}

/**
 * Helper pour mesurer la performance d'une fonction
 */
export function logPerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (!isDevelopment) {
    return fn()
  }

  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.then(value => {
      const duration = performance.now() - start
      logger.debug(`Performance: ${operation}`, { duration: `${duration.toFixed(2)}ms` })
      return value
    })
  }

  const duration = performance.now() - start
  logger.debug(`Performance: ${operation}`, { duration: `${duration.toFixed(2)}ms` })
  return result
}
