import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
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
      lastLogin: new Date() // Dernière connexion vient d'être mise à jour
    }

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
      token
    })

  } catch (error: any) {
    console.error('Erreur API login:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 401 }
    )
  }
}