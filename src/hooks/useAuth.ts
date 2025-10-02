// hooks/useAuth.ts - Version PostgreSQL
'use client'

import { useState, useEffect } from 'react'
import { DatabaseAuthService, AuthenticatedUser } from '@/services/databaseAuthService'

interface UseAuthReturn {
  user: AuthenticatedUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success?: boolean; error?: string }>
  signOut: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au démarrage
    const loadUser = async () => {
      try {
        const stored = DatabaseAuthService.getCurrentUserFromStorage()
        if (stored) {
          // Vérifier la validité du token avec le serveur
          const verifiedUser = await DatabaseAuthService.verifyCurrentUser()
          setUser(verifiedUser)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Écouter les changements d'état d'authentification
    const handleAuthChange = (event: CustomEvent) => {
      const userData = event.detail
      if (userData) {
        setUser(userData.user)
      } else {
        setUser(null)
      }
    }

    window.addEventListener('auth-state-changed', handleAuthChange as EventListener)

    // Vérifier les anciennes données localStorage pour migration
    DatabaseAuthService.migrateFromLocalStorage()

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange as EventListener)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Erreur lors de la connexion' }
      }

      // Sauvegarder dans le localStorage
      DatabaseAuthService.saveUserToStorage(data.user, data.token)
      setUser(data.user)

      return { success: true }

    } catch (error: any) {
      console.error('Erreur signIn:', error)
      return { error: error.message || 'Erreur de connexion au serveur' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Erreur lors de la création du compte' }
      }

      // Sauvegarder dans le localStorage
      DatabaseAuthService.saveUserToStorage(data.user, data.token)
      setUser(data.user)

      // Nettoyer les anciennes données après inscription réussie
      DatabaseAuthService.cleanupOldLocalStorage()

      return { success: true }

    } catch (error: any) {
      console.error('Erreur signUp:', error)
      return { error: error.message || 'Erreur de connexion au serveur' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    DatabaseAuthService.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}