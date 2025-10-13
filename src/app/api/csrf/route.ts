import { NextResponse } from 'next/server'
import { generateCsrfToken, setCsrfToken } from '@/lib/csrf'

/**
 * Génère et retourne un nouveau token CSRF
 * Le token est stocké dans un cookie HttpOnly
 */
export async function GET() {
  try {
    // Générer un nouveau token
    const token = generateCsrfToken()

    // Stocker dans un cookie HttpOnly
    await setCsrfToken(token)

    // Retourner le token au client (pour l'inclure dans les requêtes)
    return NextResponse.json({
      token,
      success: true
    })
  } catch (error) {
    console.error('Erreur génération CSRF token:', error)
    return NextResponse.json(
      { error: 'Impossible de générer le token CSRF' },
      { status: 500 }
    )
  }
}
