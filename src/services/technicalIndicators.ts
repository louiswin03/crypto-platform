// src/services/technicalIndicators.ts

import { HistoricalPrice } from './historicalDataService'

export interface IndicatorResult {
  timestamp: number
  value: number | null
}

export interface MACDResult {
  timestamp: number
  macd: number | null
  signal: number | null
  histogram: number | null
}

export interface BollingerBandsResult {
  timestamp: number
  upper: number | null
  middle: number | null
  lower: number | null
}

export interface StochasticResult {
  timestamp: number
  k: number | null
  d: number | null
}

// ===== MOVING AVERAGES =====

// Simple Moving Average (SMA) - exactement comme TradingView
export function calculateSMA(prices: HistoricalPrice[], period: number = 20): IndicatorResult[] {
  const results: IndicatorResult[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      results.push({ timestamp: prices[i].timestamp, value: null })
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) {
        sum += prices[j].close
      }
      results.push({
        timestamp: prices[i].timestamp,
        value: sum / period
      })
    }
  }

  return results
}

// Exponential Moving Average (EMA) - formule TradingView
export function calculateEMA(prices: HistoricalPrice[], period: number = 20): IndicatorResult[] {
  const results: IndicatorResult[] = []
  const multiplier = 2 / (period + 1)

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      results.push({ timestamp: prices[i].timestamp, value: prices[i].close })
    } else if (i < period - 1) {
      // Utiliser SMA pour les premières valeurs
      let sum = 0
      for (let j = 0; j <= i; j++) {
        sum += prices[j].close
      }
      results.push({
        timestamp: prices[i].timestamp,
        value: sum / (i + 1)
      })
    } else {
      const previousEMA = results[i - 1].value!
      const currentEMA = (prices[i].close * multiplier) + (previousEMA * (1 - multiplier))
      results.push({
        timestamp: prices[i].timestamp,
        value: currentEMA
      })
    }
  }

  return results
}

// ===== RSI =====

// Relative Strength Index - formule exacte TradingView
export function calculateRSI(prices: HistoricalPrice[], period: number = 14): IndicatorResult[] {
  const results: IndicatorResult[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      results.push({ timestamp: prices[i].timestamp, value: null })
    } else {
      let gains = 0
      let losses = 0

      // Calculer les gains et pertes moyens sur la période
      for (let j = i - period + 1; j <= i; j++) {
        const change = prices[j].close - prices[j - 1].close
        if (change > 0) {
          gains += change
        } else {
          losses += Math.abs(change)
        }
      }

      const avgGain = gains / period
      const avgLoss = losses / period

      if (avgLoss === 0) {
        results.push({ timestamp: prices[i].timestamp, value: 100 })
      } else {
        const rs = avgGain / avgLoss
        const rsi = 100 - (100 / (1 + rs))
        results.push({ timestamp: prices[i].timestamp, value: rsi })
      }
    }
  }

  return results
}

// ===== MACD =====

// MACD - Moving Average Convergence Divergence (paramètres TradingView : 12, 26, 9)
export function calculateMACD(
  prices: HistoricalPrice[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)

  // Calculer la ligne MACD
  const macdLine: IndicatorResult[] = []
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i].value !== null && slowEMA[i].value !== null) {
      macdLine.push({
        timestamp: prices[i].timestamp,
        value: fastEMA[i].value! - slowEMA[i].value!
      })
    } else {
      macdLine.push({ timestamp: prices[i].timestamp, value: null })
    }
  }

  // Calculer la ligne de signal (EMA du MACD)
  const signalLine = calculateEMAFromValues(macdLine, signalPeriod)

  // Construire le résultat final
  const results: MACDResult[] = []
  for (let i = 0; i < prices.length; i++) {
    const macd = macdLine[i].value
    const signal = signalLine[i].value
    const histogram = (macd !== null && signal !== null) ? macd - signal : null

    results.push({
      timestamp: prices[i].timestamp,
      macd,
      signal,
      histogram
    })
  }

  return results
}

