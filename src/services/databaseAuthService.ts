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
  // Note: Le token est maintenant dans un cookie httpOnly, pas dans la réponse
}

export class DatabaseAuthService {

  /**
   * Récupérer l'utilisateur courant depuis le localStorage (côté client)
   * Note: Le token est maintenant dans un cookie httpOnly, on ne stocke que les données utilisateur
   */
  static getCurrentUserFromStorage(): AuthenticatedUser | null {
    if (typeof window === 'undefined') return null

    try {
      const userData = sessionStorage.getItem('crypto_platform_user')
      if (!userData) return null

      const parsed = JSON.parse(userData)
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : null
      }
    } catch (error) {

      return null
    }
  }

  /**
   * Sauvegarder les données utilisateur dans le localStorage (côté client)
   * Note: Le token est géré automatiquement via cookie httpOnly
   */
  static saveUserToStorage(user: AuthenticatedUser): void {
    if (typeof window === 'undefined') return

    // Ne stocker que le minimum nécessaire (pas d'email pour la sécurité)
    const userData = {
      id: user.id,
      displayName: user.displayName,
      savedAt: new Date().toISOString()
    }

    // Utiliser sessionStorage au lieu de localStorage (plus sécurisé)
    sessionStorage.setItem('crypto_platform_user', JSON.stringify(userData))

    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { user } }))
  }

  /**
   * Déconnecter l'utilisateur (côté client)
   * Appelle l'API pour supprimer le cookie httpOnly et nettoie le localStorage
   */
  static async logout(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Appeler l'API pour supprimer le cookie httpOnly
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Important pour envoyer les cookies
      })
    } catch (error) {

    }

    // Nettoyer le localStorage
    sessionStorage.removeItem('crypto_platform_user')

    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: null }))
  }

  // Vérifier si l'utilisateur est connecté (côté client)
  static isLoggedIn(): boolean {
    return this.getCurrentUserFromStorage() !== null
  }

  /**
   * Hook pour vérifier l'état de connexion (côté client)
   * Vérifie que le cookie httpOnly est toujours valide
   */
  static async verifyCurrentUser(): Promise<AuthenticatedUser | null> {
    const stored = this.getCurrentUserFromStorage()
    if (!stored) return null

    // Vérifier la validité du cookie côté serveur
    const user = await this.verifyTokenOnServer()
    if (!user) {
      // Cookie invalide ou expiré, nettoyer le localStorage
      await this.logout()
      return null
    }

    // Mettre à jour les données utilisateur si elles ont changé
    if (JSON.stringify(stored) !== JSON.stringify(user)) {
      this.saveUserToStorage(user)
    }

    return user
  }

  /**
   * Vérifier le cookie d'authentification côté serveur via API
   * Le cookie est envoyé automatiquement par le navigateur
   */
  private static async verifyTokenOnServer(): Promise<AuthenticatedUser | null> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important pour envoyer les cookies
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user

    } catch (error) {

      return null
    }
  }

  /**
   * Migrer depuis l'ancien système localStorage avec token
   * Nettoie les anciennes données et ne garde que les données utilisateur
   */
  static migrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return

    try {
      // Nettoyer l'ancien format avec token
      const oldAuth = localStorage.getItem('crypto_platform_auth')
      if (oldAuth) {
        try {
          const parsed = JSON.parse(oldAuth)
          if (parsed.user) {
            // Sauvegarder seulement les données utilisateur (pas le token)
            this.saveUserToStorage(parsed.user)
          }
        } catch (e) {

        }
        localStorage.removeItem('crypto_platform_auth')
      }

      // Nettoyer les autres anciennes clés
      this.cleanupOldLocalStorage()

    } catch (error) {

    }
  }

  /**
   * Nettoyer les anciennes données localStorage
   * Garde seulement crypto_platform_user
   */
  static cleanupOldLocalStorage(): void {
    if (typeof window === 'undefined') return

    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('crypto_platform_') && key !== 'crypto_platform_user') {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
  }
}