import { NextRequest, NextResponse } from 'next/server'
import { SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // Utiliser getUserIdFromRequest qui vérifie d'abord les cookies httpOnly,
    // puis fallback sur Authorization header pour compatibilité
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await SupabaseDatabaseService.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // Récupérer le profil
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

  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}