import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserIdFromRequest } from '@/lib/jwt'

// Client Supabase admin pour bypasser RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// PUT - Mettre à jour les notes d'un item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; cryptoId: string } }
) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { notes } = body

    const { data, error } = await supabaseAdmin
      .from('watchlist_items')
      .update({ notes })
      .eq('watchlist_id', params.id)
      .eq('crypto_id', params.cryptoId)
      .eq('user_id', userId) // Sécurité
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Item non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un item d'une watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; cryptoId: string } }
) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('watchlist_items')
      .delete()
      .eq('watchlist_id', params.id)
      .eq('crypto_id', params.cryptoId)
      .eq('user_id', userId) // Sécurité

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item supprimé avec succès' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}