// Helper function pour calculer EMA sur des valeurs déjà calculées
function calculateEMAFromValues(values: IndicatorResult[], period: number): IndicatorResult[] {
  const results: IndicatorResult[] = []
  const multiplier = 2 / (period + 1)
  let emaValue: number | null = null

  for (let i = 0; i < values.length; i++) {
    if (values[i].value === null) {
      results.push({ timestamp: values[i].timestamp, value: null })
    } else if (emaValue === null) {
      // Première valeur non-null devient l'EMA initial
      emaValue = values[i].value!
      results.push({ timestamp: values[i].timestamp, value: emaValue })
    } else {
      emaValue = (values[i].value! * multiplier) + (emaValue * (1 - multiplier))
      results.push({ timestamp: values[i].timestamp, value: emaValue })
    }
  }

  return results
}

// ===== BOLLINGER BANDS =====

// Bollinger Bands - paramètres TradingView (période 20, déviation 2)
export function calculateBollingerBands(
  prices: HistoricalPrice[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsResult[] {
  const sma = calculateSMA(prices, period)
  const results: BollingerBandsResult[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1 || sma[i].value === null) {
      results.push({
        timestamp: prices[i].timestamp,
        upper: null,
        middle: null,
        lower: null
      })
    } else {
      const middle = sma[i].value!

      // Calculer l'écart-type
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) {
        sum += Math.pow(prices[j].close - middle, 2)
      }
      const standardDeviation = Math.sqrt(sum / period)

      results.push({
        timestamp: prices[i].timestamp,
        upper: middle + (stdDev * standardDeviation),
        middle: middle,
        lower: middle - (stdDev * standardDeviation)
      })
    }
  }

  return results
}

// ===== STOCHASTIC =====

// Stochastic Oscillator - paramètres TradingView (%K=14, %D=3)
export function calculateStochastic(
  prices: HistoricalPrice[],
  kPeriod: number = 14,
  dPeriod: number = 3
): StochasticResult[] {
  const kValues: IndicatorResult[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push({ timestamp: prices[i].timestamp, value: null })
    } else {
      // Trouver le plus haut et plus bas sur la période
      let highest = prices[i - kPeriod + 1].high
      let lowest = prices[i - kPeriod + 1].low

      for (let j = i - kPeriod + 2; j <= i; j++) {
        if (prices[j].high > highest) highest = prices[j].high
        if (prices[j].low < lowest) lowest = prices[j].low
      }

      const k = ((prices[i].close - lowest) / (highest - lowest)) * 100
      kValues.push({ timestamp: prices[i].timestamp, value: k })
    }
  }

  // %D est la moyenne mobile de %K
  const dValues = calculateSMAFromValues(kValues, dPeriod)

  // Combiner %K et %D dans le format StochasticResult
  const results: StochasticResult[] = []
  for (let i = 0; i < prices.length; i++) {
    results.push({
      timestamp: prices[i].timestamp,
      k: kValues[i].value,
      d: dValues[i].value
    })
  }

  return results
}

// Helper function pour calculer SMA sur des valeurs déjà calculées
function calculateSMAFromValues(values: IndicatorResult[], period: number): IndicatorResult[] {
  const results: IndicatorResult[] = []

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      results.push({ timestamp: values[i].timestamp, value: null })
    } else {
      let sum = 0
      let count = 0
      for (let j = i - period + 1; j <= i; j++) {
        if (values[j].value !== null) {
          sum += values[j].value!
          count++
        }
      }

      if (count === period) {
        results.push({ timestamp: values[i].timestamp, value: sum / period })
      } else {
        results.push({ timestamp: values[i].timestamp, value: null })
      }
    }
  }

  return results
}

// ===== WILLIAMS %R =====

// Williams %R - paramètre TradingView (période 14)
export function calculateWilliamsR(prices: HistoricalPrice[], period: number = 14): IndicatorResult[] {
  const results: IndicatorResult[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      results.push({ timestamp: prices[i].timestamp, value: null })
    } else {
      // Trouver le plus haut et plus bas sur la période
      let highest = prices[i - period + 1].high
      let lowest = prices[i - period + 1].low

      for (let j = i - period + 2; j <= i; j++) {
        if (prices[j].high > highest) highest = prices[j].high
        if (prices[j].low < lowest) lowest = prices[j].low
      }

      const williamsR = ((highest - prices[i].close) / (highest - lowest)) * -100
      results.push({ timestamp: prices[i].timestamp, value: williamsR })
    }
  }

  return results
}

