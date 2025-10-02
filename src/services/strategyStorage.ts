// Service pour sauvegarder et charger les stratégies personnalisées par utilisateur

import { DatabaseAuthService } from './databaseAuthService'

export interface SavedStrategy {
  id: string
  name: string
  description?: string
  createdAt: Date
  lastModified: Date
  config: {
    strategyType: 'custom'
    customStrategy: {
      name: string
      indicators: any[]
      entryLogic: 'ALL_AND' | 'ANY_OR' | 'CUSTOM'
      exitLogic: 'ALL_AND' | 'ANY_OR' | 'CUSTOM'
    }
    riskManagement: {
      stopLoss: number
      takeProfit: number
      trailingStop?: boolean
      trailingStopPercent?: number
    }
    parameters: Record<string, any>
  }
}

const STORAGE_KEY_SUFFIX = 'saved_strategies'

export class StrategyStorageService {
  private static getStorageKey(): string | null {
    const authData = DatabaseAuthService.getCurrentUserFromStorage()
    if (!authData) {
      console.warn('Aucun utilisateur connecté pour accéder aux stratégies')
      return null
    }
    return `crypto_platform_user_${authData.user.id}_${STORAGE_KEY_SUFFIX}`
  }

  static getAllSavedStrategies(): SavedStrategy[] {
    try {
      const storageKey = this.getStorageKey()
      if (!storageKey) return []

      const stored = localStorage.getItem(storageKey)
      if (!stored) return []

      const strategies = JSON.parse(stored)
      return strategies.map((strategy: any) => ({
        ...strategy,
        createdAt: new Date(strategy.createdAt),
        lastModified: new Date(strategy.lastModified)
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des stratégies:', error)
      return []
    }
  }

  static saveStrategy(strategy: Omit<SavedStrategy, 'id' | 'createdAt' | 'lastModified'>): string {
    try {
      const storageKey = this.getStorageKey()
      if (!storageKey) {
        throw new Error('Aucun utilisateur connecté pour sauvegarder la stratégie')
      }

      const strategies = this.getAllSavedStrategies()
      const newStrategy: SavedStrategy = {
        ...strategy,
        id: this.generateId(),
        createdAt: new Date(),
        lastModified: new Date()
      }

      strategies.push(newStrategy)
      localStorage.setItem(storageKey, JSON.stringify(strategies))
      return newStrategy.id
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw new Error('Impossible de sauvegarder la stratégie')
    }
  }

  static updateStrategy(id: string, updates: Partial<Omit<SavedStrategy, 'id' | 'createdAt'>>): boolean {
    try {
      const storageKey = this.getStorageKey()
      if (!storageKey) return false

      const strategies = this.getAllSavedStrategies()
      const index = strategies.findIndex(s => s.id === id)

      if (index === -1) return false

      strategies[index] = {
        ...strategies[index],
        ...updates,
        lastModified: new Date()
      }

      localStorage.setItem(storageKey, JSON.stringify(strategies))
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return false
    }
  }

  static deleteStrategy(id: string): boolean {
    try {
      const storageKey = this.getStorageKey()
      if (!storageKey) return false

      const strategies = this.getAllSavedStrategies()
      const filtered = strategies.filter(s => s.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return false
    }
  }

  static getStrategy(id: string): SavedStrategy | null {
    const strategies = this.getAllSavedStrategies()
    return strategies.find(s => s.id === id) || null
  }

  private static generateId(): string {
    return `strategy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  static exportStrategies(): string {
    const strategies = this.getAllSavedStrategies()
    return JSON.stringify(strategies, null, 2)
  }

  static importStrategies(data: string): number {
    try {
      const storageKey = this.getStorageKey()
      if (!storageKey) {
        throw new Error('Aucun utilisateur connecté pour importer les stratégies')
      }

      const importedStrategies: SavedStrategy[] = JSON.parse(data)
      const currentStrategies = this.getAllSavedStrategies()

      // Éviter les doublons basés sur le nom
      const existingNames = new Set(currentStrategies.map(s => s.name))
      const newStrategies = importedStrategies.filter(s => !existingNames.has(s.name))

      // Régénérer les IDs et dates
      const processedStrategies = newStrategies.map(s => ({
        ...s,
        id: this.generateId(),
        createdAt: new Date(),
        lastModified: new Date()
      }))

      const allStrategies = [...currentStrategies, ...processedStrategies]
      localStorage.setItem(storageKey, JSON.stringify(allStrategies))

      return newStrategies.length
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      throw new Error('Format de fichier invalide')
    }
  }

  // Méthodes utilitaires pour la gestion des utilisateurs
  static getUserStrategiesCount(userId: string): number {
    try {
      const storageKey = `crypto_platform_user_${userId}_${STORAGE_KEY_SUFFIX}`
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored).length : 0
    } catch (error) {
      return 0
    }
  }

  static clearUserStrategies(userId: string): void {
    const storageKey = `crypto_platform_user_${userId}_${STORAGE_KEY_SUFFIX}`
    localStorage.removeItem(storageKey)
  }
}