import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Client Supabase admin pour bypasser RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Fonction pour vérifier le token JWT et récupérer l'userId
async function getUserFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error('Erreur vérification token:', error)
    return null
  }
}

// PUT - Mettre à jour une watchlist
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon, is_default, is_pinned } = body

    const { data, error } = await supabaseAdmin
      .from('watchlists')
      .update({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(is_default !== undefined && { is_default }),
        ...(is_pinned !== undefined && { is_pinned }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité : s'assurer que c'est bien la watchlist de l'utilisateur
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour watchlist:', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Watchlist non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ watchlist: data })
  } catch (error) {
    console.error('Erreur API watchlists PUT:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // D'abord supprimer tous les items de la watchlist
    await supabaseAdmin
      .from('watchlist_items')
      .delete()
      .eq('watchlist_id', params.id)
      .eq('user_id', userId) // Sécurité

    // Puis supprimer la watchlist
    const { error } = await supabaseAdmin
      .from('watchlists')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité : s'assurer que c'est bien la watchlist de l'utilisateur

    if (error) {
      console.error('Erreur suppression watchlist:', error)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Watchlist supprimée avec succès' })
  } catch (error) {
    console.error('Erreur API watchlists DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}