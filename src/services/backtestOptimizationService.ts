// Service d'analyse et d'optimisation des backtests

import { BacktestResult } from './backtestEngine'

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

  constructor(result: BacktestResult) {
    this.result = result
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
          title: 'Take Profit trop conservateur',
          description: `Dans ${missedOpportunityRate.toFixed(0)}% des cas, le prix continue de monter après votre TP. Vous manquez en moyenne ${avgMissedProfit.toFixed(1)}% de profit supplémentaire.`,
          impact: 'high',
          suggestion: `Augmentez votre Take Profit pour capturer plus de gains. Testez avec ${suggestedTP}% au lieu de ${currentTP}%.`,
          currentValue: `${currentTP}%`,
          suggestedValue: `${suggestedTP}%`
        })
      } else if (missedOpportunityRate < 10 && config.riskManagement.takeProfit > 8) {
        advice.push({
          id: 'tp-optimal',
          type: 'success',
          category: 'risk_management',
          title: 'Take Profit bien calibré',
          description: 'Votre TP est bien positionné, vous capturez la majorité des gains sans laisser trop d\'opportunités.',
          impact: 'low',
          suggestion: 'Votre paramétrage de TP est optimal pour cette stratégie.'
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
          title: 'Stop Loss trop serré',
          description: `${prematureStopRate.toFixed(0)}% de vos Stop Loss se déclenchent alors que le prix récupère ensuite. Vous sortez trop tôt de positions potentiellement gagnantes.`,
          impact: 'high',
          suggestion: `Élargissez votre Stop Loss pour laisser respirer les positions. Testez ${suggestedSL}% au lieu de ${currentSL}%.`,
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
        title: 'Taux de réussite très faible',
        description: `Seulement ${metrics.winRate.toFixed(0)}% de vos trades sont gagnants. Votre stratégie génère trop de faux signaux.`,
        impact: 'high',
        suggestion: 'Ajoutez des filtres de confirmation ou changez de stratégie. Considérez combiner plusieurs indicateurs pour réduire les faux signaux.',
        currentValue: `${metrics.winRate.toFixed(0)}%`
      })
    } else if (metrics.winRate > 70) {
      advice.push({
        id: 'high-winrate',
        type: 'success',
        category: 'strategy',
        title: 'Excellent taux de réussite',
        description: `${metrics.winRate.toFixed(0)}% de trades gagnants ! Votre stratégie est très efficace.`,
        impact: 'low',
        suggestion: 'Maintenez cette stratégie. Assurez-vous que le ratio gain/perte reste favorable.'
      })
    } else if (metrics.winRate >= 50 && metrics.winRate <= 70) {
      advice.push({
        id: 'good-winrate',
        type: 'success',
        category: 'performance',
        title: 'Taux de réussite solide',
        description: `${metrics.winRate.toFixed(0)}% de trades gagnants, c'est un bon équilibre.`,
        impact: 'low',
        suggestion: 'Concentrez-vous maintenant sur l\'optimisation du ratio gain/perte.'
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
        title: 'Profit Factor négatif',
        description: `Vos pertes (${Math.abs(metrics.profitFactor * 100).toFixed(0)}%) dépassent vos gains. Cette stratégie perd de l'argent.`,
        impact: 'high',
        suggestion: 'Stratégie non rentable. Revoyez complètement vos paramètres ou changez d\'approche.'
      })
    } else if (metrics.profitFactor > 2) {
      advice.push({
        id: 'excellent-profit-factor',
        type: 'success',
        category: 'performance',
        title: 'Profit Factor excellent',
        description: `Vos gains sont ${metrics.profitFactor.toFixed(1)}x supérieurs à vos pertes !`,
        impact: 'low',
        suggestion: 'Excellente stratégie ! Surveillez la stabilité sur différentes périodes.'
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
        title: 'Drawdown dangereux',
        description: `Perte maximale de ${metrics.maxDrawdownPercentage.toFixed(1)}%. Vous risquez de perdre plus de 30% de votre capital.`,
        impact: 'high',
        suggestion: 'Réduisez la taille de vos positions ou resserrez vos stops. Risque trop élevé.',
        currentValue: `${metrics.maxDrawdownPercentage.toFixed(1)}%`
      })
    } else if (metrics.maxDrawdownPercentage < 10) {
      advice.push({
        id: 'low-drawdown',
        type: 'success',
        category: 'risk_management',
        title: 'Risque bien maîtrisé',
        description: `Drawdown de seulement ${metrics.maxDrawdownPercentage.toFixed(1)}%, excellent contrôle du risque.`,
        impact: 'low',
        suggestion: 'Gestion du risque exemplaire. Vous pourriez légèrement augmenter la taille des positions.'
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
          title: 'Entrées trop anticipées',
          description: `${earlyEntryRate.toFixed(0)}% de vos entrées sont suivies d'une baisse. Vous entrez trop tôt.`,
          impact: 'medium',
          suggestion: 'Attendez une confirmation supplémentaire avant d\'entrer en position. Ajoutez un filtre de volume ou de momentum.'
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
          title: 'Sorties manuelles perdantes',
          description: 'Vos sorties manuelles (hors TP/SL) sont majoritairement perdantes.',
          impact: 'medium',
          suggestion: 'Laissez vos TP/SL travailler. Évitez de sortir prématurément par peur.'
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

    // Analyser selon les indicateurs réellement utilisés
    if (hasRSI && !hasEMA && !hasMACD && metrics.winRate < 50) {
      advice.push({
        id: 'rsi-inefficient',
        type: 'suggestion',
        category: 'indicators',
        title: 'RSI peu efficace sur cette période',
        description: 'Le RSI seul ne semble pas suffisant pour cette crypto/période.',
        impact: 'medium',
        suggestion: 'Combinez le RSI avec un indicateur de tendance (EMA, MACD) pour filtrer les faux signaux.'
      })
    }

    if (hasEMA && metrics.profitFactor < 1.5) {
      advice.push({
        id: 'ema-needs-improvement',
        type: 'suggestion',
        category: 'indicators',
        title: 'Performance EMA à améliorer',
        description: 'Vos signaux EMA génèrent un profit factor faible.',
        impact: 'medium',
        suggestion: hasRSI || hasMACD
          ? 'Ajustez les périodes de vos EMA ou affinez les conditions de combinaison.'
          : 'Combinez vos EMA avec RSI ou MACD pour confirmation des signaux.'
      })
    }

    if (hasMACD && metrics.winRate < 45) {
      advice.push({
        id: 'macd-low-winrate',
        type: 'suggestion',
        category: 'indicators',
        title: 'MACD génère trop de faux signaux',
        description: `Seulement ${metrics.winRate.toFixed(0)}% de trades gagnants avec MACD.`,
        impact: 'medium',
        suggestion: 'Ajoutez un filtre de tendance (EMA) ou de momentum (RSI) pour valider les signaux MACD.'
      })
    }

    if (hasBB && metrics.winRate < 50) {
      advice.push({
        id: 'bb-inefficient',
        type: 'suggestion',
        category: 'indicators',
        title: 'Bollinger Bands peu efficaces',
        description: 'Les rebonds sur les bandes génèrent trop de faux signaux.',
        impact: 'medium',
        suggestion: 'Combinez avec RSI pour détecter les vraies surventes/surachats aux bandes.'
      })
    }

    if (hasStochastic && metrics.profitFactor < 1.3) {
      advice.push({
        id: 'stochastic-weak',
        type: 'suggestion',
        category: 'indicators',
        title: 'Stochastic peu rentable',
        description: 'Le Stochastic seul ne génère pas assez de profit.',
        impact: 'medium',
        suggestion: 'Utilisez le Stochastic comme filtre secondaire avec une EMA de tendance.'
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
        title: 'Sous-performance vs Buy & Hold',
        description: `Vous auriez gagné ${Math.abs(metrics.alpha).toFixed(1)}% de plus en achetant et gardant.`,
        impact: 'high',
        suggestion: 'Cette stratégie active ne bat pas le simple achat. Repensez votre approche ou restez passif.',
        currentValue: `${metrics.totalReturnPercentage.toFixed(1)}%`,
        suggestedValue: `${metrics.holdStrategyReturnPercentage.toFixed(1)}% (Hold)`
      })
    } else if (metrics.alpha > 10) {
      advice.push({
        id: 'outperform-hold',
        type: 'success',
        category: 'performance',
        title: 'Surperformance remarquable',
        description: `Vous battez le Buy & Hold de ${metrics.alpha.toFixed(1)}% !`,
        impact: 'low',
        suggestion: 'Excellente stratégie active. Vérifiez sa robustesse sur d\'autres périodes.'
      })
    }

    // Ratio Sharpe
    if (metrics.sharpeRatio > 2) {
      advice.push({
        id: 'excellent-sharpe',
        type: 'success',
        category: 'performance',
        title: 'Ratio Sharpe excellent',
        description: `Sharpe de ${metrics.sharpeRatio.toFixed(2)}, rendement très stable par rapport au risque.`,
        impact: 'low',
        suggestion: 'Rendement ajusté au risque optimal. Stratégie très équilibrée.'
      })
    }

    return advice
  }
}

// Fonction helper pour analyser un backtest
export function analyzeBacktest(result: BacktestResult): OptimizationAdvice[] {
  const service = new BacktestOptimizationService(result)
  return service.analyzeAndGenerateAdvice()
}
