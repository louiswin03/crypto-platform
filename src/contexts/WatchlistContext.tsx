// src/contexts/WatchlistContext.tsx
"use client"

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { watchlistService, type Watchlist, type WatchlistItem } from '@/services/watchlistService'

// Interface pour les watchlists avec items
interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[]
}

interface WatchlistContextType {
  // État
  watchlists: WatchlistWithItems[]
  activeWatchlist: string | null
  loading: boolean
  error: string | null

  // Actions de base
  setActiveWatchlist: (id: string | null) => void
  createWatchlist: (name: string, description?: string, color?: string, icon?: string) => Promise<string | null>
  deleteWatchlist: (listId: string) => Promise<boolean>
  updateWatchlist: (listId: string, updates: { name?: string; description?: string; color?: string; icon?: string; is_pinned?: boolean }) => Promise<boolean>
  refreshWatchlists: () => Promise<void>

  // Gestion des items
  addToWatchlist: (listId: string, crypto: any, notes?: string) => Promise<boolean>
  removeFromWatchlist: (listId: string, cryptoId: string) => Promise<boolean>
  updateItemNotes: (listId: string, cryptoId: string, notes: string) => Promise<boolean>

  // Utilitaires
  togglePinWatchlist: (listId: string) => Promise<boolean>
  isInWatchlist: (listId: string, cryptoId: string) => boolean
  getListsContainingCrypto: (cryptoId: string) => WatchlistWithItems[]
  getTotalWatchedCryptos: () => number
  getWatchlistStats: (listId: string) => any

  // Getters
  pinnedWatchlists: WatchlistWithItems[]
  unpinnedWatchlists: WatchlistWithItems[]
  currentWatchlist: WatchlistWithItems | null

