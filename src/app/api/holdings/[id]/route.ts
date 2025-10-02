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

// PUT - Mettre à jour un holding
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
    const {
      quantity,
      avg_cost_usd,
      current_price_usd
    } = body

    // Recalculer les valeurs
    const updates: any = {}
    if (quantity !== undefined) updates.quantity = quantity
    if (avg_cost_usd !== undefined) updates.avg_cost_usd = avg_cost_usd
    if (current_price_usd !== undefined) updates.current_price_usd = current_price_usd

    // Recalculer les valeurs dérivées si nécessaire
    if (quantity !== undefined || current_price_usd !== undefined) {
      const finalQuantity = quantity !== undefined ? quantity : (await supabaseAdmin.from('holdings').select('quantity').eq('id', params.id).single()).data?.quantity || 0
      const finalCurrentPrice = current_price_usd !== undefined ? current_price_usd : (await supabaseAdmin.from('holdings').select('current_price_usd').eq('id', params.id).single()).data?.current_price_usd || 0

      updates.current_value_usd = finalQuantity * finalCurrentPrice
    }

    if ((quantity !== undefined || avg_cost_usd !== undefined || current_price_usd !== undefined)) {
      const holding = await supabaseAdmin.from('holdings').select('*').eq('id', params.id).single()
      const existingHolding = holding.data

      if (existingHolding) {
        const finalQuantity = quantity !== undefined ? quantity : existingHolding.quantity
        const finalAvgCost = avg_cost_usd !== undefined ? avg_cost_usd : existingHolding.avg_cost_usd
        const finalCurrentPrice = current_price_usd !== undefined ? current_price_usd : existingHolding.current_price_usd

        const current_value = finalQuantity * finalCurrentPrice
        const unrealized_pnl = current_value - (finalQuantity * finalAvgCost)
        const unrealized_pnl_percent = finalAvgCost > 0 ? ((finalCurrentPrice - finalAvgCost) / finalAvgCost) * 100 : 0

        updates.current_value_usd = current_value
        updates.unrealized_pnl_usd = unrealized_pnl
        updates.unrealized_pnl_percent = unrealized_pnl_percent
      }
    }

    updates.last_updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('holdings')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour holding:', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Holding non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ holding: data })
  } catch (error) {
    console.error('Erreur API holding PUT:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un holding
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('holdings')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité

    if (error) {
      console.error('Erreur suppression holding:', error)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Holding supprimé avec succès' })
  } catch (error) {
    console.error('Erreur API holding DELETE:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}