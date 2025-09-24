// hooks/useAuth.ts - Version corrigée
'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, authHelpers, UserProfile } from '@/lib/supabase'

interface UseAuthReturn {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>
  signUp: (email: string, password: string) => Promise<{ data?: any; error?: any }>
  signOut: () => Promise<{ error?: any }>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonction séparée pour gérer le profil
  const handleUserProfile = async (userId: string) => {
    try {
      console.log('Récupération du profil pour:', userId)
      
      // D'abord, essayer de récupérer le profil existant
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Utilise maybeSingle au lieu de single pour éviter l'erreur si pas trouvé

      if (fetchError) {
        console.error('Erreur lors de la récupération du profil:', fetchError)
        return
      }

      if (existingProfile) {
        console.log('Profil existant trouvé:', existingProfile)
        setProfile(existingProfile)
        return
      }

      // Si pas de profil, le créer
      console.log('Création d\'un nouveau profil pour:', userId)
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          plan: 'free',
          preferences: {},
          member_since: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Erreur lors de la création du profil:', createError)
        return
      }

      console.log('Nouveau profil créé:', newProfile)
      setProfile(newProfile)

    } catch (error) {
      console.error('Erreur inattendue lors de la gestion du profil:', error)
    }
  }

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          // Récupérer le profil si l'utilisateur est connecté
          if (session?.user) {
            await handleUserProfile(session.user.id)
          }
        }
      } catch (error) {
        console.error('Erreur getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Petit délai pour laisser Supabase finaliser l'inscription
          if (event === 'SIGNED_UP') {
            setTimeout(() => handleUserProfile(session.user.id), 1000)
          } else {
            await handleUserProfile(session.user.id)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Cleanup
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await authHelpers.signIn(email, password)
    // Le loading sera mis à false par onAuthStateChange
    return result
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    const result = await authHelpers.signUp(email, password)
    // Le loading sera mis à false par onAuthStateChange
    return result
  }

  const signOut = async () => {
    const result = await authHelpers.signOut()
    return result
  }

  return {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }
}