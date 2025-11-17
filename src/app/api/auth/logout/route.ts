import { NextRequest } from 'next/server'
import { createLogoutResponse } from '@/lib/cookies'

/**
 * Route de déconnexion
 * Supprime le cookie d'authentification httpOnly
 */
export async function POST(request: NextRequest) {
  // Créer une réponse qui supprime le cookie d'authentification
  return createLogoutResponse()
}
