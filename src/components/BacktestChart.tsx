"use client"

import React, { useMemo, useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts'
import { Eye, EyeOff } from 'lucide-react'
import CandlestickChart from './CandlestickChart'
import ReplayControls from './ReplayControls'
import type { BacktestResult } from '@/services/backtestEngine'
import { ReplayService, ReplayState } from '@/services/replayService'
import { useLanguage } from '@/contexts/LanguageContext'

// Format date utility
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Composant pour les graphiques d'oscillateurs
const OscillatorCharts = ({ backtestData, chartData, t }: any) => {
  const { config, indicators } = backtestData

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-[#F9FAFB] font-medium mb-2">{data.displayDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="mb-1">
              {entry.name}: <span className="font-mono">{entry.value?.toFixed(2)}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* RSI */}
      {indicators.rsi && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
          <div className="border-b border-gray-600/40 px-6 py-4 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#F9FAFB]">
                RSI (14)
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full"></div>
                <span className="text-gray-400">Relative Strength Index</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-48 bg-gray-900/50 rounded-lg border border-gray-700/50 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 40, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.4} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#D1D5DB"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#D1D5DB"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#A855F7"
                  strokeWidth={3}
                  dot={false}
                  name="RSI"
                />
                {/* Lignes de référence */}
                <ReferenceDot y={70} stroke="#DC2626" strokeDasharray="5 5" />
                <ReferenceDot y={30} stroke="#00FF88" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400 px-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00FF88] rounded-full"></span>{t('backtest.chart.oversold')} &lt; 30</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DC2626] rounded-full"></span>{t('backtest.chart.overbought')} &gt; 70</span>
            </div>
          </div>
        </div>
      )}

      {/* MACD */}
      {indicators.macd && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
          <div className="border-b border-gray-600/40 px-6 py-4 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#F9FAFB]">
                MACD (12,26,9)
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#00FF88] rounded-full"></div>
                <span className="text-gray-400">Convergence Divergence</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-48 bg-gray-900/50 rounded-lg border border-gray-700/50 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 40, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.4} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#D1D5DB"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#D1D5DB"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="macd"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={false}
                  name="MACD"
                />
                <Line
                  type="monotone"
                  dataKey="macdSignal"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={false}
                  name="Signal"
                />
                <Line
                  type="monotone"
                  dataKey="macdHistogram"
                  stroke="#FFA366"
                  strokeWidth={2}
                  dot={false}
                  name="Histogram"
                />
                <ReferenceDot y={0} stroke="#9CA3AF" strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-gray-400 px-2">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00FF88] rounded"></div>{t('backtest.chart.macd_line')}</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#DC2626] rounded"></div>{t('backtest.chart.signal')}</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#FFA366] rounded"></div>{t('backtest.chart.histogram')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Stochastic */}
      {indicators.stochastic && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
          <div className="border-b border-gray-600/40 px-6 py-4 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#F9FAFB]">
                Stochastic (14,3)
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full"></div>
                <span className="text-gray-400">%K et %D</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-48 bg-gray-900/50 rounded-lg border border-gray-700/50 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 40, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.4} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#D1D5DB"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#D1D5DB"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="stochasticK"
                  stroke="#A855F7"
                  strokeWidth={3}
                  dot={false}
                  name="%K"
                />
                <Line
                  type="monotone"
                  dataKey="stochasticD"
                  stroke="#FFA366"
                  strokeWidth={3}
                  dot={false}
                  name="%D"
                />
                <ReferenceDot y={80} stroke="#DC2626" strokeDasharray="5 5" />
                <ReferenceDot y={20} stroke="#00FF88" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400 px-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00FF88] rounded-full"></span>{t('backtest.chart.oversold')} &lt; 20</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DC2626] rounded-full"></span>{t('backtest.chart.overbought')} &gt; 80</span>
            </div>
          </div>
        </div>
      )}

      {/* Williams %R */}
      {indicators.williamsR && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
          <div className="border-b border-gray-600/40 px-6 py-4 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#F9FAFB]">
                Williams %R (14)
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#EC4899] rounded-full"></div>
                <span className="text-gray-400">Momentum</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-48 bg-gray-900/50 rounded-lg border border-gray-700/50 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 40, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.4} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#D1D5DB"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#D1D5DB"
                  fontSize={12}
                  domain={[-100, 0]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="williamsR"
                  stroke="#EC4899"
                  strokeWidth={3}
                  dot={false}
                  name="Williams %R"
                />
                <ReferenceDot y={-20} stroke="#DC2626" strokeDasharray="5 5" />
                <ReferenceDot y={-80} stroke="#00FF88" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400 px-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00FF88] rounded-full"></span>{t('backtest.chart.oversold')} &gt; -80</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DC2626] rounded-full"></span>{t('backtest.chart.overbought')} &lt; -20</span>
            </div>
          </div>
        </div>
      )}


      {/* OBV */}
      {indicators.obv && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
          <div className="border-b border-gray-600/40 px-6 py-4 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#F9FAFB]">
                OBV (On-Balance Volume)
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#06B6D4] rounded-full"></div>
                <span className="text-gray-400">Volume Indicator</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-48 bg-gray-900/50 rounded-lg border border-gray-700/50 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 40, left: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.4} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#D1D5DB"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#D1D5DB"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="obv"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={false}
                  name="OBV"
                />
                {indicators.obv.some((item: any) => item.signal !== null) && (
                  <Line
                    type="monotone"
                    dataKey="obvSignal"
                    stroke="#FFA366"
                    strokeWidth={3}
                    dot={false}
                    name="Signal OBV"
                    strokeDasharray="3 3"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface BacktestChartProps {
  backtestData: BacktestResult
  selectedTrade?: any
  onTradeZoomComplete?: () => void
}

export default function BacktestChart({ backtestData, selectedTrade, onTradeZoomComplete }: BacktestChartProps) {
  const { t } = useLanguage()
  const [replayMode, setReplayMode] = useState(false)
  const [replayService, setReplayService] = useState<ReplayService | null>(null)
  const [replayState, setReplayState] = useState<ReplayState | null>(null)
  const [zoomedTrade, setZoomedTrade] = useState<any>(null)
  const [showOnlySelectedTrade, setShowOnlySelectedTrade] = useState(false)

  // Gérer le trade sélectionné pour le zoom
  useEffect(() => {
    if (selectedTrade) {
      setZoomedTrade(selectedTrade)
      setShowOnlySelectedTrade(true) // Activer par défaut le mode "uniquement ce trade"
      // Scroll vers le graphique
      const chartElement = document.getElementById('main-chart')
      if (chartElement) {
        chartElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Plus de reset automatique - l'utilisateur contrôle manuellement
    }
  }, [selectedTrade])

  // Initialiser le service de replay
  useEffect(() => {
    if (replayMode && !replayService) {
      const service = ReplayService.createInstance(backtestData)
      setReplayService(service)

      const unsubscribe = service.subscribe(setReplayState)
      return () => {
        unsubscribe()
        service.destroy()
      }
    } else if (!replayMode && replayService) {
      replayService.destroy()
      setReplayService(null)
      setReplayState(null)
    }
  }, [replayMode, backtestData])

  // Données à utiliser selon le mode
  const currentBacktestData = useMemo(() => {
    if (replayMode && replayState) {
      return {
        ...backtestData,
        priceData: replayState.visibleData.prices,
        state: {
          ...backtestData.state,
          trades: replayState.visibleData.trades
        },
        indicators: replayState.visibleData.indicators
      }
    }

    // Si un trade est sélectionné, filtrer les données pour zoomer dessus
    if (zoomedTrade) {
      const startTime = zoomedTrade.openTrade.timestamp
      const endTime = zoomedTrade.closeTrade.timestamp
      const tradeDuration = endTime - startTime

      // Amélioration du système de zoom sur les trades
      const startIndex = backtestData.priceData.findIndex(p => p.timestamp >= startTime)
      const endIndex = backtestData.priceData.findIndex(p => p.timestamp >= endTime)
      let filteredPrices: any[] = []

      if (startIndex !== -1) {
        // Calculer le centre du trade (point de focus)
        const tradeCenterIndex = endIndex !== -1 ? Math.floor((startIndex + endIndex) / 2) : startIndex

        // Taille de fenêtre garantissant une vue de la structure globale (minimum 80 bougies)
        const minWindowSize = 80
        const optimalWindowSize = Math.min(200, Math.max(minWindowSize, Math.ceil(backtestData.priceData.length * 0.15)))
        const halfWindow = Math.floor(optimalWindowSize / 2)

        // Centrer parfaitement autour du trade
        let windowStart = Math.max(0, tradeCenterIndex - halfWindow)
        let windowEnd = Math.min(backtestData.priceData.length - 1, windowStart + optimalWindowSize - 1)

        // Ajustement si on touche les bords
        if (windowEnd === backtestData.priceData.length - 1) {
          windowStart = Math.max(0, windowEnd - optimalWindowSize + 1)
        }
        if (windowStart === 0) {
          windowEnd = Math.min(backtestData.priceData.length - 1, optimalWindowSize - 1)
        }

        // S'assurer que le trade est toujours dans la fenêtre visible
        if (startIndex < windowStart) {
          const shift = windowStart - startIndex + 5 // Petit buffer
          windowStart = Math.max(0, windowStart - shift)
          windowEnd = Math.min(backtestData.priceData.length - 1, windowEnd - shift)
        }
        if (endIndex > windowEnd) {
          const shift = endIndex - windowEnd + 5 // Petit buffer
          windowEnd = Math.min(backtestData.priceData.length - 1, windowEnd + shift)
          windowStart = Math.max(0, windowStart + shift)
        }

        filteredPrices = backtestData.priceData.slice(windowStart, windowEnd + 1)

        // Vérification de sécurité : s'assurer qu'on a des données
        if (filteredPrices.length === 0) {
          // Fallback ultime : prendre 80 bougies autour du trade
          const safeStart = Math.max(0, startIndex - 40)
          const safeEnd = Math.min(backtestData.priceData.length - 1, startIndex + 40)
          filteredPrices = backtestData.priceData.slice(safeStart, safeEnd + 1)
        }
      } else {
        // Fallback: Si on ne trouve pas les index, utiliser un buffer temporel
        const minBuffer = 7 * 24 * 60 * 60 * 1000 // 7 jours minimum
        const adaptiveBuffer = Math.max(tradeDuration * 3, minBuffer)

        const zoomStart = startTime - adaptiveBuffer
        const zoomEnd = endTime + adaptiveBuffer

        filteredPrices = backtestData.priceData.filter(price =>
          price.timestamp >= zoomStart && price.timestamp <= zoomEnd
        )

        // S'assurer qu'on a au moins 60 bougies pour voir la structure
        if (filteredPrices.length < 60) {
          const centerTimestamp = (startTime + endTime) / 2
          const allPrices = backtestData.priceData
          const centerIndex = allPrices.findIndex(p => p.timestamp >= centerTimestamp)

          if (centerIndex !== -1) {
            const start = Math.max(0, centerIndex - 40)
            const end = Math.min(allPrices.length - 1, centerIndex + 40)
            filteredPrices = allPrices.slice(start, end + 1)
          }
        }
      }

      // Filtrer les trades correspondant à la nouvelle fenêtre
      const windowStart = filteredPrices[0]?.timestamp
      const windowEnd = filteredPrices[filteredPrices.length - 1]?.timestamp

      let filteredTrades = backtestData.state.trades.filter(trade =>
        trade.timestamp >= windowStart && trade.timestamp <= windowEnd
      )

      // Si "uniquement ce trade" est activé, ne garder que le trade sélectionné
      if (showOnlySelectedTrade && zoomedTrade) {
        filteredTrades = filteredTrades.filter(trade =>
          trade.id === zoomedTrade.openTrade.id || trade.id === zoomedTrade.closeTrade.id
        )
      }

      // Filtrer les indicateurs correspondants aux nouvelles données
      const filteredIndicators: any = {}
      Object.keys(backtestData.indicators).forEach(key => {
        if (Array.isArray(backtestData.indicators[key])) {
          const startIndex = backtestData.priceData.findIndex(p => p.timestamp === windowStart)
          const endIndex = backtestData.priceData.findIndex(p => p.timestamp === windowEnd)
          if (startIndex !== -1) {
            filteredIndicators[key] = backtestData.indicators[key].slice(
              startIndex,
              endIndex !== -1 ? endIndex + 1 : undefined
            )
          }
        }
      })

      return {
        ...backtestData,
        priceData: filteredPrices,
        state: {
          ...backtestData.state,
          trades: filteredTrades
        },
        indicators: filteredIndicators
      }
    }

    return backtestData
  }, [backtestData, replayMode, replayState?.currentIndex, replayState?.visibleData?.prices?.length, zoomedTrade, showOnlySelectedTrade])

  const chartData = useMemo(() => {
    const { priceData, state, indicators, config } = currentBacktestData

    // Créer un map des trades par timestamp pour un accès rapide
    const tradesByTimestamp = new Map()
    state.trades.forEach(trade => {
      tradesByTimestamp.set(trade.timestamp, trade)
    })

    // Fusionner les données de prix avec les indicateurs et trades
    return priceData.map((price, index) => {
      const trade = tradesByTimestamp.get(price.timestamp)

      let chartPoint: any = {
        timestamp: price.timestamp,
        date: price.date,
        open: price.open || price.close,
        high: price.high || price.close,
        low: price.low || price.close,
        close: price.close,
        price: price.close, // Pour compatibilité
        volume: price.volume,
        // Format pour l'affichage
        displayDate: formatDate(price.timestamp)
      }

      // Ajouter les indicateurs selon la stratégie
      if (config.strategy === 'rsi_oversold' && indicators.rsi?.[index]) {
        chartPoint.rsi = indicators.rsi[index].value
      }

      if (config.strategy === 'ema_cross') {
        if (indicators.ema1?.[index]) chartPoint.ema1 = indicators.ema1[index].value
        if (indicators.ema2?.[index]) chartPoint.ema2 = indicators.ema2[index].value
      }

      if (config.strategy === 'bollinger_mean_reversion' && indicators.bollinger?.[index]) {
        const bollinger = indicators.bollinger[index]
        chartPoint.bollingerUpper = bollinger.upper
        chartPoint.bollingerMiddle = bollinger.middle
        chartPoint.bollingerLower = bollinger.lower
      }

      if (config.strategy === 'macd_divergence' && indicators.macd?.[index]) {
        const macd = indicators.macd[index]
        chartPoint.macd = macd.macd
        chartPoint.macdSignal = macd.signal
        chartPoint.macdHistogram = macd.histogram
      }

      // Ajouter tous les autres indicateurs pour les oscillateurs
      if (indicators.rsi?.[index]) {
        chartPoint.rsi = indicators.rsi[index].value
      }

      if (indicators.macd?.[index]) {
        const macd = indicators.macd[index]
        chartPoint.macd = macd.macd
        chartPoint.macdSignal = macd.signal
        chartPoint.macdHistogram = macd.histogram
      }

      if (indicators.stochastic?.[index]) {
        const stoch = indicators.stochastic[index]
        chartPoint.stochasticK = stoch.k
        chartPoint.stochasticD = stoch.d
      }

      if (indicators.williamsR?.[index]) {
        chartPoint.williamsR = indicators.williamsR[index].value
      }

      // Ajouter les nouveaux indicateurs
      if (indicators.vwap?.[index]) {
        chartPoint.vwap = indicators.vwap[index].vwap
      }

      if (indicators.supertrend?.[index]) {
        chartPoint.supertrend = indicators.supertrend[index].supertrend
        chartPoint.supertrendTrend = indicators.supertrend[index].trend
      }

      if (indicators.ichimoku?.[index]) {
        const ichimoku = indicators.ichimoku[index]
        chartPoint.tenkanSen = ichimoku.tenkanSen
        chartPoint.kijunSen = ichimoku.kijunSen
        chartPoint.senkouSpanA = ichimoku.senkouSpanA
        chartPoint.senkouSpanB = ichimoku.senkouSpanB
        chartPoint.chikouSpan = ichimoku.chikouSpan
      }

      if (indicators.pivotPoints?.[index]) {
        const pivot = indicators.pivotPoints[index]
        chartPoint.pivot = pivot.pivot
        chartPoint.r1 = pivot.r1
        chartPoint.r2 = pivot.r2
        chartPoint.r3 = pivot.r3
        chartPoint.s1 = pivot.s1
        chartPoint.s2 = pivot.s2
        chartPoint.s3 = pivot.s3
      }

      if (indicators.obv?.[index]) {
        chartPoint.obv = indicators.obv[index].obv
        chartPoint.obvSignal = indicators.obv[index].signal
      }

      // Ajouter les SMA/EMA pour le graphique principal
      if (indicators.sma1?.[index]) chartPoint.sma1 = indicators.sma1[index].value
      if (indicators.sma2?.[index]) chartPoint.sma2 = indicators.sma2[index].value
      if (indicators.ema1?.[index]) chartPoint.ema1 = indicators.ema1[index].value
      if (indicators.ema2?.[index]) chartPoint.ema2 = indicators.ema2[index].value

      // Ajouter les informations de trade si présentes
      if (trade) {
        chartPoint.trade = trade
        chartPoint.tradeType = trade.type
        chartPoint.tradeReason = trade.reason
        chartPoint.tradePnL = trade.pnl
      }

      return chartPoint
    })
  }, [currentBacktestData])

  // Séparer les trades par type pour l'affichage
  const buyTrades = chartData.filter(point => point.trade?.type === 'BUY')
  const sellTrades = chartData.filter(point => point.trade?.type === 'SELL')
  const stopLossTrades = sellTrades.filter(point =>
    point.trade?.reason?.includes('Stop Loss')
  )
  const takeProfitTrades = sellTrades.filter(point =>
    point.trade?.reason?.includes('Take Profit')
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-[#F9FAFB] font-medium mb-2">{data.displayDate}</p>
          <p className="text-[#F9FAFB] mb-1">
            {t('backtest.chart.price')}: <span className="font-mono">${data.price?.toFixed(2)}</span>
          </p>

          {/* Afficher les indicateurs selon la stratégie */}
          {data.rsi && (
            <p className="text-[#8B5CF6]">
              RSI: <span className="font-mono">{data.rsi.toFixed(2)}</span>
            </p>
          )}

          {data.ema1 && (
            <p className="text-[#00FF88]">
              EMA {backtestData.config.parameters.emaPeriod1}: <span className="font-mono">${data.ema1.toFixed(2)}</span>
            </p>
          )}

          {data.ema2 && (
            <p className="text-[#DC2626]">
              EMA {backtestData.config.parameters.emaPeriod2}: <span className="font-mono">${data.ema2.toFixed(2)}</span>
            </p>
          )}

          {data.trade && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className={`font-medium ${
                data.trade.type === 'BUY' ? 'text-[#00FF88]' : 'text-[#DC2626]'
              }`}>
                {data.trade.type === 'BUY' ? `📈 ${t('backtest.chart.buy').toUpperCase()}` : `📉 ${t('backtest.chart.sell').toUpperCase()}`}
              </p>
              <p className="text-gray-300 text-sm">{data.trade.reason}</p>
              {data.trade.pnl !== undefined && (
                <p className={`text-sm font-medium ${
                  data.trade.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                }`}>
                  P&L: {data.trade.pnl >= 0 ? '+' : ''}${data.trade.pnl.toFixed(2)}
                  {data.trade.pnlPercentage && (
                    <span className="ml-1">
                      ({data.trade.pnlPercentage >= 0 ? '+' : ''}{data.trade.pnlPercentage.toFixed(1)}%)
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const TradeMarker = ({ cx, cy, payload, type }: any) => {
    if (!payload.trade) return null

    const isStopLoss = payload.trade.reason?.includes('Stop Loss')
    const isTakeProfit = payload.trade.reason?.includes('Take Profit')
    const isBuy = type === 'BUY'

    // Couleurs plus vives et distinctives
    let fillColor = isBuy ? '#22C55E' : '#EF4444'  // Vert vif / Rouge vif
    let glowColor = isBuy ? '#22C55E' : '#EF4444'

    // Taille augmentée pour meilleure visibilité
    const radius = 8

    return (
      <g>
        {/* Cercle de glow externe pour effet lumineux */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 4}
          fill={glowColor}
          opacity={0.2}
          className="animate-pulse"
        />

        {/* Cercle principal */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={fillColor}
          stroke="#FFFFFF"
          strokeWidth={2.5}
          opacity={0.95}
        />

        {/* Icône au centre selon le type */}
        {isBuy ? (
          // Flèche vers le haut pour BUY (verte)
          <path
            d={`M ${cx} ${cy - 4} L ${cx + 3} ${cy + 2} L ${cx + 1.5} ${cy + 2} L ${cx + 1.5} ${cy + 4} L ${cx - 1.5} ${cy + 4} L ${cx - 1.5} ${cy + 2} L ${cx - 3} ${cy + 2} Z`}
            fill="white"
          />
        ) : isStopLoss ? (
          // Croix pour Stop Loss (rouge)
          <>
            <line x1={cx - 3} y1={cy - 3} x2={cx + 3} y2={cy + 3} stroke="white" strokeWidth={2} strokeLinecap="round" />
            <line x1={cx + 3} y1={cy - 3} x2={cx - 3} y2={cy + 3} stroke="white" strokeWidth={2} strokeLinecap="round" />
          </>
        ) : isTakeProfit ? (
          // Étoile pour Take Profit (verte)
          <path
            d={`M ${cx} ${cy - 4} L ${cx + 1} ${cy - 1} L ${cx + 4} ${cy} L ${cx + 1} ${cy + 1} L ${cx} ${cy + 4} L ${cx - 1} ${cy + 1} L ${cx - 4} ${cy} L ${cx - 1} ${cy - 1} Z`}
            fill="white"
          />
        ) : (
          // Flèche vers le bas pour SELL normal (rouge)
          <path
            d={`M ${cx} ${cy + 4} L ${cx + 3} ${cy - 2} L ${cx + 1.5} ${cy - 2} L ${cx + 1.5} ${cy - 4} L ${cx - 1.5} ${cy - 4} L ${cx - 1.5} ${cy - 2} L ${cx - 3} ${cy - 2} Z`}
            fill="white"
          />
        )}
      </g>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header professionnel */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#F9FAFB] via-[#E5E7EB] to-[#D1D5DB] bg-clip-text text-transparent">
            {backtestData.config.crypto} / USD
          </h2>
          <div className="px-4 py-2 bg-gradient-to-r from-white/[0.05] to-white/[0.08] backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold text-[#E5E7EB]">
            {backtestData.config.strategyType === 'custom' && backtestData.config.customStrategy
              ? backtestData.config.customStrategy.name || 'Stratégie Personnalisée'
              : backtestData.config.strategy.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
        <div className="text-sm text-[#9CA3AF] font-medium">
          {t('backtest.chart.period')}: {chartData.length} {t('backtest.chart.data_points')}
        </div>
      </div>

      {/* Section Mode Replay - Plus compacte */}
      <div className="space-y-3">
        {/* En-tête compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-[#F9FAFB]">{t('backtest.chart.replay_mode')}</h3>
            {replayMode && (
              <div className="px-2 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-xs text-red-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                {t('backtest.chart.active')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReplayMode(!replayMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                replayMode
                  ? 'bg-red-600/20 border border-red-600/50 text-red-400 hover:bg-red-600/30'
                  : 'bg-blue-600/20 border border-blue-600/50 text-blue-400 hover:bg-blue-600/30'
              }`}
            >
              {replayMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {replayMode ? t('backtest.chart.quit') : t('backtest.chart.activate')}
            </button>
            <div className="text-xs text-gray-400">
              {replayMode && replayState
                ? `${replayState.visibleData.prices.length} / ${backtestData.priceData.length} pts`
                : t('backtest.chart.relive_trades')
              }
            </div>
          </div>
        </div>

        {/* Contrôles de replay */}
        {replayMode && (
          <ReplayControls replayService={replayService} />
        )}
      </div>

      {/* Graphique principal */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="border-b border-white/10 px-8 py-6 bg-gradient-to-r from-white/[0.02] to-white/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent">
                {t('backtest.chart.price_indicators')}
              </h3>
              {/* Bannière de zoom intégrée */}
              {zoomedTrade && (
                <div className="flex items-center gap-2 bg-blue-900/50 border border-blue-600/50 rounded-lg px-3 py-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-200 text-sm font-medium">
                    {t('backtest.chart.zoomed_view')} - Trade #{zoomedTrade.number}
                  </span>
                  <span className="text-blue-400 text-xs bg-blue-800/50 px-2 py-0.5 rounded">
                    {currentBacktestData.priceData.length} bougies
                  </span>
                  {/* Toggle pour afficher/masquer les autres trades */}
                  <button
                    onClick={() => setShowOnlySelectedTrade(!showOnlySelectedTrade)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      showOnlySelectedTrade
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title={showOnlySelectedTrade ? 'Afficher tous les trades' : 'Masquer les autres trades'}
                  >
                    {showOnlySelectedTrade ? '1 trade' : 'Tous'}
                  </button>
                  <button
                    onClick={() => {
                      setZoomedTrade(null)
                      setShowOnlySelectedTrade(false)
                      onTradeZoomComplete?.()
                    }}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Contrôles de navigation intégrés */}
              <div id="chart-controls" className="flex items-center gap-1"></div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Mode Interactif</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">

          <div id="main-chart" className="w-full h-[500px]">
            <CandlestickChart
              data={chartData}
              width={800}
              height={500}
              trades={currentBacktestData.state.trades}
              indicators={currentBacktestData.indicators}
              config={currentBacktestData.config}
              highlightedTrade={zoomedTrade}
              disableZoom={replayMode && replayState?.followPrice}
            />
          </div>
        </div>

        {/* Légende améliorée avec symboles visuels */}
        <div className="border-t border-gray-700/30 px-6 py-4 bg-gray-800/20">
          <div className="flex flex-wrap items-center gap-8 text-sm">
            {/* Bougies */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-semibold">{t('backtest.chart.candles_label')}:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#00FF88] rounded"></div>
                <span className="text-gray-200">{t('backtest.chart.bullish')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#DC2626] rounded"></div>
                <span className="text-gray-200">{t('backtest.chart.bearish')}</span>
              </div>
            </div>

            {/* Trades */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-semibold">{t('backtest.chart.trading_signals')}:</span>
              <div className="flex items-center gap-2 bg-[#3B82F6]/10 px-3 py-1.5 rounded-lg border border-[#3B82F6]/30">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  {/* Cercle externe blanc */}
                  <circle cx="10" cy="10" r="8" fill="white"/>
                  {/* Cercle principal bleu */}
                  <circle cx="10" cy="10" r="7" fill="#3B82F6"/>
                  {/* Cercle interne blanc */}
                  <circle cx="10" cy="10" r="5" fill="white" opacity="0.4"/>
                  {/* Flèche UP blanche */}
                  <path d="M 10 6 L 13 12 L 11.5 12 L 11.5 14 L 8.5 14 L 8.5 12 L 7 12 Z" fill="white"/>
                </svg>
                <span className="text-[#3B82F6] font-bold">{t('backtest.chart.buy')}</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#10B981]/10 to-[#EF4444]/10 px-3 py-1.5 rounded-lg border border-gray-500/30">
                <svg width="20" height="20" viewBox="0 0 20 20">
                  {/* Cercle externe blanc */}
                  <circle cx="10" cy="10" r="8" fill="white"/>
                  {/* Dégradé vert/rouge */}
                  <defs>
                    <linearGradient id="sellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#EF4444', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <circle cx="10" cy="10" r="7" fill="url(#sellGradient)"/>
                  {/* Cercle interne blanc */}
                  <circle cx="10" cy="10" r="5" fill="white" opacity="0.4"/>
                  {/* Flèche DOWN blanche */}
                  <path d="M 10 14 L 13 8 L 11.5 8 L 11.5 6 L 8.5 6 L 8.5 8 L 7 8 Z" fill="white"/>
                </svg>
                <span className="text-gray-300 font-bold">{t('backtest.chart.sell')} <span className="text-xs text-gray-400">(Vert si +, Rouge si -)</span></span>
              </div>
              {stopLossTrades.length > 0 && (
                <div className="flex items-center gap-2 bg-[#DC2626]/10 px-3 py-1.5 rounded-lg border border-[#DC2626]/30">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    {/* Cercle externe blanc */}
                    <circle cx="10" cy="10" r="8" fill="white"/>
                    {/* Cercle principal rouge */}
                    <circle cx="10" cy="10" r="7" fill="#DC2626"/>
                    {/* Cercle interne blanc */}
                    <circle cx="10" cy="10" r="5" fill="white" opacity="0.4"/>
                    {/* Croix blanche */}
                    <line x1="6" y1="6" x2="14" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="14" y1="6" x2="6" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[#DC2626] font-bold">Stop Loss</span>
                </div>
              )}
              {takeProfitTrades.length > 0 && (
                <div className="flex items-center gap-2 bg-[#10B981]/10 px-3 py-1.5 rounded-lg border border-[#10B981]/30">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    {/* Cercle externe blanc */}
                    <circle cx="10" cy="10" r="8" fill="white"/>
                    {/* Cercle principal vert */}
                    <circle cx="10" cy="10" r="7" fill="#10B981"/>
                    {/* Cercle interne blanc */}
                    <circle cx="10" cy="10" r="5" fill="white" opacity="0.4"/>
                    {/* Étoile blanche */}
                    <path d="M 10 5 L 11 8 L 14 10 L 11 12 L 10 15 L 9 12 L 6 10 L 9 8 Z" fill="white"/>
                  </svg>
                  <span className="text-[#10B981] font-bold">Take Profit</span>
                </div>
              )}
            </div>

            {/* Indicateurs */}
            {(backtestData.indicators.ema1 || backtestData.indicators.ema2 || backtestData.indicators.sma1 || backtestData.indicators.sma2 || backtestData.indicators.bollinger || backtestData.indicators.vwap || backtestData.indicators.supertrend || backtestData.indicators.ichimoku || backtestData.indicators.pivotPoints) && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 font-medium">{t('backtest.chart.indicators')}:</span>
                <div className="flex items-center gap-3">
                  {backtestData.indicators.ema1 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#00FF88]"></div>
                      <span className="text-gray-300 text-xs">EMA1</span>
                    </div>
                  )}
                  {backtestData.indicators.ema2 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#DC2626]"></div>
                      <span className="text-gray-300 text-xs">EMA2</span>
                    </div>
                  )}
                  {backtestData.indicators.sma1 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#FFA366]"></div>
                      <span className="text-gray-300 text-xs">SMA1</span>
                    </div>
                  )}
                  {backtestData.indicators.sma2 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#8B5CF6]"></div>
                      <span className="text-gray-300 text-xs">SMA2</span>
                    </div>
                  )}
                  {backtestData.indicators.bollinger && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#00FF88] border-dashed border-t"></div>
                      <span className="text-gray-300 text-xs">BB</span>
                    </div>
                  )}
                  {backtestData.indicators.vwap && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#FFA366]"></div>
                      <span className="text-gray-300 text-xs">VWAP</span>
                    </div>
                  )}
                  {backtestData.indicators.supertrend && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#10B981]"></div>
                      <span className="text-gray-300 text-xs">SuperTrend</span>
                    </div>
                  )}
                  {/* Debug: afficher le statut des indicateurs */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500">
                      Debug: SuperTrend={backtestData.indicators.supertrend ? 'OK' : 'Missing'}
                    </div>
                  )}
                  {backtestData.indicators.ichimoku && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#8B5CF6]"></div>
                      <span className="text-gray-300 text-xs">Ichimoku</span>
                    </div>
                  )}
                  {backtestData.indicators.pivotPoints && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#EC4899] border-dashed border-t"></div>
                      <span className="text-gray-300 text-xs">Pivots</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sous-graphiques pour oscillateurs - Afficher seulement s'il y en a */}
      {(backtestData.indicators.rsi || backtestData.indicators.macd || backtestData.indicators.stochastic || backtestData.indicators.williamsR || backtestData.indicators.obv) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent">{t('backtest.chart.technical_oscillators')}</h3>
            <div className="text-sm text-[#9CA3AF] font-medium">
              Indicateurs de momentum et cycles
            </div>
          </div>
          <div className="space-y-6">
            <OscillatorCharts
              backtestData={currentBacktestData}
              chartData={chartData}
              t={t}
            />
          </div>
        </div>
      )}

      {/* Résumé des performances - Pleine largeur */}
      {backtestData.state.summary && (
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
          <div className="border-b border-gray-700/30 px-6 py-3">
            <h3 className="text-lg font-semibold text-[#F9FAFB]">{t('backtest.chart.performance_summary')}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F9FAFB] mb-1">
                  {backtestData.state.summary.totalTrades || 0}
                </div>
                <div className="text-sm text-gray-400">{t('backtest.chart.total_trades')}</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  (backtestData.state.summary.winRate || 0) >= 50 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                }`}>
                  {((backtestData.state.summary.winRate || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">{t('backtest.chart.success_rate')}</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  (backtestData.state.summary.totalPnL || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                }`}>
                  ${(backtestData.state.summary.totalPnL || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">{t('backtest.chart.total_pnl')}</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  (backtestData.state.summary.totalReturn || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                }`}>
                  {((backtestData.state.summary.totalReturn || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">{t('backtest.chart.return')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equity Curve - Pleine largeur */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="border-b border-white/10 px-8 py-6 bg-gradient-to-r from-white/[0.02] to-white/[0.05]">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent">
              {t('backtest.chart.equity_curve')}
            </h3>
            <div className="text-sm text-gray-400">
              {t('backtest.chart.capital_evolution')}
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="h-80 bg-gray-900/50 rounded-lg border border-gray-700/50 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={backtestData.state.capitalHistory.map(point => ({
                  timestamp: point.timestamp,
                  value: point.value,
                  displayDate: formatDate(point.timestamp)
                }))}
                margin={{ top: 10, right: 40, left: 30, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.4} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#D1D5DB"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#D1D5DB"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  domain={[
                    (dataMin: number) => Math.floor(dataMin * 0.99),
                    (dataMax: number) => Math.ceil(dataMax * 1.01)
                  ]}
                  scale="linear"
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const initialCapital = backtestData.config.initialCapital
                      const pnl = data.value - initialCapital
                      const pnlPercent = ((pnl / initialCapital) * 100).toFixed(2)
                      return (
                        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-4 shadow-xl">
                          <p className="text-[#F9FAFB] font-medium mb-2">{data.displayDate}</p>
                          <p className="text-[#F9FAFB] mb-1">
                            {t('backtest.chart.capital')}: <span className="font-mono">${data.value.toFixed(2)}</span>
                          </p>
                          <p className={`${pnl >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                            P&L: <span className="font-mono">{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00FF88"
                  strokeWidth={3}
                  dot={false}
                  name={t('backtest.chart.capital')}
                />
                <ReferenceDot
                  y={backtestData.config.initialCapital}
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#00FF88]"></div>
                <span className="text-gray-300">{t('backtest.chart.total_capital')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#9CA3AF] border-dashed border-t"></div>
                <span className="text-gray-400">{t('backtest.chart.initial_capital')} (${backtestData.config.initialCapital.toFixed(0)})</span>
              </div>
            </div>
            <div className="text-gray-400">
              {backtestData.state.capitalHistory.length} {t('backtest.chart.data_points')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}