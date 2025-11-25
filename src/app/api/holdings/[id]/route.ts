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


// PUT - Mettre à jour un holding
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      quantity,
      avg_cost_usd,
      current_price_usd
    } = body

    // Recalculer les valeurs
    const updates: {
      quantity?: number
      avg_cost_usd?: number
      current_price_usd?: number
      current_value_usd?: number
      unrealized_pnl_usd?: number
      unrealized_pnl_percent?: number
      last_updated_at?: string
    } = {}
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
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Holding non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ holding: data })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un holding
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('holdings')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Holding supprimé avec succès' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}