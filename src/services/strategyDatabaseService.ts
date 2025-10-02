// Service pour sauvegarder et charger les stratégies en base de données

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

// Fonction utilitaire pour faire des requêtes authentifiées
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authData = DatabaseAuthService.getCurrentUserFromStorage()
  if (!authData) {
    throw new Error('Non authentifié')
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${authData.token}`,
      'Content-Type': 'application/json',
    },
  })
}

export class StrategyDatabaseService {
  static async getAllSavedStrategies(): Promise<SavedStrategy[]> {
    try {
      const response = await authenticatedFetch('/api/strategies')

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      // Convertir les stratégies de la BDD vers le format attendu par l'UI
      return (data.strategies || []).map((strategy: any) => ({
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        createdAt: new Date(strategy.created_at),
        lastModified: new Date(strategy.updated_at),
        config: strategy.config
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des stratégies:', error)
      return []
    }
  }

  static async saveStrategy(strategy: Omit<SavedStrategy, 'id' | 'createdAt' | 'lastModified'>): Promise<string> {
    try {
      const response = await authenticatedFetch('/api/strategies', {
        method: 'POST',
        body: JSON.stringify({
          name: strategy.name,
          description: strategy.description,
          type: 'custom', // Type pour les stratégies personnalisées
          config: strategy.config,
          is_template: false,
          is_public: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      const data = await response.json()
      return data.strategy.id
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      throw new Error('Impossible de sauvegarder la stratégie')
    }
  }

  static async updateStrategy(id: string, updates: Partial<Omit<SavedStrategy, 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      const updateData: any = {}

      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.config !== undefined) updateData.config = updates.config

      const response = await authenticatedFetch(`/api/strategies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return false
    }
  }

  static async deleteStrategy(id: string): Promise<boolean> {
    try {
      const response = await authenticatedFetch(`/api/strategies/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return false
    }
  }

  static async getStrategy(id: string): Promise<SavedStrategy | null> {
    try {
      const strategies = await this.getAllSavedStrategies()
      return strategies.find(s => s.id === id) || null
    } catch (error) {
      console.error('Erreur lors de la récupération de la stratégie:', error)
      return null
    }
  }

  static async exportStrategies(): Promise<string> {
    const strategies = await this.getAllSavedStrategies()
    return JSON.stringify(strategies, null, 2)
  }

  static async importStrategies(data: string): Promise<number> {
    try {
      const importedStrategies: SavedStrategy[] = JSON.parse(data)
      const currentStrategies = await this.getAllSavedStrategies()

      // Éviter les doublons basés sur le nom
      const existingNames = new Set(currentStrategies.map(s => s.name))
      const newStrategies = importedStrategies.filter(s => !existingNames.has(s.name))

      let importedCount = 0
      for (const strategy of newStrategies) {
        try {
          await this.saveStrategy({
            name: strategy.name,
            description: strategy.description,
            config: strategy.config
          })
          importedCount++
        } catch (error) {
          console.error(`Erreur import stratégie ${strategy.name}:`, error)
        }
      }

      return importedCount
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      throw new Error('Format de fichier invalide')
    }
  }

  // Méthodes utilitaires pour maintenir la compatibilité
  static async getUserStrategiesCount(): Promise<number> {
    try {
      const strategies = await this.getAllSavedStrategies()
      return strategies.length
    } catch (error) {
      return 0
    }
  }

  static async clearUserStrategies(): Promise<void> {
    try {
      const strategies = await this.getAllSavedStrategies()
      for (const strategy of strategies) {
        await this.deleteStrategy(strategy.id)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des stratégies:', error)
    }
  }
}