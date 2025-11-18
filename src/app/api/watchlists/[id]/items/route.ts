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

// GET - Récupérer tous les items d'une watchlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('watchlist_items')
      .select('*')
      .eq('watchlist_id', params.id)
      .eq('user_id', userId) // Sécurité
      .order('added_at', { ascending: true })

    if (error) {
      console.error('Erreur récupération items:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Erreur API watchlist items GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Ajouter un item à une watchlist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      crypto_id,
      symbol,
      name,
      image,
      current_price,
      price_change_percentage_24h,
      market_cap_rank,
      notes
    } = body

    if (!crypto_id || !symbol || !name) {
      return NextResponse.json({ error: 'crypto_id, symbol et name sont requis' }, { status: 400 })
    }

    // Vérifier que la watchlist appartient à l'utilisateur
    const { data: watchlist } = await supabaseAdmin
      .from('watchlists')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist non trouvée' }, { status: 404 })
    }

    // Vérifier que l'item n'existe pas déjà
    const { data: existingItem } = await supabaseAdmin
      .from('watchlist_items')
      .select('id')
      .eq('watchlist_id', params.id)
      .eq('crypto_id', crypto_id)
      .single()

    if (existingItem) {
      return NextResponse.json({ error: 'Cette cryptomonnaie est déjà dans la liste' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('watchlist_items')
      .insert({
        watchlist_id: params.id,
        user_id: userId,
        crypto_id,
        symbol,
        name,
        image,
        current_price,
        price_change_percentage_24h,
        market_cap_rank,
        notes
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur ajout item:', error)
      return NextResponse.json({ error: 'Erreur lors de l\'ajout' }, { status: 500 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('Erreur API watchlist items POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}