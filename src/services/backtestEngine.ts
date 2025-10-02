// src/services/backtestEngine.ts

import { HistoricalPrice, fetchHistoricalPrices } from './historicalDataService'
import {
  calculateRSI,
  calculateEMA,
  calculateSMA,
  calculateBollingerBands,
  calculateMACD,
  calculateStochastic,
  calculateWilliamsR,
  calculateVWAP,
  calculateSuperTrend,
  calculateIchimoku,
  calculatePivotPoints,
  calculateOBV,
  IndicatorResult,
  MACDResult,
  BollingerBandsResult,
  StochasticResult,
  VWAPResult,
  SuperTrendResult,
  IchimokuResult,
  PivotPointsResult,
  OBVResult
} from './technicalIndicators'
import type { BacktestConfig } from '@/components/BacktestConfiguration'

export interface Trade {
  id: string
  type: 'BUY' | 'SELL'
  timestamp: number
  date: string
  price: number
  quantity: number
  amount: number
  reason: string // Signal qui a déclenché le trade
  fees: number
  pnl?: number // Profit/Loss réalisé (pour les ventes)
  pnlPercentage?: number
}

export interface Position {
  isOpen: boolean
  quantity: number
  averagePrice: number
  totalInvested: number
  currentValue: number
  unrealizedPnl: number
  unrealizedPnlPercentage: number
}

export interface BacktestMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalReturn: number
  totalReturnPercentage: number
  maxDrawdown: number
  maxDrawdownPercentage: number
  sharpeRatio: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  totalFees: number
  holdStrategyReturn: number
  holdStrategyReturnPercentage: number
  alpha: number // Performance vs Buy & Hold
}

export interface BacktestState {
  currentCapital: number
  totalInvested: number
  position: Position
  trades: Trade[]
  capitalHistory: { timestamp: number; value: number }[]
  drawdownHistory: { timestamp: number; value: number }[]
  summary?: {
    totalTrades: number
    winRate: number
    totalPnL: number
    totalReturn: number
  }
}

export interface BacktestResult {
  config: BacktestConfig
  state: BacktestState
  metrics: BacktestMetrics
  priceData: HistoricalPrice[]
  indicators: {
    rsi?: IndicatorResult[]
    ema1?: IndicatorResult[]
    ema2?: IndicatorResult[]
    sma1?: IndicatorResult[]
    sma2?: IndicatorResult[]
    macd?: MACDResult[]
    bollinger?: BollingerBandsResult[]
    stochastic?: StochasticResult[]
    williamsR?: IndicatorResult[]
    vwap?: VWAPResult[]
    supertrend?: SuperTrendResult[]
    ichimoku?: IchimokuResult[]
    pivotPoints?: PivotPointsResult[]
    obv?: OBVResult[]
  }
  startDate: string
  endDate: string
  duration: number
  success: boolean
  error?: string
}

class BacktestEngine {
  private config: BacktestConfig
  private state: BacktestState
  private priceData: HistoricalPrice[] = []
  private indicators: any = {}
  private readonly FEES_PERCENTAGE = 0.001 // 0.1% de frais par trade

  constructor(config: BacktestConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): BacktestState {
    return {
      currentCapital: this.config.initialCapital,
      totalInvested: 0,
      position: {
        isOpen: false,
        quantity: 0,
        averagePrice: 0,
        totalInvested: 0,
        currentValue: 0,
        unrealizedPnl: 0,
        unrealizedPnlPercentage: 0
      },
      trades: [],
      capitalHistory: [],
      drawdownHistory: []
    }
  }

