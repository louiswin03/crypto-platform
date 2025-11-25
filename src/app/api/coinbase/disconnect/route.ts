import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis le token JWT
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur
    const user = await SupabaseDatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // Supprimer la clé Coinbase de l'utilisateur de la base de données
    const { error: deleteError } = await supabase
      .from('exchange_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('exchange_name', 'coinbase')

    if (deleteError) {

      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie. Vos clés ont été supprimées en toute sécurité.'
    })
  } catch (error) {

    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}
