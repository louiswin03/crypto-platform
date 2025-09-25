// src/hooks/useWatchlists.ts
"use client"

import { useState, useEffect } from 'react'

export interface WatchlistItem {
  id: string
  symbol: string
  name: string
  image?: string
  current_price: number
  price_change_percentage_24h: number
  market_cap_rank: number
  addedAt: Date
  notes?: string
}

export interface Watchlist {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isDefault: boolean
  isPinned: boolean
  items: WatchlistItem[]
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_WATCHLISTS: Omit<Watchlist, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'favorites',
    name: 'Mes Favoris',
    description: 'Mes cryptomonnaies préférées',
    color: '#F59E0B',
    icon: '⭐',
    isDefault: true,
    isPinned: true,
    items: []
  },
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Finance décentralisée',
    color: '#8B5CF6',
    icon: '🏦',
    isDefault: true,
    isPinned: false,
    items: []
  },
  {
    id: 'gaming',
    name: 'Gaming & NFT',
    description: 'Gaming et métavers',
    color: '#06B6D4',
    icon: '🎮',
    isDefault: true,
    isPinned: false,
    items: []
  },
  {
    id: 'layer1',
    name: 'Layer 1',
    description: 'Blockchains principales',
    color: '#10B981',
    icon: '⛓️',
    isDefault: true,
    isPinned: false,
    items: []
  }
]

const STORAGE_KEY = 'crypto_watchlists'

