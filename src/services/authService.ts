// Service d'authentification simple pour gérer les comptes utilisateur

export interface User {
  id: string
  username: string
  email?: string
  createdAt: Date
  lastLogin: Date
}

const AUTH_STORAGE_KEY = 'crypto_platform_current_user'
const USERS_STORAGE_KEY = 'crypto_platform_users'

export class AuthService {
  static getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!stored) return null

      const user = JSON.parse(stored)
      // Convertir les dates
      user.createdAt = new Date(user.createdAt)
      user.lastLogin = new Date(user.lastLogin)
      return user
    } catch (error) {
      return null
    }
  }

  static getAllUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (!stored) return []

      const users = JSON.parse(stored)
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: new Date(user.lastLogin)
      }))
    } catch (error) {
      return []
    }
  }

  static createUser(username: string, email?: string): User {
    const users = this.getAllUsers()

    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Un utilisateur avec ce nom existe déjà')
    }

    const newUser: User = {
      id: this.generateUserId(),
      username: username.trim(),
      email: email?.trim(),
      createdAt: new Date(),
      lastLogin: new Date()
    }

    users.push(newUser)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    // Connecter automatiquement le nouvel utilisateur
    this.setCurrentUser(newUser)

    return newUser
  }

  static loginUser(username: string): User | null {
    const users = this.getAllUsers()
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())

    if (user) {
      // Mettre à jour la dernière connexion
      user.lastLogin = new Date()
      this.updateUser(user)
      this.setCurrentUser(user)
      return user
    }

    return null
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    // Déclencher un événement pour notifier les composants (côté client seulement)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-auth-changed'))
    }
  }

  static logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    // Déclencher un événement pour notifier les composants (côté client seulement)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-auth-changed'))
    }
  }

  static updateUser(updatedUser: User): void {
    const users = this.getAllUsers()
    const index = users.findIndex(u => u.id === updatedUser.id)

    if (index !== -1) {
      users[index] = updatedUser
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

      // Mettre à jour aussi l'utilisateur courant si c'est le même
      const currentUser = this.getCurrentUser()
      if (currentUser && currentUser.id === updatedUser.id) {
        this.setCurrentUser(updatedUser)
      }
    }
  }

  static deleteUser(userId: string): void {
    const users = this.getAllUsers()
    const filteredUsers = users.filter(u => u.id !== userId)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers))

    // Déconnecter si c'est l'utilisateur courant
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      this.logout()
    }
  }

  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  }

  private static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // Méthodes utilitaires
  static getUserStorageKey(userId: string, dataType: string): string {
    return `crypto_platform_${userId}_${dataType}`
  }

  static clearUserData(userId: string): void {
    // Nettoyer toutes les données associées à cet utilisateur
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`crypto_platform_${userId}_`)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}