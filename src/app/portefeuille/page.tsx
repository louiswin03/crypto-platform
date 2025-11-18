"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Edit3, X, Coins, Sparkles, History } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import BinanceConnection from '@/components/BinanceConnection'
import BinanceBalances from '@/components/BinanceBalances'
import CoinbaseConnection from '@/components/CoinbaseConnection'
import CoinbaseBalances from '@/components/CoinbaseBalances'
import KrakenConnection from '@/components/KrakenConnection'
import KrakenBalances from '@/components/KrakenBalances'
import PortfolioManager from '@/components/PortfolioManager'
import ConsolidatedPortfolioView from '@/components/ConsolidatedPortfolioView'
import React, { useState, useEffect, useMemo } from 'react'
import { DatabaseAuthService } from '@/services/databaseAuthService'
import { useAuth } from '@/hooks/useAuth'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices'
import { useLanguage } from '@/contexts/LanguageContext'

// Types pour le portfolio manuel
interface Holding {
  id: string
  cryptoId: string
  symbol: string
  name: string
  quantity: number
  avgPurchasePrice: number
  currentPrice: number
  image?: string
  priceChange24h: number
  lastUpdated: string
}

interface CoinSuggestion {
  id: string
  symbol: string
  name: string
  current_price: number
  image: string
  market_cap_rank: number
  price_change_percentage_24h: number
}

interface CoinGeckoPrice {
  id: string
  current_price: number
  price_change_percentage_24h: number
}

interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  is_default: boolean
  total_value_usd: number | null
  created_at: string
  sources?: {
    manual: boolean
    binance: boolean
    coinbase: boolean
    kraken: boolean
  }
}

