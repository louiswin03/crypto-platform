'use client'

import { useState, useEffect } from 'react'
import { DatabaseAuthService } from '@/services/databaseAuthService'
import { useAuth } from '@/hooks/useAuth'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices'
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, Folder, Plus, PieChart } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

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

interface ConsolidatedHolding {
  symbol: string
  name: string
  quantity: number
  avgCost: number
  currentPrice: number
  totalValue: number
  pnl: number
  pnlPercent: number
  source: string
  image?: string
}

interface ConsolidatedPortfolioViewProps {
  portfolio: Portfolio
  onAddManualHolding?: () => void
  onEditManualHolding?: (holdingId: string) => void
  onDeleteManualHolding?: (holdingId: string) => void
  refreshTrigger?: number
}

export default function ConsolidatedPortfolioView({ portfolio, onAddManualHolding, refreshTrigger }: ConsolidatedPortfolioViewProps) {
  const { user } = useAuth()
  const [holdings, setHoldings] = useState<ConsolidatedHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showHoldings, setShowHoldings] = useState(false)

  // Hook pour récupérer les images des cryptos (100 cryptos = bon équilibre entre couverture et performance)
  // Les images sont déjà dans les données, pas d'appel API supplémentaire
  const { prices } = useExtendedCoinGeckoPrices(100)

  // Fonction pour obtenir l'image d'une crypto
  const getCryptoImage = (symbol: string, name: string) => {
    // Essayer de matcher par symbol ou par ID (name en lowercase)
    const cryptoData = prices.find(coin =>
      coin.symbol.toLowerCase() === symbol.toLowerCase() ||
      coin.id === name.toLowerCase() ||
      coin.name.toLowerCase() === name.toLowerCase()
    )
    return cryptoData?.image || null
  }

  // Charger les holdings de toutes les sources sélectionnées
  const loadConsolidatedHoldings = async () => {
    if (!user || !portfolio.sources) return

    setLoading(true)
    setError(null)
    const allHoldings: ConsolidatedHolding[] = []

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        setError('Non authentifié')
        return
      }

      // 1. Charger les holdings manuels si sélectionné
      if (portfolio.sources.manual) {
        try {
          const response = await fetch(`/api/holdings?portfolio_id=${portfolio.id}`, {
            headers: {
              'Authorization': `Bearer ${authData.token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            const manualHoldings: ConsolidatedHolding[] = (data.holdings || []).map((h: any) => ({
              symbol: h.symbol,
              name: h.crypto_id,
              quantity: h.quantity,
              avgCost: h.avg_cost_usd,
              currentPrice: h.current_price_usd,
              totalValue: h.current_value_usd,
              pnl: h.unrealized_pnl_usd,
              pnlPercent: h.unrealized_pnl_percent,
              source: 'manuel',
            }))
            allHoldings.push(...manualHoldings)
          }
        } catch (err) {

        }
      }

      // 2. Charger les balances Binance si sélectionné
      if (portfolio.sources.binance) {
        try {
          const response = await fetch('/api/binance/balances', {
            headers: {
              'Authorization': `Bearer ${authData.token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            const binanceHoldings: ConsolidatedHolding[] = (data.balances || [])
              .filter((b: any) => b.total > 0 && b.valueUsd > 0.1)
              .map((b: any) => ({
                symbol: b.asset,
                name: b.asset,
                quantity: b.total,
                avgCost: 0, // Binance ne fournit pas le coût moyen
                currentPrice: b.priceUsd || 0,
                totalValue: b.valueUsd || 0,
                pnl: 0,
                pnlPercent: 0,
                source: 'binance',
              }))
            allHoldings.push(...binanceHoldings)
          }
        } catch (err) {

        }
      }

      // 3. Charger les balances Coinbase si sélectionné
      if (portfolio.sources.coinbase) {
        try {
          const response = await fetch('/api/coinbase/balances', {
            headers: {
              'Authorization': `Bearer ${authData.token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            const coinbaseHoldings: ConsolidatedHolding[] = (data.balances || [])
              .filter((b: any) => b.amount > 0 && b.valueUsd > 0.1)
              .map((b: any) => ({
                symbol: b.asset,
                name: b.name || b.asset,
                quantity: b.amount,
                avgCost: 0,
                currentPrice: b.amount > 0 ? b.valueUsd / b.amount : 0,
                totalValue: b.valueUsd || 0,
                pnl: 0,
                pnlPercent: 0,
                source: 'coinbase',
              }))
            allHoldings.push(...coinbaseHoldings)
          }
        } catch (err) {

        }
      }

      // 4. Charger les balances Kraken si sélectionné
      if (portfolio.sources.kraken) {
        try {
          const response = await fetch('/api/kraken/balances', {
            headers: {
              'Authorization': `Bearer ${authData.token}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            const krakenHoldings: ConsolidatedHolding[] = (data.balances || [])
              .filter((b: any) => b.amount > 0 && b.valueUsd > 0.1)
              .map((b: any) => ({
                symbol: b.asset,
                name: b.asset,
                quantity: b.amount,
                avgCost: 0,
                currentPrice: b.amount > 0 ? b.valueUsd / b.amount : 0,
                totalValue: b.valueUsd || 0,
                pnl: 0,
                pnlPercent: 0,
                source: 'kraken',
              }))
            allHoldings.push(...krakenHoldings)
          }
        } catch (err) {

        }
      }

      // Fusionner les holdings du même actif (même symbol)
      const mergedHoldings = allHoldings.reduce((acc, holding) => {
        const existing = acc.find(h => h.symbol === holding.symbol)

        if (existing) {
          // Fusionner avec le holding existant
          const totalQuantity = existing.quantity + holding.quantity
          const totalValue = existing.totalValue + holding.totalValue
          const newCurrentPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

          // Pour le coût moyen, on fait une moyenne pondérée uniquement si les deux ont un coût
          let newAvgCost = 0
          let newPnl = 0
          let newPnlPercent = 0

          if (existing.avgCost > 0 && holding.avgCost > 0) {
            // Moyenne pondérée du coût
            const totalCost = (existing.quantity * existing.avgCost) + (holding.quantity * holding.avgCost)
            newAvgCost = totalCost / totalQuantity
            newPnl = totalValue - totalCost
            newPnlPercent = (newPnl / totalCost) * 100
          } else if (existing.avgCost > 0) {
            // Garder le coût du premier
            const totalCost = existing.quantity * existing.avgCost
            newAvgCost = totalCost / totalQuantity
            newPnl = totalValue - (totalQuantity * newAvgCost)
            newPnlPercent = totalCost > 0 ? (newPnl / totalCost) * 100 : 0
          } else if (holding.avgCost > 0) {
            // Garder le coût du deuxième
            const totalCost = holding.quantity * holding.avgCost
            newAvgCost = totalCost / totalQuantity
            newPnl = totalValue - (totalQuantity * newAvgCost)
            newPnlPercent = totalCost > 0 ? (newPnl / totalCost) * 100 : 0
          }

          existing.quantity = totalQuantity
          existing.totalValue = totalValue
          existing.currentPrice = newCurrentPrice
          existing.avgCost = newAvgCost
          existing.pnl = newPnl
          existing.pnlPercent = newPnlPercent
          existing.source = existing.source + ', ' + holding.source // Combiner les sources
        } else {
          // Nouveau holding
          acc.push({ ...holding })
        }

        return acc
      }, [] as ConsolidatedHolding[])

      setHoldings(mergedHoldings.sort((a, b) => b.totalValue - a.totalValue))
    } catch (err) {

      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConsolidatedHoldings()
  }, [user, portfolio.id, portfolio.sources, refreshTrigger])

  // Calculer les statistiques globales
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0)

  // Calculer le P&L seulement pour les holdings qui ont un coût moyen (holdings manuels)
  const holdingsWithCost = holdings.filter(h => h.avgCost > 0)
  const totalPnL = holdingsWithCost.reduce((sum, h) => sum + h.pnl, 0)
  const totalInvested = holdingsWithCost.reduce((sum, h) => sum + (h.quantity * h.avgCost), 0)
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const hasPnLData = holdingsWithCost.length > 0

  // Analyse du portfolio
  const largestPosition = holdings.length > 0 ? holdings[0] : null
  const largestPositionPercent = totalValue > 0 && largestPosition ? (largestPosition.totalValue / totalValue) * 100 : 0
  const significantPositions = holdings.filter(h => (h.totalValue / totalValue) * 100 >= 5).length
  const riskLevel = largestPositionPercent > 50 ? 'Élevé' : largestPositionPercent > 30 ? 'Moyen' : 'Faible'

  // État pour le hover sur le graphique
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Données pour le graphique circulaire
  const COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#FFA366', '#10B981', '#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#8B5CF6']

  // Séparer les holdings >= 1% et < 1%
  const significantHoldings = holdings.filter(h => totalValue > 0 && (h.totalValue / totalValue) * 100 >= 1)
  const smallHoldings = holdings.filter(h => totalValue > 0 && (h.totalValue / totalValue) * 100 < 1)

  // Créer les données du graphique avec "Autres" si nécessaire
  const chartData = [
    ...significantHoldings.map((h, index) => ({
      name: h.symbol,
      value: h.totalValue,
      percent: totalValue > 0 ? (h.totalValue / totalValue) * 100 : 0,
      color: COLORS[index % COLORS.length]
    })),
    ...(smallHoldings.length > 0 ? [{
      name: 'Autres',
      value: smallHoldings.reduce((sum, h) => sum + h.totalValue, 0),
      percent: totalValue > 0 ? (smallHoldings.reduce((sum, h) => sum + h.totalValue, 0) / totalValue) * 100 : 0,
      color: '#6B7280'
    }] : [])
  ]

  if (loading) {
    return (
      <div className="glass-effect-strong rounded-2xl p-6 border border-gray-800/40 mt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700/30 rounded-xl w-1/3"></div>
          <div className="h-20 bg-gray-700/30 rounded-xl"></div>
          <div className="h-20 bg-gray-700/30 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-effect-strong rounded-2xl p-6 border border-red-500/40 mt-6">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="glass-effect-strong rounded-2xl p-6 border border-gray-800/40 mt-6">
      {/* Header avec stats globales */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Wallet className="w-6 h-6 text-[#2563EB]" />
            <span>{portfolio.name}</span>
          </h3>
          {portfolio.description && (
            <p className="text-gray-400 text-sm mt-1">{portfolio.description}</p>
          )}
        </div>
        <button
          onClick={loadConsolidatedHoldings}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all"
        >
          <RefreshCcw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
          <p className="text-gray-400 text-sm">Valeur Totale</p>
          <p className="text-2xl font-bold text-white mt-1">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
          <p className="text-gray-400 text-sm">P&L Total {!hasPnLData && <span className="text-xs">(manuel uniquement)</span>}</p>
          {hasPnLData ? (
            <p className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-500 mt-1">N/A</p>
          )}
        </div>
        <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
          <p className="text-gray-400 text-sm">P&L % {!hasPnLData && <span className="text-xs">(manuel uniquement)</span>}</p>
          {hasPnLData ? (
            <p className={`text-2xl font-bold mt-1 flex items-center space-x-2 ${totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnLPercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%</span>
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-500 mt-1">N/A</p>
          )}
        </div>
      </div>

      {/* Bouton pour afficher/masquer les holdings */}
      {holdings.length > 0 && (
        <button
          onClick={() => setShowHoldings(!showHoldings)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#2563EB]/10 to-[#8B5CF6]/10 border border-[#2563EB]/30 hover:border-[#2563EB]/50 transition-all group mb-4"
        >
          <div className="flex items-center space-x-3">
            <Wallet className="w-5 h-5 text-[#2563EB]" />
            <span className="text-white font-semibold">
              {showHoldings ? 'Masquer mes actifs' : 'Voir mes actifs'} ({holdings.length})
            </span>
          </div>
          <div className={`transform transition-transform ${showHoldings ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Liste des holdings */}
      {holdings.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucune position dans ce portfolio</p>
        </div>
      ) : showHoldings ? (
        <div className="space-y-2">
          {holdings.map((holding, index) => (
            <div
              key={`${holding.source}-${holding.symbol}-${index}`}
              className="glass-effect rounded-xl p-4 hover:bg-gray-700/30 transition-all border border-gray-800/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {holding.image ? (
                    <img src={holding.image} alt={holding.symbol} className="w-10 h-10 rounded-full" />
                  ) : getCryptoImage(holding.symbol, holding.name) ? (
                    <img
                      src={getCryptoImage(holding.symbol, holding.name)!}
                      alt={holding.symbol}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] via-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {holding.symbol.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{holding.symbol}</span>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                        {holding.source}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{holding.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-semibold">
                    ${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {holding.quantity.toLocaleString('en-US', { maximumFractionDigits: 8 })} @ ${holding.currentPrice.toFixed(2)}
                  </p>
                  {holding.avgCost > 0 && (
                    <p className={`text-sm ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)} ({holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Analyse du Portfolio */}
      {holdings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h4 className="text-lg font-bold text-white mb-4">Analyse Détaillée du Portfolio</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Plus Grande Position */}
            {largestPosition && (
              <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
                <p className="text-gray-400 text-sm mb-2">Plus Grande Position</p>
                <p className="text-xl font-bold text-white">{largestPosition.symbol}</p>
                <p className="text-[#2563EB] text-sm mt-1">{largestPositionPercent.toFixed(1)}% du portfolio</p>
              </div>
            )}

            {/* Diversification */}
            <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
              <p className="text-gray-400 text-sm mb-2">Diversification</p>
              <p className="text-xl font-bold text-white">{significantPositions}</p>
              <p className="text-gray-500 text-sm mt-1">Positions significatives</p>
            </div>

            {/* Risque */}
            <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
              <p className="text-gray-400 text-sm mb-2">Risque</p>
              <p className={`text-xl font-bold ${riskLevel === 'Élevé' ? 'text-red-400' : riskLevel === 'Moyen' ? 'text-yellow-400' : 'text-green-400'}`}>
                {riskLevel}
              </p>
              <p className="text-gray-500 text-sm mt-1">Concentration du portefeuille</p>
            </div>
          </div>

          {/* Conseils de Gestion */}
          <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
            <h5 className="text-md font-semibold text-white mb-3">Conseils de Gestion</h5>
            <div className="space-y-3 text-sm">
              {/* Concentration */}
              {largestPosition && largestPositionPercent > 40 && (
                <div className="flex items-start space-x-2">
                  <span className="text-orange-400 mt-0.5">⚠</span>
                  <div>
                    <p className="text-orange-400 font-semibold">Forte concentration détectée</p>
                    <p className="text-gray-400">
                      Votre position {largestPosition.symbol} représente {largestPositionPercent.toFixed(1)}% de votre portfolio.
                      Envisagez de diversifier pour réduire le risque.
                    </p>
                  </div>
                </div>
              )}

              {/* Diversification */}
              {significantPositions < 5 && (
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">ℹ</span>
                  <div>
                    <p className="text-blue-400 font-semibold">Diversification à améliorer</p>
                    <p className="text-gray-400">
                      Avec {significantPositions} position{significantPositions > 1 ? 's' : ''} significative{significantPositions > 1 ? 's' : ''},
                      pensez à diversifier davantage (idéalement 5-10 positions).
                    </p>
                  </div>
                </div>
              )}

              {/* Performance */}
              {hasPnLData && totalPnLPercent > 20 && (
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <div>
                    <p className="text-green-400 font-semibold">Performance excellente</p>
                    <p className="text-gray-400">
                      Gain de {totalPnLPercent.toFixed(1)}%. Pensez à sécuriser une partie des profits (take profit) selon votre stratégie.
                    </p>
                  </div>
                </div>
              )}

              {hasPnLData && totalPnLPercent < -10 && (
                <div className="flex items-start space-x-2">
                  <span className="text-red-400 mt-0.5">⚠</span>
                  <div>
                    <p className="text-red-400 font-semibold">Perte importante</p>
                    <p className="text-gray-400">
                      Perte de {Math.abs(totalPnLPercent).toFixed(1)}%. Revoyez votre stratégie et envisagez un stop-loss si nécessaire.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Répartition du Portfolio */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/40 mt-6">
            <h5 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-[#2563EB]" />
              <span>Répartition du Portfolio</span>
            </h5>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique circulaire */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={{
                        stroke: '#6B7280',
                        strokeWidth: 1
                      }}
                      label={({ cx, cy, midAngle, outerRadius, name, percent }) => {
                        const RADIAN = Math.PI / 180
                        const radius = outerRadius + 25
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#F9FAFB"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs font-medium"
                          >
                            {`${name} ${percent.toFixed(1)}%`}
                          </text>
                        )
                      }}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      activeIndex={activeIndex !== null ? activeIndex : undefined}
                      activeShape={{
                        outerRadius: 100,
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          style={{
                            filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '12px'
                      }}
                      itemStyle={{
                        color: '#fff'
                      }}
                      labelStyle={{
                        color: '#fff'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Légende détaillée */}
              <div className="space-y-2">
                {chartData.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                      activeIndex === index
                        ? 'bg-gray-700/50 scale-105'
                        : 'hover:bg-gray-800/30'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded transition-all ${
                          activeIndex === index ? 'scale-125' : ''
                        }`}
                        style={{
                          backgroundColor: item.color,
                          filter: activeIndex === index ? 'brightness(1.2)' : 'none'
                        }}
                      ></div>
                      <span className={`font-medium transition-colors ${
                        activeIndex === index ? 'text-white' : 'text-gray-300'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold transition-colors ${
                        activeIndex === index ? 'text-white' : 'text-gray-300'
                      }`}>
                        ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-gray-400 text-sm">{item.percent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources actives */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500">
          Sources actives: {' '}
          {[
            portfolio.sources?.manual && 'Manuel',
            portfolio.sources?.binance && 'Binance',
            portfolio.sources?.coinbase && 'Coinbase',
            portfolio.sources?.kraken && 'Kraken'
          ].filter(Boolean).join(', ')}
        </p>
      </div>
    </div>
  )
}