// ===== NOUVEAUX INDICATEURS =====

// Interface pour VWAP
export interface VWAPResult {
  timestamp: number
  vwap: number | null
}

// Interface pour SuperTrend
export interface SuperTrendResult {
  timestamp: number
  supertrend: number | null
  trend: 'up' | 'down'
}

// Interface pour Ichimoku
export interface IchimokuResult {
  timestamp: number
  tenkanSen: number | null
  kijunSen: number | null
  senkouSpanA: number | null
  senkouSpanB: number | null
  chikouSpan: number | null
}

// Interface pour Pivot Points
export interface PivotPointsResult {
  timestamp: number
  pivot: number | null
  r1: number | null
  r2: number | null
  r3: number | null
  s1: number | null
  s2: number | null
  s3: number | null
}

// Interface pour OBV
export interface OBVResult {
  timestamp: number
  obv: number | null
  signal: number | null
}

// VWAP - Volume Weighted Average Price (TradingView standard)
// Peut être calculé en mode session (cumulative) ou sur une période roulante
export function calculateVWAP(prices: HistoricalPrice[], period?: number): VWAPResult[] {
  const results: VWAPResult[] = []

  if (!period) {
    // Mode session : VWAP cumulatif depuis le début
    let cumulativeVolume = 0
    let cumulativeVolumePrice = 0

    for (let i = 0; i < prices.length; i++) {
      const typicalPrice = (prices[i].high + prices[i].low + prices[i].close) / 3
      const volumePrice = typicalPrice * prices[i].volume

      cumulativeVolumePrice += volumePrice
      cumulativeVolume += prices[i].volume

      const vwap = cumulativeVolume > 0 ? cumulativeVolumePrice / cumulativeVolume : null
      results.push({ timestamp: prices[i].timestamp, vwap })
    }
  } else {
    // Mode période : VWAP sur une fenêtre glissante
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        results.push({ timestamp: prices[i].timestamp, vwap: null })
      } else {
        let totalVolumePrice = 0
        let totalVolume = 0

        for (let j = i - period + 1; j <= i; j++) {
          const typicalPrice = (prices[j].high + prices[j].low + prices[j].close) / 3
          totalVolumePrice += typicalPrice * prices[j].volume
          totalVolume += prices[j].volume
        }

        const vwap = totalVolume > 0 ? totalVolumePrice / totalVolume : null
        results.push({ timestamp: prices[i].timestamp, vwap })
      }
    }
  }

  return results
}

// SuperTrend Indicator (TradingView standard)
export function calculateSuperTrend(prices: HistoricalPrice[], period: number = 10, multiplier: number = 3): SuperTrendResult[] {
  const results: SuperTrendResult[] = []
  const atr = calculateATR(prices, period)

  let upperBand: number[] = []
  let lowerBand: number[] = []
  let finalUpperBand: number[] = []
  let finalLowerBand: number[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1 || !atr[i].value) {
      results.push({ timestamp: prices[i].timestamp, supertrend: null, trend: 'up' })
      upperBand.push(0)
      lowerBand.push(0)
      finalUpperBand.push(0)
      finalLowerBand.push(0)
    } else {
      const hl2 = (prices[i].high + prices[i].low) / 2

      // Calcul des bandes de base
      upperBand[i] = hl2 + (multiplier * atr[i].value!)
      lowerBand[i] = hl2 - (multiplier * atr[i].value!)

      // Calcul des bandes finales (logique TradingView)
      if (i === 0 || upperBand[i] < finalUpperBand[i - 1] || prices[i - 1].close > finalUpperBand[i - 1]) {
        finalUpperBand[i] = upperBand[i]
      } else {
        finalUpperBand[i] = finalUpperBand[i - 1]
      }

      if (i === 0 || lowerBand[i] > finalLowerBand[i - 1] || prices[i - 1].close < finalLowerBand[i - 1]) {
        finalLowerBand[i] = lowerBand[i]
      } else {
        finalLowerBand[i] = finalLowerBand[i - 1]
      }

      // Détermination du SuperTrend et de la tendance
      let supertrend: number
      let trend: 'up' | 'down'

      if (i === 0) {
        supertrend = finalLowerBand[i]
        trend = 'up'
      } else {
        const prevResult = results[i - 1]
        if (prevResult.supertrend === finalUpperBand[i - 1] && prices[i].close <= finalUpperBand[i]) {
          supertrend = finalUpperBand[i]
          trend = 'down'
        } else if (prevResult.supertrend === finalUpperBand[i - 1] && prices[i].close >= finalUpperBand[i]) {
          supertrend = finalLowerBand[i]
          trend = 'up'
        } else if (prevResult.supertrend === finalLowerBand[i - 1] && prices[i].close >= finalLowerBand[i]) {
          supertrend = finalLowerBand[i]
          trend = 'up'
        } else if (prevResult.supertrend === finalLowerBand[i - 1] && prices[i].close <= finalLowerBand[i]) {
          supertrend = finalUpperBand[i]
          trend = 'down'
        } else {
          supertrend = prevResult.supertrend || finalLowerBand[i]
          trend = prevResult.trend
        }
      }

      results.push({ timestamp: prices[i].timestamp, supertrend, trend })
    }
  }

  return results
}

