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

// PUT - Mettre à jour une stratégie
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
      name,
      description,
      type,
      config,
      is_template,
      is_public
    } = body

    const updates: {
      updated_at: string
      name?: string
      description?: string
      type?: string
      config?: Record<string, unknown>
      is_template?: boolean
      is_public?: boolean
    } = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (type !== undefined) updates.type = type
    if (config !== undefined) updates.config = config
    if (is_template !== undefined) updates.is_template = is_template
    if (is_public !== undefined) updates.is_public = is_public

    const { data, error } = await supabaseAdmin
      .from('strategies')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Stratégie non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ strategy: data })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une stratégie
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
      .from('strategies')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId) // Sécurité

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Stratégie supprimée avec succès' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}