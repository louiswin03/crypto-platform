import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
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

    // Validation mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
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

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '7d' }
    )

    const authenticatedUser = {
      id: user.id,
      email: user.email,
      displayName: profile?.display_name || email.split('@')[0],
      profile,
      createdAt: user.created_at,
      lastLogin: user.last_login
    }

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
      token
    })

  } catch (error: any) {
    console.error('Erreur API register:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du compte' },
      { status: 400 }
    )
  }
}