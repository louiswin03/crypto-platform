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

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, location, preferences } = body

    // Préparer les données à mettre à jour - SEULEMENT les champs fournis et non vides
    const updateData: {
      updated_at: string
      phone?: string | null
      location?: string | null
      preferences?: Record<string, unknown>
    } = {
      updated_at: new Date().toISOString()
    }

    // Ajouter phone seulement s'il est fourni ET non vide
    if (phone !== undefined && phone !== null) {
      updateData.phone = phone
    }

    // Ajouter location seulement s'il est fourni ET non vide
    if (location !== undefined && location !== null) {
      updateData.location = location
    }

    // Conserver preferences seulement si fourni
    if (preferences && Object.keys(preferences).length > 0) {
      updateData.preferences = preferences
    }

    // D'abord récupérer le profil existant avec toutes ses données
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')  // Récupérer toutes les colonnes
      .eq('id', userId)
      .single()

    let result

    if (existingProfile) {
      // Fusionner les nouvelles données avec les existantes pour éviter la suppression
      const mergedData = {
        ...existingProfile,  // Garder toutes les données existantes
        ...updateData,       // Appliquer seulement les nouvelles données
        updated_at: new Date().toISOString()
      }

      // Supprimer les champs qui ne doivent pas être mis à jour
      delete mergedData.id
      delete mergedData.created_at

      // Mettre à jour le profil existant
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update(mergedData)
        .eq('id', userId)
        .select()
        .single()

      result = { data, error }
    } else {
      // Créer un nouveau profil
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: userId,
          ...updateData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {

      // Si c'est une erreur de contrainte de clé étrangère, on essaie une approche différente
      if (result.error.message && result.error.message.includes('foreign key constraint')) {

        // Essayer de créer d'abord un utilisateur dans auth.users si nécessaire
        // Ou modifier la structure pour ne pas dépendre de auth.users
        return NextResponse.json({
          error: 'Erreur de configuration de la base de données. Veuillez d\'abord vous connecter via Supabase Auth ou modifier la structure de la table pour supprimer la contrainte foreign key.'
        }, { status: 500 })
      }

      return NextResponse.json({
        error: 'Erreur lors de la mise à jour: ' + result.error.message
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: result.data })
  } catch (error) {

    return NextResponse.json({
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 })
  }
}