// Types pour l'authentification côté client
export interface DatabaseUser {
  id: string
  email: string
  password_hash: string
  created_at: Date
  updated_at: Date
  last_login: Date | null
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
}

export interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  timezone: string | null
  language: string
  preferences: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface AuthenticatedUser {
  id: string
  email: string
  displayName: string
  profile: UserProfile | null
  createdAt: Date
  lastLogin: Date | null
}

export interface LoginResponse {
  user: AuthenticatedUser
  token: string
}

export class DatabaseAuthService {

  // Récupérer l'utilisateur courant depuis le localStorage (côté client)
  static getCurrentUserFromStorage(): { user: AuthenticatedUser; token: string } | null {
    if (typeof window === 'undefined') return null

    try {
      const userData = localStorage.getItem('crypto_platform_auth')
      if (!userData) return null

      const parsed = JSON.parse(userData)
      return {
        user: {
          ...parsed.user,
          createdAt: new Date(parsed.user.createdAt),
          lastLogin: parsed.user.lastLogin ? new Date(parsed.user.lastLogin) : null
        },
        token: parsed.token
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  }

  // Sauvegarder l'utilisateur dans le localStorage (côté client)
  static saveUserToStorage(user: AuthenticatedUser, token: string): void {
    if (typeof window === 'undefined') return

    const userData = {
      user,
      token,
      savedAt: new Date().toISOString()
    }

    localStorage.setItem('crypto_platform_auth', JSON.stringify(userData))

    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: userData }))
  }

  // Déconnecter l'utilisateur (côté client)
  static logout(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem('crypto_platform_auth')

    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }))
  }

  // Vérifier si l'utilisateur est connecté (côté client)
  static isLoggedIn(): boolean {
    return this.getCurrentUserFromStorage() !== null
  }

  // Hook pour vérifier l'état de connexion (côté client)
  static async verifyCurrentUser(): Promise<AuthenticatedUser | null> {
    const stored = this.getCurrentUserFromStorage()
    if (!stored) return null

    // Vérifier la validité du token côté serveur
    const user = await this.verifyTokenOnServer(stored.token)
    if (!user) {
      // Token invalide, nettoyer le localStorage
      this.logout()
      return null
    }

    return user
  }

  // Vérifier le token côté serveur via API
  private static async verifyTokenOnServer(token: string): Promise<AuthenticatedUser | null> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user

    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error)
      return null
    }
  }

  // Méthodes utilitaires pour la migration
  static migrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      // Récupérer les anciennes données localStorage
      const oldCurrentUser = localStorage.getItem('crypto_platform_current_user')
      const oldUsers = localStorage.getItem('crypto_platform_users')

      if (oldCurrentUser || oldUsers) {
        console.log('🔄 Données d\'authentification localStorage détectées')
        console.log('Veuillez créer un compte avec votre email/mot de passe pour migrer vos données')

        // Optionnel: afficher une notification à l'utilisateur
        window.dispatchEvent(new CustomEvent('migration-needed', {
          detail: { hasOldData: true }
        }))
      }

    } catch (error) {
      console.error('Erreur lors de la vérification de migration:', error)
    }
  }

  // Nettoyer les anciennes données localStorage après migration réussie
  static cleanupOldLocalStorage(): void {
    if (typeof window === 'undefined') return

    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('crypto_platform_') && key !== 'crypto_platform_auth') {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ Nettoyage clé localStorage: ${key}`)
    })
  }
}