// Ichimoku Kinko Hyo
export function calculateIchimoku(prices: HistoricalPrice[], tenkan: number = 9, kijun: number = 26, senkou: number = 52): IchimokuResult[] {
  const results: IchimokuResult[] = []

  for (let i = 0; i < prices.length; i++) {
    let tenkanSen: number | null = null
    let kijunSen: number | null = null
    let senkouSpanA: number | null = null
    let senkouSpanB: number | null = null
    let chikouSpan: number | null = null

    // Tenkan-sen (Conversion Line)
    if (i >= tenkan - 1) {
      let high = prices[i - tenkan + 1].high
      let low = prices[i - tenkan + 1].low
      for (let j = i - tenkan + 2; j <= i; j++) {
        if (prices[j].high > high) high = prices[j].high
        if (prices[j].low < low) low = prices[j].low
      }
      tenkanSen = (high + low) / 2
    }

    // Kijun-sen (Base Line)
    if (i >= kijun - 1) {
      let high = prices[i - kijun + 1].high
      let low = prices[i - kijun + 1].low
      for (let j = i - kijun + 2; j <= i; j++) {
        if (prices[j].high > high) high = prices[j].high
        if (prices[j].low < low) low = prices[j].low
      }
      kijunSen = (high + low) / 2
    }

    // Senkou Span A (Leading Span A)
    if (tenkanSen !== null && kijunSen !== null) {
      senkouSpanA = (tenkanSen + kijunSen) / 2
    }

    // Senkou Span B (Leading Span B)
    if (i >= senkou - 1) {
      let high = prices[i - senkou + 1].high
      let low = prices[i - senkou + 1].low
      for (let j = i - senkou + 2; j <= i; j++) {
        if (prices[j].high > high) high = prices[j].high
        if (prices[j].low < low) low = prices[j].low
      }
      senkouSpanB = (high + low) / 2
    }

    // Chikou Span (Lagging Span) - prix de clôture décalé
    chikouSpan = prices[i].close

    results.push({
      timestamp: prices[i].timestamp,
      tenkanSen,
      kijunSen,
      senkouSpanA,
      senkouSpanB,
      chikouSpan
    })
  }

  return results
}