// Composant du portfolio manuel
function ManualPortfolioSection({ portfolioId, onTransactionAdded }: { portfolioId: string | null, onTransactionAdded?: () => void }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [manualHoldings, setManualHoldings] = useState<Holding[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showValues, setShowValues] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)
  const [selectedCryptoForTransactions, setSelectedCryptoForTransactions] = useState<string | null>(null)
  const [preselectedCrypto, setPreselectedCrypto] = useState<CoinSuggestion | null>(null)

  // AJOUT : Hook pour récupérer les données et images des cryptos
  const { prices, formatters } = useExtendedCoinGeckoPrices(50)

  // Mapping des images depuis CoinGecko
  const getCryptoImage = (cryptoId: string) => {
    const cryptoData = prices.find(coin => coin.id === cryptoId)
    return cryptoData?.image || null
  }

  // Charger les holdings depuis l'API
  const loadHoldings = async () => {
    if (!user || !portfolioId) return

    setIsLoading(true)
    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        console.error('Token d\'authentification manquant')
        return
      }

      const response = await fetch(`/api/holdings?portfolio_id=${portfolioId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Erreur chargement holdings:', response.status)
        return
      }

      const { holdings: data } = await response.json()

      if (data) {
        const holdings: Holding[] = data.map((holding: any) => ({
          id: holding.id,
          cryptoId: holding.crypto_id,
          symbol: holding.symbol,
          name: holding.symbol, // On mettra à jour avec l'API
          quantity: parseFloat(holding.quantity),
          avgPurchasePrice: holding.avg_cost_usd || 0,
          currentPrice: holding.current_price_usd || 0,
          priceChange24h: 0,
          lastUpdated: new Date(holding.last_updated_at || holding.created_at).toLocaleTimeString('fr-FR'),
          image: undefined
        }))

        setManualHoldings(holdings)

        // Actualiser les prix après chargement
        if (holdings.length > 0) {
          await updatePricesForHoldings(holdings)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les holdings au montage du composant et quand le portfolio change
  useEffect(() => {
    if (portfolioId) {
      loadHoldings()
    }
  }, [user, portfolioId])

  // Actualiser les prix pour les holdings existants
  const updatePricesForHoldings = async (holdings: Holding[]) => {
    if (holdings.length === 0) return
    
    try {
      const cryptoIds = holdings.map(h => h.cryptoId)
      const updatedPrices = await updatePricesFromAPI(cryptoIds)
      
      // Vérifier si on a reçu des prix
      if (Object.keys(updatedPrices).length === 0) {
        console.warn('Aucun prix reçu de l\'API, les prix ne seront pas mis à jour')
        return
      }
      
      const updates = holdings.map(holding => {
        const apiPrice = updatedPrices[holding.cryptoId]
        if (apiPrice) {
          return {
            ...holding,
            currentPrice: apiPrice.current_price,
            priceChange24h: apiPrice.price_change_percentage_24h,
            lastUpdated: new Date().toLocaleTimeString('fr-FR')
          }
        }
        return holding
      })
      
      setManualHoldings(updates)
      
      // Mettre à jour les prix dans la DB seulement si on a des nouvelles données
      for (const holding of updates) {
        if (updatedPrices[holding.cryptoId]) {
          try {
            const authData = DatabaseAuthService.getCurrentUserFromStorage()
            if (authData) {
              await fetch(`/api/holdings/${holding.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                  'Authorization': `Bearer ${authData.token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  current_price_usd: holding.currentPrice
                })
              })
            }
          } catch (dbError) {
            console.warn('Erreur mise à jour DB (non bloquante):', dbError)
          }
        }
      }
    } catch (error) {
      console.warn('Erreur actualisation prix (non bloquante):', error)
    }
  }

  // API Functions
  const searchCoinsAPI = async (query: string): Promise<CoinSuggestion[]> => {
    if (query.length < 2) return []
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(8000) // 8 secondes timeout
        }
      )
      
      if (!response.ok) {
        console.warn(`API CoinGecko search error: ${response.status}`)
        return []
      }
      
      const data = await response.json()
      
      if (!data.coins || data.coins.length === 0) {
        return []
      }

      // Récupérer les détails des premières suggestions
      const coinIds = data.coins.slice(0, 10).map((coin: any) => coin.id).join(',')
      
      try {
        const pricesResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(8000)
          }
        )
        
        let pricesData = {}
        if (pricesResponse.ok) {
          pricesData = await pricesResponse.json()
        }
        
        const coinsWithPrices = data.coins.slice(0, 10).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: pricesData[coin.id]?.usd || 0,
          image: coin.thumb || coin.large || '',
          market_cap_rank: coin.market_cap_rank || 999,
          price_change_percentage_24h: pricesData[coin.id]?.usd_24h_change || 0
        }))
        
        return coinsWithPrices
      } catch (priceError) {
        console.warn('Prix non disponibles, retour des résultats sans prix:', priceError)
        // Retourner les résultats même sans prix
        return data.coins.slice(0, 10).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: 0,
          image: coin.thumb || coin.large || '',
          market_cap_rank: coin.market_cap_rank || 999,
          price_change_percentage_24h: 0
        }))
      }
    } catch (error) {
      console.warn('Erreur recherche API (non bloquante):', error)
      return []
    }
  }

  const updatePricesFromAPI = async (cryptoIds: string[]): Promise<Record<string, CoinGeckoPrice>> => {
    if (cryptoIds.length === 0) return {}
    
    try {
      const ids = cryptoIds.join(',')
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          // Ajouter un timeout
          signal: AbortSignal.timeout(10000) // 10 secondes
        }
      )
      
      if (!response.ok) {
        console.warn(`API CoinGecko error: ${response.status}`)
        return {}
      }
      
      const data = await response.json()
      
      const prices: Record<string, CoinGeckoPrice> = {}
      Object.keys(data).forEach(id => {
        prices[id] = {
          id,
          current_price: data[id].usd,
          price_change_percentage_24h: data[id].usd_24h_change || 0
        }
      })
      
      return prices
    } catch (error) {
      console.warn('Erreur API CoinGecko (non bloquante):', error)
      // Retourner un objet vide au lieu de faire crasher
      return {}
    }
  }

  const refreshPrices = async () => {
    setIsRefreshing(true)
    await updatePricesForHoldings(manualHoldings)
    setIsRefreshing(false)
  }

  const addHolding = async (newHolding: Omit<Holding, 'id' | 'lastUpdated'>) => {
    if (!user) return

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        console.error('Token d\'authentification manquant')
        return
      }

      // Sauvegarder en DB via API
      const payload = {
        portfolio_id: portfolioId,
        crypto_id: newHolding.cryptoId,
        symbol: newHolding.symbol,
        quantity: newHolding.quantity,
        avg_cost_usd: newHolding.avgPurchasePrice,
        current_price_usd: newHolding.currentPrice
      }


      const response = await fetch('/api/holdings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })


      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erreur sauvegarde - Status:', response.status)
        console.error('❌ Erreur sauvegarde - Response:', errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText }
        }

        alert(`Erreur lors de la sauvegarde: ${errorData.error || 'Erreur inconnue'}`)
        return
      }

      const { holding: data } = await response.json()

      // Ajouter au state local
      const holding: Holding = {
        id: data.id,
        cryptoId: data.crypto_id,
        symbol: data.symbol,
        name: data.symbol,
        quantity: parseFloat(data.quantity),
        avgPurchasePrice: data.avg_cost_usd,
        currentPrice: data.current_price_usd,
        priceChange24h: 0,
        lastUpdated: new Date().toLocaleTimeString()
      }
      setManualHoldings(prev => [...prev, holding])

      // Déclencher le rafraîchissement du portfolio consolidé
      onTransactionAdded?.()
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    }
  }

  const updateHolding = async (id: string, updatedHolding: Partial<Holding>) => {
    if (!user) return

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        console.error('Token d\'authentification manquant')
        return
      }

      const apiUpdates: any = {}

      if (updatedHolding.quantity !== undefined) apiUpdates.quantity = updatedHolding.quantity
      if (updatedHolding.avgPurchasePrice !== undefined) apiUpdates.avg_cost_usd = updatedHolding.avgPurchasePrice
      if (updatedHolding.currentPrice !== undefined) apiUpdates.current_price_usd = updatedHolding.currentPrice

      const response = await fetch(`/api/holdings/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiUpdates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erreur mise à jour:', errorData)
        alert('Erreur lors de la mise à jour. Veuillez réessayer.')
        return
      }

      // Mettre à jour le state local
      setManualHoldings(prev => prev.map(holding =>
        holding.id === id
          ? { ...holding, ...updatedHolding, lastUpdated: new Date().toLocaleTimeString() }
          : holding
      ))

      // Déclencher le rafraîchissement du portfolio consolidé
      onTransactionAdded?.()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour. Veuillez réessayer.')
    }
  }

  const deleteHolding = async (id: string) => {
    if (!user) return

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        console.error('Token d\'authentification manquant')
        return
      }

      const response = await fetch(`/api/holdings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erreur suppression:', errorData)
        alert('Erreur lors de la suppression. Veuillez réessayer.')
        return
      }

      // Supprimer du state local
      setManualHoldings(prev => prev.filter(holding => holding.id !== id))

      // Déclencher le rafraîchissement du portfolio consolidé
      onTransactionAdded?.()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression. Veuillez réessayer.')
    }
  }

  const formatCurrency = (amount: number) => {
    return showValues ? 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) :
      '••••••'
  }

  const formatNumber = (num: number, decimals = 4) => {
    return showValues ? num.toLocaleString('fr-FR', { maximumFractionDigits: decimals }) : '••••••'
  }

  // Calculs pour les stats avec regroupement par crypto
  const consolidatedHoldings = React.useMemo(() => {
    const grouped = manualHoldings.reduce((acc, holding) => {
      const existing = acc.find(h => h.cryptoId === holding.cryptoId)
      
      if (existing) {
        // Calculer le prix moyen pondéré
        const totalInvested = (existing.quantity * existing.avgPurchasePrice) + (holding.quantity * holding.avgPurchasePrice)
        const totalQuantity = existing.quantity + holding.quantity
        
        existing.quantity = totalQuantity
        existing.avgPurchasePrice = totalInvested / totalQuantity
        existing.lastUpdated = holding.lastUpdated > existing.lastUpdated ? holding.lastUpdated : existing.lastUpdated
      } else {
        acc.push({ ...holding })
      }
      
      return acc
    }, [] as Holding[])

    // Ajouter les calculs pour chaque position consolidée
    return grouped.map(holding => {
      const currentValue = holding.quantity * holding.currentPrice
      const investedValue = holding.quantity * holding.avgPurchasePrice
      const pnlAmount = currentValue - investedValue
      const pnlPercent = investedValue > 0 ? (pnlAmount / investedValue) * 100 : 0
      
      return {
        ...holding,
        currentValue,
        investedValue,
        pnlAmount,
        pnlPercent
      }
    }).sort((a, b) => b.currentValue - a.currentValue) // Trier par valeur décroissante
  }, [manualHoldings])

  const totalValue = consolidatedHoldings.reduce((sum, holding) => sum + holding.currentValue, 0)
  const totalInvested = consolidatedHoldings.reduce((sum, holding) => sum + holding.investedValue, 0)
  const totalPnL = totalValue - totalInvested
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  // Calculer les allocations
  const holdingsWithAllocation = consolidatedHoldings.map(holding => ({
    ...holding,
    allocation: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0
  }))

  return (
    <div className="mb-12">
      {/* Simplified Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB] flex items-center gap-2">
            <History className="w-5 h-5 text-[#00FF88]" />
            Transactions Manuelles
          </h2>
          <p className="text-gray-400 text-sm mt-1">Gérez vos transactions crypto manuelles</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm"
          >
            {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshPrices}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-[#00FF88] hover:bg-[#8B5CF6] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('portfolio.add')}
          </button>
        </div>
      </div>

      {/* Simplified Table Portfolio Manuel */}
      <div className="glass-effect rounded-xl border border-gray-800/40 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#00FF88] mb-3"></div>
            <div className="text-gray-400 text-sm">Chargement de votre portfolio...</div>
          </div>
        ) : manualHoldings.length > 0 ? (
          <>
            <div className="border-b border-gray-800/40 bg-gray-900/30">
              <div className="grid grid-cols-8 gap-4 p-4 text-gray-400 font-medium text-xs uppercase tracking-wide">
                <div className="col-span-2">Asset</div>
                <div className="text-right">{t('portfolio.current_price')}</div>
                <div className="text-right">24h</div>
                <div className="text-right">{t('portfolio.quantity')}</div>
                <div className="text-right">{t('portfolio.avg_price')}</div>
                <div className="text-right">{t('portfolio.value')}</div>
                <div className="text-right">P&L</div>
                <div className="text-center">Actions</div>
              </div>
            </div>
            <div>
              {holdingsWithAllocation.map((holding) => {
                return (
                  <div key={holding.cryptoId} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                    <div className="grid grid-cols-8 gap-4 p-4 items-center">
                      <div className="col-span-2 flex items-center space-x-3">
                        {getCryptoImage(holding.cryptoId) ? (
                          <img
                            src={getCryptoImage(holding.cryptoId)}
                            alt={holding.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88] via-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold">
                            {holding.symbol[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#F9FAFB]">{holding.symbol}</div>
                          <div className="text-gray-400 text-xs">{holding.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-medium text-[#F9FAFB]">{formatCurrency(holding.currentPrice)}</div>
                        <div className="text-xs text-gray-400">{holding.lastUpdated}</div>
                      </div>

                      <div className={`text-right font-mono font-medium flex items-center justify-end space-x-1 ${
                        holding.priceChange24h >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                      }`}>
                        {holding.priceChange24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-sm">{showValues ? `${holding.priceChange24h >= 0 ? '+' : ''}${holding.priceChange24h.toFixed(1)}%` : '••••'}</span>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-[#F9FAFB] font-medium">{formatNumber(holding.quantity)}</div>
                        <div className="text-xs text-gray-400">
                          {showValues ? formatCurrency(holding.investedValue) : '••••••'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-[#F9FAFB] font-medium">{formatCurrency(holding.avgPurchasePrice)}</div>
                        <div className="text-xs text-gray-400">Prix moyen</div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-[#F9FAFB]">{formatCurrency(holding.currentValue)}</div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold ${holding.pnlAmount >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                          {showValues ? formatCurrency(holding.pnlAmount) : '••••••'}
                        </div>
                        <div className={`text-xs font-mono ${holding.pnlAmount >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                          {showValues ? `${holding.pnlPercent >= 0 ? '+' : ''}${holding.pnlPercent.toFixed(1)}%` : '••••'}
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            // Voir et gérer les transactions pour cette crypto
                            setSelectedCryptoForTransactions(holding.cryptoId)
                            setShowTransactionsModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 rounded-lg transition-all"
                          title="Historique des transactions"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Pré-remplir avec cette crypto
                            setPreselectedCrypto({
                              id: holding.cryptoId,
                              symbol: holding.symbol,
                              name: holding.name,
                              current_price: holding.currentPrice,
                              image: getCryptoImage(holding.cryptoId) || '',
                              market_cap_rank: 1,
                              price_change_percentage_24h: holding.priceChange24h
                            })
                            setShowAddModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 rounded-lg transition-all"
                          title={t('portfolio.add_transaction')}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">{t('portfolio.empty_portfolio')}</div>
            <div className="text-gray-500 text-sm mb-4">{t('portfolio.add_first')}</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-[#00FF88] hover:bg-[#8B5CF6] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('portfolio.add_first_crypto')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal d'ajout/édition */}
      {(showAddModal || editingHolding) && (
        <AddEditHoldingModal
          holding={editingHolding}
          preselectedCrypto={preselectedCrypto}
          onSave={(holding) => {
            if (editingHolding) {
              updateHolding(editingHolding.id, holding)
              setEditingHolding(null)
            } else {
              addHolding(holding)
              setShowAddModal(false)
            }
          }}
          onCancel={() => {
            setShowAddModal(false)
            setEditingHolding(null)
            setPreselectedCrypto(null)
          }}
          searchCoinsAPI={searchCoinsAPI}
          updatePricesFromAPI={updatePricesFromAPI}
          t={t}
        />
      )}

      {/* Modal de gestion des transactions */}
      {showTransactionsModal && selectedCryptoForTransactions && (
        <TransactionsManagerModal
          cryptoId={selectedCryptoForTransactions}
          transactions={manualHoldings.filter(h => h.cryptoId === selectedCryptoForTransactions)}
          onClose={() => {
            setShowTransactionsModal(false)
            setSelectedCryptoForTransactions(null)
          }}
          onUpdateTransaction={updateHolding}
          onDeleteTransaction={deleteHolding}
          getCryptoImage={getCryptoImage}
          t={t}
        />
      )}
    </div>
  )
}

// Composant de diagramme de répartition du portfolio
function PortfolioAllocationChart({ holdings }: { holdings: Array<{ symbol: string; allocation: number; currentValue: number }> }) {
  const { t } = useLanguage()
  const [selectedSegment, setSelectedSegment] = React.useState<string | null>(null)
  const [hoveredSegment, setHoveredSegment] = React.useState<string | null>(null)

  const radius = 80
  const center = 100
  const circumference = 2 * Math.PI * radius

  // Trier par allocation décroissante et prendre les 6 plus importantes
  const topHoldings = holdings
    .filter(h => h.allocation > 0)
    .sort((a, b) => b.allocation - a.allocation)
    .slice(0, 6)

  // Grouper les autres dans "Autres"
  const otherAllocation = holdings
    .filter(h => h.allocation > 0)
    .slice(6)
    .reduce((sum, h) => sum + h.allocation, 0)

  const displayHoldings = [...topHoldings]
  if (otherAllocation > 0) {
    displayHoldings.push({
      symbol: 'Autres',
      allocation: otherAllocation,
      currentValue: holdings.slice(6).reduce((sum, h) => sum + h.currentValue, 0)
    })
  }

  // Calculer les segments avec logique d'explosion
  let cumulativePercentage = 0
  const segments = displayHoldings.map((holding, index) => {
    const strokeDasharray = `${(holding.allocation / 100) * circumference} ${circumference}`
    const strokeDashoffset = -cumulativePercentage * circumference / 100
    cumulativePercentage += holding.allocation

    const hue = 220 + index * 45 // Distribution des couleurs
    const color = `hsl(${hue}, 70%, 60%)`

    // Calculer l'angle pour l'effet d'explosion
    const segmentAngle = (cumulativePercentage - holding.allocation / 2) * 360 / 100
    const isSelected = selectedSegment === holding.symbol
    const isHovered = hoveredSegment === holding.symbol

    // Pas d'explosion, juste des effets visuels
    const explodeX = 0
    const explodeY = 0

    return {
      ...holding,
      strokeDasharray,
      strokeDashoffset,
      color,
      explodeX,
      explodeY,
      isSelected,
      isHovered,
      segmentAngle
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const handleSegmentClick = (symbol: string) => {
    setSelectedSegment(selectedSegment === symbol ? null : symbol)
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-lg font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-[#00FF88]" />
        {t('portfolio.allocation')}
      </h3>

      <div className="flex flex-col items-center space-y-6">
        {/* Diagramme circulaire interactif amélioré */}
        <div className="relative">
          <svg width="260" height="260" className="transform -rotate-90">
            {/* Cercle de fond avec style amélioré */}
            <circle
              cx={130}
              cy={130}
              r={radius}
              fill="transparent"
              stroke="rgba(75, 85, 99, 0.15)"
              strokeWidth="6"
            />

            {/* Segments avec effet de contour simple */}
            {segments.map((segment, index) => (
              <g key={index}>
                {/* Segment principal */}
                <circle
                  cx={130}
                  cy={130}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="14"
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-300 ease-out"
                  style={{
                    filter: segment.isSelected
                      ? `drop-shadow(0 0 15px ${segment.color}80) brightness(1.3)`
                      : segment.isHovered
                        ? `drop-shadow(0 0 10px ${segment.color}60) brightness(1.1)`
                        : `drop-shadow(0 0 4px ${segment.color}30)`
                  }}
                  onClick={() => handleSegmentClick(segment.symbol)}
                  onMouseEnter={() => setHoveredSegment(segment.symbol)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />

                {/* Contour blanc pour le segment sélectionné */}
                {segment.isSelected && (
                  <circle
                    cx={130}
                    cy={130}
                    r={radius}
                    fill="transparent"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="round"
                    className="pointer-events-none"
                    style={{
                      filter: `drop-shadow(0 0 8px rgba(255,255,255,0.8))`
                    }}
                  />
                )}

                {/* Contour coloré externe pour le segment sélectionné */}
                {segment.isSelected && (
                  <circle
                    cx={130}
                    cy={130}
                    r={radius + 2}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="2"
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="round"
                    className="pointer-events-none animate-pulse"
                    style={{
                      opacity: 0.6
                    }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Centre du diagramme avec infos dynamiques */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-gray-900/95 backdrop-blur-md rounded-full w-32 h-32 flex flex-col items-center justify-center border border-gray-700/50 shadow-2xl">
              {selectedSegment ? (
                <>
                  <div className="text-lg font-bold text-[#00FF88]">{selectedSegment}</div>
                  <div className="text-gray-400 text-xs">
                    {segments.find(s => s.symbol === selectedSegment)?.allocation.toFixed(1)}%
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#F9FAFB]">{displayHoldings.length}</div>
                  <div className="text-gray-400 text-xs">{t('portfolio.assets')}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Légende interactive */}
        <div className="w-full space-y-3">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`flex items-center justify-between group rounded-lg p-3 transition-all duration-300 cursor-pointer ${
                segment.isSelected
                  ? 'bg-[#00FF88]/20 border border-[#00FF88]/40 shadow-lg'
                  : 'hover:bg-gray-800/30 border border-transparent'
              }`}
              onClick={() => handleSegmentClick(segment.symbol)}
              onMouseEnter={() => setHoveredSegment(segment.symbol)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                    segment.isSelected || segment.isHovered
                      ? 'border-white/60 scale-125 shadow-lg'
                      : 'border-white/20'
                  }`}
                  style={{
                    backgroundColor: segment.color,
                    boxShadow: segment.isSelected || segment.isHovered ? `0 0 12px ${segment.color}60` : 'none'
                  }}
                ></div>
                <span className={`font-medium transition-colors duration-300 ${
                  segment.isSelected
                    ? 'text-[#00FF88] font-bold'
                    : segment.isHovered
                      ? 'text-[#8B5CF6]'
                      : 'text-[#F9FAFB] group-hover:text-[#00FF88]'
                }`}>
                  {segment.symbol}
                </span>
                {segment.isSelected && (
                  <div className="text-xs text-[#00FF88] font-medium bg-[#00FF88]/20 px-2 py-1 rounded-full animate-pulse">
                    SÉLECTIONNÉ
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-semibold transition-colors duration-300 ${
                  segment.isSelected ? 'text-[#00FF88]' : 'text-[#F9FAFB]'
                }`}>
                  {segment.allocation.toFixed(1)}%
                </div>
                <div className="font-mono text-xs text-gray-400">
                  {formatCurrency(segment.currentValue)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instruction pour l'utilisateur */}
        <div className="text-center mt-4">
          <div className="text-xs text-gray-400 bg-gray-800/30 rounded-lg px-4 py-2 border border-gray-700/30">
            {t('portfolio.click_highlight')}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de gestion des transactions par crypto
function TransactionsManagerModal({
  cryptoId,
  transactions,
  onClose,
  onUpdateTransaction,
  onDeleteTransaction,
  getCryptoImage,
  t
}: {
  cryptoId: string
  transactions: Holding[]
  onClose: () => void
  onUpdateTransaction: (id: string, updates: Partial<Holding>) => void
  onDeleteTransaction: (id: string) => void
  getCryptoImage: (cryptoId: string) => string | null
  t: (key: string) => string
}) {
  const [editingTransaction, setEditingTransaction] = useState<Holding | null>(null)

  const cryptoName = transactions[0]?.name || transactions[0]?.symbol || 'Crypto'
  const cryptoSymbol = transactions[0]?.symbol || ''

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatNumber = (num: number, decimals = 4) => {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: decimals })
  }

  // Calculer les totaux
  const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0)
  const totalInvested = transactions.reduce((sum, t) => sum + (t.quantity * t.avgPurchasePrice), 0)
  const avgPrice = totalInvested / totalQuantity
  const currentValue = totalQuantity * (transactions[0]?.currentPrice || 0)
  const pnl = currentValue - totalInvested

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl border border-gray-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getCryptoImage(cryptoId) ? (
              <img
                src={getCryptoImage(cryptoId)}
                alt={cryptoName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88] via-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold">
                {cryptoSymbol[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-[#F9FAFB]">
                Transactions {cryptoSymbol}
              </h2>
              <p className="text-gray-400 text-sm">{transactions.length} transaction{transactions.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#F9FAFB] p-2 hover:bg-gray-800/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-effect rounded-lg p-3 border border-gray-700/50">
            <div className="text-gray-400 text-xs mb-1">Total Détenu</div>
            <div className="font-mono font-bold text-[#F9FAFB]">{formatNumber(totalQuantity)}</div>
          </div>
          <div className="glass-effect rounded-lg p-3 border border-gray-700/50">
            <div className="text-gray-400 text-xs mb-1">{t('portfolio.avg_price')}</div>
            <div className="font-mono font-bold text-[#F9FAFB]">{formatCurrency(avgPrice)}</div>
          </div>
          <div className="glass-effect rounded-lg p-3 border border-gray-700/50">
            <div className="text-gray-400 text-xs mb-1">Valeur Actuelle</div>
            <div className="font-mono font-bold text-[#F9FAFB]">{formatCurrency(currentValue)}</div>
          </div>
          <div className="glass-effect rounded-lg p-3 border border-gray-700/50">
            <div className="text-gray-400 text-xs mb-1">P&L Total</div>
            <div className={`font-mono font-bold ${pnl >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
              {formatCurrency(pnl)}
            </div>
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="glass-effect rounded-xl border border-gray-800/40 overflow-hidden">
          {/* En-têtes fixes */}
          <div className="border-b border-gray-800/40 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
            <div className="grid grid-cols-6 gap-4 p-3 text-gray-400 font-medium text-xs uppercase tracking-wide">
              <div>{t('portfolio.quantity')}</div>
              <div className="text-right">{t('portfolio.purchase_price')}</div>
              <div className="text-right">{t('portfolio.total_invested')}</div>
              <div className="text-right">{t('portfolio.value')}</div>
              <div className="text-right">P&L</div>
              <div className="text-center">Actions</div>
            </div>
          </div>

          {/* Zone de scroll pour les transactions */}
          <div className="max-h-80 overflow-y-auto">

          <div>
            {transactions.map((transaction, index) => {
              const investedValue = transaction.quantity * transaction.avgPurchasePrice
              const currentTransactionValue = transaction.quantity * transaction.currentPrice
              const transactionPnL = currentTransactionValue - investedValue
              const transactionPnLPercent = (transactionPnL / investedValue) * 100

              return (
                <div key={transaction.id} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div>
                      <div className="font-mono font-semibold text-[#F9FAFB]">{formatNumber(transaction.quantity)}</div>
                      <div className="text-xs text-gray-400">Transaction #{index + 1}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-[#F9FAFB]">{formatCurrency(transaction.avgPurchasePrice)}</div>
                      <div className="text-xs text-gray-400">Par unité</div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-[#F9FAFB]">{formatCurrency(investedValue)}</div>
                      <div className="text-xs text-gray-400">Coût total</div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-[#F9FAFB]">{formatCurrency(currentTransactionValue)}</div>
                      <div className="text-xs text-gray-400">Valeur maintenant</div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold ${transactionPnL >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                        {formatCurrency(transactionPnL)}
                      </div>
                      <div className={`text-xs font-mono ${transactionPnL >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                        {transactionPnL >= 0 ? '+' : ''}{transactionPnLPercent.toFixed(1)}%
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="p-2 text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 rounded-lg transition-all"
                        title={t('portfolio.modify_transaction')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t('portfolio.delete_transaction_confirm'))) {
                            onDeleteTransaction(transaction.id)
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg transition-all"
                        title={t('portfolio.delete_transaction')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        </div>

        {/* Footer avec boutons d'action */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-400">
            💡 Vous pouvez modifier ou supprimer chaque transaction individuellement
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#00FF88] hover:bg-[#8B5CF6] text-white rounded-lg transition-colors font-medium"
          >
            Fermer
          </button>
        </div>

        {/* Modal d'édition de transaction */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <div className="glass-effect rounded-2xl border border-gray-700 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#F9FAFB]">{t('portfolio.modify_transaction')}</h3>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="text-gray-400 hover:text-[#F9FAFB]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">{t('portfolio.quantity')}</label>
                  <input
                    type="number"
                    step="any"
                    defaultValue={editingTransaction.quantity}
                    id="edit-quantity"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Prix d'achat ($)</label>
                  <input
                    type="number"
                    step="any"
                    defaultValue={editingTransaction.avgPurchasePrice}
                    id="edit-price"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-[#F9FAFB] rounded-xl hover:bg-gray-700/50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    const quantityInput = document.getElementById('edit-quantity') as HTMLInputElement
                    const priceInput = document.getElementById('edit-price') as HTMLInputElement

                    if (quantityInput && priceInput) {
                      onUpdateTransaction(editingTransaction.id, {
                        quantity: parseFloat(quantityInput.value),
                        avgPurchasePrice: parseFloat(priceInput.value)
                      })
                      setEditingTransaction(null)
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-[#00FF88] hover:bg-[#8B5CF6] text-white rounded-xl transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Modal d'ajout/édition
function AddEditHoldingModal({
  holding,
  preselectedCrypto,
  onSave,
  onCancel,
  searchCoinsAPI,
  updatePricesFromAPI,
  t
}: {
  holding: Holding | null
  preselectedCrypto?: CoinSuggestion | null
  onSave: (holding: Omit<Holding, 'id' | 'lastUpdated'>) => void
  onCancel: () => void
  searchCoinsAPI: (query: string) => Promise<CoinSuggestion[]>
  updatePricesFromAPI: (cryptoIds: string[]) => Promise<Record<string, CoinGeckoPrice>>
  t: (key: string) => string
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<CoinSuggestion[]>([])
  const [selectedCoin, setSelectedCoin] = useState<CoinSuggestion | null>(null)
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (holding) {
      // Mode édition : pré-remplir avec les données existantes
      setSelectedCoin({
        id: holding.cryptoId,
        symbol: holding.symbol,
        name: holding.name,
        current_price: holding.currentPrice,
        image: holding.image || '',
        market_cap_rank: 1,
        price_change_percentage_24h: holding.priceChange24h
      })
      setQuantity(holding.quantity.toString())
      setAvgPrice(holding.avgPurchasePrice.toString())
      setSearchTerm(holding.name)
    } else if (preselectedCrypto) {
      // Mode ajout avec crypto pré-sélectionnée : pré-remplir seulement la crypto
      setSelectedCoin(preselectedCrypto)
      setSearchTerm(preselectedCrypto.name)
      // Laisser quantité et prix vides pour l'utilisateur
    }
  }, [holding, preselectedCrypto])

  const searchCoins = async (term: string) => {
    if (term.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const results = await searchCoinsAPI(term)
      setSuggestions(results)
    } catch (error) {
      console.error('Erreur recherche:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchCoins(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleSave = async () => {
    if (!selectedCoin || !quantity || !avgPrice) return

    let currentPrice = selectedCoin.current_price
    let priceChange24h = selectedCoin.price_change_percentage_24h

    if (currentPrice === 0) {
      try {
        const prices = await updatePricesFromAPI([selectedCoin.id])
        const apiPrice = prices[selectedCoin.id]
        if (apiPrice) {
          currentPrice = apiPrice.current_price
          priceChange24h = apiPrice.price_change_percentage_24h
        }
      } catch (error) {
        console.error('Erreur récupération prix:', error)
        currentPrice = 1
      }
    }

    const newHolding = {
      cryptoId: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      quantity: parseFloat(quantity),
      avgPurchasePrice: parseFloat(avgPrice),
      currentPrice: currentPrice,
      priceChange24h: priceChange24h,
      image: selectedCoin.image
    }

    onSave(newHolding)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl border border-gray-700 p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#F9FAFB]">
            {holding ? t('portfolio.modify_position') : t('portfolio.add_position')}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-[#F9FAFB]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Recherche de crypto */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Cryptomonnaie
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('portfolio.search_crypto')}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
              />
            </div>
            
            {/* Suggestions */}
            {suggestions.length > 0 && !selectedCoin && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-effect rounded-xl border border-gray-700 max-h-60 overflow-y-auto z-10">
                {suggestions.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => {
                      setSelectedCoin(coin)
                      setSearchTerm(coin.name)
                      setSuggestions([])
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/40 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                    <div className="flex-1 text-left">
                      <div className="text-[#F9FAFB] font-medium">{coin.name}</div>
                      <div className="text-gray-400 text-sm">{coin.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#F9FAFB] text-sm">
                        {coin.current_price > 0 ? 
                          coin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) :
                          t('portfolio.loading_price')
                        }
                      </div>
                      <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                        {coin.price_change_percentage_24h !== 0 ? 
                          `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(1)}%` :
                          '--'
                        }
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Crypto sélectionnée */}
            {selectedCoin && (
              <div className="mt-3 p-3 bg-gray-800/40 rounded-xl flex items-center gap-3">
                {selectedCoin.image && selectedCoin.image !== '' ? (
                  <img src={selectedCoin.image} alt={selectedCoin.name} className="w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {selectedCoin.symbol[0]}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-[#F9FAFB] font-medium">{selectedCoin.name}</div>
                  <div className="text-gray-400 text-sm">{selectedCoin.symbol}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCoin(null)
                    setSearchTerm('')
                  }}
                  className="text-gray-400 hover:text-[#F9FAFB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Quantité
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
            />
          </div>

          {/* Prix moyen d'achat */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              {t('portfolio.avg_purchase_price')}
            </label>
            <input
              type="number"
              step="any"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
            />
            {selectedCoin && (
              <div className="mt-2 text-sm text-gray-400">
                {t('portfolio.current_price_label')} {selectedCoin.current_price > 0 ? 
                  selectedCoin.current_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) :
                  'Chargement...'
                }
              </div>
            )}
          </div>

          {/* Calcul automatique */}
          {selectedCoin && quantity && avgPrice && selectedCoin.current_price > 0 && (
            <div className="p-4 bg-gray-800/30 rounded-xl">
              <div className="text-sm text-gray-300 mb-2">Résumé :</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Investissement :</span>
                <span className="text-[#F9FAFB] font-medium font-mono">
                  {(parseFloat(quantity) * parseFloat(avgPrice)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valeur actuelle :</span>
                <span className="text-[#F9FAFB] font-medium font-mono">
                  {(parseFloat(quantity) * selectedCoin.current_price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400">P&L :</span>
                {(() => {
                  const pnl = (parseFloat(quantity) * selectedCoin.current_price) - (parseFloat(quantity) * parseFloat(avgPrice))
                  const pnlPercent = (pnl / (parseFloat(quantity) * parseFloat(avgPrice))) * 100
                  return (
                    <span className={`font-bold font-mono ${pnl >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                      {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                      ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                    </span>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-[#F9FAFB] rounded-xl hover:bg-gray-700/50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCoin || !quantity || !avgPrice}
            className="flex-1 px-4 py-3 bg-[#00FF88] hover:bg-[#8B5CF6] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {holding ? t('portfolio.modify') : t('portfolio.add')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PortefeuillePage() {
  const { t } = useLanguage()
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [binanceConnected, setBinanceConnected] = useState(false)
  const [binanceBalance, setBinanceBalance] = useState(0)
  const [coinbaseConnected, setCoinbaseConnected] = useState(false)
  const [coinbaseBalance, setCoinbaseBalance] = useState(0)
  const [krakenConnected, setKrakenConnected] = useState(false)
  const [krakenBalance, setKrakenBalance] = useState(0)

  const exchanges = [
    {
      name: 'Binance',
      logo: '/Binance.png',
      connected: binanceConnected,
      status: binanceConnected ? 'active' : 'disconnected',
      balance: binanceBalance
    },
    {
      name: 'Coinbase',
      logo: '/coinbase.png',
      connected: coinbaseConnected,
      status: coinbaseConnected ? 'active' : 'disconnected',
      balance: coinbaseBalance
    },
    {
      name: 'Kraken',
      logo: '/kraken.png',
      connected: krakenConnected,
      status: krakenConnected ? 'active' : 'disconnected',
      balance: krakenBalance
    },
  ]

  const holdings: any[] = []
  const transactions: any[] = []

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatCrypto = (amount: number) => {
    return amount.toLocaleString('fr-FR', { maximumFractionDigits: 8 })
  }

  const totalBalance = holdings.reduce((sum, holding) => sum + holding.valueEur, 0)

  return (
    <ProtectedRoute>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
        }
        
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-effect-strong {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                      0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease-in-out infinite;
        }

        .font-display {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 700;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>

        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#8B5CF6]/10 via-[#00D9FF]/6 to-transparent rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#FFA366]/8 to-transparent rounded-full blur-[100px]"></div>
        </div>

        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          {/* Simplified Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {t('portfolio.title')}
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  {t('portfolio.track_investments')}
                </p>
              </div>
            </div>
          </div>

          {/* Gestionnaire de Portfolios */}
          <div className="mb-12">
            <PortfolioManager
              onPortfolioSelect={setSelectedPortfolio}
              selectedPortfolioId={selectedPortfolio?.id || null}
            />
          </div>

          {/* Vue Consolidée du Portfolio */}
          {selectedPortfolio && (
            <ConsolidatedPortfolioView
              portfolio={selectedPortfolio}
              refreshTrigger={refreshTrigger}
            />
          )}

          {/* Section manuelle pour gérer l'ajout/modification (uniquement si manuel est coché) */}
          {selectedPortfolio?.sources?.manual && (
            <div className="mt-6">
              <ManualPortfolioSection
                portfolioId={selectedPortfolio.id}
                onTransactionAdded={() => setRefreshTrigger(prev => prev + 1)}
              />
            </div>
          )}

          {/* Simplified Exchange Connections */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#F9FAFB] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#00FF88]" />
                  {t('portfolio.exchange_portfolio')}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{t('portfolio.synced_wallet')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {exchanges.map((exchange, index) => (
                <div key={exchange.name} className="glass-effect rounded-xl p-5 border border-gray-700/50 hover:border-[#00FF88]/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
                        <img src={exchange.logo} alt={exchange.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-bold text-[#F9FAFB]">{exchange.name}</div>
                        <div className="text-gray-400 text-xs">
                          {exchange.connected ? t('portfolio.connected') : t('portfolio.not_connected')}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      exchange.status === 'active'
                        ? 'bg-[#00FF88]/20 text-[#00FF88]'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {exchange.status === 'active' ? t('portfolio.active') : t('portfolio.inactive')}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-gray-400 text-xs mb-1">{t('portfolio.total_balance')}</div>
                    <div className="font-mono font-bold text-[#F9FAFB] text-xl">
                      {exchange.connected ? formatCurrency(exchange.balance) : formatCurrency(0)}
                    </div>
                    {exchange.connected && (
                      <div className="text-xs text-gray-400 mt-1">
                        {t('portfolio.last_update')}: {t('portfolio.minutes_ago').replace('{count}', '5')}
                      </div>
                    )}
                  </div>

                  {/* Composants de connexion par exchange */}
                  {exchange.name === 'Binance' ? (
                    <BinanceConnection
                      onConnectionChange={setBinanceConnected}
                      onBalanceChange={setBinanceBalance}
                    />
                  ) : exchange.name === 'Coinbase' ? (
                    <CoinbaseConnection
                      onConnectionChange={setCoinbaseConnected}
                      onBalanceChange={setCoinbaseBalance}
                    />
                  ) : exchange.name === 'Kraken' ? (
                    <KrakenConnection
                      onConnectionChange={setKrakenConnected}
                      onBalanceChange={setKrakenBalance}
                    />
                  ) : (
                    <button disabled className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-600 cursor-not-allowed text-sm font-semibold opacity-50">
                      <Key className="w-4 h-4" />
                      <span>Bientôt disponible</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Simplified Security Notice */}
            <div className="mt-6 glass-effect rounded-xl p-5 border border-[#FFA366]/30">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFA366]/20 rounded-lg">
                  <Shield className="w-5 h-5 text-[#FFA366]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#F9FAFB] mb-2 flex items-center gap-2">
                    {t('portfolio.bank_level_security')}
                    <CheckCircle className="w-4 h-4 text-[#00FF88]" />
                  </div>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-[#00FF88]" />
                      <span>{t('portfolio.api_read_only')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-3 h-3 text-[#00FF88]" />
                      <span>{t('portfolio.aes_encryption')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-[#00FF88]" />
                      <span>{t('portfolio.no_trade_withdraw')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ProtectedRoute>
  )
}