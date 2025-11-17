import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/jwt'
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rateLimit'
import { createAuthResponse } from '@/lib/cookies'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - Protection contre brute force
    const clientIp = getClientIp(request.headers)
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMIT_PRESETS.AUTH)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfter! / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT_PRESETS.AUTH.maxRequests),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime)
          }
        }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur par email
    const user = await SupabaseDatabaseService.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Mettre à jour la dernière connexion
    await SupabaseDatabaseService.updateUserLastLogin(user.id)

    // Récupérer le profil
    const profile = await SupabaseDatabaseService.getUserProfile(user.id)

    // Générer le token JWT (expire dans 4h pour plus de sécurité)
    const token = createToken({ userId: user.id }, '4h')

    const authenticatedUser = {
      id: user.id,
      email: user.email,
      displayName: profile?.display_name || email.split('@')[0],
      profile,
      createdAt: user.created_at,
      lastLogin: new Date() // Dernière connexion vient d'être mise à jour
    }

    // Retourner la réponse avec le token dans un cookie httpOnly sécurisé
    // Le token n'est plus accessible via JavaScript (protection XSS)
    return createAuthResponse(
      {
        success: true,
        user: authenticatedUser
      },
      token
    )

  } catch (error: any) {
    console.error('Erreur API login:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 401 }
    )
  }
}