  // Gestion d'erreur
  clearError: () => void
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [watchlists, setWatchlists] = useState<WatchlistWithItems[]>([])
  const [activeWatchlist, setActiveWatchlist] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les watchlists depuis Supabase
  const loadWatchlists = useCallback(async () => {
    if (!user?.id) {
      setWatchlists([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      const watchlistsWithItems = await watchlistService.getWatchlistsWithItems(user.id)
      setWatchlists(watchlistsWithItems)

      // Note: Création automatique de listes par défaut désactivée
      // if (watchlistsWithItems.length === 0) {
      //   await initializeDefaultWatchlists()
      // }
    } catch (err) {
      console.error('Erreur lors du chargement des watchlists:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Initialiser les listes par défaut pour un nouvel utilisateur
  const initializeDefaultWatchlists = async () => {
    if (!user?.id) return

    try {
      await watchlistService.createDefaultWatchlists(user.id)
      // Recharger après création
      await loadWatchlists()
    } catch (err) {
      console.error('Erreur lors de l\'initialisation:', err)
      setError('Erreur lors de l\'initialisation des listes')
    }
  }

  // Charger les watchlists au montage et quand l'utilisateur change
  useEffect(() => {
    loadWatchlists()
  }, [loadWatchlists])

  // === ACTIONS SUR LES WATCHLISTS ===

  // Créer une nouvelle watchlist
  const createWatchlist = async (
    name: string,
    description?: string,
    color?: string,
    icon?: string
  ): Promise<string | null> => {
    if (!user?.id) {
      setError('Utilisateur non connecté')
      return null
    }

    try {
      setError(null)
      const newWatchlist = await watchlistService.createWatchlist(user.id, {
        name,
        description,
        color: color || '#6366F1',
        icon: icon || '📋',
        is_default: false,
        is_pinned: false,
      })

      // Ajouter à la liste locale
      const watchlistWithItems: WatchlistWithItems = {
        ...newWatchlist,
        items: []
      }
      setWatchlists(prev => [...prev, watchlistWithItems])

      return newWatchlist.id
    } catch (err) {
      console.error('Erreur lors de la création:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
      return null
    }
  }

  // Supprimer une watchlist
  const deleteWatchlist = async (listId: string): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setError(null)

      // Vérification temporairement désactivée pour permettre la suppression des listes par défaut
      // const list = watchlists.find(l => l.id === listId)
      // if (list?.is_default) {
      //   setError('Impossible de supprimer une liste par défaut')
      //   return false
      // }

      await watchlistService.deleteWatchlist(listId)

      // Retirer de la liste locale
      setWatchlists(prev => prev.filter(l => l.id !== listId))

      // Si c'était la liste active, changer pour les favoris
      if (activeWatchlist === listId) {
        const favoritesId = watchlists.find(l => l.name === 'Mes Favoris')?.id || null
        setActiveWatchlist(favoritesId)
      }

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      return false
    }
  }

  // Mettre à jour une watchlist
  const updateWatchlist = async (
    listId: string,
    updates: { name?: string; description?: string; color?: string; icon?: string; is_pinned?: boolean }
  ): Promise<boolean> => {
    try {
      setError(null)
      await watchlistService.updateWatchlist(listId, updates)

      // Mettre à jour localement
      setWatchlists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, ...updates, updated_at: new Date().toISOString() }
          : list
      ))

      return true
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      return false
    }
  }

  // === ACTIONS SUR LES ITEMS ===

  // Ajouter une crypto à une watchlist
  const addToWatchlist = async (
    listId: string,
    crypto: {
      id: string
      symbol: string
      name: string
      image?: string
      current_price?: number
      price_change_percentage_24h?: number
      market_cap_rank?: number
    },
    notes?: string
  ): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setError(null)

      // Vérification locale d'abord (instantanée)
      const list = watchlists.find(l => l.id === listId)
      if (list?.items.some(item => item.crypto_id === crypto.id)) {
        setError('Cette cryptomonnaie est déjà dans la liste')
        return false
      }

      const newItem = await watchlistService.addItemToWatchlist(
        user.id,
        listId,
        {
          crypto_id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          current_price: crypto.current_price,
          price_change_percentage_24h: crypto.price_change_percentage_24h,
          market_cap_rank: crypto.market_cap_rank,
        },
        notes
      )

      // Ajouter à la liste locale
      setWatchlists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, items: [...list.items, newItem] }
          : list
      ))

      return true
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err)
      // Gérer spécifiquement l'erreur de doublon
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
        setError('Cette cryptomonnaie est déjà dans la liste')
      } else {
        setError(errorMsg)
      }
      return false
    }
  }

  // Retirer une crypto d'une watchlist
  const removeFromWatchlist = async (listId: string, cryptoId: string): Promise<boolean> => {
    try {
      setError(null)
      await watchlistService.removeItemFromWatchlist(listId, cryptoId)

      // Retirer de la liste locale
      setWatchlists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, items: list.items.filter(item => item.crypto_id !== cryptoId) }
          : list
      ))

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      return false
    }
  }

  // Mettre à jour les notes d'un item
  const updateItemNotes = async (listId: string, cryptoId: string, notes: string): Promise<boolean> => {
    try {
      setError(null)
      await watchlistService.updateItemNotes(listId, cryptoId, notes)

      // Mettre à jour localement
      setWatchlists(prev => prev.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.crypto_id === cryptoId
                  ? { ...item, notes }
                  : item
              )
            }
          : list
      ))

      return true
    } catch (err) {
      console.error('Erreur lors de la mise à jour des notes:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      return false
    }
  }

  // === UTILITAIRES ===

  // Vérifier si une crypto est dans une liste
  const isInWatchlist = (listId: string, cryptoId: string): boolean => {
    const list = watchlists.find(l => l.id === listId)
    return list?.items.some(item => item.crypto_id === cryptoId) || false
  }

  // Obtenir toutes les listes contenant une crypto
  const getListsContainingCrypto = (cryptoId: string): WatchlistWithItems[] => {
    return watchlists.filter(list =>
      list.items.some(item => item.crypto_id === cryptoId)
    )
  }

  // Compter le nombre total de cryptos suivies
  const getTotalWatchedCryptos = (): number => {
    const allCryptoIds = new Set()
    watchlists.forEach(list => {
      list.items.forEach(item => {
        allCryptoIds.add(item.crypto_id)
      })
    })
    return allCryptoIds.size
  }

  // Obtenir les statistiques d'une liste
  const getWatchlistStats = (listId: string) => {
    const list = watchlists.find(l => l.id === listId)
    if (!list) return null

    const items = list.items
    const totalValue = items.reduce((sum, item) => sum + (item.current_price || 0), 0)
    const avgChange = items.length > 0
      ? items.reduce((sum, item) => sum + (item.price_change_percentage_24h || 0), 0) / items.length
      : 0

    const gainers = items.filter(item => (item.price_change_percentage_24h || 0) > 0).length
    const losers = items.filter(item => (item.price_change_percentage_24h || 0) < 0).length

    return {
      count: items.length,
      totalValue,
      avgChange,
      gainers,
      losers,
      lastUpdated: new Date(list.updated_at)
    }
  }

  // Épingler/désépingler une liste
  const togglePinWatchlist = async (listId: string): Promise<boolean> => {
    const list = watchlists.find(l => l.id === listId)
    if (!list) return false

    return await updateWatchlist(listId, { is_pinned: !list.is_pinned })
  }

  // Actualiser les données
  const refreshWatchlists = async () => {
    await loadWatchlists()
  }

  // Gestion d'erreur
  const clearError = () => setError(null)

  const contextValue: WatchlistContextType = {
    // État
    watchlists,
    activeWatchlist,
    loading,
    error,

    // Actions de base
    setActiveWatchlist,
    createWatchlist,
    deleteWatchlist,
    updateWatchlist,
    refreshWatchlists,

    // Gestion des items
    addToWatchlist,
    removeFromWatchlist,
    updateItemNotes,

    // Utilitaires
    togglePinWatchlist,
    isInWatchlist,
    getListsContainingCrypto,
    getTotalWatchedCryptos,
    getWatchlistStats,
    clearError,

    // Getters
    pinnedWatchlists: watchlists.filter(l => l.is_pinned),
    unpinnedWatchlists: watchlists.filter(l => !l.is_pinned),
    currentWatchlist: watchlists.find(l => l.id === activeWatchlist) || null
  }

  return (
    <WatchlistContext.Provider value={contextValue}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error('useWatchlistContext must be used within a WatchlistProvider')
  }
  return context
}