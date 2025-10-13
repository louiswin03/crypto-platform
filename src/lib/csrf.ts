import crypto from 'crypto'
import { cookies } from 'next/headers'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'csrf-token'

/**
 * Génère un token CSRF cryptographiquement sécurisé
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Stocke le token CSRF dans un cookie HttpOnly
 */
export async function setCsrfToken(token: string): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 heures
  })
}

/**
 * Récupère le token CSRF depuis les cookies
 */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value
}

/**
 * Valide un token CSRF
 * Compare le token du cookie avec celui fourni dans la requête
 */
export async function validateCsrfToken(requestToken: string | null): Promise<boolean> {
  if (!requestToken) {
    return false
  }

  const cookieToken = await getCsrfToken()

  if (!cookieToken) {
    return false
  }

  // Utiliser une comparaison à temps constant pour éviter les timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(requestToken),
    Buffer.from(cookieToken)
  )
}

/**
 * Middleware helper pour vérifier le token CSRF
 * À utiliser dans les API routes
 */
export async function verifyCsrfToken(headers: Headers): Promise<{ valid: boolean; error?: string }> {
  // Récupérer le token depuis le header X-CSRF-Token
  const requestToken = headers.get('x-csrf-token')

  if (!requestToken) {
    return {
      valid: false,
      error: 'CSRF token manquant'
    }
  }

  const isValid = await validateCsrfToken(requestToken)

  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF token invalide'
    }
  }

  return { valid: true }
}
