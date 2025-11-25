/**
 * Logger minimaliste qui désactive TOUT en production
 * Utiliser si vous ne voulez AUCUN log en production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  debug(message: string, context?: any) {
    if (isDevelopment) {

    }
  },

  info(message: string, context?: any) {
    if (isDevelopment) {

    }
  },

  warn(message: string, context?: any) {
    if (isDevelopment) {

    }
  },

  error(message: string, error?: any) {
    if (isDevelopment) {

    }
  },

  // Critical reste actif même en production (pour les erreurs graves)
  critical(message: string, error?: any) {

  },
}
