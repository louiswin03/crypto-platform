// Service d'analyse et d'optimisation des backtests

import { BacktestResult } from './backtestEngine'

// Helper function to replace placeholders in translated strings
function replacePlaceholders(text: string, values: Record<string, string | number>): string {
  let result = text
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  })
  return result
}

export interface OptimizationAdvice {
  id: string
  type: 'critical' | 'warning' | 'suggestion' | 'success'
  category: 'risk_management' | 'strategy' | 'timing' | 'indicators' | 'performance'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  suggestion: string
  currentValue?: string
  suggestedValue?: string
}

export class BacktestOptimizationService {
  private result: BacktestResult
  private t: (key: string) => string

  constructor(result: BacktestResult, translateFn?: (key: string) => string) {
    this.result = result
    this.t = translateFn || ((key: string) => key)
  }

  analyzeAndGenerateAdvice(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []

    // Analyses des paramètres de gestion du risque
    advice.push(...this.analyzeTakeProfitOptimization())
    advice.push(...this.analyzeStopLossOptimization())

    // Analyses de la stratégie
    advice.push(...this.analyzeWinRate())
    advice.push(...this.analyzeProfitFactor())
    advice.push(...this.analyzeDrawdown())

    // Analyses du timing
    advice.push(...this.analyzeEntryTiming())
    advice.push(...this.analyzeExitTiming())

    // Analyses des indicateurs
    advice.push(...this.analyzeIndicatorEfficiency())

    // Analyses de performance globale
    advice.push(...this.analyzeOverallPerformance())

    return advice.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 }
      return impactOrder[a.impact] - impactOrder[b.impact]
    })
  }

  private analyzeTakeProfitOptimization(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { config, priceData, state } = this.result

    // Analyser si les prix continuent de monter après TP
    const tpTrades = state.trades.filter(t =>
      t.type === 'SELL' && t.reason.toLowerCase().includes('take profit')
    )

    if (tpTrades.length >= 3) {
      let missedOpportunities = 0
      let totalMissedProfit = 0

      tpTrades.forEach(trade => {
        const tradeIndex = priceData.findIndex(p => p.timestamp === trade.timestamp)
        if (tradeIndex === -1 || tradeIndex >= priceData.length - 10) return

        // Analyser les 10 bougies suivantes
        const nextCandles = priceData.slice(tradeIndex + 1, tradeIndex + 11)
        const maxPriceAfter = Math.max(...nextCandles.map(c => c.high))
        const tpPrice = trade.price

        // Si le prix continue de monter de plus de 3% après le TP
        const additionalGain = ((maxPriceAfter - tpPrice) / tpPrice) * 100
        if (additionalGain > 3) {
          missedOpportunities++
          totalMissedProfit += additionalGain
        }
      })

      const missedOpportunityRate = (missedOpportunities / tpTrades.length) * 100

      if (missedOpportunityRate > 40) {
        const avgMissedProfit = totalMissedProfit / missedOpportunities
        const currentTP = config.riskManagement.takeProfit
        const suggestedTP = Math.min(currentTP + Math.ceil(avgMissedProfit / 2), 30)

        advice.push({
          id: 'tp-too-conservative',
          type: 'warning',
          category: 'risk_management',
          title: this.t('optimization.advice.tp_conservative.title'),
          description: replacePlaceholders(this.t('optimization.advice.tp_conservative.desc'), {
            rate: missedOpportunityRate.toFixed(0),
            profit: avgMissedProfit.toFixed(1)
          }),
          impact: 'high',
          suggestion: replacePlaceholders(this.t('optimization.advice.tp_conservative.suggestion'), {
            suggested: suggestedTP,
            current: currentTP
          }),
          currentValue: `${currentTP}%`,
          suggestedValue: `${suggestedTP}%`
        })
      } else if (missedOpportunityRate < 10 && config.riskManagement.takeProfit > 8) {
        advice.push({
          id: 'tp-optimal',
          type: 'success',
          category: 'risk_management',
          title: this.t('optimization.advice.tp_optimal.title'),
          description: this.t('optimization.advice.tp_optimal.desc'),
          impact: 'low',
          suggestion: this.t('optimization.advice.tp_optimal.suggestion')
        })
      }
    }

    return advice
  }

  private analyzeStopLossOptimization(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { config, priceData, state } = this.result

    // Analyser si les SL sont déclenchés trop tôt
    const slTrades = state.trades.filter(t =>
      t.type === 'SELL' && t.reason.toLowerCase().includes('stop loss')
    )

    if (slTrades.length >= 3) {
      let prematureStops = 0
      let totalRecovery = 0

      slTrades.forEach(trade => {
        const tradeIndex = priceData.findIndex(p => p.timestamp === trade.timestamp)
        if (tradeIndex === -1 || tradeIndex >= priceData.length - 20) return

        // Analyser les 20 bougies suivantes
        const nextCandles = priceData.slice(tradeIndex + 1, tradeIndex + 21)
        const entryPrice = trade.price / (1 - config.riskManagement.stopLoss / 100)
        const recoveryCandles = nextCandles.filter(c => c.close > entryPrice)

        if (recoveryCandles.length > 10) {
          prematureStops++
          const maxRecovery = Math.max(...nextCandles.map(c => c.high))
          const recovery = ((maxRecovery - entryPrice) / entryPrice) * 100
          totalRecovery += recovery
        }
      })

      const prematureStopRate = (prematureStops / slTrades.length) * 100

      if (prematureStopRate > 50) {
        const currentSL = config.riskManagement.stopLoss
        const suggestedSL = Math.min(currentSL + 2, 15)

        advice.push({
          id: 'sl-too-tight',
          type: 'warning',
          category: 'risk_management',
          title: this.t('optimization.advice.sl_tight.title'),
          description: replacePlaceholders(this.t('optimization.advice.sl_tight.desc'), {
            rate: prematureStopRate.toFixed(0)
          }),
          impact: 'high',
          suggestion: replacePlaceholders(this.t('optimization.advice.sl_tight.suggestion'), {
            suggested: suggestedSL,
            current: currentSL
          }),
          currentValue: `${currentSL}%`,
          suggestedValue: `${suggestedSL}%`
        })
      }
    }

    return advice
  }

  private analyzeWinRate(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { metrics, config } = this.result

    if (metrics.winRate < 40) {
      advice.push({
        id: 'low-winrate',
        type: 'critical',
        category: 'strategy',
        title: this.t('optimization.advice.low_winrate.title'),
        description: replacePlaceholders(this.t('optimization.advice.low_winrate.desc'), {
          rate: metrics.winRate.toFixed(0)
        }),
        impact: 'high',
        suggestion: this.t('optimization.advice.low_winrate.suggestion'),
        currentValue: `${metrics.winRate.toFixed(0)}%`
      })
    } else if (metrics.winRate > 70) {
      advice.push({
        id: 'high-winrate',
        type: 'success',
        category: 'strategy',
        title: this.t('optimization.advice.high_winrate.title'),
        description: replacePlaceholders(this.t('optimization.advice.high_winrate.desc'), {
          rate: metrics.winRate.toFixed(0)
        }),
        impact: 'low',
        suggestion: this.t('optimization.advice.high_winrate.suggestion')
      })
    } else if (metrics.winRate >= 50 && metrics.winRate <= 70) {
      advice.push({
        id: 'good-winrate',
        type: 'success',
        category: 'performance',
        title: this.t('optimization.advice.good_winrate.title'),
        description: replacePlaceholders(this.t('optimization.advice.good_winrate.desc'), {
          rate: metrics.winRate.toFixed(0)
        }),
        impact: 'low',
        suggestion: this.t('optimization.advice.good_winrate.suggestion')
      })
    }

    return advice
  }

  private analyzeProfitFactor(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { metrics } = this.result

    if (metrics.profitFactor < 1) {
      advice.push({
        id: 'negative-profit-factor',
        type: 'critical',
        category: 'performance',
        title: this.t('optimization.advice.negative_pf.title'),
        description: replacePlaceholders(this.t('optimization.advice.negative_pf.desc'), {
          value: Math.abs(metrics.profitFactor * 100).toFixed(0)
        }),
        impact: 'high',
        suggestion: this.t('optimization.advice.negative_pf.suggestion')
      })
    } else if (metrics.profitFactor > 2) {
      advice.push({
        id: 'excellent-profit-factor',
        type: 'success',
        category: 'performance',
        title: this.t('optimization.advice.excellent_pf.title'),
        description: replacePlaceholders(this.t('optimization.advice.excellent_pf.desc'), {
          value: metrics.profitFactor.toFixed(1)
        }),
        impact: 'low',
        suggestion: this.t('optimization.advice.excellent_pf.suggestion')
      })
    }

    return advice
  }

  private analyzeDrawdown(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { metrics } = this.result

    if (metrics.maxDrawdownPercentage > 30) {
      advice.push({
        id: 'high-drawdown',
        type: 'critical',
        category: 'risk_management',
        title: this.t('optimization.advice.high_drawdown.title'),
        description: replacePlaceholders(this.t('optimization.advice.high_drawdown.desc'), {
          value: metrics.maxDrawdownPercentage.toFixed(1)
        }),
        impact: 'high',
        suggestion: this.t('optimization.advice.high_drawdown.suggestion'),
        currentValue: `${metrics.maxDrawdownPercentage.toFixed(1)}%`
      })
    } else if (metrics.maxDrawdownPercentage < 10) {
      advice.push({
        id: 'low-drawdown',
        type: 'success',
        category: 'risk_management',
        title: this.t('optimization.advice.low_drawdown.title'),
        description: replacePlaceholders(this.t('optimization.advice.low_drawdown.desc'), {
          value: metrics.maxDrawdownPercentage.toFixed(1)
        }),
        impact: 'low',
        suggestion: this.t('optimization.advice.low_drawdown.suggestion')
      })
    }

    return advice
  }

  private analyzeEntryTiming(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { state, priceData } = this.result

    const buyTrades = state.trades.filter(t => t.type === 'BUY')

    if (buyTrades.length >= 5) {
      let tooEarlyEntries = 0

      buyTrades.forEach(trade => {
        const tradeIndex = priceData.findIndex(p => p.timestamp === trade.timestamp)
        if (tradeIndex >= priceData.length - 5) return

        // Vérifier si le prix baisse dans les 5 bougies suivantes
        const nextCandles = priceData.slice(tradeIndex + 1, tradeIndex + 6)
        const minPriceAfter = Math.min(...nextCandles.map(c => c.low))

        if (minPriceAfter < trade.price * 0.98) { // 2% de baisse
          tooEarlyEntries++
        }
      })

      const earlyEntryRate = (tooEarlyEntries / buyTrades.length) * 100

      if (earlyEntryRate > 60) {
        advice.push({
          id: 'entry-too-early',
          type: 'warning',
          category: 'timing',
          title: this.t('optimization.advice.entry_early.title'),
          description: replacePlaceholders(this.t('optimization.advice.entry_early.desc'), {
            rate: earlyEntryRate.toFixed(0)
          }),
          impact: 'medium',
          suggestion: this.t('optimization.advice.entry_early.suggestion')
        })
      }
    }

    return advice
  }

  private analyzeExitTiming(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { state, config } = this.result

    const sellTrades = state.trades.filter(t =>
      t.type === 'SELL' && !t.reason.includes('Take Profit') && !t.reason.includes('Stop Loss')
    )

    if (sellTrades.length >= 3) {
      const avgPnL = sellTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / sellTrades.length

      if (avgPnL < 0) {
        advice.push({
          id: 'manual-exit-negative',
          type: 'warning',
          category: 'timing',
          title: this.t('optimization.advice.manual_exit_negative.title'),
          description: this.t('optimization.advice.manual_exit_negative.desc'),
          impact: 'medium',
          suggestion: this.t('optimization.advice.manual_exit_negative.suggestion')
        })
      }
    }

    return advice
  }

  private analyzeIndicatorEfficiency(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { metrics, config } = this.result

    // Détecter les indicateurs réellement utilisés
    // Pour les stratégies custom, on vérifie uniquement les indicateurs activés
    const isCustomStrategy = config.strategyType === 'custom'

    const hasRSI = isCustomStrategy
      ? config.customStrategy?.indicators?.some(i => i.type === 'RSI' && i.enabled) || false
      : (config.strategy === 'rsi_oversold' || config.strategy === 'rsi_overbought')

    const hasEMA = isCustomStrategy
      ? config.customStrategy?.indicators?.some(i => i.type === 'EMA' && i.enabled) || false
      : config.strategy === 'ema_cross'

    const hasMACD = isCustomStrategy
      ? config.customStrategy?.indicators?.some(i => i.type === 'MACD' && i.enabled) || false
      : config.strategy === 'macd_cross'

    const hasBB = isCustomStrategy
      ? config.customStrategy?.indicators?.some(i => i.type === 'BOLLINGER' && i.enabled) || false
      : config.strategy === 'bollinger_bands'

    const hasStochastic = isCustomStrategy
      ? config.customStrategy?.indicators?.some(i => i.type === 'STOCHASTIC' && i.enabled) || false
      : config.strategy === 'stochastic'

    // Compter le nombre d'indicateurs actifs
    const activeIndicators = [hasRSI, hasEMA, hasMACD, hasBB, hasStochastic].filter(Boolean).length

    // Analyser selon les indicateurs réellement utilisés
    // IMPORTANT : Ne suggérer d'ajouter des indicateurs QUE si l'utilisateur utilise un seul indicateur
    if (hasRSI && !hasEMA && !hasMACD && !hasBB && !hasStochastic && metrics.winRate < 50) {
      advice.push({
        id: 'rsi-inefficient',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.rsi_inefficient.title'),
        description: this.t('optimization.advice.rsi_inefficient.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.rsi_inefficient.suggestion')
      })
    } else if (hasRSI && activeIndicators >= 2 && metrics.winRate < 50) {
      // Si plusieurs indicateurs mais toujours mauvais winrate
      advice.push({
        id: 'combined-indicators-inefficient',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.combined_inefficient.title'),
        description: replacePlaceholders(this.t('optimization.advice.combined_inefficient.desc'), {
          count: activeIndicators,
          rate: metrics.winRate.toFixed(0)
        }),
        impact: 'medium',
        suggestion: this.t('optimization.advice.combined_inefficient.suggestion')
      })
    }

    if (hasEMA && activeIndicators === 1 && metrics.profitFactor < 1.5) {
      advice.push({
        id: 'ema-needs-improvement',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.ema_weak.title'),
        description: this.t('optimization.advice.ema_weak.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.ema_weak.suggestion')
      })
    } else if (hasEMA && activeIndicators >= 2 && metrics.profitFactor < 1.5) {
      advice.push({
        id: 'ema-combined-weak',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.ema_combined_weak.title'),
        description: this.t('optimization.advice.ema_combined_weak.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.ema_combined_weak.suggestion')
      })
    }

    if (hasMACD && activeIndicators === 1 && metrics.winRate < 45) {
      advice.push({
        id: 'macd-low-winrate',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.macd_low_winrate.title'),
        description: replacePlaceholders(this.t('optimization.advice.macd_low_winrate.desc'), {
          rate: metrics.winRate.toFixed(0)
        }),
        impact: 'medium',
        suggestion: this.t('optimization.advice.macd_low_winrate.suggestion')
      })
    } else if (hasMACD && activeIndicators >= 2 && metrics.winRate < 45) {
      advice.push({
        id: 'macd-combined-weak',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.macd_combined_weak.title'),
        description: replacePlaceholders(this.t('optimization.advice.macd_combined_weak.desc'), {
          rate: metrics.winRate.toFixed(0)
        }),
        impact: 'medium',
        suggestion: this.t('optimization.advice.macd_combined_weak.suggestion')
      })
    }

    if (hasBB && activeIndicators === 1 && metrics.winRate < 50) {
      advice.push({
        id: 'bb-inefficient',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.bb_inefficient.title'),
        description: this.t('optimization.advice.bb_inefficient.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.bb_inefficient.suggestion')
      })
    } else if (hasBB && activeIndicators >= 2 && metrics.winRate < 50) {
      advice.push({
        id: 'bb-combined-weak',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.bb_combined_weak.title'),
        description: this.t('optimization.advice.bb_combined_weak.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.bb_combined_weak.suggestion')
      })
    }

    if (hasStochastic && activeIndicators === 1 && metrics.profitFactor < 1.3) {
      advice.push({
        id: 'stochastic-weak',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.stochastic_weak.title'),
        description: this.t('optimization.advice.stochastic_weak.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.stochastic_weak.suggestion')
      })
    } else if (hasStochastic && activeIndicators >= 2 && metrics.profitFactor < 1.3) {
      advice.push({
        id: 'stochastic-combined-weak',
        type: 'suggestion',
        category: 'indicators',
        title: this.t('optimization.advice.stochastic_combined_weak.title'),
        description: this.t('optimization.advice.stochastic_combined_weak.desc'),
        impact: 'medium',
        suggestion: this.t('optimization.advice.stochastic_combined_weak.suggestion')
      })
    }

    return advice
  }

  private analyzeOverallPerformance(): OptimizationAdvice[] {
    const advice: OptimizationAdvice[] = []
    const { metrics } = this.result

    // Comparer avec Buy & Hold
    if (metrics.alpha < 0) {
      advice.push({
        id: 'underperform-hold',
        type: 'critical',
        category: 'performance',
        title: this.t('optimization.advice.underperform_hold.title'),
        description: replacePlaceholders(this.t('optimization.advice.underperform_hold.desc'), {
          value: Math.abs(metrics.alpha).toFixed(1)
        }),
        impact: 'high',
        suggestion: this.t('optimization.advice.underperform_hold.suggestion'),
        currentValue: `${metrics.totalReturnPercentage.toFixed(1)}%`,
        suggestedValue: `${metrics.holdStrategyReturnPercentage.toFixed(1)}% (Hold)`
      })
    } else if (metrics.alpha > 10) {
      advice.push({
        id: 'outperform-hold',
        type: 'success',
        category: 'performance',
        title: this.t('optimization.advice.outperform_hold.title'),
        description: replacePlaceholders(this.t('optimization.advice.outperform_hold.desc'), {
          value: metrics.alpha.toFixed(1)
        }),
        impact: 'low',
        suggestion: this.t('optimization.advice.outperform_hold.suggestion')
      })
    }

    // Ratio Sharpe
    if (metrics.sharpeRatio > 2) {
      advice.push({
        id: 'excellent-sharpe',
        type: 'success',
        category: 'performance',
        title: this.t('optimization.advice.excellent_sharpe.title'),
        description: replacePlaceholders(this.t('optimization.advice.excellent_sharpe.desc'), {
          value: metrics.sharpeRatio.toFixed(2)
        }),
        impact: 'low',
        suggestion: this.t('optimization.advice.excellent_sharpe.suggestion')
      })
    }

    return advice
  }
}

// Fonction helper pour analyser un backtest
export function analyzeBacktest(result: BacktestResult, translateFn?: (key: string) => string): OptimizationAdvice[] {
  const service = new BacktestOptimizationService(result, translateFn)
  return service.analyzeAndGenerateAdvice()
}