export const useWatchlists = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [activeWatchlist, setActiveWatchlist] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger les listes depuis le localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convertir les dates string en Date objects
        const watchlistsWithDates = parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          items: list.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        }))
        setWatchlists(watchlistsWithDates)
      } else {
        // Initialiser avec les listes par défaut
        const defaultLists = DEFAULT_WATCHLISTS.map(list => ({
          ...list,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
        setWatchlists(defaultLists)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLists))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des watchlists:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Sauvegarder dans localStorage quand les listes changent
  const saveWatchlists = (newWatchlists: Watchlist[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlists))
      setWatchlists(newWatchlists)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  // Créer une nouvelle liste
  const createWatchlist = (name: string, description?: string, color?: string, icon?: string) => {
    const newWatchlist: Watchlist = {
      id: `watchlist_${Date.now()}`,
      name,
      description,
      color: color || '#6366F1',
      icon: icon || '📋',
      isDefault: false,
      isPinned: false,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updated = [...watchlists, newWatchlist]
    saveWatchlists(updated)
    return newWatchlist.id
  }

  // Supprimer une liste
  const deleteWatchlist = (listId: string) => {
    const list = watchlists.find(l => l.id === listId)
    if (list?.isDefault) {
      throw new Error('Impossible de supprimer une liste par défaut')
    }
    
    const updated = watchlists.filter(l => l.id !== listId)
    saveWatchlists(updated)
    
    if (activeWatchlist === listId) {
      setActiveWatchlist('favorites')
    }
  }

  // Modifier une liste
  const updateWatchlist = (listId: string, updates: Partial<Omit<Watchlist, 'id' | 'createdAt' | 'items'>>) => {
    const updated = watchlists.map(list => 
      list.id === listId 
        ? { ...list, ...updates, updatedAt: new Date() }
        : list
    )
    saveWatchlists(updated)
  }

  // Ajouter une crypto à une liste
  const addToWatchlist = (listId: string, crypto: any, notes?: string) => {
    const item: WatchlistItem = {
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      image: crypto.image,
      current_price: crypto.current_price,
      price_change_percentage_24h: crypto.price_change_percentage_24h,
      market_cap_rank: crypto.market_cap_rank,
      addedAt: new Date(),
      notes
    }

    const updated = watchlists.map(list => {
      if (list.id === listId) {
        // Éviter les doublons
        const exists = list.items.some(i => i.id === crypto.id)
        if (exists) return list
        
        return {
          ...list,
          items: [...list.items, item],
          updatedAt: new Date()
        }
      }
      return list
    })
    
    saveWatchlists(updated)
  }

  // Retirer une crypto d'une liste
  const removeFromWatchlist = (listId: string, cryptoId: string) => {
    const updated = watchlists.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            items: list.items.filter(item => item.id !== cryptoId),
            updatedAt: new Date()
          }
        : list
    )
    saveWatchlists(updated)
  }

  // Déplacer une crypto entre listes
  const moveBetweenLists = (fromListId: string, toListId: string, cryptoId: string) => {
    const fromList = watchlists.find(l => l.id === fromListId)
    const item = fromList?.items.find(i => i.id === cryptoId)
    
    if (!item) return
    
    removeFromWatchlist(fromListId, cryptoId)
    
    // Créer un nouvel item avec la date actuelle
    const toList = watchlists.find(l => l.id === toListId)
    if (toList) {
      addToWatchlist(toListId, item)
    }
  }

  // Épingler/désépingler une liste
  const togglePinWatchlist = (listId: string) => {
    updateWatchlist(listId, { 
      isPinned: !watchlists.find(l => l.id === listId)?.isPinned 
    })
  }

  // Vérifier si une crypto est dans une liste
  const isInWatchlist = (listId: string, cryptoId: string): boolean => {
    const list = watchlists.find(l => l.id === listId)
    return list?.items.some(item => item.id === cryptoId) || false
  }

  // Obtenir toutes les listes contenant une crypto
  const getListsContainingCrypto = (cryptoId: string): Watchlist[] => {
    return watchlists.filter(list => 
      list.items.some(item => item.id === cryptoId)
    )
  }

  // Compter le nombre total de cryptos suivies
  const getTotalWatchedCryptos = (): number => {
    const allCryptoIds = new Set()
    watchlists.forEach(list => {
      list.items.forEach(item => {
        allCryptoIds.add(item.id)
      })
    })
    return allCryptoIds.size
  }

  // Obtenir les statistiques d'une liste
  const getWatchlistStats = (listId: string) => {
    const list = watchlists.find(l => l.id === listId)
    if (!list) return null

    const items = list.items
    const totalValue = items.reduce((sum, item) => sum + item.current_price, 0)
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
      lastUpdated: list.updatedAt
    }
  }

  // Rechercher dans les listes
  const searchInWatchlists = (query: string): { list: Watchlist, items: WatchlistItem[] }[] => {
    const lowerQuery = query.toLowerCase()
    return watchlists.map(list => ({
      list,
      items: list.items.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.symbol.toLowerCase().includes(lowerQuery) ||
        (item.notes && item.notes.toLowerCase().includes(lowerQuery))
      )
    })).filter(result => result.items.length > 0)
  }

  // Exporter les listes
  const exportWatchlists = () => {
    const exportData = {
      watchlists,
      exportDate: new Date(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crypto-watchlists-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Importer des listes
  const importWatchlists = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)
          if (importData.watchlists && Array.isArray(importData.watchlists)) {
            const importedLists = importData.watchlists.map((list: any) => ({
              ...list,
              id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date(list.createdAt),
              updatedAt: new Date(),
              items: list.items.map((item: any) => ({
                ...item,
                addedAt: new Date(item.addedAt)
              }))
            }))
            
            const updated = [...watchlists, ...importedLists]
            saveWatchlists(updated)
            resolve(importedLists.length)
          } else {
            reject(new Error('Format de fichier invalide'))
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'))
      reader.readAsText(file)
    })
  }

  return {
    // État
    watchlists,
    activeWatchlist,
    loading,
    
    // Actions de base
    setActiveWatchlist,
    createWatchlist,
    deleteWatchlist,
    updateWatchlist,
    
    // Gestion des items
    addToWatchlist,
    removeFromWatchlist,
    moveBetweenLists,
    
    // Utilitaires
    togglePinWatchlist,
    isInWatchlist,
    getListsContainingCrypto,
    getTotalWatchedCryptos,
    getWatchlistStats,
    searchInWatchlists,
    
    // Import/Export
    exportWatchlists,
    importWatchlists,
    
    // Getters
    pinnedWatchlists: watchlists.filter(l => l.isPinned),
    unpinnedWatchlists: watchlists.filter(l => !l.isPinned),
    currentWatchlist: watchlists.find(l => l.id === activeWatchlist) || null
  }
}