  async runBacktest(): Promise<BacktestResult> {
    try {
      console.log(`🚀 Démarrage du backtest pour ${this.config.crypto} sur ${this.config.period}`)

      // 1. Récupérer les données historiques
      const historicalData = await fetchHistoricalPrices(this.config.crypto, this.config.period)
      this.priceData = historicalData.prices

      if (this.priceData.length === 0) {
        throw new Error('Aucune donnée historique disponible')
      }

      // 2. Calculer les indicateurs techniques
      this.calculateIndicators()

      // 3. Simuler le trading
      this.simulateTrading()

      // 4. Calculer les métriques de performance
      const metrics = this.calculateMetrics()

      // 5. Ajouter le résumé au state
      this.state.summary = {
        totalTrades: metrics.totalTrades,
        winRate: metrics.winRate / 100,
        totalPnL: metrics.totalReturn,
        totalReturn: metrics.totalReturnPercentage / 100
      }

      console.log(`✅ Backtest terminé: ${this.state.trades.length} trades, ROI: ${metrics.totalReturnPercentage.toFixed(2)}%`)

      return {
        config: this.config,
        state: this.state,
        metrics,
        priceData: this.priceData,
        indicators: this.indicators,
        startDate: historicalData.startDate,
        endDate: historicalData.endDate,
        duration: historicalData.totalDays,
        success: true
      }

    } catch (error) {
      console.error('❌ Erreur lors du backtest:', error)
      return {
        config: this.config,
        state: this.state,
        metrics: this.getEmptyMetrics(),
        priceData: [],
        indicators: {},
        startDate: '',
        endDate: '',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  private calculateIndicators() {
    console.log('📊 Calcul des indicateurs techniques...')

    // Gestion des stratégies personnalisées
    if (this.config.strategyType === 'custom' && this.config.customStrategy) {
      this.calculateCustomIndicators()
      return
    }

    // Gestion des stratégies recommandées
    switch (this.config.strategy) {
      case 'rsi_oversold':
        this.indicators.rsi = calculateRSI(this.priceData, this.config.parameters.rsiPeriod)
        break

      case 'ema_cross':
        this.indicators.ema1 = calculateEMA(this.priceData, this.config.parameters.emaPeriod1)
        this.indicators.ema2 = calculateEMA(this.priceData, this.config.parameters.emaPeriod2)
        break

      case 'bollinger_mean_reversion':
        this.indicators.bollinger = calculateBollingerBands(
          this.priceData,
          this.config.parameters.bollingerPeriod,
          this.config.parameters.bollingerStdDev
        )
        break

      case 'macd_divergence':
        this.indicators.macd = calculateMACD(this.priceData)
        break

      // === NOUVELLES STRATÉGIES RECOMMANDÉES ===
      case 'sma_cross':
        this.indicators.sma1 = calculateSMA(this.priceData, this.config.parameters.smaPeriod1 || 10)
        this.indicators.sma2 = calculateSMA(this.priceData, this.config.parameters.smaPeriod2 || 20)
        break

      case 'macd_rsi_combo':
        this.indicators.macd = calculateMACD(this.priceData)
        this.indicators.rsi = calculateRSI(this.priceData, this.config.parameters.rsiPeriod || 14)
        break

      case 'stochastic_bollinger':
        this.indicators.stochastic = calculateStochastic(this.priceData, 14, 3)
        this.indicators.bollinger = calculateBollingerBands(this.priceData, 20, 2)
        break

      case 'ema_rsi_volume':
        this.indicators.ema1 = calculateEMA(this.priceData, this.config.parameters.emaPeriod1 || 12)
        this.indicators.ema2 = calculateEMA(this.priceData, this.config.parameters.emaPeriod2 || 26)
        this.indicators.rsi = calculateRSI(this.priceData, this.config.parameters.rsiPeriod || 14)
        break

      case 'williams_r_trend':
        this.indicators.williamsR = calculateWilliamsR(this.priceData, 14)
        this.indicators.ema1 = calculateEMA(this.priceData, 20)
        break

      case 'triple_ema':
        this.indicators.ema1 = calculateEMA(this.priceData, 8)
        this.indicators.ema2 = calculateEMA(this.priceData, 21)
        this.indicators.sma1 = calculateSMA(this.priceData, 50)
        break
    }
  }

  private simulateTrading() {
    console.log('⚡ Simulation du trading...')

    for (let i = 1; i < this.priceData.length; i++) {
      const currentPrice = this.priceData[i]
      const previousPrice = this.priceData[i - 1]

      // Mettre à jour la position courante
      this.updatePosition(currentPrice)

      // Vérifier les conditions de stop loss / take profit
      this.checkStopConditions(currentPrice, i)

      // Vérifier les signaux de trading
      const signal = this.getSignal(i, currentPrice)

      if (signal === 'BUY' && !this.state.position.isOpen) {
        this.executeBuy(currentPrice, i)
      } else if (signal === 'SELL' && this.state.position.isOpen) {
        this.executeSell(currentPrice, i, 'Signal de vente')
      }

      // Enregistrer l'historique du capital
      const totalValue = this.state.currentCapital + this.state.position.currentValue
      this.state.capitalHistory.push({
        timestamp: currentPrice.timestamp,
        value: totalValue
      })
    }

    // Fermer la position ouverte à la fin si nécessaire
    if (this.state.position.isOpen) {
      const lastPrice = this.priceData[this.priceData.length - 1]
      this.executeSell(lastPrice, this.priceData.length - 1, 'Fermeture fin de période')
    }
  }

  private getSignal(index: number, currentPrice: HistoricalPrice): 'BUY' | 'SELL' | 'HOLD' {
    // Gestion des stratégies personnalisées
    if (this.config.strategyType === 'custom' && this.config.customStrategy) {
      return this.getCustomStrategySignal(index, currentPrice)
    }

    // Gestion des stratégies recommandées
    switch (this.config.strategy) {
      case 'rsi_oversold':
        return this.getRSISignal(index)

      case 'ema_cross':
        return this.getEMACrossSignal(index)

      case 'bollinger_mean_reversion':
        return this.getBollingerSignal(index, currentPrice)

      case 'macd_divergence':
        return this.getMACDSignal(index)

      // === NOUVELLES STRATÉGIES RECOMMANDÉES ===
      case 'sma_cross':
        return this.getSMACrossSignal(index)

      case 'macd_rsi_combo':
        return this.getMACDRSIComboSignal(index)

      case 'stochastic_bollinger':
        return this.getStochasticBollingerSignal(index, currentPrice)

      case 'ema_rsi_volume':
        return this.getEMARSIVolumeSignal(index, currentPrice)

      case 'williams_r_trend':
        return this.getWilliamsRTrendSignal(index)

      case 'triple_ema':
        return this.getTripleEMASignal(index)

      default:
        return 'HOLD'
    }
  }

  // === MÉTHODES POUR STRATÉGIES PERSONNALISÉES ===

  private calculateCustomIndicators() {
    if (!this.config.customStrategy) return

    console.log(`📊 Calcul des indicateurs personnalisés pour "${this.config.customStrategy.name}"`)
    console.log('📋 Indicateurs à calculer:', this.config.customStrategy.indicators.map(i => i.type))

    for (const indicatorConfig of this.config.customStrategy.indicators) {
      switch (indicatorConfig.type) {
        case 'RSI':
          this.indicators.rsi = calculateRSI(this.priceData, indicatorConfig.parameters.period || 14)
          break

        case 'EMA':
          if (!this.indicators.ema1) {
            this.indicators.ema1 = calculateEMA(this.priceData, indicatorConfig.parameters.period || 20)
          } else if (!this.indicators.ema2) {
            this.indicators.ema2 = calculateEMA(this.priceData, indicatorConfig.parameters.period || 20)
          }
          break

        case 'SMA':
          if (!this.indicators.sma1) {
            this.indicators.sma1 = calculateSMA(this.priceData, indicatorConfig.parameters.period || 20)
          } else if (!this.indicators.sma2) {
            this.indicators.sma2 = calculateSMA(this.priceData, indicatorConfig.parameters.period || 20)
          }
          break

        case 'MACD':
          this.indicators.macd = calculateMACD(
            this.priceData,
            indicatorConfig.parameters.fastPeriod || 12,
            indicatorConfig.parameters.slowPeriod || 26,
            indicatorConfig.parameters.signalPeriod || 9
          )
          break

        case 'BOLLINGER':
          this.indicators.bollinger = calculateBollingerBands(
            this.priceData,
            indicatorConfig.parameters.period || 20,
            indicatorConfig.parameters.stdDev || 2
          )
          break

        case 'STOCHASTIC':
          this.indicators.stochastic = calculateStochastic(
            this.priceData,
            indicatorConfig.parameters.kPeriod || 14,
            indicatorConfig.parameters.dPeriod || 3
          )
          break

        case 'VWAP':
          this.indicators.vwap = calculateVWAP(
            this.priceData,
            indicatorConfig.parameters.period || 20
          )
          break

        case 'SUPERTREND':
          this.indicators.supertrend = calculateSuperTrend(
            this.priceData,
            indicatorConfig.parameters.period || 10,
            indicatorConfig.parameters.multiplier || 3
          )
          break

        case 'ICHIMOKU':
          this.indicators.ichimoku = calculateIchimoku(
            this.priceData,
            indicatorConfig.parameters.tenkan || 9,
            indicatorConfig.parameters.kijun || 26,
            indicatorConfig.parameters.senkou || 52
          )
          break

        case 'PIVOT_POINTS':
          this.indicators.pivotPoints = calculatePivotPoints(
            this.priceData,
            indicatorConfig.parameters.type || 'standard'
          )
          break

        case 'OBV':
          this.indicators.obv = calculateOBV(
            this.priceData,
            indicatorConfig.parameters.signal_period || 10
          )
          break
      }
    }

    // Debug : afficher les indicateurs calculés
    console.log('✅ Indicateurs calculés:', Object.keys(this.indicators))
    Object.keys(this.indicators).forEach(key => {
      const indicator = this.indicators[key]
      if (Array.isArray(indicator)) {
        console.log(`  ${key}: ${indicator.length} points, premiers non-null:`,
          indicator.filter(p => (p.value !== null && p.value !== undefined) || (p.vwap !== null && p.vwap !== undefined) || (p.supertrend !== null && p.supertrend !== undefined)).slice(0, 3))
      }
    })
  }

  private getCustomStrategySignal(index: number, currentPrice: HistoricalPrice): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.config.customStrategy) return 'HOLD'

    // Évaluer les conditions d'entrée
    const entrySignals: boolean[] = []
    const exitSignals: boolean[] = []

    for (const indicatorConfig of this.config.customStrategy.indicators) {
      // Évaluer les conditions d'entrée de cet indicateur
      for (const entryCondition of indicatorConfig.conditions.entry) {
        // Ignorer les conditions 'custom' non configurées
        if (entryCondition.condition === 'custom') {
          console.warn(`Condition 'custom' ignorée pour ${indicatorConfig.type}`, entryCondition)
          continue
        }
        const entryResult = this.evaluateCondition(indicatorConfig, entryCondition, index, currentPrice, 'entry')
        entrySignals.push(entryResult)
      }

      // Évaluer les conditions de sortie de cet indicateur
      for (const exitCondition of indicatorConfig.conditions.exit) {
        // Ignorer les conditions 'custom' non configurées
        if (exitCondition.condition === 'custom') {
          console.warn(`Condition 'custom' ignorée pour ${indicatorConfig.type}`, exitCondition)
          continue
        }
        const exitResult = this.evaluateCondition(indicatorConfig, exitCondition, index, currentPrice, 'exit')
        exitSignals.push(exitResult)
      }
    }

    // Appliquer la logique de combinaison pour les entrées
    let shouldBuy = false
    if (this.config.customStrategy.entryLogic === 'ALL_AND') {
      shouldBuy = entrySignals.length > 0 && entrySignals.every(signal => signal)
    } else if (this.config.customStrategy.entryLogic === 'ANY_OR') {
      shouldBuy = entrySignals.some(signal => signal)
    }

    // Appliquer la logique de combinaison pour les sorties
    let shouldSell = false
    if (this.config.customStrategy.exitLogic === 'ALL_AND') {
      shouldSell = exitSignals.length > 0 && exitSignals.every(signal => signal)
    } else if (this.config.customStrategy.exitLogic === 'ANY_OR') {
      shouldSell = exitSignals.some(signal => signal)
    }

    // Debug logging pour les premiers trades
    if (index < 100 && (shouldBuy || shouldSell)) {
      console.log(`Signal détecté à l'index ${index}:`, {
        signal: shouldBuy ? 'BUY' : 'SELL',
        entrySignals,
        exitSignals,
        price: currentPrice.close,
        timestamp: currentPrice.timestamp
      })
    }

    if (shouldBuy) return 'BUY'
    if (shouldSell) return 'SELL'
    return 'HOLD'
  }

  private evaluateCondition(
    indicatorConfig: any,
    condition: any,
    index: number,
    currentPrice: HistoricalPrice,
    type: 'entry' | 'exit'
  ): boolean {
    switch (indicatorConfig.type) {
      case 'RSI':
        return this.evaluateRSICondition(condition, index)

      case 'EMA':
      case 'SMA':
        return this.evaluateMACondition(indicatorConfig, condition, index, currentPrice)

      case 'MACD':
        return this.evaluateMACDCondition(condition, index)

      case 'BOLLINGER':
        return this.evaluateBollingerCondition(condition, index, currentPrice)

      case 'STOCHASTIC':
        return this.evaluateStochasticCondition(condition, index)

      case 'VWAP':
        return this.evaluateVWAPCondition(condition, index, currentPrice)

      case 'SUPERTREND':
        return this.evaluateSuperTrendCondition(condition, index, currentPrice)

      case 'ICHIMOKU':
        return this.evaluateIchimokuCondition(condition, index, currentPrice)

      case 'PIVOT_POINTS':
        return this.evaluatePivotPointsCondition(condition, index, currentPrice)

      case 'OBV':
        return this.evaluateOBVCondition(condition, index)

      default:
        console.warn(`Type d'indicateur non reconnu: ${indicatorConfig.type}`, { condition, indicatorConfig })
        return false
    }
  }

  private evaluateRSICondition(condition: any, index: number): boolean {
    const rsi = this.indicators.rsi?.[index]?.value
    if (rsi === null || rsi === undefined) return false

    switch (condition.condition) {
      case 'rsi_oversold':
        return rsi < (condition.value1 || 30)

      case 'rsi_overbought':
        return rsi > (condition.value1 || 70)

      case 'rsi_above':
        return rsi > (condition.value1 || 50)

      case 'rsi_below':
        return rsi < (condition.value1 || 50)

      case 'rsi_between':
        const min = Math.min(condition.value1 || 30, condition.value2 || 70)
        const max = Math.max(condition.value1 || 30, condition.value2 || 70)
        return rsi >= min && rsi <= max

      default:
        return false
    }
  }

  private evaluateMACondition(indicatorConfig: any, condition: any, index: number, currentPrice: HistoricalPrice): boolean {
    const isSMA = indicatorConfig.type === 'SMA'
    const ma = isSMA ? this.indicators.sma1?.[index]?.value : this.indicators.ema1?.[index]?.value
    if (ma === null || ma === undefined) return false

    const price = currentPrice.close
    const maType = isSMA ? 'sma' : 'ema'

    switch (condition.condition) {
      case `price_cross_above_${maType}`:
        if (index === 0) return false
        const prevMA = isSMA ? this.indicators.sma1?.[index - 1]?.value : this.indicators.ema1?.[index - 1]?.value
        const prevPrice = this.priceData[index - 1].close
        if (prevMA === null) return false
        return prevPrice <= prevMA && price > ma

      case `price_cross_below_${maType}`:
        if (index === 0) return false
        const prevMABelow = isSMA ? this.indicators.sma1?.[index - 1]?.value : this.indicators.ema1?.[index - 1]?.value
        const prevPriceBelow = this.priceData[index - 1].close
        if (prevMABelow === null) return false
        return prevPriceBelow >= prevMABelow && price < ma

      case `price_above_${maType}`:
        return price > ma

      case `price_below_${maType}`:
        return price < ma

      case `price_distance_from_${maType}`:
        const distancePercent = Math.abs((price - ma) / ma) * 100
        return distancePercent >= (condition.value1 || 2)

      default:
        return false
    }
  }

  private evaluateMACDCondition(condition: any, index: number): boolean {
    const macd = this.indicators.macd?.[index]
    if (!macd) return false

    switch (condition.condition) {
      case 'macd_cross_above_signal':
        if (index === 0 || !macd.macd || !macd.signal) return false
        const prevMACD = this.indicators.macd?.[index - 1]
        if (!prevMACD?.macd || !prevMACD?.signal) return false
        return prevMACD.macd <= prevMACD.signal && macd.macd > macd.signal

      case 'macd_cross_below_signal':
        if (index === 0 || !macd.macd || !macd.signal) return false
        const prevMACDBelow = this.indicators.macd?.[index - 1]
        if (!prevMACDBelow?.macd || !prevMACDBelow?.signal) return false
        return prevMACDBelow.macd >= prevMACDBelow.signal && macd.macd < macd.signal

      case 'macd_above_zero':
        return (macd.macd || 0) > 0

      case 'macd_below_zero':
        return (macd.macd || 0) < 0

      case 'macd_histogram_positive':
        return (macd.histogram || 0) > 0

      case 'macd_histogram_negative':
        return (macd.histogram || 0) < 0

      // Les divergences sont plus complexes à implémenter, on les laisse pour plus tard
      case 'macd_divergence_bullish':
      case 'macd_divergence_bearish':
        return false

      default:
        return false
    }
  }

  private evaluateBollingerCondition(condition: any, index: number, currentPrice: HistoricalPrice): boolean {
    const bollinger = this.indicators.bollinger?.[index]
    if (!bollinger?.upper || !bollinger?.middle || !bollinger?.lower) return false

    const price = currentPrice.close
    const high = currentPrice.high
    const low = currentPrice.low

    switch (condition.condition) {
      case 'price_touches_lower_band':
        return low <= bollinger.lower * 1.001 // Marge de 0.1%

      case 'price_touches_upper_band':
        return high >= bollinger.upper * 0.999 // Marge de 0.1%

      case 'price_breaks_lower_band':
        return price < bollinger.lower

      case 'price_breaks_upper_band':
        return price > bollinger.upper

      case 'price_in_lower_zone':
        return price < bollinger.middle

      case 'price_in_upper_zone':
        return price > bollinger.middle

      case 'bollinger_squeeze':
        // Bandes serrées: ratio upper/lower proche de 1
        const ratio = bollinger.upper / bollinger.lower
        return ratio < 1.05 // Ajustable selon la volatilité souhaitée

      case 'bollinger_expansion':
        if (index === 0) return false
        const prevBollinger = this.indicators.bollinger?.[index - 1]
        if (!prevBollinger?.upper || !prevBollinger?.lower) return false
        const currentWidth = bollinger.upper - bollinger.lower
        const prevWidth = prevBollinger.upper - prevBollinger.lower
        return currentWidth > prevWidth * 1.1 // Expansion de 10%

      default:
        return false
    }
  }

  private evaluateStochasticCondition(condition: any, index: number): boolean {
    const stoch = this.indicators.stochastic?.[index]
    if (!stoch) return false

    switch (condition.condition) {
      case 'stoch_oversold':
        return (stoch.k || 0) < (condition.value1 || 20)

      case 'stoch_overbought':
        return (stoch.k || 0) > (condition.value1 || 80)

      case 'stoch_k_cross_above_d':
        if (index === 0 || !stoch.k || !stoch.d) return false
        const prevStoch = this.indicators.stochastic?.[index - 1]
        if (!prevStoch?.k || !prevStoch?.d) return false
        return prevStoch.k <= prevStoch.d && stoch.k > stoch.d

      case 'stoch_k_cross_below_d':
        if (index === 0 || !stoch.k || !stoch.d) return false
        const prevStochBelow = this.indicators.stochastic?.[index - 1]
        if (!prevStochBelow?.k || !prevStochBelow?.d) return false
        return prevStochBelow.k >= prevStochBelow.d && stoch.k < stoch.d

      case 'stoch_both_oversold':
        return (stoch.k || 0) < (condition.value1 || 20) && (stoch.d || 0) < (condition.value1 || 20)

      case 'stoch_both_overbought':
        return (stoch.k || 0) > (condition.value1 || 80) && (stoch.d || 0) > (condition.value1 || 80)

      default:
        return false
    }
  }

  private evaluateVWAPCondition(condition: any, index: number, currentPrice: HistoricalPrice): boolean {
    const vwap = this.indicators.vwap?.[index]?.vwap
    if (vwap === null || vwap === undefined) return false

    switch (condition.condition) {
      case 'price_above_vwap':
        return currentPrice.close > vwap

      case 'price_below_vwap':
        return currentPrice.close < vwap

      case 'price_cross_above_vwap':
        if (index === 0) return false
        const prevPrice = this.priceData[index - 1].close
        const prevVwap = this.indicators.vwap?.[index - 1]?.vwap
        return prevPrice <= (prevVwap || 0) && currentPrice.close > vwap

      case 'price_cross_below_vwap':
        if (index === 0) return false
        const prevPriceBelow = this.priceData[index - 1].close
        const prevVwapBelow = this.indicators.vwap?.[index - 1]?.vwap
        return prevPriceBelow >= (prevVwapBelow || 0) && currentPrice.close < vwap

      case 'price_distance_from_vwap':
        const distancePercent = Math.abs((currentPrice.close - vwap) / vwap) * 100
        return distancePercent >= (condition.value1 || 1)

      case 'volume_above_average':
        // Calculer la moyenne des volumes sur les 20 dernières périodes
        const volumePeriod = 20
        if (index < volumePeriod) return false
        let avgVolume = 0
        for (let i = index - volumePeriod + 1; i <= index; i++) {
          avgVolume += this.priceData[i].volume
        }
        avgVolume /= volumePeriod
        return currentPrice.volume > avgVolume

      default:
        return false
    }
  }

  private evaluateSuperTrendCondition(condition: any, index: number, currentPrice: HistoricalPrice): boolean {
    const supertrend = this.indicators.supertrend?.[index]
    if (!supertrend || supertrend.supertrend === null) return false

    switch (condition.condition) {
      case 'supertrend_bullish':
        return supertrend.trend === 'up'

      case 'supertrend_bearish':
        return supertrend.trend === 'down'

      case 'price_above_supertrend':
        return currentPrice.close > supertrend.supertrend

      case 'price_below_supertrend':
        return currentPrice.close < supertrend.supertrend

      case 'supertrend_trend_change_bullish':
        if (index === 0) return false
        const prevSupertrend = this.indicators.supertrend?.[index - 1]
        return prevSupertrend?.trend === 'down' && supertrend.trend === 'up'

      case 'supertrend_trend_change_bearish':
        if (index === 0) return false
        const prevSupertrendBear = this.indicators.supertrend?.[index - 1]
        return prevSupertrendBear?.trend === 'up' && supertrend.trend === 'down'

      default:
        return false
    }
  }

  private evaluateIchimokuCondition(condition: any, index: number, currentPrice: HistoricalPrice): boolean {
    const ichimoku = this.indicators.ichimoku?.[index]
    if (!ichimoku) return false

    switch (condition.condition) {
      case 'price_above_cloud':
        if (ichimoku.senkouSpanA === null || ichimoku.senkouSpanB === null) return false
        const cloudTop = Math.max(ichimoku.senkouSpanA, ichimoku.senkouSpanB)
        return currentPrice.close > cloudTop

      case 'price_below_cloud':
        if (ichimoku.senkouSpanA === null || ichimoku.senkouSpanB === null) return false
        const cloudBottom = Math.min(ichimoku.senkouSpanA, ichimoku.senkouSpanB)
        return currentPrice.close < cloudBottom

      case 'price_in_cloud':
        if (ichimoku.senkouSpanA === null || ichimoku.senkouSpanB === null) return false
        const cloudTopIn = Math.max(ichimoku.senkouSpanA, ichimoku.senkouSpanB)
        const cloudBottomIn = Math.min(ichimoku.senkouSpanA, ichimoku.senkouSpanB)
        return currentPrice.close >= cloudBottomIn && currentPrice.close <= cloudTopIn

      case 'tenkan_cross_above_kijun':
        if (index === 0 || ichimoku.tenkanSen === null || ichimoku.kijunSen === null) return false
        const prevIchimoku = this.indicators.ichimoku?.[index - 1]
        return (prevIchimoku?.tenkanSen || 0) <= (prevIchimoku?.kijunSen || 0) && ichimoku.tenkanSen > ichimoku.kijunSen

      case 'tenkan_cross_below_kijun':
        if (index === 0 || ichimoku.tenkanSen === null || ichimoku.kijunSen === null) return false
        const prevIchimokuBelow = this.indicators.ichimoku?.[index - 1]
        return (prevIchimokuBelow?.tenkanSen || 0) >= (prevIchimokuBelow?.kijunSen || 0) && ichimoku.tenkanSen < ichimoku.kijunSen

      case 'price_cross_above_tenkan':
        if (index === 0 || ichimoku.tenkanSen === null) return false
        const prevPriceTenkan = this.priceData[index - 1].close
        const prevTenkan = this.indicators.ichimoku?.[index - 1]?.tenkanSen
        return prevPriceTenkan <= (prevTenkan || 0) && currentPrice.close > ichimoku.tenkanSen

      case 'price_cross_below_tenkan':
        if (index === 0 || ichimoku.tenkanSen === null) return false
        const prevPriceTenkanBelow = this.priceData[index - 1].close
        const prevTenkanBelow = this.indicators.ichimoku?.[index - 1]?.tenkanSen
        return prevPriceTenkanBelow >= (prevTenkanBelow || 0) && currentPrice.close < ichimoku.tenkanSen

      case 'cloud_bullish':
        return ichimoku.senkouSpanA !== null && ichimoku.senkouSpanB !== null && ichimoku.senkouSpanA > ichimoku.senkouSpanB

      case 'cloud_bearish':
        return ichimoku.senkouSpanA !== null && ichimoku.senkouSpanB !== null && ichimoku.senkouSpanA < ichimoku.senkouSpanB

      default:
        return false
    }
  }

  private evaluatePivotPointsCondition(condition: any, index: number, currentPrice: HistoricalPrice): boolean {
    const pivot = this.indicators.pivotPoints?.[index]
    if (!pivot) return false

    switch (condition.condition) {
      case 'price_above_pivot':
        return pivot.pivot !== null && currentPrice.close > pivot.pivot

      case 'price_below_pivot':
        return pivot.pivot !== null && currentPrice.close < pivot.pivot

      case 'price_above_r1':
        return pivot.r1 !== null && currentPrice.close > pivot.r1

      case 'price_below_s1':
        return pivot.s1 !== null && currentPrice.close < pivot.s1

      case 'price_touches_r1':
        return pivot.r1 !== null && Math.abs(currentPrice.high - pivot.r1) / pivot.r1 < 0.001 // Tolérance de 0.1%

      case 'price_touches_s1':
        return pivot.s1 !== null && Math.abs(currentPrice.low - pivot.s1) / pivot.s1 < 0.001

      case 'price_touches_r2':
        return pivot.r2 !== null && Math.abs(currentPrice.high - pivot.r2) / pivot.r2 < 0.001

      case 'price_touches_s2':
        return pivot.s2 !== null && Math.abs(currentPrice.low - pivot.s2) / pivot.s2 < 0.001

      case 'price_between_pivot_r1':
        return pivot.pivot !== null && pivot.r1 !== null && currentPrice.close >= pivot.pivot && currentPrice.close <= pivot.r1

      case 'price_between_s1_pivot':
        return pivot.s1 !== null && pivot.pivot !== null && currentPrice.close >= pivot.s1 && currentPrice.close <= pivot.pivot

      default:
        return false
    }
  }

  private evaluateOBVCondition(condition: any, index: number): boolean {
    const obv = this.indicators.obv?.[index]
    if (!obv || obv.obv === null) return false

    switch (condition.condition) {
      case 'obv_rising':
        if (index === 0) return false
        const prevOBV = this.indicators.obv?.[index - 1]?.obv
        return prevOBV !== null && obv.obv > prevOBV

      case 'obv_falling':
        if (index === 0) return false
        const prevOBVFalling = this.indicators.obv?.[index - 1]?.obv
        return prevOBVFalling !== null && obv.obv < prevOBVFalling

      case 'obv_above_signal':
        return obv.signal !== null && obv.obv > obv.signal

      case 'obv_below_signal':
        return obv.signal !== null && obv.obv < obv.signal

      case 'obv_cross_above_signal':
        if (index === 0 || obv.signal === null) return false
        const prevOBVSignal = this.indicators.obv?.[index - 1]
        return prevOBVSignal?.obv !== null && prevOBVSignal?.signal !== null &&
               prevOBVSignal.obv <= prevOBVSignal.signal && obv.obv > obv.signal

      case 'obv_cross_below_signal':
        if (index === 0 || obv.signal === null) return false
        const prevOBVSignalBelow = this.indicators.obv?.[index - 1]
        return prevOBVSignalBelow?.obv !== null && prevOBVSignalBelow?.signal !== null &&
               prevOBVSignalBelow.obv >= prevOBVSignalBelow.signal && obv.obv < obv.signal

      default:
        return false
    }
  }

  private getIndicatorValue(indicatorConfig: any, index: number, price: HistoricalPrice): number | null {
    switch (indicatorConfig.type) {
      case 'RSI':
        return this.indicators.rsi?.[index]?.value || null

      case 'EMA':
        // Pour les EMA, nous devons déterminer laquelle utiliser
        // On peut utiliser la période pour différencier
        if (this.indicators.ema1 && this.indicators.ema2) {
          // Si nous avons deux EMA, utiliser celle qui correspond à la période
          const ema1Period = 12 // période par défaut de ema1 dans les stratégies recommandées
          return indicatorConfig.parameters.period <= 15
            ? this.indicators.ema1[index]?.value || null
            : this.indicators.ema2[index]?.value || null
        }
        return this.indicators.ema1?.[index]?.value || null

      case 'SMA':
        return this.indicators.sma1?.[index]?.value || null

      case 'MACD':
        return this.indicators.macd?.[index]?.macd || null

      case 'BOLLINGER':
        // Pour Bollinger, on compare avec le prix
        const bollinger = this.indicators.bollinger?.[index]
        if (!bollinger) return null
        // On retourne un ratio prix/bande pour faciliter les comparaisons
        if (bollinger.lower && bollinger.upper) {
          return price.close / bollinger.lower // Ratio prix/bande basse
        }
        return null

      case 'STOCHASTIC':
        return this.indicators.stochastic?.[index]?.k || null

      default:
        return null
    }
  }

  private getRSISignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.rsi || index >= this.indicators.rsi.length) return 'HOLD'

