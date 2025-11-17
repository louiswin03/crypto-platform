import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/jwt'
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rateLimit'
import { createAuthResponse } from '@/lib/cookies'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - Protection contre brute force et spam
    const clientIp = getClientIp(request.headers)
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMIT_PRESETS.AUTH)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.' },
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

    const { email, password, displayName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Validation mot de passe renforcée
    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 12 caractères' },
        { status: 400 }
      )
    }

    // Vérifier la complexité du mot de passe
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        {
          error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (!@#$%^&*(),.?":{}|<>)'
        },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await SupabaseDatabaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await SupabaseDatabaseService.createUser(email, passwordHash, displayName)

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
      lastLogin: user.last_login
    }

    // Retourner la réponse avec le token dans un cookie httpOnly sécurisé
    return createAuthResponse(
      {
        success: true,
        user: authenticatedUser
      },
      token
    )

  } catch (error: unknown) {
    console.error('Erreur API register:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du compte'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}