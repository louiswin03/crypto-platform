import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

// PUT - Modifier un portfolio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Authentification
    let userId: string

    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Non authentifié' },
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

    const updates: {
      name?: string
      description?: string | null
      is_default?: boolean
      sources?: Record<string, boolean>
    } = {}

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'Le nom du portfolio ne peut pas être vide' },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null
    }

    if (is_default !== undefined) {
      updates.is_default = is_default

      // Si on définit ce portfolio comme défaut, retirer le défaut des autres
      if (is_default) {
        await supabase
          .from('portfolios')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id)
      }
    }

    if (sources !== undefined) {
      updates.sources = sources
    }

    // Mettre à jour le portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Sécurité : s'assurer que le portfolio appartient à l'utilisateur
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la modification du portfolio' },
        { status: 500 }
      )
    }

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ portfolio })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Authentification
    let userId: string

    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Non authentifié' },
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

    // Vérifier que le portfolio existe et appartient à l'utilisateur
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !portfolio) {
      return NextResponse.json(
        { error: 'Portfolio non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier qu'il reste au moins un autre portfolio
    const { data: allPortfolios, error: countError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)

    if (countError || !allPortfolios || allPortfolios.length <= 1) {
      return NextResponse.json(
        { error: 'Impossible de supprimer le dernier portfolio' },
        { status: 400 }
      )
    }

    // Supprimer les holdings associés au portfolio
    await supabase
      .from('holdings')
      .delete()
      .eq('portfolio_id', id)

    // Supprimer le portfolio
    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du portfolio' },
        { status: 500 }
      )
    }

    // Si c'était le portfolio par défaut, définir un autre comme défaut
    if (portfolio.is_default) {
      const { data: remainingPortfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (remainingPortfolios && remainingPortfolios.length > 0) {
        await supabase
          .from('portfolios')
          .update({ is_default: true })
          .eq('id', remainingPortfolios[0].id)
      }
    }

    return NextResponse.json({ success: true, message: 'Portfolio supprimé avec succès' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
