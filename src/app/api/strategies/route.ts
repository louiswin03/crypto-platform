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

// GET - Récupérer toutes les stratégies d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('strategies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération stratégies:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ strategies: data || [] })
  } catch (error) {
    console.error('Erreur API strategies GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle stratégie
export async function POST(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      config,
      is_template,
      is_public
    } = body

    if (!name || !type || !config) {
      return NextResponse.json({ error: 'Données manquantes (name, type, config requis)' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('strategies')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        type,
        config,
        is_template: is_template || false,
        is_public: is_public || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création stratégie:', error)
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ strategy: data })
  } catch (error) {
    console.error('Erreur API strategies POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}