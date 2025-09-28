// src/services/watchlistService.ts
import { supabase } from '@/lib/supabase'

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

export const watchlistService = {
  // === WATCHLISTS ===

  // Récupérer toutes les listes d'un utilisateur
  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération des watchlists:', error)
      throw new Error(`Erreur lors de la récupération des listes: ${error.message}`)
    }

    return data || []
  },

  // Créer une nouvelle liste
  async createWatchlist(userId: string, watchlist: Omit<WatchlistInsert, 'user_id' | 'id'>): Promise<Watchlist> {
    const { data, error } = await supabase
      .from('watchlists')
      .insert({
        ...watchlist,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la création de la watchlist:', error)
      throw new Error(`Erreur lors de la création de la liste: ${error.message}`)
    }

    return data
  },

  // Mettre à jour une liste
  async updateWatchlist(listId: string, updates: WatchlistUpdate): Promise<Watchlist> {
    const { data, error } = await supabase
      .from('watchlists')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listId)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de la watchlist:', error)
      throw new Error(`Erreur lors de la mise à jour de la liste: ${error.message}`)
    }

    return data
  },

  // Supprimer une liste
  async deleteWatchlist(listId: string): Promise<void> {
    // D'abord supprimer tous les items de la liste
    await supabase
      .from('watchlist_items')
      .delete()
      .eq('watchlist_id', listId)

    // Puis supprimer la liste elle-même
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('id', listId)

    if (error) {
      console.error('Erreur lors de la suppression de la watchlist:', error)
      throw new Error(`Erreur lors de la suppression de la liste: ${error.message}`)
    }
  },

  // === WATCHLIST ITEMS ===

  // Récupérer tous les items d'une liste
  async getWatchlistItems(listId: string): Promise<WatchlistItem[]> {
    const { data, error } = await supabase
      .from('watchlist_items')
      .select('*')
      .eq('watchlist_id', listId)
      .order('added_at', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération des items:', error)
      throw new Error(`Erreur lors de la récupération des items: ${error.message}`)
    }

    return data || []
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
    const { data, error } = await supabase
      .from('watchlist_items')
      .insert({
        watchlist_id: listId,
        user_id: userId,
        crypto_id: crypto.crypto_id,
        symbol: crypto.symbol,
        name: crypto.name,
        image: crypto.image,
        current_price: crypto.current_price,
        price_change_percentage_24h: crypto.price_change_percentage_24h,
        market_cap_rank: crypto.market_cap_rank,
        notes: notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de l\'ajout de l\'item:', error)
      throw new Error(`Erreur lors de l'ajout de la cryptomonnaie: ${error.message}`)
    }

    return data
  },

  // Supprimer un item d'une liste
  async removeItemFromWatchlist(listId: string, cryptoId: string): Promise<void> {
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('watchlist_id', listId)
      .eq('crypto_id', cryptoId)

    if (error) {
      console.error('Erreur lors de la suppression de l\'item:', error)
      throw new Error(`Erreur lors de la suppression de la cryptomonnaie: ${error.message}`)
    }
  },

  // Mettre à jour les notes d'un item
  async updateItemNotes(listId: string, cryptoId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('watchlist_items')
      .update({ notes })
      .eq('watchlist_id', listId)
      .eq('crypto_id', cryptoId)

    if (error) {
      console.error('Erreur lors de la mise à jour des notes:', error)
      throw new Error(`Erreur lors de la mise à jour des notes: ${error.message}`)
    }
  },

  // Vérifier si une crypto est dans une liste
  async isItemInWatchlist(listId: string, cryptoId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('watchlist_items')
      .select('id')
      .eq('watchlist_id', listId)
      .eq('crypto_id', cryptoId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la vérification:', error)
      return false
    }

    return !!data
  },

  // === UTILITAIRES ===

  // Récupérer les listes avec leurs items
  async getWatchlistsWithItems(userId: string): Promise<(Watchlist & { items: WatchlistItem[] })[]> {
    const { data, error } = await supabase
      .from('watchlists')
      .select(`
        *,
        watchlist_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération des listes avec items:', error)
      throw new Error(`Erreur lors de la récupération: ${error.message}`)
    }

    return (data || []).map(watchlist => ({
      ...watchlist,
      items: watchlist.watchlist_items || []
    }))
  },

  // Créer les listes par défaut pour un nouvel utilisateur
  async createDefaultWatchlists(userId: string): Promise<Watchlist[]> {
    const defaultLists = [
      {
        user_id: userId,
        name: 'Mes Favoris',
        description: 'Mes cryptomonnaies préférées',
        color: '#F59E0B',
        icon: '⭐',
        is_default: true,
        is_pinned: true,
      },
      {
        user_id: userId,
        name: 'DeFi',
        description: 'Finance décentralisée',
        color: '#8B5CF6',
        icon: '🏦',
        is_default: true,
        is_pinned: false,
      },
      {
        user_id: userId,
        name: 'Gaming & NFT',
        description: 'Gaming et métavers',
        color: '#06B6D4',
        icon: '🎮',
        is_default: true,
        is_pinned: false,
      },
      {
        user_id: userId,
        name: 'Layer 1',
        description: 'Blockchains principales',
        color: '#10B981',
        icon: '⛓️',
        is_default: true,
        is_pinned: false,
      }
    ]

    const { data, error } = await supabase
      .from('watchlists')
      .insert(defaultLists)
      .select()

    if (error) {
      console.error('Erreur lors de la création des listes par défaut:', error)
      throw new Error(`Erreur lors de l'initialisation: ${error.message}`)
    }

    return data || []
  },

  // Compter le nombre total de cryptos suivies par un utilisateur
  async getTotalWatchedCryptosCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('watchlist_items')
      .select('crypto_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Erreur lors du comptage:', error)
      return 0
    }

    // Compter les cryptos uniques
    const uniqueCryptos = new Set((data || []).map(item => item.crypto_id))
    return uniqueCryptos.size
  },

  // Mettre à jour les prix des items dans les watchlists
  async updateItemsPrices(userId: string, pricesData: { [cryptoId: string]: { price: number, change24h: number } }): Promise<void> {
    const updates = Object.entries(pricesData).map(([cryptoId, data]) =>
      supabase
        .from('watchlist_items')
        .update({
          current_price: data.price,
          price_change_percentage_24h: data.change24h,
        })
        .eq('user_id', userId)
        .eq('crypto_id', cryptoId)
    )

    await Promise.all(updates)
  }
}