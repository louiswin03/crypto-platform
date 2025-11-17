import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import { getAuthToken } from './cookies'

/**
 * Récupère le JWT_SECRET de manière sécurisée
 * Lance une erreur si la variable d'environnement n'est pas définie
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not defined in environment variables. ' +
      'This is a critical security requirement. ' +
      'Please set JWT_SECRET in your .env.local file or deployment environment.'
    )
  }

  // Vérifier que le secret est suffisamment long (minimum 32 caractères)
  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security reasons. ' +
      'Current length: ' + secret.length
    )
  }

  return secret
}

/**
 * Vérifie un token JWT de manière sécurisée
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, getJwtSecret())
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Crée un token JWT de manière sécurisée
 */
export function createToken(payload: object, expiresIn: string = '4h'): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

/**
 * Extrait et vérifie le token depuis les headers Authorization
 * Retourne le userId décodé
 * Lance une erreur si le token est manquant ou invalide
 *
 * @deprecated Utiliser getUserIdFromRequest pour supporter les cookies
 */
export function extractUserIdFromRequest(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token manquant')
  }

  const token = authHeader.substring(7) // Enlever "Bearer "
  const decoded = verifyToken(token) as { userId: string }

  if (!decoded.userId) {
    throw new Error('Token invalide')
  }

  return decoded.userId
}

/**
 * Extrait et vérifie le token depuis un NextRequest
 * Essaie d'abord les cookies httpOnly, puis fallback sur Authorization header
 * Retourne le userId décodé
 * Lance une erreur si le token est manquant ou invalide
 *
 * @param request - NextRequest contenant les cookies ou headers
 * @returns userId extrait du token
 */
export function getUserIdFromRequest(request: NextRequest): string {
  // Priorité 1: Cookie httpOnly (plus sécurisé)
  const cookieToken = getAuthToken(request)

  if (cookieToken) {
    const decoded = verifyToken(cookieToken) as { userId: string }
    if (decoded.userId) {
      return decoded.userId
    }
  }

  // Priorité 2: Header Authorization (compatibilité legacy)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const decoded = verifyToken(token) as { userId: string }
    if (decoded.userId) {
      return decoded.userId
    }
  }

  throw new Error('Token manquant ou invalide')
}