// Pivot Points (TradingView standard)
export function calculatePivotPoints(prices: HistoricalPrice[], type: 'standard' | 'fibonacci' | 'camarilla' = 'standard'): PivotPointsResult[] {
  const results: PivotPointsResult[] = []

  // Pour les pivots, on utilise les données de la session précédente
  // TradingView recalcule les pivots chaque jour

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      // Pour le premier point, on ne peut pas calculer de pivots
      results.push({
        timestamp: prices[i].timestamp,
        pivot: null,
        r1: null, r2: null, r3: null,
        s1: null, s2: null, s3: null
      })
    } else {
      // Utiliser les données de la période précédente pour calculer les pivots
      const prev = prices[i - 1]
      const pivot = (prev.high + prev.low + prev.close) / 3

      let r1: number, r2: number, r3: number
      let s1: number, s2: number, s3: number

      switch (type) {
        case 'standard':
          r1 = 2 * pivot - prev.low
          r2 = pivot + (prev.high - prev.low)
          r3 = prev.high + 2 * (pivot - prev.low)
          s1 = 2 * pivot - prev.high
          s2 = pivot - (prev.high - prev.low)
          s3 = prev.low - 2 * (prev.high - pivot)
          break

        case 'fibonacci':
          const fibDiff = prev.high - prev.low
          r1 = pivot + 0.382 * fibDiff
          r2 = pivot + 0.618 * fibDiff
          r3 = pivot + 1.000 * fibDiff
          s1 = pivot - 0.382 * fibDiff
          s2 = pivot - 0.618 * fibDiff
          s3 = pivot - 1.000 * fibDiff
          break

        case 'camarilla':
          const camDiff = prev.high - prev.low
          r1 = prev.close + camDiff * 0.0916  // 1.1/12
          r2 = prev.close + camDiff * 0.1833  // 1.1/6
          r3 = prev.close + camDiff * 0.2750  // 1.1/4
          s1 = prev.close - camDiff * 0.0916
          s2 = prev.close - camDiff * 0.1833
          s3 = prev.close - camDiff * 0.2750
          break

        default:
          r1 = r2 = r3 = s1 = s2 = s3 = pivot
      }

      results.push({
        timestamp: prices[i].timestamp,
        pivot,
        r1, r2, r3,
        s1, s2, s3
      })
    }
  }

  return results
}

// On-Balance Volume (OBV) - TradingView standard
export function calculateOBV(prices: HistoricalPrice[], signalPeriod: number = 10): OBVResult[] {
  const results: OBVResult[] = []
  let runningOBV = 0
  const obvValues: number[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      runningOBV = prices[i].volume
    } else {
      if (prices[i].close > prices[i - 1].close) {
        runningOBV += prices[i].volume
      } else if (prices[i].close < prices[i - 1].close) {
        runningOBV -= prices[i].volume
      }
      // Si close === prev close, OBV reste inchangé
    }

    obvValues.push(runningOBV)

    // Calculer le signal (SMA du OBV)
    let signal: number | null = null
    if (i >= signalPeriod - 1) {
      let sum = 0
      for (let j = i - signalPeriod + 1; j <= i; j++) {
        sum += obvValues[j]
      }
      signal = sum / signalPeriod
    }

    results.push({
      timestamp: prices[i].timestamp,
      obv: runningOBV,
      signal
    })
  }

  return results
}

// Helper: calcul de l'ATR (Average True Range) pour SuperTrend
function calculateATR(prices: HistoricalPrice[], period: number): IndicatorResult[] {
  const results: IndicatorResult[] = []
  const trueRanges: number[] = []

  for (let i = 0; i < prices.length; i++) {
    let tr: number
    if (i === 0) {
      tr = prices[i].high - prices[i].low
    } else {
      const hl = prices[i].high - prices[i].low
      const hc = Math.abs(prices[i].high - prices[i - 1].close)
      const lc = Math.abs(prices[i].low - prices[i - 1].close)
      tr = Math.max(hl, hc, lc)
    }
    trueRanges.push(tr)

    if (i < period - 1) {
      results.push({ timestamp: prices[i].timestamp, value: null })
    } else {
      const atr = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      results.push({ timestamp: prices[i].timestamp, value: atr })
    }
  }

  return results
}

// ===== UTILITY FUNCTIONS =====

// Fonction pour aligner les indicateurs avec les données de prix
export function alignIndicatorWithPrices(
  prices: HistoricalPrice[],
  indicator: IndicatorResult[]
): (number | null)[] {
  return prices.map(price => {
    const indicatorPoint = indicator.find(ind => ind.timestamp === price.timestamp)
    return indicatorPoint ? indicatorPoint.value : null
  })
}

// Fonction pour obtenir la dernière valeur valide d'un indicateur
export function getLastValidValue(indicator: IndicatorResult[]): number | null {
  for (let i = indicator.length - 1; i >= 0; i--) {
    if (indicator[i].value !== null) {
      return indicator[i].value
    }
  }
  return null
}