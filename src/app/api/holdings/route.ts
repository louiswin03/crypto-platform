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

// GET - Récupérer tous les holdings d'un utilisateur (optionnellement filtrés par portfolio)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le portfolio_id depuis les query params si fourni
    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolio_id')

    let query = supabaseAdmin
      .from('holdings')
      .select('*')
      .eq('user_id', userId)

    // Filtrer par portfolio_id si fourni
    if (portfolioId) {
      query = query.eq('portfolio_id', portfolioId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération holdings:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ holdings: data || [] })
  } catch (error) {
    console.error('Erreur API holdings GET:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau holding
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      portfolio_id,
      crypto_id,
      symbol,
      quantity,
      avg_cost_usd,
      current_price_usd
    } = body

    if (!crypto_id || !symbol || !quantity || !avg_cost_usd || !current_price_usd) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const current_value_usd = quantity * current_price_usd
    const unrealized_pnl_usd = current_value_usd - (quantity * avg_cost_usd)
    const unrealized_pnl_percent = ((current_price_usd - avg_cost_usd) / avg_cost_usd) * 100

    const { data, error } = await supabaseAdmin
      .from('holdings')
      .insert({
        user_id: userId,
        portfolio_id: portfolio_id || null,
        crypto_id,
        symbol,
        quantity,
        avg_cost_usd,
        current_price_usd,
        current_value_usd,
        unrealized_pnl_usd,
        unrealized_pnl_percent,
        last_updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création holding:', error)
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    return NextResponse.json({ holding: data })
  } catch (error) {
    console.error('Erreur API holdings POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}