import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { verifyToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Enlever "Bearer "

    try {
      const decoded = verifyToken(token) as { userId: string }
      const user = await SupabaseDatabaseService.getUserById(decoded.userId)

      if (!user) {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        )
      }

      const profile = await SupabaseDatabaseService.getUserProfile(user.id)

      const authenticatedUser = {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.email.split('@')[0],
        profile,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }

      return NextResponse.json({
        success: true,
        user: authenticatedUser
      })

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

  } catch (error: any) {
    console.error('Erreur API verify:', error)

    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}