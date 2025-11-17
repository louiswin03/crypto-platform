import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Configuration des cookies pour l'authentification
 */
const COOKIE_CONFIG = {
  name: 'auth_token',
  options: {
    httpOnly: true, // Non accessible via JavaScript (protection XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
    sameSite: 'lax' as const, // Protection CSRF
    path: '/',
    maxAge: 4 * 60 * 60 // 4 heures (correspond à l'expiration du JWT)
  }
}

/**
 * Définit le cookie d'authentification dans la réponse
 *
 * @param response - NextResponse où ajouter le cookie
 * @param token - Token JWT à stocker
 * @returns La réponse avec le cookie configuré
 */
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(
    COOKIE_CONFIG.name,
    token,
    COOKIE_CONFIG.options
  )
  return response
}

/**
 * Crée une nouvelle réponse avec un cookie d'authentification
 * Utile pour les routes API qui retournent du JSON
 *
 * @param data - Données JSON à retourner
 * @param token - Token JWT à stocker dans le cookie
 * @param status - Code HTTP (défaut: 200)
 * @returns NextResponse avec le cookie configuré
 */
export function createAuthResponse(
  data: any,
  token: string,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return setAuthCookie(response, token)
}

/**
 * Récupère le token d'authentification depuis les cookies
 *
 * @param request - NextRequest contenant les cookies
 * @returns Le token ou null s'il n'existe pas
 */
export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_CONFIG.name)?.value || null
}

/**
 * Supprime le cookie d'authentification
 *
 * @param response - NextResponse où supprimer le cookie
 * @returns La réponse avec le cookie supprimé
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(
    COOKIE_CONFIG.name,
    '',
    {
      ...COOKIE_CONFIG.options,
      maxAge: 0 // Expire immédiatement
    }
  )
  return response
}

/**
 * Crée une réponse de logout qui supprime le cookie
 *
 * @returns NextResponse de logout avec cookie supprimé
 */
export function createLogoutResponse(): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie'
  })
  return clearAuthCookie(response)
}

/**
 * Vérifie si un token d'authentification existe dans les cookies
 *
 * @param request - NextRequest à vérifier
 * @returns true si le cookie existe
 */
export function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.has(COOKIE_CONFIG.name)
}

/**
 * Configuration du cookie pour les environnements de développement
 * Permet de tester les cookies en local sans HTTPS
 */
export function getAuthCookieConfig() {
  return COOKIE_CONFIG
}
