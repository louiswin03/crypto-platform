// src/services/watchlistService.ts
import { DatabaseAuthService } from './databaseAuthService'

// Types pour les watchlists (basés sur votre schéma BDD)
export interface Watchlist {
  id: string
  user_id: string
  name: string
  description?: string | null
  color: string
  icon: string
  is_default: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface WatchlistInsert {
  id?: string
  user_id: string
  name: string
  description?: string | null
  color?: string
  icon?: string
  is_default?: boolean
  is_pinned?: boolean
  created_at?: string
  updated_at?: string
}

export interface WatchlistUpdate {
  name?: string
  description?: string | null
  color?: string
  icon?: string
  is_default?: boolean
  is_pinned?: boolean
  updated_at?: string
}

export interface WatchlistItem {
  id: string
  watchlist_id: string
  user_id: string
  crypto_id: string
  symbol: string
  name: string
  image?: string | null
  current_price?: number | null
  price_change_percentage_24h?: number | null
  market_cap_rank?: number | null
  notes?: string | null
  added_at: string
}

// Fonction utilitaire pour faire des requêtes authentifiées
// Utilise les cookies httpOnly pour l'authentification
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include', // Important: envoie les cookies httpOnly
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  })
}

export const watchlistService = {
  // === WATCHLISTS ===

  // Récupérer toutes les listes d'un utilisateur
  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    try {
      const response = await authenticatedFetch('/api/watchlists')

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.watchlists || []
    } catch (error) {
      console.error('Erreur lors de la récupération des watchlists:', error)
      throw new Error(`Erreur lors de la récupération des listes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Créer une nouvelle liste
  async createWatchlist(userId: string, watchlist: Omit<WatchlistInsert, 'user_id' | 'id'>): Promise<Watchlist> {
    try {
      const response = await authenticatedFetch('/api/watchlists', {
        method: 'POST',
        body: JSON.stringify(watchlist),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.watchlist
    } catch (error) {
      console.error('Erreur lors de la création de la watchlist:', error)
      throw new Error(`Erreur lors de la création de la liste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Mettre à jour une liste
  async updateWatchlist(listId: string, updates: WatchlistUpdate): Promise<Watchlist> {
    try {
      const response = await authenticatedFetch(`/api/watchlists/${listId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.watchlist
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la watchlist:', error)
      throw new Error(`Erreur lors de la mise à jour de la liste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Supprimer une liste
  async deleteWatchlist(listId: string): Promise<void> {
    try {
      const response = await authenticatedFetch(`/api/watchlists/${listId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la watchlist:', error)
      throw new Error(`Erreur lors de la suppression de la liste: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // === WATCHLIST ITEMS ===

  // Récupérer tous les items d'une liste
  async getWatchlistItems(listId: string): Promise<WatchlistItem[]> {
    try {
      const response = await authenticatedFetch(`/api/watchlists/${listId}/items`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Erreur lors de la récupération des items:', error)
      throw new Error(`Erreur lors de la récupération des items: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Ajouter un item à une liste
  async addItemToWatchlist(
    userId: string,
    listId: string,
    crypto: {
      crypto_id: string
      symbol: string
      name: string
      image?: string
      current_price?: number
      price_change_percentage_24h?: number
      market_cap_rank?: number
    },
    notes?: string
  ): Promise<WatchlistItem> {
    try {
      const response = await authenticatedFetch(`/api/watchlists/${listId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          crypto_id: crypto.crypto_id,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          current_price: crypto.current_price,
          price_change_percentage_24h: crypto.price_change_percentage_24h,
          market_cap_rank: crypto.market_cap_rank,
          notes: notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.item
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'item:', error)
      throw new Error(`Erreur lors de l'ajout de la cryptomonnaie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Supprimer un item d'une liste
  async removeItemFromWatchlist(listId: string, cryptoId: string): Promise<void> {
    try {
      const response = await authenticatedFetch(`/api/watchlists/${listId}/items/${cryptoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'item:', error)
      throw new Error(`Erreur lors de la suppression de la cryptomonnaie: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Mettre à jour les notes d'un item
  async updateItemNotes(listId: string, cryptoId: string, notes: string): Promise<void> {
    try {
      const response = await authenticatedFetch(`/api/watchlists/${listId}/items/${cryptoId}`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error)
      throw new Error(`Erreur lors de la mise à jour des notes: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Vérifier si une crypto est dans une liste
  async isItemInWatchlist(listId: string, cryptoId: string): Promise<boolean> {
    try {
      const items = await this.getWatchlistItems(listId)
      return items.some(item => item.crypto_id === cryptoId)
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      return false
    }
  },

  // === UTILITAIRES ===

  // Récupérer les listes avec leurs items
  async getWatchlistsWithItems(userId: string): Promise<(Watchlist & { items: WatchlistItem[] })[]> {
    try {
      const response = await authenticatedFetch('/api/watchlists/with-items')

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      return data.watchlists || []
    } catch (error) {
      console.error('Erreur lors de la récupération des listes avec items:', error)
      throw new Error(`Erreur lors de la récupération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Créer les listes par défaut pour un nouvel utilisateur
  async createDefaultWatchlists(userId: string): Promise<Watchlist[]> {
    const defaultLists = [
      {
        name: 'Mes Favoris',
        description: 'Mes cryptomonnaies préférées',
        color: '#F59E0B',
        icon: '⭐',
        is_default: true,
        is_pinned: true,
      },
      {
        name: 'DeFi',
        description: 'Finance décentralisée',
        color: '#8B5CF6',
        icon: '🏦',
        is_default: true,
        is_pinned: false,
      },
      {
        name: 'Gaming & NFT',
        description: 'Gaming et métavers',
        color: '#06B6D4',
        icon: '🎮',
        is_default: true,
        is_pinned: false,
      },
      {
        name: 'Layer 1',
        description: 'Blockchains principales',
        color: '#10B981',
        icon: '⛓️',
        is_default: true,
        is_pinned: false,
      }
    ]

    try {
      const createdLists: Watchlist[] = []

      for (const list of defaultLists) {
        const createdList = await this.createWatchlist(userId, list)
        createdLists.push(createdList)
      }

      return createdLists
    } catch (error) {
      console.error('Erreur lors de la création des listes par défaut:', error)
      throw new Error(`Erreur lors de l'initialisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  },

  // Compter le nombre total de cryptos suivies par un utilisateur
  async getTotalWatchedCryptosCount(userId: string): Promise<number> {
    try {
      const watchlists = await this.getWatchlistsWithItems(userId)
      const allItems = watchlists.flatMap(w => w.items)

      // Compter les cryptos uniques
      const uniqueCryptos = new Set(allItems.map(item => item.crypto_id))
      return uniqueCryptos.size
    } catch (error) {
      console.error('Erreur lors du comptage:', error)
      return 0
    }
  },

  // Mettre à jour les prix des items dans les watchlists (pour l'instant, on skip cette fonction avancée)
  async updateItemsPrices(userId: string, pricesData: { [cryptoId: string]: { price: number, change24h: number } }): Promise<void> {
    // TODO: Implémenter si nécessaire via API route
  }
}