    const currentRSI = this.indicators.rsi[index].value
    if (currentRSI === null) return 'HOLD'

    if (currentRSI <= this.config.parameters.rsiOversold) {
      return 'BUY' // RSI en survente
    } else if (currentRSI >= this.config.parameters.rsiOverbought) {
      return 'SELL' // RSI en surachat
    }

    return 'HOLD'
  }

  private getEMACrossSignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.ema1 || !this.indicators.ema2 || index === 0) return 'HOLD'

    const currentEMA1 = this.indicators.ema1[index]?.value
    const currentEMA2 = this.indicators.ema2[index]?.value
    const previousEMA1 = this.indicators.ema1[index - 1]?.value
    const previousEMA2 = this.indicators.ema2[index - 1]?.value

    if (!currentEMA1 || !currentEMA2 || !previousEMA1 || !previousEMA2) return 'HOLD'

    // Golden Cross: EMA rapide croise au-dessus de l'EMA lente
    if (previousEMA1 <= previousEMA2 && currentEMA1 > currentEMA2) {
      return 'BUY'
    }

    // Death Cross: EMA rapide croise en-dessous de l'EMA lente
    if (previousEMA1 >= previousEMA2 && currentEMA1 < currentEMA2) {
      return 'SELL'
    }

    return 'HOLD'
  }

  private getBollingerSignal(index: number, currentPrice: HistoricalPrice): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.bollinger || index >= this.indicators.bollinger.length) return 'HOLD'

    const bollinger = this.indicators.bollinger[index]
    if (!bollinger.upper || !bollinger.lower || !bollinger.middle) return 'HOLD'

    // Achat près de la bande basse
    if (currentPrice.close <= bollinger.lower * 1.02) { // 2% de marge
      return 'BUY'
    }

    // Vente près de la bande haute
    if (currentPrice.close >= bollinger.upper * 0.98) { // 2% de marge
      return 'SELL'
    }

    return 'HOLD'
  }

  private getMACDSignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.macd || index === 0) return 'HOLD'

    const currentMACD = this.indicators.macd[index]
    const previousMACD = this.indicators.macd[index - 1]

    if (!currentMACD.macd || !currentMACD.signal || !previousMACD.macd || !previousMACD.signal) {
      return 'HOLD'
    }

    // Signal d'achat: MACD croise au-dessus de la ligne de signal
    if (previousMACD.macd <= previousMACD.signal && currentMACD.macd > currentMACD.signal) {
      return 'BUY'
    }

    // Signal de vente: MACD croise en-dessous de la ligne de signal
    if (previousMACD.macd >= previousMACD.signal && currentMACD.macd < currentMACD.signal) {
      return 'SELL'
    }

    return 'HOLD'
  }

  // === NOUVELLES MÉTHODES DE SIGNAUX ===

  private getSMACrossSignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.sma1 || !this.indicators.sma2 || index === 0) return 'HOLD'

    const currentSMA1 = this.indicators.sma1[index]?.value
    const currentSMA2 = this.indicators.sma2[index]?.value
    const previousSMA1 = this.indicators.sma1[index - 1]?.value
    const previousSMA2 = this.indicators.sma2[index - 1]?.value

    if (!currentSMA1 || !currentSMA2 || !previousSMA1 || !previousSMA2) return 'HOLD'

    // Golden Cross: SMA rapide croise au-dessus de l'SMA lente
    if (previousSMA1 <= previousSMA2 && currentSMA1 > currentSMA2) {
      return 'BUY'
    }

    // Death Cross: SMA rapide croise en-dessous de l'SMA lente
    if (previousSMA1 >= previousSMA2 && currentSMA1 < currentSMA2) {
      return 'SELL'
    }

    return 'HOLD'
  }

  private getMACDRSIComboSignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    const macdSignal = this.getMACDSignal(index)
    const rsiSignal = this.getRSISignal(index)

    // Signal d'achat: MACD ET RSI doivent être en accord
    if (macdSignal === 'BUY' && rsiSignal === 'BUY') {
      return 'BUY'
    }

    // Signal de vente: MACD ET RSI doivent être en accord
    if (macdSignal === 'SELL' && rsiSignal === 'SELL') {
      return 'SELL'
    }

    return 'HOLD'
  }

  private getStochasticBollingerSignal(index: number, currentPrice: HistoricalPrice): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.stochastic || !this.indicators.bollinger) return 'HOLD'

    const stoch = this.indicators.stochastic[index]
    const bollinger = this.indicators.bollinger[index]

    if (!stoch.k || !stoch.d || !bollinger.upper || !bollinger.lower) return 'HOLD'

    // Signal d'achat: Stochastic oversold ET prix près de la bande basse
    if (stoch.k <= 20 && stoch.d <= 20 && currentPrice.close <= bollinger.lower * 1.02) {
      return 'BUY'
    }

    // Signal de vente: Stochastic overbought ET prix près de la bande haute
    if (stoch.k >= 80 && stoch.d >= 80 && currentPrice.close >= bollinger.upper * 0.98) {
      return 'SELL'
    }

    return 'HOLD'
  }

  private getEMARSIVolumeSignal(index: number, currentPrice: HistoricalPrice): 'BUY' | 'SELL' | 'HOLD' {
    const emaSignal = this.getEMACrossSignal(index)
    const rsiSignal = this.getRSISignal(index)

    // Analyser le volume (si disponible)
    const volumeStrong = currentPrice.volume && index > 0 ?
      currentPrice.volume > (this.priceData[index - 1].volume || 0) * 1.5 : false

    // Signal d'achat: EMA bullish, RSI oversold, volume fort
    if (emaSignal === 'BUY' && rsiSignal === 'BUY' && volumeStrong) {
      return 'BUY'
    }

    // Signal de vente: EMA bearish OU RSI overbought
    if (emaSignal === 'SELL' || rsiSignal === 'SELL') {
      return 'SELL'
    }

    return 'HOLD'
  }

  private getWilliamsRTrendSignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.williamsR || !this.indicators.ema1) return 'HOLD'

    const williamsR = this.indicators.williamsR[index]?.value
    const currentEMA = this.indicators.ema1[index]?.value
    const currentPrice = this.priceData[index].close

    if (!williamsR || !currentEMA) return 'HOLD'

    // Signal d'achat: Williams %R oversold ET prix au-dessus de l'EMA
    if (williamsR <= -80 && currentPrice > currentEMA) {
      return 'BUY'
    }

    // Signal de vente: Williams %R overbought OU prix en-dessous de l'EMA
    if (williamsR >= -20 || currentPrice < currentEMA) {
      return 'SELL'
    }

    return 'HOLD'
  }

  private getTripleEMASignal(index: number): 'BUY' | 'SELL' | 'HOLD' {
    if (!this.indicators.ema1 || !this.indicators.ema2 || !this.indicators.sma1) return 'HOLD'

    const ema8 = this.indicators.ema1[index]?.value
    const ema21 = this.indicators.ema2[index]?.value
    const sma50 = this.indicators.sma1[index]?.value

    if (!ema8 || !ema21 || !sma50) return 'HOLD'

    // Signal d'achat: EMA8 > EMA21 > SMA50 (trend bullish fort)
    if (ema8 > ema21 && ema21 > sma50) {
      return 'BUY'
    }

    // Signal de vente: EMA8 < EMA21 (changement de trend)
    if (ema8 < ema21) {
      return 'SELL'
    }

    return 'HOLD'
  }

  private executeBuy(price: HistoricalPrice, index: number) {
    const positionSize = this.config.positionSize / 100
    const amountToInvest = this.state.currentCapital * positionSize

    if (amountToInvest < 10) return // Montant minimum

    const fees = amountToInvest * this.FEES_PERCENTAGE
    const netAmount = amountToInvest - fees
    const quantity = netAmount / price.close

    const trade: Trade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'BUY',
      timestamp: price.timestamp,
      date: price.date,
      price: price.close,
      quantity,
      amount: netAmount,
      reason: this.getSignalReason('BUY'),
      fees
    }

    // Mettre à jour l'état
    this.state.currentCapital -= amountToInvest
    this.state.totalInvested += amountToInvest
    this.state.position.isOpen = true
    this.state.position.quantity += quantity
    this.state.position.totalInvested += netAmount
    this.state.position.averagePrice = this.state.position.totalInvested / this.state.position.quantity

    this.state.trades.push(trade)

    console.log(`📈 ACHAT: ${quantity.toFixed(6)} ${this.config.crypto} à ${price.close.toFixed(2)}$ (${trade.reason})`)
  }

  private executeSell(price: HistoricalPrice, index: number, reason: string) {
    if (!this.state.position.isOpen) return

    const fees = this.state.position.currentValue * this.FEES_PERCENTAGE
    const netAmount = this.state.position.currentValue - fees
    const pnl = netAmount - this.state.position.totalInvested
    const pnlPercentage = (pnl / this.state.position.totalInvested) * 100

    const trade: Trade = {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'SELL',
      timestamp: price.timestamp,
      date: price.date,
      price: price.close,
      quantity: this.state.position.quantity,
      amount: netAmount,
      reason,
      fees,
      pnl,
      pnlPercentage
    }

    // Mettre à jour l'état
    this.state.currentCapital += netAmount
    this.state.position = {
      isOpen: false,
      quantity: 0,
      averagePrice: 0,
      totalInvested: 0,
      currentValue: 0,
      unrealizedPnl: 0,
      unrealizedPnlPercentage: 0
    }

    this.state.trades.push(trade)

    console.log(`📉 VENTE: ${trade.quantity.toFixed(6)} ${this.config.crypto} à ${price.close.toFixed(2)}$ | P&L: ${pnl.toFixed(2)}$ (${pnlPercentage.toFixed(2)}%)`)
  }

  private checkStopConditions(price: HistoricalPrice, index: number) {
    if (!this.state.position.isOpen) return

    // Calculer les niveaux de stop loss et take profit en prix absolus
    const stopLossPrice = this.state.position.averagePrice * (1 - this.config.riskManagement.stopLoss / 100)
    const takeProfitPrice = this.state.position.averagePrice * (1 + this.config.riskManagement.takeProfit / 100)

    // 🔥 RÉALISTE: Vérifier si les mèches ont touché les niveaux
    // Stop Loss: si le prix bas (low) a touché le stop loss
    if (price.low <= stopLossPrice) {
      // Créer un prix modifié avec le prix d'exécution du stop loss
      const stopExecutionPrice: HistoricalPrice = {
        ...price,
        close: stopLossPrice // Le stop s'exécute au niveau défini
      }
      this.executeSell(stopExecutionPrice, index, `Stop Loss (-${this.config.riskManagement.stopLoss}%) - Mèche touchée`)
      return
    }

    // Take Profit: si le prix haut (high) a touché le take profit
    if (price.high >= takeProfitPrice) {
      // Créer un prix modifié avec le prix d'exécution du take profit
      const takeProfitExecutionPrice: HistoricalPrice = {
        ...price,
        close: takeProfitPrice // Le take profit s'exécute au niveau défini
      }
      this.executeSell(takeProfitExecutionPrice, index, `Take Profit (+${this.config.riskManagement.takeProfit}%) - Mèche touchée`)
      return
    }
  }

  private updatePosition(price: HistoricalPrice) {
    if (!this.state.position.isOpen) return

    this.state.position.currentValue = this.state.position.quantity * price.close
    this.state.position.unrealizedPnl = this.state.position.currentValue - this.state.position.totalInvested
    this.state.position.unrealizedPnlPercentage = (this.state.position.unrealizedPnl / this.state.position.totalInvested) * 100
  }

  private getSignalReason(signal: 'BUY' | 'SELL'): string {
    // Stratégie personnalisée
    if (this.config.strategyType === 'custom' && this.config.customStrategy) {
      const actionText = signal === 'BUY' ? 'Entrée' : 'Sortie'
      return `${this.config.customStrategy.name} - ${actionText}`
    }

    // Stratégies recommandées
    const strategy = this.config.strategy
    if (signal === 'BUY') {
      switch (strategy) {
        case 'rsi_oversold': return `RSI Survente (<${this.config.parameters.rsiOversold})`
        case 'ema_cross': return `Golden Cross EMA${this.config.parameters.emaPeriod1}/${this.config.parameters.emaPeriod2}`
        case 'bollinger_mean_reversion': return 'Prix près bande basse Bollinger'
        case 'macd_divergence': return 'MACD croise ligne signal ↗'
        case 'sma_cross': return 'Golden Cross SMA (Simple Moving Average)'
        case 'macd_rsi_combo': return 'MACD + RSI Combo Bullish'
        case 'stochastic_bollinger': return 'Stochastic Oversold + Bollinger Low'
        case 'ema_rsi_volume': return 'EMA Cross + RSI + Volume Fort'
        case 'williams_r_trend': return 'Williams %R Oversold + Trend'
        case 'triple_ema': return 'Triple EMA Alignement Bullish'
        default: return 'Signal d\'achat'
      }
    } else {
      switch (strategy) {
        case 'rsi_oversold': return `RSI Surachat (>${this.config.parameters.rsiOverbought})`
        case 'ema_cross': return `Death Cross EMA${this.config.parameters.emaPeriod1}/${this.config.parameters.emaPeriod2}`
        case 'bollinger_mean_reversion': return 'Prix près bande haute Bollinger'
        case 'macd_divergence': return 'MACD croise ligne signal ↘'
        case 'sma_cross': return 'Death Cross SMA (Simple Moving Average)'
        case 'macd_rsi_combo': return 'MACD + RSI Combo Bearish'
        case 'stochastic_bollinger': return 'Stochastic Overbought + Bollinger High'
        case 'ema_rsi_volume': return 'EMA/RSI Signal de Vente'
        case 'williams_r_trend': return 'Williams %R Overbought/Trend Down'
        case 'triple_ema': return 'Triple EMA Changement de Trend'
        default: return 'Signal de vente'
      }
    }
  }

  private calculateMetrics(): BacktestMetrics {
    const trades = this.state.trades
    const sellTrades = trades.filter(t => t.type === 'SELL' && t.pnl !== undefined)

    const totalReturn = this.state.currentCapital - this.config.initialCapital
    const totalReturnPercentage = (totalReturn / this.config.initialCapital) * 100

    const winningTrades = sellTrades.filter(t => t.pnl! > 0).length
    const losingTrades = sellTrades.filter(t => t.pnl! <= 0).length
    const winRate = sellTrades.length > 0 ? (winningTrades / sellTrades.length) * 100 : 0

    const profits = sellTrades.filter(t => t.pnl! > 0).map(t => t.pnl!)
    const losses = sellTrades.filter(t => t.pnl! <= 0).map(t => Math.abs(t.pnl!))

    const totalFees = trades.reduce((sum, t) => sum + t.fees, 0)

    // Buy & Hold comparison
    const firstPrice = this.priceData[0].close
    const lastPrice = this.priceData[this.priceData.length - 1].close
    const holdStrategyReturn = this.config.initialCapital * (lastPrice / firstPrice) - this.config.initialCapital
    const holdStrategyReturnPercentage = (holdStrategyReturn / this.config.initialCapital) * 100
    const alpha = totalReturnPercentage - holdStrategyReturnPercentage

    // Calcul du drawdown maximum
    const { maxDrawdown, maxDrawdownPercentage } = this.calculateMaxDrawdown()

    return {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate,
      totalReturn,
      totalReturnPercentage,
      maxDrawdown,
      maxDrawdownPercentage,
      sharpeRatio: this.calculateSharpeRatio(),
      profitFactor: losses.reduce((a, b) => a + b, 0) > 0 ? profits.reduce((a, b) => a + b, 0) / losses.reduce((a, b) => a + b, 0) : 0,
      averageWin: profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 0,
      averageLoss: losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0,
      largestWin: profits.length > 0 ? Math.max(...profits) : 0,
      largestLoss: losses.length > 0 ? Math.max(...losses) : 0,
      totalFees,
      holdStrategyReturn,
      holdStrategyReturnPercentage,
      alpha
    }
  }

  private calculateMaxDrawdown(): { maxDrawdown: number, maxDrawdownPercentage: number } {
    let peak = this.config.initialCapital
    let maxDrawdown = 0
    let maxDrawdownPercentage = 0

    for (const point of this.state.capitalHistory) {
      if (point.value > peak) {
        peak = point.value
      }

      const drawdown = peak - point.value
      const drawdownPercentage = (drawdown / peak) * 100

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercentage = drawdownPercentage
      }
    }

    return { maxDrawdown, maxDrawdownPercentage }
  }

  private calculateSharpeRatio(): number {
    if (this.state.capitalHistory.length < 2) return 0

    const returns = []
    for (let i = 1; i < this.state.capitalHistory.length; i++) {
      const prevValue = this.state.capitalHistory[i - 1].value
      const currentValue = this.state.capitalHistory[i].value
      returns.push((currentValue - prevValue) / prevValue)
    }

    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // Annualisé
  }

  private getEmptyMetrics(): BacktestMetrics {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalReturn: 0,
      totalReturnPercentage: 0,
      maxDrawdown: 0,
      maxDrawdownPercentage: 0,
      sharpeRatio: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      totalFees: 0,
      holdStrategyReturn: 0,
      holdStrategyReturnPercentage: 0,
      alpha: 0
    }
  }
}

// Export function pour lancer un backtest
export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  const engine = new BacktestEngine(config)
  return await engine.runBacktest()
}

export { BacktestEngine }