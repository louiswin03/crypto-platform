"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Edit3, X, Coins, Sparkles, History } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices'

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

// Composant du portfolio manuel
function ManualPortfolioSection() {
  const { user } = useAuth()
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

  // Charger les holdings depuis Supabase
  const loadHoldings = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .is('exchange_key_id', null) // Portfolio manuel uniquement
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur chargement holdings:', error)
        return
      }

      if (data) {
        const holdings: Holding[] = data.map(holding => ({
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

  // Charger les holdings au montage du composant
  useEffect(() => {
    loadHoldings()
  }, [user])

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
            await supabase
              .from('holdings')
              .update({ 
                current_price_usd: holding.currentPrice,
                last_updated_at: new Date().toISOString()
              })
              .eq('id', holding.id)
              .eq('user_id', user?.id)
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
      // Sauvegarder en DB
      const { data, error } = await supabase
        .from('holdings')
        .insert({
          user_id: user.id,
          crypto_id: newHolding.cryptoId,
          symbol: newHolding.symbol,
          quantity: newHolding.quantity,
          avg_cost_usd: newHolding.avgPurchasePrice,
          current_price_usd: newHolding.currentPrice,
          current_value_usd: newHolding.quantity * newHolding.currentPrice,
          unrealized_pnl_usd: (newHolding.quantity * newHolding.currentPrice) - (newHolding.quantity * newHolding.avgPurchasePrice),
          unrealized_pnl_percent: ((newHolding.currentPrice - newHolding.avgPurchasePrice) / newHolding.avgPurchasePrice) * 100,
          last_updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur sauvegarde:', error)
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
        return
      }

      // Ajouter au state local
      const holding: Holding = {
        ...newHolding,
        id: data.id,
        lastUpdated: new Date().toLocaleTimeString()
      }
      setManualHoldings(prev => [...prev, holding])
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    }
  }

  const updateHolding = async (id: string, updatedHolding: Partial<Holding>) => {
    if (!user) return

    try {
      const dbUpdates: any = {
        last_updated_at: new Date().toISOString()
      }

      if (updatedHolding.quantity !== undefined) dbUpdates.quantity = updatedHolding.quantity
      if (updatedHolding.avgPurchasePrice !== undefined) dbUpdates.avg_cost_usd = updatedHolding.avgPurchasePrice
      if (updatedHolding.currentPrice !== undefined) {
        dbUpdates.current_price_usd = updatedHolding.currentPrice
        // Recalculer les valeurs dérivées
        const holding = manualHoldings.find(h => h.id === id)
        if (holding) {
          const newCurrentValue = (updatedHolding.quantity || holding.quantity) * updatedHolding.currentPrice
          const newCostBasis = (updatedHolding.quantity || holding.quantity) * (updatedHolding.avgPurchasePrice || holding.avgPurchasePrice)
          dbUpdates.current_value_usd = newCurrentValue
          dbUpdates.unrealized_pnl_usd = newCurrentValue - newCostBasis
          dbUpdates.unrealized_pnl_percent = ((updatedHolding.currentPrice - (updatedHolding.avgPurchasePrice || holding.avgPurchasePrice)) / (updatedHolding.avgPurchasePrice || holding.avgPurchasePrice)) * 100
        }
      }

      const { error } = await supabase
        .from('holdings')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erreur mise à jour:', error)
        alert('Erreur lors de la mise à jour. Veuillez réessayer.')
        return
      }

      // Mettre à jour le state local
      setManualHoldings(prev => prev.map(holding => 
        holding.id === id 
          ? { ...holding, ...updatedHolding, lastUpdated: new Date().toLocaleTimeString() }
          : holding
      ))
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour. Veuillez réessayer.')
    }
  }

  const deleteHolding = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erreur suppression:', error)
        alert('Erreur lors de la suppression. Veuillez réessayer.')
        return
      }

      // Supprimer du state local
      setManualHoldings(prev => prev.filter(holding => holding.id !== id))
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
      {/* Header du portfolio manuel */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#F9FAFB] flex items-center gap-3">
            <Coins className="w-6 h-6 text-[#6366F1]" />
            Portfolio Manuel
          </h2>
          <p className="text-gray-400 mt-1">Gérez vos positions crypto manuellement</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowValues(!showValues)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm"
          >
            {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showValues ? 'Masquer' : 'Afficher'}
          </button>
          <button
            onClick={refreshPrices}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      {consolidatedHoldings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Valeur Totale</span>
              <div className="p-3 bg-[#16A34A]/20 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-[#16A34A]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#F9FAFB] font-mono mb-2">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-gray-400 font-medium">{consolidatedHoldings.length} assets • {manualHoldings.length} positions</div>
          </div>

          <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">P&L Total</span>
              <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${
                totalPnL >= 0 ? 'bg-[#16A34A]/20' : 'bg-[#DC2626]/20'
              }`}>
                {totalPnL >= 0 ?
                  <TrendingUp className="w-6 h-6 text-[#16A34A]" /> :
                  <TrendingDown className="w-6 h-6 text-[#DC2626]" />
                }
              </div>
            </div>
            <div className={`text-3xl font-black font-mono mb-2 ${totalPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {formatCurrency(totalPnL)}
            </div>
            <div className={`text-sm font-semibold ${totalPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {showValues ? `${totalPnL >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%` : '••••'}
            </div>
          </div>

          <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Investissement</span>
              <div className="p-3 bg-[#6366F1]/20 rounded-xl group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-[#6366F1]" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#F9FAFB] font-mono mb-2">{formatCurrency(totalInvested)}</div>
            <div className="text-sm text-gray-400 font-medium">Capital investi</div>
          </div>

          <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Meilleur Asset</span>
              <div className="p-3 bg-[#F59E0B]/20 rounded-xl group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-[#F59E0B]" />
              </div>
            </div>
            {holdingsWithAllocation.length > 0 && (
              <>
                <div className="text-2xl font-black text-[#F9FAFB] mb-2">
                  {holdingsWithAllocation.reduce((best, current) =>
                    current.pnlPercent > best.pnlPercent ? current : best
                  ).symbol}
                </div>
                <div className="text-sm text-[#16A34A] font-semibold">
                  +{holdingsWithAllocation.reduce((best, current) =>
                    current.pnlPercent > best.pnlPercent ? current : best
                  ).pnlPercent.toFixed(1)}% de gain
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table Portfolio Manuel */}
      <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1] mb-4"></div>
            <div className="text-gray-400">Chargement de votre portfolio...</div>
          </div>
        ) : manualHoldings.length > 0 ? (
          <>
            <div className="border-b border-gray-800/40 bg-gray-900/30">
              <div className="grid grid-cols-9 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                <div className="col-span-2">Asset</div>
                <div className="text-right">Prix Actuel</div>
                <div className="text-right">24h</div>
                <div className="text-right">Quantité</div>
                <div className="text-right">Prix Moyen</div>
                <div className="text-right">Valeur</div>
                <div className="text-right">P&L</div>
                <div className="text-right">Allocation</div>
                <div className="text-center">Actions</div>
              </div>
            </div>
            <div>
              {holdingsWithAllocation.map((holding) => {
                return (
                  <div key={holding.cryptoId} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                    <div className="grid grid-cols-9 gap-4 p-6 items-center">
                      <div className="col-span-2 flex items-center space-x-4">
                        {getCryptoImage(holding.cryptoId) ? (
                          <img
                            src={getCryptoImage(holding.cryptoId)}
                            alt={holding.name}
                            className="w-12 h-12 rounded-full shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {holding.symbol[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#F9FAFB] text-lg">{holding.symbol}</div>
                          <div className="text-gray-400 text-sm font-medium">{holding.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono font-semibold text-[#F9FAFB]">{formatCurrency(holding.currentPrice)}</div>
                        <div className="text-xs text-gray-400">Mis à jour {holding.lastUpdated}</div>
                      </div>
                      
                      <div className={`text-right font-mono font-semibold flex items-center justify-end space-x-1 ${
                        holding.priceChange24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}>
                        {holding.priceChange24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{showValues ? `${holding.priceChange24h >= 0 ? '+' : ''}${holding.priceChange24h.toFixed(1)}%` : '••••'}</span>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono text-[#F9FAFB] font-semibold">{formatNumber(holding.quantity)}</div>
                        <div className="text-xs text-gray-400">
                          {showValues ? formatCurrency(holding.investedValue) : '••••••'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono text-[#F9FAFB] font-semibold">{formatCurrency(holding.avgPurchasePrice)}</div>
                        <div className="text-xs text-gray-400">Prix moyen pondéré</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#F9FAFB]">{formatCurrency(holding.currentValue)}</div>
                        <div className="text-xs text-gray-400">
                          {showValues ? `${holding.allocation.toFixed(1)}% du portfolio` : '••••'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-mono font-bold ${holding.pnlAmount >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {showValues ? formatCurrency(holding.pnlAmount) : '••••••'}
                        </div>
                        <div className={`text-xs font-mono ${holding.pnlAmount >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {showValues ? `${holding.pnlPercent >= 0 ? '+' : ''}${holding.pnlPercent.toFixed(1)}%` : '••••'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2 mb-1">
                          <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                              style={{ width: `${Math.min(holding.allocation, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-xs text-gray-400 w-12 text-right">
                            {holding.allocation.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 text-right">
                          {holding.allocation >= 50 ? 'Position dominante' :
                           holding.allocation >= 25 ? 'Position importante' :
                           holding.allocation >= 10 ? 'Position significative' :
                           'Position mineure'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            // Voir et gérer les transactions pour cette crypto
                            setSelectedCryptoForTransactions(holding.cryptoId)
                            setShowTransactionsModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-all"
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
                          className="p-2 text-gray-400 hover:text-[#16A34A] hover:bg-[#16A34A]/10 rounded-lg transition-all"
                          title="Ajouter une transaction"
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
          <div className="p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">Portfolio manuel vide</div>
            <div className="text-gray-500 text-sm mb-6">Ajoutez vos premières positions crypto manuellement</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter ma première crypto</span>
            </button>
          </div>
        )}
      </div>

      {/* Analyse Détaillée et Diagramme */}
      {consolidatedHoldings.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-[#F9FAFB] flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#6366F1]" />
              Analyse Détaillée du Portfolio
            </h3>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm font-medium">Plus Grande Position</span>
                  <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                </div>
                {holdingsWithAllocation.length > 0 && (
                  <>
                    <div className="text-xl font-bold text-[#F9FAFB] mb-1">
                      {holdingsWithAllocation[0].symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      {holdingsWithAllocation[0].allocation.toFixed(1)}% du portfolio
                    </div>
                  </>
                )}
              </div>

              <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm font-medium">Diversification</span>
                  <PieChart className="w-4 h-4 text-[#6366F1]" />
                </div>
                <div className="text-xl font-bold text-[#F9FAFB] mb-1">
                  {holdingsWithAllocation.filter(h => h.allocation >= 5).length}
                </div>
                <div className="text-sm text-gray-400">
                  Positions significatives
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm font-medium">Risque</span>
                  <Activity className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div className="text-xl font-bold text-[#F9FAFB] mb-1">
                  {holdingsWithAllocation[0]?.allocation > 50 ? 'Élevé' :
                   holdingsWithAllocation[0]?.allocation > 30 ? 'Moyen' : 'Faible'}
                </div>
                <div className="text-sm text-gray-400">
                  Concentration du portefeuille
                </div>
              </div>
            </div>
          </div>

          {/* Diagramme de répartition */}
          <div>
            <PortfolioAllocationChart holdings={holdingsWithAllocation} />
          </div>
        </div>
      )}

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
        />
      )}
    </div>
  )
}

// Composant de diagramme de répartition du portfolio
function PortfolioAllocationChart({ holdings }: { holdings: Array<{ symbol: string; allocation: number; currentValue: number }> }) {
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
    <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50">
      <h3 className="text-xl font-bold text-[#F9FAFB] mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-[#6366F1]" />
        Répartition du Portfolio
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
                  <div className="text-lg font-bold text-[#6366F1]">{selectedSegment}</div>
                  <div className="text-gray-400 text-xs">
                    {segments.find(s => s.symbol === selectedSegment)?.allocation.toFixed(1)}%
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#F9FAFB]">{displayHoldings.length}</div>
                  <div className="text-gray-400 text-xs">Assets</div>
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
                  ? 'bg-[#6366F1]/20 border border-[#6366F1]/40 shadow-lg'
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
                    ? 'text-[#6366F1] font-bold'
                    : segment.isHovered
                      ? 'text-[#8B5CF6]'
                      : 'text-[#F9FAFB] group-hover:text-[#6366F1]'
                }`}>
                  {segment.symbol}
                </span>
                {segment.isSelected && (
                  <div className="text-xs text-[#6366F1] font-medium bg-[#6366F1]/20 px-2 py-1 rounded-full animate-pulse">
                    SÉLECTIONNÉ
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-semibold transition-colors duration-300 ${
                  segment.isSelected ? 'text-[#6366F1]' : 'text-[#F9FAFB]'
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
            💡 <strong>Cliquez</strong> sur un segment ou une crypto pour la mettre en surbrillance
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
  getCryptoImage
}: {
  cryptoId: string
  transactions: Holding[]
  onClose: () => void
  onUpdateTransaction: (id: string, updates: Partial<Holding>) => void
  onDeleteTransaction: (id: string) => void
  getCryptoImage: (cryptoId: string) => string | null
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
      <div className="glass-effect-strong rounded-3xl border border-gray-700 p-8 w-full max-w-4xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {getCryptoImage(cryptoId) ? (
              <img
                src={getCryptoImage(cryptoId)}
                alt={cryptoName}
                className="w-12 h-12 rounded-full shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {cryptoSymbol[0]}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB]">
                Transactions {cryptoSymbol}
              </h2>
              <p className="text-gray-400">{transactions.length} transaction{transactions.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#F9FAFB] p-2 hover:bg-gray-800/50 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-2xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Total Détenu</div>
            <div className="font-mono font-bold text-[#F9FAFB] text-lg">{formatNumber(totalQuantity)}</div>
          </div>
          <div className="glass-effect rounded-2xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Prix Moyen</div>
            <div className="font-mono font-bold text-[#F9FAFB] text-lg">{formatCurrency(avgPrice)}</div>
          </div>
          <div className="glass-effect rounded-2xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">Valeur Actuelle</div>
            <div className="font-mono font-bold text-[#F9FAFB] text-lg">{formatCurrency(currentValue)}</div>
          </div>
          <div className="glass-effect rounded-2xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-sm mb-1">P&L Total</div>
            <div className={`font-mono font-bold text-lg ${pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {formatCurrency(pnl)}
            </div>
          </div>
        </div>

        {/* Liste des transactions */}
        <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
          {/* En-têtes fixes */}
          <div className="border-b border-gray-800/40 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
            <div className="grid grid-cols-6 gap-4 p-4 text-gray-400 font-semibold text-sm uppercase tracking-wider">
              <div>Quantité</div>
              <div className="text-right">Prix d'Achat</div>
              <div className="text-right">Valeur Investie</div>
              <div className="text-right">Valeur Actuelle</div>
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
                      <div className={`font-mono font-bold ${transactionPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                        {formatCurrency(transactionPnL)}
                      </div>
                      <div className={`text-xs font-mono ${transactionPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                        {transactionPnL >= 0 ? '+' : ''}{transactionPnLPercent.toFixed(1)}%
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="p-2 text-gray-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-all"
                        title="Modifier cette transaction"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Supprimer cette transaction ?')) {
                            onDeleteTransaction(transaction.id)
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg transition-all"
                        title="Supprimer cette transaction"
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
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
          <div className="text-sm text-gray-400">
            💡 Vous pouvez modifier ou supprimer chaque transaction individuellement
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-xl font-semibold"
          >
            Fermer
          </button>
        </div>

        {/* Modal d'édition de transaction */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <div className="glass-effect rounded-2xl border border-gray-700 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#F9FAFB]">Modifier Transaction</h3>
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="text-gray-400 hover:text-[#F9FAFB]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Quantité</label>
                  <input
                    type="number"
                    step="any"
                    defaultValue={editingTransaction.quantity}
                    id="edit-quantity"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Prix d'achat ($)</label>
                  <input
                    type="number"
                    step="any"
                    defaultValue={editingTransaction.avgPurchasePrice}
                    id="edit-price"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl hover:from-[#5B21B6] hover:to-[#7C3AED] transition-all"
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
  updatePricesFromAPI
}: {
  holding: Holding | null
  preselectedCrypto?: CoinSuggestion | null
  onSave: (holding: Omit<Holding, 'id' | 'lastUpdated'>) => void
  onCancel: () => void
  searchCoinsAPI: (query: string) => Promise<CoinSuggestion[]>
  updatePricesFromAPI: (cryptoIds: string[]) => Promise<Record<string, CoinGeckoPrice>>
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
            {holding ? 'Modifier' : 'Ajouter'} une position
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
                placeholder="Rechercher une crypto..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
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
                          'Prix en cours...'
                        }
                      </div>
                      <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
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
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold text-xs">
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
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
          </div>

          {/* Prix moyen d'achat */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Prix moyen d'achat ($)
            </label>
            <input
              type="number"
              step="any"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
            />
            {selectedCoin && (
              <div className="mt-2 text-sm text-gray-400">
                Prix actuel : {selectedCoin.current_price > 0 ? 
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
                    <span className={`font-bold font-mono ${pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl hover:from-[#5B21B6] hover:to-[#7C3AED] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {holding ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PortefeuillePage() {
  const exchanges = [
    { 
      name: 'Binance', 
      logo: '🔶', 
      connected: false,
      lastSync: null, 
      status: 'disconnected',
      balance: 0
    },
    { 
      name: 'Coinbase', 
      logo: '🔵', 
      connected: false, 
      lastSync: null, 
      status: 'disconnected',
      balance: 0 
    },
    { 
      name: 'Kraken', 
      logo: '🟣', 
      connected: false,
      lastSync: null, 
      status: 'disconnected',
      balance: 0
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
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          {/* Enhanced Page Header */}
          <div className="mb-16 relative">
            {/* Hero background effects */}
            <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#6366F1]/15 via-[#8B5CF6]/8 to-transparent rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-[#A855F7]/12 to-transparent rounded-full blur-[100px] animate-pulse"></div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12 relative z-10">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1] py-4">
                  <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent animate-gradient-shift font-display flex items-center justify-center lg:justify-start space-x-4">
                    <span>Portfolio</span>
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-[#6366F1] animate-pulse" />
                  </span>
                  <div className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent font-display font-semibold mt-4">
                    Gestion Avancée
                  </div>
                </h1>
                <p className="text-gray-300 text-xl md:text-2xl font-light max-w-3xl leading-relaxed font-display">
                  Suivez vos investissements crypto avec des outils professionnels
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Manuel */}
          <ManualPortfolioSection />

          {/* Exchange Connections */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#F9FAFB] flex items-center gap-3">
                  <Zap className="w-6 h-6 text-[#6366F1]" />
                  Exchanges Connectés
                </h2>
                <p className="text-gray-400 mt-1">Synchronisez vos comptes d'exchange en toute sécurité</p>
              </div>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl">
                <Plus className="w-4 h-4" />
                <span>Ajouter un Exchange</span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {exchanges.map((exchange, index) => (
                <div key={exchange.name} className="glass-effect-strong rounded-3xl p-6 border border-gray-700/50 hover:scale-105 transition-all duration-300 group" style={{
                  animationDelay: `${index * 150}ms`
                }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl group-hover:scale-110 transition-transform">{exchange.logo}</div>
                      <div>
                        <div className="font-bold text-[#F9FAFB] text-lg group-hover:text-[#6366F1] transition-colors">{exchange.name}</div>
                        <div className="text-gray-400 text-sm font-medium">
                          {exchange.connected ? `Sync: ${exchange.lastSync}` : 'Non connecté'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider group-hover:scale-105 transition-all ${
                      exchange.status === 'active'
                        ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 shadow-lg shadow-[#16A34A]/20'
                        : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                    }`}>
                      {exchange.status === 'active' ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-gray-400 text-sm mb-2 font-semibold uppercase tracking-wider">Solde Total</div>
                    <div className="font-mono font-black text-[#F9FAFB] text-2xl group-hover:text-[#6366F1] transition-colors">
                      {exchange.connected ? formatCurrency(exchange.balance) : formatCurrency(0)}
                    </div>
                    {exchange.connected && (
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        Dernière mise à jour: il y a 5 min
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {exchange.connected ? (
                      <>
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 hover:scale-105 transition-all text-sm font-semibold">
                          <Settings className="w-4 h-4" />
                          <span>Config</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#DC2626] hover:border-[#DC2626]/50 hover:scale-105 transition-all text-sm font-semibold">
                          <Trash2 className="w-4 h-4" />
                          <span>Suppr</span>
                        </button>
                      </>
                    ) : (
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl hover:scale-105 transition-all text-sm font-bold shadow-lg hover:shadow-xl">
                        <Key className="w-4 h-4" />
                        <span>Connecter</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Notice - Enhanced */}
            <div className="mt-8 glass-effect-strong rounded-3xl p-8 border border-[#F59E0B]/40 bg-gradient-to-r from-[#F59E0B]/5 to-[#16A34A]/5 relative overflow-hidden group">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-full blur-2xl"></div>

              <div className="flex items-start space-x-6 relative z-10">
                <div className="p-4 bg-[#F59E0B]/20 rounded-2xl group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#F9FAFB] mb-3 text-xl flex items-center gap-2">
                    Sécurité de Niveau Bancaire
                    <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <div className="text-gray-300 leading-relaxed space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#16A34A]" />
                      <span>Clés API en <strong>lecture seule uniquement</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#16A34A]" />
                      <span>Chiffrement AES-256 pour toutes les données</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#16A34A]" />
                      <span>Impossible de trader ou retirer vos fonds</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-400 font-medium">
                    🔒 Vos données sont protégées selon les standards financiers les plus stricts
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Recent Transactions - SEULEMENT SI ON A DES TRANSACTIONS */}
          {exchanges.some(ex => ex.connected) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#F9FAFB]">Transactions récentes</h2>
                <button className="flex items-center space-x-2 text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium">
                  <span>Voir tout</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
                <div className="border-b border-gray-800/40 bg-gray-900/30">
                  <div className="grid grid-cols-7 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                    <div>Type</div>
                    <div>Asset</div>
                    <div className="text-right">Quantité</div>
                    <div className="text-right">Prix</div>
                    <div className="text-right">Valeur</div>
                    <div>Exchange</div>
                    <div className="text-right">Date</div>
                  </div>
                </div>
                <div>
                  {transactions.map((tx) => (
                    <div key={tx.id} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                      <div className="grid grid-cols-7 gap-4 p-6 items-center">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                          tx.type === 'buy' 
                            ? 'bg-[#16A34A]/20 text-[#16A34A]' 
                            : 'bg-[#DC2626]/20 text-[#DC2626]'
                        }`}>
                          {tx.type === 'buy' ? 'Achat' : 'Vente'}
                        </div>
                        <div className="font-semibold text-[#F9FAFB]">{tx.symbol}</div>
                        <div className="text-right font-mono text-[#F9FAFB]">
                          {formatCrypto(tx.amount)}
                        </div>
                        <div className="text-right font-mono text-gray-400">
                          {formatCurrency(tx.price)}
                        </div>
                        <div className="text-right font-mono font-semibold text-[#F9FAFB]">
                          {formatCurrency(tx.value)}
                        </div>
                        <div className="text-gray-400">{tx.exchange}</div>
                        <div className="text-right text-gray-400 text-sm font-mono">
                          {tx.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ProtectedRoute>
  )
}