"use client"

import React, { useState } from 'react'
import { Play, Settings, TrendingUp, Calendar, DollarSign, Target, BarChart3, Activity, Save, FolderOpen, Download, Upload } from 'lucide-react'
import { BacktestPeriod } from '@/services/historicalDataService'
import { StrategyDatabaseService as StrategyStorageService, SavedStrategy } from '@/services/strategyDatabaseService'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

interface IndicatorConfig {
  id: string
  type: 'RSI' | 'EMA' | 'SMA' | 'MACD' | 'BOLLINGER' | 'STOCHASTIC' | 'VOLUME' | 'SUPPORT_RESISTANCE' | 'VWAP' | 'SUPERTREND' | 'ICHIMOKU' | 'PIVOT_POINTS' | 'OBV'
  enabled: boolean
  parameters: Record<string, any>
  conditions: {
    entry: Array<{
      condition: string
      value1?: number
      value2?: number
      operator?: 'AND' | 'OR'
    }>
    exit: Array<{
      condition: string
      value1?: number
      value2?: number
      operator?: 'AND' | 'OR'
    }>
  }
}

interface BacktestConfig {
  crypto: 'BTC' | 'ETH'
  period: BacktestPeriod
  strategyType: 'recommended' | 'custom'
  strategy: string
  customStrategy?: {
    name: string
    indicators: IndicatorConfig[]
    entryLogic: 'ALL_AND' | 'ANY_OR' | 'CUSTOM'
    exitLogic: 'ALL_AND' | 'ANY_OR' | 'CUSTOM'
  }
  initialCapital: number
  positionSize: number
  riskManagement: {
    stopLoss: number
    takeProfit: number
    trailingStop?: boolean
    trailingStopPercent?: number
  }
  parameters: {
    rsiPeriod: number
    rsiOversold: number
    rsiOverbought: number
    emaPeriod1: number
    emaPeriod2: number
    bollingerPeriod: number
    bollingerStdDev: number
    macdFast: number
    macdSlow: number
    macdSignal: number
    stochasticK: number
    stochasticD: number
    smaPeriod: number
    dcaAmount: number
    dcaFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  }
}

interface BacktestConfigurationProps {
  onStartBacktest: (config: BacktestConfig) => void
  isRunning?: boolean
  initialConfig?: BacktestConfig
}

