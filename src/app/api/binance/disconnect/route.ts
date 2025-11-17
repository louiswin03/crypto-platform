import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis le token JWT
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Vérifier le token JWT
    let userId: string
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as { userId: string }
      userId = decoded.userId
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
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

    // Supprimer la clé Binance de l'utilisateur de la base de données
    const { error: deleteError } = await supabase
      .from('exchange_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('exchange_name', 'binance')

    if (deleteError) {
      console.error('Erreur suppression clé:', deleteError)
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
    console.error('Erreur déconnexion:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}
