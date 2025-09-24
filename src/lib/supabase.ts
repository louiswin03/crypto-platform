// lib/supabase.ts - Version simplifiée
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client principal (côté client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Types TypeScript pour nos données
export interface UserProfile {
  id: string
  display_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  plan: 'free' | 'pro' | 'business'
  subscription_expires_at?: string
  member_since: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description?: string
  is_default: boolean
  total_value_usd?: number
  total_value_eur?: number
  cost_basis_usd?: number
  unrealized_pnl_usd?: number
  last_updated_at?: string
  created_at: string
}

// Fonctions utilitaires pour l'auth
export const authHelpers = {
  // Inscription
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Connexion
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Récupérer utilisateur actuel
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Récupérer ou créer le profil utilisateur
  async getOrCreateProfile(userId: string) {
    // Essayer de récupérer le profil existant
    let { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Si le profil n'existe pas, le créer
    if (error && error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          plan: 'free',
          preferences: {}
        })
        .select()
        .single()

      if (createError) {
        return { profile: null, error: createError }
      }
      
      profile = newProfile
    }

    return { profile, error: error && error.code !== 'PGRST116' ? error : null }
  }
}