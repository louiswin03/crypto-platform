"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Edit3, X, Coins } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

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
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=eur&include_24hr_change=true&include_market_cap=true`,
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
          current_price: pricesData[coin.id]?.eur || 0,
          image: coin.thumb || coin.large || '',
          market_cap_rank: coin.market_cap_rank || 999,
          price_change_percentage_24h: pricesData[coin.id]?.eur_24h_change || 0
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
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`,
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
          current_price: data[id].eur,
          price_change_percentage_24h: data[id].eur_24h_change || 0
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
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount) :
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

      {/* Stats Cards */}
      {consolidatedHoldings.length > 0 && (
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Valeur Totale</span>
              <DollarSign className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div className="text-2xl font-bold text-[#F9FAFB] font-mono">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-gray-400 mt-1">{consolidatedHoldings.length} assets • {manualHoldings.length} positions</div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">P&L Total</span>
              {totalPnL >= 0 ? 
                <TrendingUp className="w-5 h-5 text-[#16A34A]" /> : 
                <TrendingDown className="w-5 h-5 text-[#DC2626]" />
              }
            </div>
            <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {formatCurrency(totalPnL)}
            </div>
            <div className={`text-xs mt-1 ${totalPnL >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {showValues ? `${totalPnL >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%` : '••••'}
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Investissement</span>
              <BarChart3 className="w-5 h-5 text-[#6366F1]" />
            </div>
            <div className="text-2xl font-bold text-[#F9FAFB] font-mono">{formatCurrency(totalInvested)}</div>
            <div className="text-xs text-gray-400 mt-1">Capital investi</div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Meilleur Asset</span>
              <Target className="w-5 h-5 text-[#F59E0B]" />
            </div>
            {holdingsWithAllocation.length > 0 && (
              <>
                <div className="text-lg font-bold text-[#F9FAFB]">
                  {holdingsWithAllocation.reduce((best, current) => 
                    current.pnlPercent > best.pnlPercent ? current : best
                  ).symbol}
                </div>
                <div className="text-xs text-[#16A34A] mt-1">
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
                        {holding.image ? (
                          <img src={holding.image} alt={holding.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold">
                            {holding.symbol[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[#F9FAFB]">{holding.symbol}</div>
                          <div className="text-gray-400 text-sm">{holding.name}</div>
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
                            // Éditer la première position de cet asset
                            const firstPosition = manualHoldings.find(h => h.cryptoId === holding.cryptoId)
                            if (firstPosition) setEditingHolding(firstPosition)
                          }}
                          className="p-2 text-gray-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-all"
                          title="Modifier les positions"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            // Supprimer toutes les positions de cet asset
                            const positionsToDelete = manualHoldings.filter(h => h.cryptoId === holding.cryptoId)
                            for (const position of positionsToDelete) {
                              await deleteHolding(position.id)
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-[#DC2626]/10 rounded-lg transition-all"
                          title="Supprimer toutes les positions"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal d'ajout/édition */}
      {(showAddModal || editingHolding) && (
        <AddEditHoldingModal
          holding={editingHolding}
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
          }}
          searchCoinsAPI={searchCoinsAPI}
          updatePricesFromAPI={updatePricesFromAPI}
        />
      )}
    </div>
  )
}

// Modal d'ajout/édition
function AddEditHoldingModal({ 
  holding, 
  onSave, 
  onCancel,
  searchCoinsAPI,
  updatePricesFromAPI
}: { 
  holding: Holding | null
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
    }
  }, [holding])

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
                          coin.current_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) :
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
              Prix moyen d'achat (€)
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
                  selectedCoin.current_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) :
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
                  {(parseFloat(quantity) * parseFloat(avgPrice)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valeur actuelle :</span>
                <span className="text-[#F9FAFB] font-medium font-mono">
                  {(parseFloat(quantity) * selectedCoin.current_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400">P&L :</span>
                {(() => {
                  const pnl = (parseFloat(quantity) * selectedCoin.current_price) - (parseFloat(quantity) * parseFloat(avgPrice))
                  const pnlPercent = (pnl / (parseFloat(quantity) * parseFloat(avgPrice))) * 100
                  return (
                    <span className={`font-bold font-mono ${pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {pnl.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} 
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
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
        
        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight">
                  Mon Portefeuille
                </h1>
                <p className="text-gray-400 text-xl font-light max-w-2xl">
                  Synchronisez vos exchanges et suivez vos investissements en temps réel
                </p>
              </div>
              
              {/* Portfolio Stats - UNIQUEMENT SI ON A DES DONNÉES */}
              {(totalBalance > 0) && (
                <div className="flex gap-6">
                  <div className="glass-effect rounded-2xl p-6 text-center min-w-[160px]">
                    <div className="text-3xl font-bold text-[#16A34A] mb-1 font-mono">
                      {formatCurrency(totalBalance)}
                    </div>
                    <div className="text-gray-400 text-sm font-medium">Exchanges</div>
                  </div>
                  <div className="glass-effect rounded-2xl p-6 text-center min-w-[160px]">
                    <div className="text-3xl font-bold text-[#6366F1] mb-1 font-mono">+12.4%</div>
                    <div className="text-gray-400 text-sm font-medium">Performance 30j</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Manuel */}
          <ManualPortfolioSection />

          {/* Exchange Connections */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F9FAFB]">Exchanges connectés</h2>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl">
                <Plus className="w-4 h-4" />
                <span>Ajouter un exchange</span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {exchanges.map((exchange) => (
                <div key={exchange.name} className="glass-effect rounded-2xl p-6 border border-gray-800/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{exchange.logo}</div>
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">{exchange.name}</div>
                        <div className="text-gray-400 text-sm">
                          {exchange.connected ? `Sync: ${exchange.lastSync}` : 'Non connecté'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exchange.status === 'active' 
                        ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40'
                        : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                    }`}>
                      {exchange.status === 'active' ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm mb-1">Solde</div>
                    <div className="font-mono font-bold text-[#F9FAFB] text-lg">
                      {exchange.connected ? formatCurrency(exchange.balance) : formatCurrency(0)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {exchange.connected ? (
                      <>
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm">
                          <Settings className="w-4 h-4" />
                          <span>Config</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#DC2626] hover:border-[#DC2626]/50 transition-all text-sm">
                          <Trash2 className="w-4 h-4" />
                          <span>Suppr</span>
                        </button>
                      </>
                    ) : (
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-all text-sm font-semibold">
                        <Key className="w-4 h-4" />
                        <span>Connecter</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="mt-6 glass-effect rounded-2xl p-6 border border-[#F59E0B]/40 bg-[#F59E0B]/5">
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#F9FAFB] mb-2">Sécurité maximale</div>
                  <div className="text-gray-300 text-sm">
                    Nous utilisons uniquement des clés API en <strong>lecture seule</strong>. 
                    Impossible de trader ou retirer vos fonds. Chiffrement AES-256 pour toutes les données sensibles.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Breakdown - SEULEMENT SI ON A DES EXCHANGES CONNECTÉS */}
          {exchanges.some(ex => ex.connected && ex.balance > 0) && (
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Holdings Exchange</h2>
                <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
                  <div className="border-b border-gray-800/40 bg-gray-900/30">
                    <div className="grid grid-cols-6 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                      <div className="col-span-2">Asset</div>
                      <div className="text-right">Quantité</div>
                      <div className="text-right">Valeur</div>
                      <div className="text-right">24h</div>
                      <div className="text-right">Allocation</div>
                    </div>
                  </div>
                  <div>
                    {holdings.map((holding) => (
                      <div key={holding.symbol} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                        <div className="grid grid-cols-6 gap-4 p-6 items-center">
                          <div className="col-span-2 flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold">
                              {holding.symbol[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-[#F9FAFB]">{holding.symbol}</div>
                              <div className="text-gray-400 text-sm">{holding.name}</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[#F9FAFB]">
                            {formatCrypto(holding.amount)}
                          </div>
                          <div className="text-right font-mono font-semibold text-[#F9FAFB]">
                            {formatCurrency(holding.valueEur)}
                          </div>
                          <div className={`text-right font-mono font-semibold flex items-center justify-end space-x-1 ${
                            holding.change24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}>
                            {holding.change24h >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{Math.abs(holding.change24h).toFixed(1)}%</span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <div className="w-12 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                                  style={{ width: `${holding.allocation}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-sm text-gray-400">{holding.allocation}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Répartition</h2>
                <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
                  <div className="aspect-square flex items-center justify-center mb-6">
                    <div className="w-40 h-40 rounded-full border-8 border-[#6366F1] flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#F9FAFB]">4</div>
                        <div className="text-gray-400 text-sm">Assets</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {holdings.map((holding, index) => (
                      <div key={holding.symbol} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(${220 + index * 30}, 70%, 60%)` }}
                          ></div>
                          <span className="text-[#F9FAFB] font-medium">{holding.symbol}</span>
                        </div>
                        <div className="font-mono text-gray-400">{holding.allocation}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
      </div>
    </ProtectedRoute>
  )
}