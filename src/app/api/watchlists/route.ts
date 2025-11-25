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

// GET - Récupérer toutes les watchlists d'un utilisateur
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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ watchlists: data || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle watchlist
export async function POST(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon, is_default, is_pinned } = body

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('watchlists')
      .insert({
        user_id: userId,
        name,
        description,
        color: color || '#6366F1',
        icon: icon || '📋',
        is_default: is_default || false,
        is_pinned: is_pinned || false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ watchlist: data })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}