export default function BacktestConfiguration({ onStartBacktest, isRunning = false, initialConfig }: BacktestConfigurationProps) {
  const { t } = useLanguage()
  const { isDarkMode } = useTheme()

  const [config, setConfig] = useState<BacktestConfig>(initialConfig || {
    crypto: 'BTC',
    period: BacktestPeriod.ONE_YEAR,
    strategyType: 'recommended',
    strategy: '', // Aucune stratégie sélectionnée par défaut
    initialCapital: 10000,
    positionSize: 20,
    riskManagement: {
      stopLoss: 5,
      takeProfit: 10,
      trailingStop: false,
      trailingStopPercent: 3
    },
    parameters: {
      rsiPeriod: 14,
      rsiOversold: 30,
      rsiOverbought: 70,
      emaPeriod1: 20,
      emaPeriod2: 50,
      bollingerPeriod: 20,
      bollingerStdDev: 2,
      macdFast: 12,
      macdSlow: 26,
      macdSignal: 9,
      stochasticK: 14,
      stochasticD: 3,
      smaPeriod: 50,
      dcaAmount: 100,
      dcaFrequency: 'weekly'
    }
  })

  const [activeTab, setActiveTab] = useState<'recommended' | 'custom'>('recommended')
  const [savedStrategies, setSavedStrategies] = useState<SavedStrategy[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [strategyName, setStrategyName] = useState('')
  const [strategyDescription, setStrategyDescription] = useState('')

  // Mettre à jour la config et l'onglet quand initialConfig change (quand on revient de l'onglet résultats)
  React.useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
      // Synchroniser l'onglet actif avec le type de stratégie qui a été utilisé
      setActiveTab(initialConfig.strategyType)
    }
  }, [initialConfig])

  // Charger les stratégies sauvegardées au montage
  React.useEffect(() => {
    const loadStrategies = async () => {
      try {
        const strategies = await StrategyStorageService.getAllSavedStrategies()
        setSavedStrategies(strategies)
      } catch (error) {

      }
    }
    loadStrategies()
  }, [])

  const recommendedStrategies = [
    {
      id: 'dca',
      name: 'DCA (Dollar Cost Averaging)',
      description: 'Achète automatiquement un montant fixe à intervalle régulier, sans se soucier du prix. Stratégie passive idéale pour accumuler sur le long terme.',
      type: 'Accumulation',
      difficulty: t('difficulty.beginner'),
      winRate: 'N/A',
      indicators: ['Aucun']
    },
    {
      id: 'rsi_oversold',
      name: t('strategy.rsi.name'),
      description: t('strategy.rsi.desc'),
      type: t('strategy.rsi.type'),
      difficulty: t('difficulty.beginner'),
      winRate: '~65%',
      indicators: ['RSI']
    },
    {
      id: 'ema_cross',
      name: t('strategy.ema.name'),
      description: t('strategy.ema.desc'),
      type: t('strategy.ema.type'),
      difficulty: t('difficulty.beginner'),
      winRate: '~58%',
      indicators: ['EMA 20', 'EMA 50']
    },
    {
      id: 'bollinger_mean_reversion',
      name: t('strategy.bollinger.name'),
      description: t('strategy.bollinger.desc'),
      type: t('strategy.bollinger.type'),
      difficulty: t('difficulty.intermediate'),
      winRate: '~72%',
      indicators: ['Bollinger Bands']
    },
    {
      id: 'macd_rsi_combo',
      name: t('strategy.macd_rsi.name'),
      description: t('strategy.macd_rsi.desc'),
      type: t('strategy.macd_rsi.type'),
      difficulty: t('difficulty.intermediate'),
      winRate: '~70%',
      indicators: ['MACD', 'RSI']
    },
    {
      id: 'triple_ema',
      name: t('strategy.triple_ema.name'),
      description: t('strategy.triple_ema.desc'),
      type: t('strategy.triple_ema.type'),
      difficulty: t('difficulty.advanced'),
      winRate: '~68%',
      indicators: ['EMA 9', 'EMA 21', 'EMA 55']
    },
    {
      id: 'stochastic_bollinger',
      name: t('strategy.stoch_bollinger.name'),
      description: t('strategy.stoch_bollinger.desc'),
      type: t('strategy.stoch_bollinger.type'),
      difficulty: t('difficulty.advanced'),
      winRate: '~75%',
      indicators: ['Stochastic', 'Bollinger Bands']
    }
  ]

  const availableIndicators = [
    {
      id: 'RSI',
      name: 'RSI',
      fullName: 'Relative Strength Index',
      category: t('indicator.category.oscillator'),
      description: 'Mesure la force du momentum',
      parameters: [
        { key: 'period', name: t('indicator.param.period'), default: 14, min: 5, max: 30 },
        { key: 'oversold', name: 'Survente', default: 30, min: 20, max: 40 },
        { key: 'overbought', name: 'Surachat', default: 70, min: 60, max: 80 }
      ]
    },
    {
      id: 'EMA',
      name: 'EMA',
      fullName: 'Exponential Moving Average',
      category: t('indicator.category.trend'),
      description: 'Moyenne mobile exponentielle',
      parameters: [
        { key: 'period', name: t('indicator.param.period'), default: 20, min: 5, max: 200 }
      ]
    },
    {
      id: 'SMA',
      name: 'SMA',
      fullName: 'Simple Moving Average',
      category: t('indicator.category.trend'),
      description: 'Moyenne mobile simple',
      parameters: [
        { key: 'period', name: t('indicator.param.period'), default: 50, min: 5, max: 200 }
      ]
    },
    {
      id: 'MACD',
      name: 'MACD',
      fullName: 'Moving Average Convergence Divergence',
      category: t('indicator.category.momentum'),
      description: 'Convergence/divergence des moyennes mobiles',
      parameters: [
        { key: 'fast', name: 'Rapide', default: 12, min: 5, max: 20 },
        { key: 'slow', name: 'Lent', default: 26, min: 20, max: 50 },
        { key: 'signal', name: 'Signal', default: 9, min: 5, max: 15 }
      ]
    },
    {
      id: 'BOLLINGER',
      name: 'Bollinger',
      fullName: 'Bollinger Bands',
      category: t('indicator.category.volatility'),
      description: 'Bandes de volatilité',
      parameters: [
        { key: 'period', name: t('indicator.param.period'), default: 20, min: 10, max: 50 },
        { key: 'stdDev', name: 'Déviation', default: 2, min: 1, max: 3, step: 0.1 }
      ]
    },
    {
      id: 'STOCHASTIC',
      name: 'Stochastic',
      fullName: 'Stochastic Oscillator',
      category: t('indicator.category.oscillator'),
      description: 'Oscillateur de momentum',
      parameters: [
        { key: 'k', name: '%K Période', default: 14, min: 5, max: 25 },
        { key: 'd', name: '%D Période', default: 3, min: 2, max: 10 }
      ]
    },
    {
      id: 'VWAP',
      name: 'VWAP',
      fullName: 'Volume Weighted Average Price',
      category: t('indicator.category.volume'),
      description: 'Prix moyen pondéré par le volume',
      parameters: [
        { key: 'period', name: t('indicator.param.period'), default: 20, min: 10, max: 100 }
      ]
    },
    {
      id: 'SUPERTREND',
      name: 'SuperTrend',
      fullName: 'SuperTrend Indicator',
      category: t('indicator.category.trend'),
      description: 'Indicateur de tendance basé sur l\'ATR',
      parameters: [
        { key: 'period', name: 'Période ATR', default: 10, min: 5, max: 20 },
        { key: 'multiplier', name: 'Multiplicateur', default: 3, min: 1, max: 5, step: 0.1 }
      ]
    },
    {
      id: 'ICHIMOKU',
      name: 'Ichimoku',
      fullName: 'Ichimoku Kinko Hyo',
      category: t('indicator.category.trend'),
      description: 'Système complet d\'analyse technique',
      parameters: [
        { key: 'tenkan', name: 'Tenkan-sen', default: 9, min: 5, max: 15 },
        { key: 'kijun', name: 'Kijun-sen', default: 26, min: 20, max: 35 },
        { key: 'senkou', name: 'Senkou Span B', default: 52, min: 40, max: 65 }
      ]
    },
    {
      id: 'PIVOT_POINTS',
      name: 'Pivot Points',
      fullName: 'Pivot Points',
      category: t('indicator.category.support_resistance'),
      description: 'Niveaux de support et résistance',
      parameters: [
        { key: 'type', name: 'Type', default: 'standard', options: ['standard', 'fibonacci', 'camarilla'] }
      ]
    },
    {
      id: 'OBV',
      name: 'OBV',
      fullName: 'On-Balance Volume',
      category: t('indicator.category.volume'),
      description: 'Volume en équilibre',
      parameters: [
        { key: 'signal_period', name: 'Période Signal', default: 10, min: 5, max: 30 }
      ]
    }
  ]

  const periods = [
    { value: BacktestPeriod.ONE_MONTH, label: t('period.1_month'), description: t('period.1_month_desc') },
    { value: BacktestPeriod.THREE_MONTHS, label: t('period.3_months'), description: t('period.3_months_desc') },
    { value: BacktestPeriod.SIX_MONTHS, label: t('period.6_months'), description: t('period.6_months_desc') },
    { value: BacktestPeriod.ONE_YEAR, label: t('period.1_year'), description: t('period.1_year_desc') },
    { value: BacktestPeriod.TWO_YEARS, label: t('period.2_years'), description: t('period.2_years_desc') },
    { value: BacktestPeriod.FIVE_YEARS, label: t('period.5_years'), description: t('period.5_years_desc') }
  ]

  const selectedStrategy = recommendedStrategies.find(s => s.id === config.strategy)

  // Fonctions pour la gestion des stratégies personnalisées
  const toggleIndicator = (indicator: any) => {
    setConfig(prev => {
      const existing = prev.customStrategy?.indicators || []
      const isSelected = existing.some(ind => ind.id === indicator.id)

      if (isSelected) {
        return {
          ...prev,
          customStrategy: {
            ...prev.customStrategy,
            name: prev.customStrategy?.name || t('strategy.summary.custom'),
            indicators: existing.filter(ind => ind.id !== indicator.id),
            entryLogic: prev.customStrategy?.entryLogic || 'ALL_AND',
            exitLogic: prev.customStrategy?.exitLogic || 'ALL_AND'
          }
        }
      } else {
        const newIndicator: IndicatorConfig = {
          id: indicator.id,
          type: indicator.id as 'RSI' | 'EMA' | 'SMA' | 'MACD' | 'BOLLINGER' | 'STOCHASTIC' | 'VWAP' | 'SUPERTREND' | 'ICHIMOKU' | 'PIVOT_POINTS' | 'OBV',
          enabled: true,
          parameters: getDefaultParameters(indicator.id),
          conditions: {
            entry: getDefaultEntryConditions(indicator.id),
            exit: getDefaultExitConditions(indicator.id)
          }
        }

        return {
          ...prev,
          customStrategy: {
            ...prev.customStrategy,
            name: prev.customStrategy?.name || t('strategy.summary.custom'),
            indicators: [...existing, newIndicator],
            entryLogic: prev.customStrategy?.entryLogic || 'ALL_AND',
            exitLogic: prev.customStrategy?.exitLogic || 'ALL_AND'
          }
        }
      }
    })
  }

  const removeIndicator = (indicatorId: string) => {
    setConfig(prev => ({
      ...prev,
      customStrategy: {
        ...prev.customStrategy!,
        indicators: prev.customStrategy!.indicators.filter(ind => ind.id !== indicatorId)
      }
    }))
  }

  const getDefaultParameters = (type: string): Record<string, any> => {
    switch (type) {
      case 'RSI': return { period: 14 }
      case 'EMA': return { period: 20 }
      case 'SMA': return { period: 20 }
      case 'MACD': return { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
      case 'BOLLINGER': return { period: 20, stdDev: 2 }
      case 'STOCHASTIC': return { kPeriod: 14, dPeriod: 3 }
      case 'VWAP': return { period: 20 }
      case 'SUPERTREND': return { period: 10, multiplier: 3 }
      case 'ICHIMOKU': return { tenkan: 9, kijun: 26, senkou: 52 }
      case 'PIVOT_POINTS': return { type: 'standard' }
      case 'OBV': return { signal_period: 10 }
      default: return {}
    }
  }

  const getDefaultEntryConditions = (type: string) => {
    switch (type) {
      case 'RSI': return [{ condition: 'rsi_oversold', value1: 30 }]
      case 'EMA': return [{ condition: 'price_cross_above_ema' }]
      case 'SMA': return [{ condition: 'price_cross_above_sma' }]
      case 'MACD': return [{ condition: 'macd_cross_above_signal' }]
      case 'BOLLINGER': return [{ condition: 'price_touches_lower_band' }]
      case 'STOCHASTIC': return [{ condition: 'stoch_oversold', value1: 20 }]
      case 'VWAP': return [{ condition: 'price_cross_above_vwap' }]
      case 'SUPERTREND': return [{ condition: 'supertrend_trend_change_bullish' }]
      case 'ICHIMOKU': return [{ condition: 'price_above_cloud' }]
      case 'PIVOT_POINTS': return [{ condition: 'price_touches_s1' }]
      case 'OBV': return [{ condition: 'obv_cross_above_signal' }]
      default: return [{ condition: 'custom', value1: 0 }]
    }
  }

  const getDefaultExitConditions = (type: string) => {
    switch (type) {
      case 'RSI': return [{ condition: 'rsi_overbought', value1: 70 }]
      case 'EMA': return [{ condition: 'price_cross_below_ema' }]
      case 'SMA': return [{ condition: 'price_cross_below_sma' }]
      case 'MACD': return [{ condition: 'macd_cross_below_signal' }]
      case 'BOLLINGER': return [{ condition: 'price_touches_upper_band' }]
      case 'STOCHASTIC': return [{ condition: 'stoch_overbought', value1: 80 }]
      case 'VWAP': return [{ condition: 'price_cross_below_vwap' }]
      case 'SUPERTREND': return [{ condition: 'supertrend_trend_change_bearish' }]
      case 'ICHIMOKU': return [{ condition: 'price_below_cloud' }]
      case 'PIVOT_POINTS': return [{ condition: 'price_touches_r1' }]
      case 'OBV': return [{ condition: 'obv_cross_below_signal' }]
      default: return [{ condition: 'custom', value1: 0 }]
    }
  }

  // Fonction pour obtenir les conditions disponibles pour chaque indicateur
  const getAvailableConditions = (type: string, conditionType: 'entry' | 'exit') => {
    const conditions: Record<string, { label: string, hasValue1?: boolean, hasValue2?: boolean, placeholder1?: string, placeholder2?: string }> = {}

    switch (type) {
      case 'RSI':
        conditions['rsi_oversold'] = { label: 'RSI en survente (<)', hasValue1: true, placeholder1: '30' }
        conditions['rsi_overbought'] = { label: 'RSI en surachat (>)', hasValue1: true, placeholder1: '70' }
        conditions['rsi_above'] = { label: 'RSI au-dessus de', hasValue1: true, placeholder1: '50' }
        conditions['rsi_below'] = { label: 'RSI en-dessous de', hasValue1: true, placeholder1: '50' }
        conditions['rsi_between'] = { label: 'RSI entre', hasValue1: true, hasValue2: true, placeholder1: '30', placeholder2: '70' }
        break

      case 'EMA':
        conditions['price_cross_above_ema'] = { label: 'Prix croise au-dessus EMA' }
        conditions['price_cross_below_ema'] = { label: 'Prix croise en-dessous EMA' }
        conditions['price_above_ema'] = { label: 'Prix au-dessus EMA' }
        conditions['price_below_ema'] = { label: 'Prix en-dessous EMA' }
        conditions['price_distance_from_ema'] = { label: 'Distance prix/EMA (%)', hasValue1: true, placeholder1: '2' }
        break

      case 'SMA':
        conditions['price_cross_above_sma'] = { label: 'Prix croise au-dessus SMA' }
        conditions['price_cross_below_sma'] = { label: 'Prix croise en-dessous SMA' }
        conditions['price_above_sma'] = { label: 'Prix au-dessus SMA' }
        conditions['price_below_sma'] = { label: 'Prix en-dessous SMA' }
        conditions['price_distance_from_sma'] = { label: 'Distance prix/SMA (%)', hasValue1: true, placeholder1: '2' }
        break

      case 'MACD':
        conditions['macd_cross_above_signal'] = { label: 'MACD croise au-dessus Signal' }
        conditions['macd_cross_below_signal'] = { label: 'MACD croise en-dessous Signal' }
        conditions['macd_above_zero'] = { label: 'MACD au-dessus de 0' }
        conditions['macd_below_zero'] = { label: 'MACD en-dessous de 0' }
        conditions['macd_histogram_positive'] = { label: 'Histogramme MACD positif' }
        conditions['macd_histogram_negative'] = { label: 'Histogramme MACD négatif' }
        conditions['macd_divergence_bullish'] = { label: 'Divergence haussière MACD' }
        conditions['macd_divergence_bearish'] = { label: 'Divergence baissière MACD' }
        break

      case 'BOLLINGER':
        conditions['price_touches_lower_band'] = { label: 'Prix touche bande basse' }
        conditions['price_touches_upper_band'] = { label: 'Prix touche bande haute' }
        conditions['price_breaks_lower_band'] = { label: 'Prix casse bande basse' }
        conditions['price_breaks_upper_band'] = { label: 'Prix casse bande haute' }
        conditions['price_in_lower_zone'] = { label: 'Prix dans zone basse (< moyenne)' }
        conditions['price_in_upper_zone'] = { label: 'Prix dans zone haute (> moyenne)' }
        conditions['bollinger_squeeze'] = { label: 'Bollinger Squeeze (bandes serrées)' }
        conditions['bollinger_expansion'] = { label: 'Expansion des bandes' }
        break

      case 'STOCHASTIC':
        conditions['stoch_oversold'] = { label: '%K en survente (<)', hasValue1: true, placeholder1: '20' }
        conditions['stoch_overbought'] = { label: '%K en surachat (>)', hasValue1: true, placeholder1: '80' }
        conditions['stoch_k_cross_above_d'] = { label: '%K croise au-dessus %D' }
        conditions['stoch_k_cross_below_d'] = { label: '%K croise en-dessous %D' }
        conditions['stoch_both_oversold'] = { label: '%K et %D en survente', hasValue1: true, placeholder1: '20' }
        conditions['stoch_both_overbought'] = { label: '%K et %D en surachat', hasValue1: true, placeholder1: '80' }
        break

      case 'VWAP':
        conditions['price_above_vwap'] = { label: 'Prix au-dessus VWAP' }
        conditions['price_below_vwap'] = { label: 'Prix en-dessous VWAP' }
        conditions['price_cross_above_vwap'] = { label: 'Prix croise au-dessus VWAP' }
        conditions['price_cross_below_vwap'] = { label: 'Prix croise en-dessous VWAP' }
        conditions['price_distance_from_vwap'] = { label: 'Distance prix/VWAP (%)', hasValue1: true, placeholder1: '1' }
        conditions['volume_above_average'] = { label: 'Volume supérieur à la moyenne' }
        break

      case 'SUPERTREND':
        conditions['supertrend_bullish'] = { label: 'SuperTrend haussier' }
        conditions['supertrend_bearish'] = { label: 'SuperTrend baissier' }
        conditions['price_above_supertrend'] = { label: 'Prix au-dessus SuperTrend' }
        conditions['price_below_supertrend'] = { label: 'Prix en-dessous SuperTrend' }
        conditions['supertrend_trend_change_bullish'] = { label: 'Changement de tendance haussier' }
        conditions['supertrend_trend_change_bearish'] = { label: 'Changement de tendance baissier' }
        break

      case 'ICHIMOKU':
        conditions['price_above_cloud'] = { label: 'Prix au-dessus du nuage' }
        conditions['price_below_cloud'] = { label: 'Prix en-dessous du nuage' }
        conditions['price_in_cloud'] = { label: 'Prix dans le nuage' }
        conditions['tenkan_cross_above_kijun'] = { label: 'Tenkan croise au-dessus Kijun' }
        conditions['tenkan_cross_below_kijun'] = { label: 'Tenkan croise en-dessous Kijun' }
        conditions['price_cross_above_tenkan'] = { label: 'Prix croise au-dessus Tenkan' }
        conditions['price_cross_below_tenkan'] = { label: 'Prix croise en-dessous Tenkan' }
        conditions['chikou_above_price'] = { label: 'Chikou au-dessus du prix' }
        conditions['chikou_below_price'] = { label: 'Chikou en-dessous du prix' }
        conditions['cloud_bullish'] = { label: 'Nuage haussier (Senkou A > Senkou B)' }
        conditions['cloud_bearish'] = { label: 'Nuage baissier (Senkou A < Senkou B)' }
        break

      case 'PIVOT_POINTS':
        conditions['price_above_pivot'] = { label: 'Prix au-dessus du pivot' }
        conditions['price_below_pivot'] = { label: 'Prix en-dessous du pivot' }
        conditions['price_above_r1'] = { label: 'Prix au-dessus R1' }
        conditions['price_below_s1'] = { label: 'Prix en-dessous S1' }
        conditions['price_touches_r1'] = { label: 'Prix touche R1' }
        conditions['price_touches_s1'] = { label: 'Prix touche S1' }
        conditions['price_touches_r2'] = { label: 'Prix touche R2' }
        conditions['price_touches_s2'] = { label: 'Prix touche S2' }
        conditions['price_between_pivot_r1'] = { label: 'Prix entre Pivot et R1' }
        conditions['price_between_s1_pivot'] = { label: 'Prix entre S1 et Pivot' }
        break

      case 'OBV':
        conditions['obv_rising'] = { label: 'OBV en hausse' }
        conditions['obv_falling'] = { label: 'OBV en baisse' }
        conditions['obv_above_signal'] = { label: 'OBV au-dessus du signal' }
        conditions['obv_below_signal'] = { label: 'OBV en-dessous du signal' }
        conditions['obv_cross_above_signal'] = { label: 'OBV croise au-dessus du signal' }
        conditions['obv_cross_below_signal'] = { label: 'OBV croise en-dessous du signal' }
        conditions['obv_divergence_bullish'] = { label: 'Divergence haussière OBV' }
        conditions['obv_divergence_bearish'] = { label: 'Divergence baissière OBV' }
        break

      default:
        conditions['custom_condition'] = { label: 'Condition personnalisée', hasValue1: true, placeholder1: '0' }
        break
    }

    return conditions
  }

  const updateIndicatorParameter = (indicatorId: string, paramKey: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      customStrategy: {
        ...prev.customStrategy!,
        indicators: prev.customStrategy!.indicators.map(ind =>
          ind.id === indicatorId
            ? { ...ind, parameters: { ...ind.parameters, [paramKey]: value } }
            : ind
        )
      }
    }))
  }

  const updateIndicatorCondition = (
    indicatorId: string,
    conditionType: 'entry' | 'exit',
    conditionIndex: number,
    field: string,
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      customStrategy: {
        ...prev.customStrategy!,
        indicators: prev.customStrategy!.indicators.map(ind =>
          ind.id === indicatorId
            ? {
                ...ind,
                conditions: {
                  ...ind.conditions,
                  [conditionType]: ind.conditions[conditionType].map((cond, idx) =>
                    idx === conditionIndex ? { ...cond, [field]: value } : cond
                  )
                }
              }
            : ind
        )
      }
    }))
  }

  const renderIndicatorConfig = (indicator: IndicatorConfig, index: number) => {
    const indicatorInfo = availableIndicators.find(ai => ai.id === indicator.id)

    return (
      <div className="space-y-4">
        {/* Paramètres de l'indicateur */}
        <div>
          <h6 className="text-sm font-medium text-gray-300 mb-3">{t('indicator.parameters')}</h6>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(indicator.parameters).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1 capitalize">
                  {key === 'period' ? t('indicator.param.period') :
                   key === 'fastPeriod' ? t('indicator.param.fast_period') :
                   key === 'slowPeriod' ? t('indicator.param.slow_period') :
                   key === 'signalPeriod' ? t('indicator.param.signal_period') :
                   key === 'stdDev' ? t('indicator.param.std_dev') :
                   key === 'kPeriod' ? t('indicator.param.k_period') :
                   key === 'dPeriod' ? t('indicator.param.d_period') :
                   key}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateIndicatorParameter(indicator.id, key, Number(e.target.value))}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
                  min="1"
                  step={key === 'stdDev' ? '0.1' : '1'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Conditions d'entrée */}
        <div>
          <h6 className="text-sm font-medium text-gray-300 mb-3">{t('indicator.entry_conditions')}</h6>
          {indicator.conditions.entry.map((condition, condIndex) => {
            const availableConditions = getAvailableConditions(indicator.type, 'entry')
            const conditionEntries = Object.entries(availableConditions)
            const selectedConditionInfo = availableConditions[condition.condition]

            const currentCondition = selectedConditionInfo ? condition.condition : conditionEntries[0]?.[0] || ''

            return (
              <div key={condIndex} className="space-y-2 mb-3 p-3 border border-gray-600/50 rounded-lg bg-gray-700/20">
                <select
                  value={currentCondition}
                  onChange={(e) => updateIndicatorCondition(indicator.id, 'entry', condIndex, 'condition', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB]"
                >
                  {conditionEntries.map(([key, info]) => (
                    <option key={key} value={key} className="bg-gray-800 text-white">{info.label}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  {availableConditions[currentCondition]?.hasValue1 && (
                    <input
                      type="number"
                      placeholder={availableConditions[currentCondition].placeholder1}
                      value={condition.value1 || ''}
                      onChange={(e) => updateIndicatorCondition(indicator.id, 'entry', condIndex, 'value1', Number(e.target.value) || undefined)}
                      className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB]"
                      step="0.1"
                    />
                  )}
                  {availableConditions[currentCondition]?.hasValue2 && (
                    <input
                      type="number"
                      placeholder={availableConditions[currentCondition].placeholder2}
                      value={condition.value2 || ''}
                      onChange={(e) => updateIndicatorCondition(indicator.id, 'entry', condIndex, 'value2', Number(e.target.value) || undefined)}
                      className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB]"
                      step="0.1"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Conditions de sortie */}
        <div>
          <h6 className="text-sm font-medium text-gray-300 mb-3">{t('indicator.exit_conditions')}</h6>
          {indicator.conditions.exit.map((condition, condIndex) => {
            const availableConditions = getAvailableConditions(indicator.type, 'exit')
            const conditionEntries = Object.entries(availableConditions)
            const selectedConditionInfo = availableConditions[condition.condition]

            const currentCondition = selectedConditionInfo ? condition.condition : conditionEntries[0]?.[0] || ''

            return (
              <div key={condIndex} className="space-y-2 mb-3 p-3 border border-gray-600/50 rounded-lg bg-gray-700/20">
                <select
                  value={currentCondition}
                  onChange={(e) => updateIndicatorCondition(indicator.id, 'exit', condIndex, 'condition', e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB]"
                >
                  {conditionEntries.map(([key, info]) => (
                    <option key={key} value={key} className="bg-gray-800 text-white">{info.label}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  {availableConditions[currentCondition]?.hasValue1 && (
                    <input
                      type="number"
                      placeholder={availableConditions[currentCondition].placeholder1}
                      value={condition.value1 || ''}
                      onChange={(e) => updateIndicatorCondition(indicator.id, 'exit', condIndex, 'value1', Number(e.target.value) || undefined)}
                      className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB]"
                      step="0.1"
                    />
                  )}
                  {availableConditions[currentCondition]?.hasValue2 && (
                    <input
                      type="number"
                      placeholder={availableConditions[currentCondition].placeholder2}
                      value={condition.value2 || ''}
                      onChange={(e) => updateIndicatorCondition(indicator.id, 'exit', condIndex, 'value2', Number(e.target.value) || undefined)}
                      className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs text-[#F9FAFB]"
                      step="0.1"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const isConfigValid = () => {
    // Valider selon l'onglet actif
    if (activeTab === 'recommended') {
      // Pour les stratégies recommandées, une stratégie doit être sélectionnée
      return config.strategy !== ''
    } else {
      // Pour les stratégies custom, au moins un indicateur doit être configuré
      if (!config.customStrategy) return false
      return config.customStrategy.indicators.length > 0
    }
  }

  // Fonctions de gestion des stratégies sauvegardées
  const handleSaveStrategy = async () => {
    if (!config.customStrategy || strategyName.trim() === '') return

    try {
      const strategyToSave = {
        name: strategyName.trim(),
        description: strategyDescription.trim(),
        config: {
          strategyType: 'custom' as const,
          customStrategy: config.customStrategy,
          riskManagement: config.riskManagement,
          parameters: config.parameters
        }
      }

      await StrategyStorageService.saveStrategy(strategyToSave)
      const updatedStrategies = await StrategyStorageService.getAllSavedStrategies()
      setSavedStrategies(updatedStrategies)
      setShowSaveModal(false)
      setStrategyName('')
      setStrategyDescription('')
    } catch (error) {

    }
  }

  const handleLoadStrategy = (savedStrategy: SavedStrategy) => {
    setConfig(prev => ({
      ...prev,
      strategyType: 'custom',
      customStrategy: savedStrategy.config.customStrategy,
      riskManagement: savedStrategy.config.riskManagement,
      parameters: savedStrategy.config.parameters
    }))
    setActiveTab('custom')
    setShowLoadModal(false)
  }

  const handleDeleteStrategy = async (id: string) => {
    if (confirm(t('modal.load.delete_confirm'))) {
      try {
        await StrategyStorageService.deleteStrategy(id)
        const updatedStrategies = await StrategyStorageService.getAllSavedStrategies()
        setSavedStrategies(updatedStrategies)
      } catch (error) {

      }
    }
  }

  const canSaveStrategy = () => {
    return config.strategyType === 'custom' &&
           config.customStrategy?.indicators.length > 0
  }

  const handleStartBacktest = () => {
    // Créer une config finale basée sur le type de stratégie actif
    const finalConfig: BacktestConfig = {
      ...config,
      strategyType: activeTab,
      // Important : si on est en mode custom, on ne doit PAS utiliser la stratégie recommandée
      // Mettre strategy à une valeur vide pour éviter que le moteur ne détecte 'dca'
      strategy: activeTab === 'custom' ? '' : config.strategy,
    }
    onStartBacktest(finalConfig)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-4xl font-bold mb-6 ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#F9FAFB] via-[#E5E7EB] to-[#D1D5DB] bg-clip-text text-transparent'
            : 'text-[#1E293B]'
        }`}>
          {t('backtest.config.title')}
        </h2>
        <p className={`max-w-2xl mx-auto text-lg leading-relaxed ${
          isDarkMode ? 'text-[#9CA3AF]' : 'text-gray-600'
        }`}>
          {t('backtest.config.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration principale */}
        <div className="lg:col-span-2 space-y-6">

          {/* Paramètres de base */}
          <div className={`backdrop-blur-xl border rounded-2xl p-8 shadow-2xl ${
            isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white/95 border-gray-200'
          }`}>
            <h3 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent'
                : 'text-[#1E293B]'
            }`}>
              <div className="p-2 bg-gradient-to-r from-[#00FF88] to-[#8B5CF6] rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              {t('backtest.config.base_params')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cryptomonnaie */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-[#E5E7EB]' : 'text-gray-700'
                }`}>
                  {t('backtest.config.cryptocurrency')}
                </label>
                <select
                  value={config.crypto}
                  onChange={(e) => setConfig(prev => ({ ...prev, crypto: e.target.value as 'BTC' | 'ETH' }))}
                  className={`w-full backdrop-blur-sm border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-white/[0.02] border-white/10 text-[#F9FAFB]'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="BTC" className="bg-gray-800 text-white">Bitcoin (BTC)</option>
                  <option value="ETH" className="bg-gray-800 text-white">Ethereum (ETH)</option>
                </select>
              </div>

              {/* Période */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-[#E5E7EB]' : 'text-gray-700'
                }`}>
                  {t('backtest.config.test_period')}
                </label>
                <select
                  value={config.period}
                  onChange={(e) => setConfig(prev => ({ ...prev, period: e.target.value as BacktestPeriod }))}
                  className={`w-full backdrop-blur-sm border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-white/[0.02] border-white/10 text-[#F9FAFB]'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value} className="bg-gray-800 text-white">
                      {period.label} - {period.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capital initial (caché pour DCA) */}
              {config.strategy !== 'dca' && (
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-[#E5E7EB]' : 'text-gray-700'
                }`}>
                  {t('backtest.config.initial_capital')}
                </label>
                <input
                  type="number"
                  value={config.initialCapital}
                  onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: Number(e.target.value) }))}
                  className={`w-full backdrop-blur-sm border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-white/[0.02] border-white/10 text-[#F9FAFB]'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="1000"
                  step="1000"
                />
              </div>
              )}

              {/* Taille de position (cachée pour DCA) */}
              {config.strategy !== 'dca' && (
              <div>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-[#E5E7EB]' : 'text-gray-700'
                }`}>
                  {t('backtest.config.position_size')}
                </label>
                <input
                  type="number"
                  value={config.positionSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, positionSize: Number(e.target.value) }))}
                  className={`w-full backdrop-blur-sm border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-white/[0.02] border-white/10 text-[#F9FAFB]'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="1"
                  max="100"
                />
              </div>
              )}
            </div>
          </div>

          {/* Stratégie */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent mb-8 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-[#00FF88] to-[#22C55E] rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              {t('backtest.config.trading_strategy')}
            </h3>

            {/* Onglets Stratégies */}
            <div className="flex gap-2 mb-8 p-1 bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 border-2 ${
                  activeTab === 'recommended'
                    ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30 shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.05] border-transparent'
                }`}
              >
                {t('backtest.config.recommended_strategies')}
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 border-2 ${
                  activeTab === 'custom'
                    ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30 shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/[0.05] border-transparent'
                }`}
              >
                {t('backtest.config.custom_strategy')}
              </button>
            </div>

            {/* Stratégies Recommandées */}
            {activeTab === 'recommended' && (
              <div className="space-y-6">
                {/* Section Investissement */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>💰</span>
                    <span>Stratégies d'Investissement</span>
                  </h3>
                  {recommendedStrategies.filter(s => s.id === 'dca').map(strategy => (
                    <div
                      key={strategy.id}
                      className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                        config.strategy === strategy.id
                          ? 'border-[#00FF88]/50 bg-gradient-to-r from-[#00FF88]/10 to-[#8B5CF6]/10 shadow-lg shadow-[#00FF88]/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, strategy: strategy.id }))}
                    >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-[#F9FAFB]">{strategy.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            strategy.difficulty === t('difficulty.beginner') ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                            strategy.difficulty === t('difficulty.intermediate') ? 'bg-[#FFA366]/20 text-[#FFA366]' :
                            'bg-[#DC2626]/20 text-[#DC2626]'
                          }`}>
                            {strategy.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{strategy.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#00FF88] font-medium">{strategy.type}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            {t('modal.load.indicators')} {strategy.indicators.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        config.strategy === strategy.id
                          ? 'border-[#00FF88] bg-[#00FF88]'
                          : 'border-gray-600'
                      }`}>
                        {config.strategy === strategy.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section Trading */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>📈</span>
                  <span>Stratégies de Trading</span>
                </h3>
                <div className="space-y-3">
                  {recommendedStrategies.filter(s => s.id !== 'dca').map(strategy => (
                    <div
                      key={strategy.id}
                      className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                        config.strategy === strategy.id
                          ? 'border-[#00FF88]/50 bg-gradient-to-r from-[#00FF88]/10 to-[#8B5CF6]/10 shadow-lg shadow-[#00FF88]/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                      onClick={() => setConfig(prev => ({ ...prev, strategy: strategy.id }))}
                    >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-[#F9FAFB]">{strategy.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            strategy.difficulty === t('difficulty.beginner') ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                            strategy.difficulty === t('difficulty.intermediate') ? 'bg-[#FFA366]/20 text-[#FFA366]' :
                            'bg-[#DC2626]/20 text-[#DC2626]'
                          }`}>
                            {strategy.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{strategy.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#00FF88] font-medium">{strategy.type}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            {t('modal.load.indicators')} {strategy.indicators.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        config.strategy === strategy.id
                          ? 'border-[#00FF88] bg-[#00FF88]'
                          : 'border-gray-600'
                      }`}>
                        {config.strategy === strategy.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
            )}

            {/* Stratégie Personnalisée */}
            {activeTab === 'custom' && (
              <div className="space-y-6">

                {/* Sélection des indicateurs */}
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
                  <h4 className="text-xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent mb-6">
                    {t('indicator.select_indicators')}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {availableIndicators.map(indicator => (
                      <div
                        key={indicator.id}
                        className={`p-4 border rounded-xl transition-all duration-300 cursor-pointer ${
                          config.customStrategy?.indicators.some(ind => ind.id === indicator.id)
                            ? 'border-[#00FF88]/50 bg-gradient-to-r from-[#00FF88]/10 to-[#8B5CF6]/10 shadow-lg shadow-[#00FF88]/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                        onClick={() => toggleIndicator(indicator)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#F9FAFB] text-sm">{indicator.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              indicator.category === t('indicator.category.oscillator') ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                              indicator.category === t('indicator.category.trend') ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                              indicator.category === t('indicator.category.momentum') ? 'bg-[#FFA366]/20 text-[#FFA366]' :
                              'bg-[#00FF88]/20 text-[#00FF88]'
                            }`}>
                              {indicator.category}
                            </span>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              config.customStrategy?.indicators.some(ind => ind.id === indicator.id)
                                ? 'border-[#00FF88] bg-[#00FF88]'
                                : 'border-gray-600'
                            }`}>
                              {config.customStrategy?.indicators.some(ind => ind.id === indicator.id) && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">{indicator.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configuration des indicateurs sélectionnés */}
                {config.customStrategy?.indicators && config.customStrategy.indicators.length > 0 && (
                  <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent mb-6">
                      {t('indicator.config_indicators')}
                    </h4>

                    <div className="space-y-4">
                      {config.customStrategy.indicators.map((indicator, index) => (
                        <div key={`${indicator.id}-${index}`} className="border border-white/10 rounded-xl p-6 bg-white/[0.02] backdrop-blur-sm shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-[#F9FAFB]">
                              {availableIndicators.find(ai => ai.id === indicator.id)?.name}
                            </h5>
                            <button
                              onClick={() => removeIndicator(indicator.id)}
                              className="text-[#DC2626] hover:text-red-400 transition-colors text-sm"
                            >
                              {t('indicator.remove')}
                            </button>
                          </div>

                          {renderIndicatorConfig(indicator, index)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logique de combinaison */}
                {config.customStrategy?.indicators && config.customStrategy.indicators.length > 1 && (
                  <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent mb-6">
                      {t('indicator.combination_logic')}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#E5E7EB] mb-3">
                          {t('indicator.entry_logic')}
                        </label>
                        <select
                          value={config.customStrategy.entryLogic}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            customStrategy: {
                              ...prev.customStrategy!,
                              entryLogic: e.target.value as 'ALL_AND' | 'ANY_OR'
                            }
                          }))}
                          className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200"
                        >
                          <option value="ALL_AND" className="bg-gray-800 text-white">{t('indicator.all_and')}</option>
                          <option value="ANY_OR" className="bg-gray-800 text-white">{t('indicator.any_or')}</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {config.customStrategy.entryLogic === 'ALL_AND'
                            ? t('indicator.all_must_match')
                            : t('indicator.one_must_match')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#E5E7EB] mb-3">
                          {t('indicator.exit_logic')}
                        </label>
                        <select
                          value={config.customStrategy.exitLogic}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            customStrategy: {
                              ...prev.customStrategy!,
                              exitLogic: e.target.value as 'ALL_AND' | 'ANY_OR'
                            }
                          }))}
                          className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200"
                        >
                          <option value="ALL_AND" className="bg-gray-800 text-white">{t('indicator.all_and')}</option>
                          <option value="ANY_OR" className="bg-gray-800 text-white">{t('indicator.any_or')}</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {config.customStrategy.exitLogic === 'ALL_AND'
                            ? t('indicator.all_must_match')
                            : t('indicator.one_must_match')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Résumé de la stratégie personnalisée */}
                {config.customStrategy?.indicators && config.customStrategy.indicators.length > 0 && (
                  <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#22C55E]/10 border border-[#00FF88]/30 rounded-xl p-6 shadow-lg">
                    <h5 className="text-[#00FF88] text-lg font-bold mb-4">
                      {t('strategy.summary.title')}
                    </h5>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>{t('strategy.summary.custom')}</strong>
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          {config.customStrategy.indicators.length} {t('strategy.summary.indicators')} •
                          {t('strategy.summary.entry')} {config.customStrategy.entryLogic === 'ALL_AND' ? t('indicator.all_and') : t('indicator.any_or')} •
                          {t('strategy.summary.exit')} {config.customStrategy.exitLogic === 'ALL_AND' ? t('indicator.all_and') : t('indicator.any_or')}
                        </p>
                      </div>

                      {/* Détail des indicateurs */}
                      <div className="space-y-2">
                        {config.customStrategy.indicators.map((indicator, index) => {
                          const availableConditions = getAvailableConditions(indicator.type, 'entry')
                          const indicatorInfo = availableIndicators.find(ai => ai.id === indicator.id)

                          return (
                            <div key={`${indicator.id}-${index}`} className="bg-white/[0.02] backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-sm font-medium text-[#F9FAFB]">
                                  {indicatorInfo?.name} ({indicatorInfo?.fullName})
                                </h6>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  indicatorInfo?.category === t('indicator.category.oscillator') ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' :
                                  indicatorInfo?.category === t('indicator.category.trend') ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                                  indicatorInfo?.category === t('indicator.category.momentum') ? 'bg-[#FFA366]/20 text-[#FFA366]' :
                                  indicatorInfo?.category === t('indicator.category.volatility') ? 'bg-[#00FF88]/20 text-[#00FF88]' :
                                  'bg-gray-600/20 text-gray-400'
                                }`}>
                                  {indicatorInfo?.category}
                                </span>
                              </div>

                              {/* Paramètres */}
                              <div className="mb-2">
                                <p className="text-xs text-gray-400 mb-1">{t('strategy.summary.params')}</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(indicator.parameters).map(([key, value]) => (
                                    <span key={key} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                                      {key === 'period' ? t('indicator.param.period') :
                                       key === 'fastPeriod' ? 'Rapide' :
                                       key === 'slowPeriod' ? 'Lent' :
                                       key === 'signalPeriod' ? 'Signal' :
                                       key === 'stdDev' ? 'Déviation' :
                                       key === 'kPeriod' ? '%K' :
                                       key === 'dPeriod' ? '%D' :
                                       key}: {value}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Conditions d'entrée */}
                              <div className="mb-2">
                                <p className="text-xs text-gray-400 mb-1">{t('indicator.entry_conditions')}:</p>
                                <div className="space-y-1">
                                  {indicator.conditions.entry.map((condition, condIndex) => {
                                    const conditionInfo = getAvailableConditions(indicator.type, 'entry')[condition.condition]
                                    return (
                                      <div key={condIndex} className="text-xs text-green-400">
                                        • {conditionInfo?.label || condition.condition}
                                        {condition.value1 !== undefined && ` (${condition.value1})`}
                                        {condition.value2 !== undefined && ` - ${condition.value2}`}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Conditions de sortie */}
                              <div>
                                <p className="text-xs text-gray-400 mb-1">{t('indicator.exit_conditions')}:</p>
                                <div className="space-y-1">
                                  {indicator.conditions.exit.map((condition, condIndex) => {
                                    const conditionInfo = getAvailableConditions(indicator.type, 'exit')[condition.condition]
                                    return (
                                      <div key={condIndex} className="text-xs text-red-400">
                                        • {conditionInfo?.label || condition.condition}
                                        {condition.value1 !== undefined && ` (${condition.value1})`}
                                        {condition.value2 !== undefined && ` - ${condition.value2}`}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paramètres de la stratégie */}
          {selectedStrategy && config.strategyType === 'recommended' && (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent mb-8 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                {t('backtest.config.strategy_params')} {selectedStrategy.name}
              </h3>

              {config.strategy === 'rsi_oversold' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('indicator.param.rsi_period')}</label>
                    <input
                      type="number"
                      value={config.parameters.rsiPeriod}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, rsiPeriod: Number(e.target.value) }
                      }))}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
                      min="5" max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('indicator.param.rsi_oversold')}</label>
                    <input
                      type="number"
                      value={config.parameters.rsiOversold}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, rsiOversold: Number(e.target.value) }
                      }))}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
                      min="10" max="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('indicator.param.rsi_overbought')}</label>
                    <input
                      type="number"
                      value={config.parameters.rsiOverbought}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, rsiOverbought: Number(e.target.value) }
                      }))}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
                      min="60" max="90"
                    />
                  </div>
                </div>
              )}

              {config.strategy === 'ema_cross' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-[#E5E7EB] mb-3">{t('indicator.param.ema_fast')}</label>
                    <input
                      type="number"
                      value={config.parameters.emaPeriod1}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, emaPeriod1: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200"
                      min="5" max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#E5E7EB] mb-3">{t('indicator.param.ema_slow')}</label>
                    <input
                      type="number"
                      value={config.parameters.emaPeriod2}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, emaPeriod2: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200"
                      min="20" max="200"
                    />
                  </div>
                </div>
              )}

              {config.strategy === 'bollinger_mean_reversion' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('indicator.param.bollinger_period')}</label>
                    <input
                      type="number"
                      value={config.parameters.bollingerPeriod}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, bollingerPeriod: Number(e.target.value) }
                      }))}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
                      min="10" max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('indicator.param.bollinger_std_dev')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.parameters.bollingerStdDev}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, bollingerStdDev: Number(e.target.value) }
                      }))}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#00FF88]"
                      min="1" max="3"
                    />
                  </div>
                </div>
              )}

              {config.strategy === 'dca' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-[#E5E7EB] mb-3">Montant par achat ($)</label>
                    <input
                      type="number"
                      value={config.parameters.dcaAmount}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, dcaAmount: Number(e.target.value) }
                      }))}
                      className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200"
                      min="10" max="10000" step="10"
                    />
                    <p className="text-xs text-gray-400 mt-2">Montant fixe investi à chaque période</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#E5E7EB] mb-3">Fréquence d'achat</label>
                    <select
                      value={config.parameters.dcaFrequency}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, dcaFrequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' }
                      }))}
                      className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] focus:border-[#00FF88] transition-all duration-200"
                    >
                      <option value="daily" className="bg-gray-800 text-white">Quotidien</option>
                      <option value="weekly" className="bg-gray-800 text-white">Hebdomadaire</option>
                      <option value="biweekly" className="bg-gray-800 text-white">Bi-mensuel (2 semaines)</option>
                      <option value="monthly" className="bg-gray-800 text-white">Mensuel</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-2">À quelle fréquence acheter</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gestion des risques (cachée pour DCA) */}
          {config.strategy !== 'dca' && (
          <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#DC2626]" />
              {t('backtest.config.risk_management')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('backtest.config.stop_loss')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.riskManagement.stopLoss}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    riskManagement: { ...prev.riskManagement, stopLoss: Number(e.target.value) }
                  }))}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
                  min="1" max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('backtest.config.take_profit')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={config.riskManagement.takeProfit}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    riskManagement: { ...prev.riskManagement, takeProfit: Number(e.target.value) }
                  }))}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
                  min="2" max="50"
                />
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Résumé et lancement */}
        <div className="space-y-6">
          {/* Résumé de la configuration */}
          <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FFA366]" />
              {t('backtest.config.summary')}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('backtest.config.crypto')}</span>
                <span className="text-[#F9FAFB] font-medium">{config.crypto}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('backtest.config.period')}</span>
                <span className="text-[#F9FAFB] font-medium">
                  {periods.find(p => p.value === config.period)?.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('backtest.config.strategy')}</span>
                <span className="text-[#F9FAFB] font-medium">
                  {activeTab === 'custom'
                    ? t('strategy.summary.custom')
                    : (selectedStrategy?.name || '⚠️ Aucune sélectionnée')}
                </span>
              </div>
              {config.strategy !== 'dca' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('backtest.config.capital')}</span>
                    <span className="text-[#F9FAFB] font-medium">${config.initialCapital.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('backtest.config.position')}</span>
                    <span className="text-[#F9FAFB] font-medium">{config.positionSize}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-[#DC2626] font-medium">{config.riskManagement.stopLoss}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-[#00FF88] font-medium">{config.riskManagement.takeProfit}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            {/* Boutons de gestion des stratégies (seulement en mode custom) */}
            {activeTab === 'custom' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={!canSaveStrategy()}
                  className="flex-1 bg-green-600/20 border border-green-600/50 text-green-400 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Sauvegarder cette stratégie avec un nom personnalisé"
                >
                  <Save className="w-4 h-4" />
                  {t('backtest.config.save')}
                </button>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="flex-1 bg-blue-600/20 border border-blue-600/50 text-blue-400 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600/30 flex items-center justify-center gap-2"
                  title="Charger une stratégie sauvegardée"
                >
                  <FolderOpen className="w-4 h-4" />
                  {t('backtest.config.load')}
                </button>
              </div>
            )}

            {/* Bouton de lancement principal */}
            <button
              onClick={handleStartBacktest}
              disabled={isRunning || !isConfigValid()}
              className={`group w-full text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl flex items-center justify-center gap-4 ${
                isRunning || !isConfigValid()
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#00FF88] via-[#8B5CF6] to-[#A855F7] hover:scale-[1.02] hover:shadow-[#00FF88]/30 hover:shadow-2xl'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('backtest.config.running')}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {t('backtest.config.start')}
                </>
              )}
            </button>
          </div>

          {/* Note d'information */}
          <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl">
            <p className="text-[#00FF88] text-sm">
              <strong>{t('backtest.config.tip')}</strong> {t('backtest.config.tip_text')}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">
              {t('modal.save.title')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('modal.save.name')}
                </label>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88]"
                  placeholder={t('modal.save.name_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('modal.save.description')}
                </label>
                <textarea
                  value={strategyDescription}
                  onChange={(e) => setStrategyDescription(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#00FF88] h-20 resize-none"
                  placeholder={t('modal.save.description_placeholder')}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-500"
              >
                {t('modal.save.cancel')}
              </button>
              <button
                onClick={handleSaveStrategy}
                disabled={strategyName.trim() === ''}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('modal.save.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de chargement */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">
              {t('modal.load.title')}
            </h3>

            {savedStrategies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">{t('modal.load.no_strategies')}</p>
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-500"
                >
                  {t('modal.load.close')}
                </button>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-3 mb-6">
                  {savedStrategies.map((strategy) => (
                    <div key={strategy.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#F9FAFB] mb-1">
                            {strategy.name}
                          </h4>
                          {strategy.description && (
                            <p className="text-gray-400 text-sm mb-2">
                              {strategy.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>{t('modal.load.indicators')} {strategy.config.customStrategy.indicators.map(ind => ind.id).join(', ')}</p>
                            <p>{t('modal.load.created')} {new Date(strategy.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleLoadStrategy(strategy)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors hover:bg-blue-700"
                          >
                            {t('modal.load.load_button')}
                          </button>
                          <button
                            onClick={() => handleDeleteStrategy(strategy.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors hover:bg-red-700"
                          >
                            {t('modal.load.delete_button')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-600/50 pt-4">
                  <button
                    onClick={() => setShowLoadModal(false)}
                    className="w-full bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-500"
                  >
                    {t('modal.load.close')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export type { BacktestConfig }
