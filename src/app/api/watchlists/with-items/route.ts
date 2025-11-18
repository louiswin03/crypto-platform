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

// GET - Récupérer toutes les watchlists avec leurs items
export async function GET(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('watchlists')
      .select(`
        *,
        watchlist_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erreur récupération watchlists avec items:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const watchlistsWithItems = (data || []).map(watchlist => ({
      ...watchlist,
      items: watchlist.watchlist_items || []
    }))

    return NextResponse.json({ watchlists: watchlistsWithItems })
  } catch (error) {
    console.error('Erreur API watchlists with items GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}