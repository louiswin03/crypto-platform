import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await SupabaseDatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    const { error: deleteError } = await supabase
      .from('exchange_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('exchange_name', 'kraken')

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
