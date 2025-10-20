import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import jwt from 'jsonwebtoken'

// GET - Récupérer tous les portfolios de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
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

    // Récupérer tous les portfolios de l'utilisateur
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erreur récupération portfolios:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des portfolios' },
        { status: 500 }
      )
    }

    // Si aucun portfolio n'existe, créer un portfolio par défaut
    if (!portfolios || portfolios.length === 0) {
      const { data: defaultPortfolio, error: createError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: 'Portfolio Principal',
          description: 'Mon portfolio principal',
          is_default: true,
          sources: { manual: true, binance: false, coinbase: false, kraken: false }
        })
        .select()
        .single()

      if (createError) {
        console.error('Erreur création portfolio par défaut:', createError)
        return NextResponse.json({ portfolios: [] })
      }

      return NextResponse.json({ portfolios: [defaultPortfolio] })
    }

    return NextResponse.json({ portfolios })
  } catch (error: any) {
    console.error('Erreur API portfolios:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau portfolio
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
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

    // Récupérer les données du body
    const body = await request.json()
    const { name, description, is_default, sources } = body

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom du portfolio est requis' },
        { status: 400 }
      )
    }

    // Si on veut définir ce portfolio comme défaut, retirer le défaut des autres
    if (is_default) {
      await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    // Créer le nouveau portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_default: is_default || false,
        sources: sources || { manual: true, binance: false, coinbase: false, kraken: false }
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création portfolio:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création du portfolio' },
        { status: 500 }
      )
    }

    return NextResponse.json({ portfolio }, { status: 201 })
  } catch (error: any) {
    console.error('Erreur API création portfolio:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
