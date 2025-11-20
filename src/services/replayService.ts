// Service pour le mode replay/live des backtests

import type { BacktestResult } from './backtestEngine'
import { HistoricalPrice } from './historicalDataService'

export interface ReplayEvent {
  timestamp: number
  index: number
  type: 'price_update' | 'trade' | 'indicator_update'
  data: any
}

export interface ReplayState {
  currentIndex: number
  currentTimestamp: number
  isPlaying: boolean
  speed: number // 1x, 2x, 5x, 10x, etc.
  windowSize: number // Nombre de bougies à afficher
  followPrice: boolean // Suivre le prix avec une fenêtre glissante
  events: ReplayEvent[]
  highlightedTradeTimestamp: number | null // Timestamp du trade mis en évidence
  visibleData: {
    prices: HistoricalPrice[]
    trades: any[]
    indicators: any
    startIndex: number // Index de début de la fenêtre
    endIndex: number // Index de fin de la fenêtre
  }
}

export class ReplayService {
  private static instance: ReplayService | null = null
  private state: ReplayState
  private intervalId: NodeJS.Timeout | null = null
  private listeners: Array<(state: ReplayState) => void> = []

  constructor(private backtestResult: BacktestResult) {
    this.state = {
      currentIndex: 0,
      currentTimestamp: 0,
      isPlaying: false,
      speed: 1,
      windowSize: 50, // Fenêtre de 50 bougies par défaut (réduit pour mobile)
      followPrice: true, // Mode fenêtre glissante pour garder la taille fixe
      events: [],
      highlightedTradeTimestamp: null,
      visibleData: {
        prices: [],
        trades: [],
        indicators: {},
        startIndex: 0,
        endIndex: 0
      }
    }
    this.generateEvents()
  }

  static createInstance(backtestResult: BacktestResult): ReplayService {
    ReplayService.instance = new ReplayService(backtestResult)
    return ReplayService.instance
  }

  static getInstance(): ReplayService | null {
    return ReplayService.instance
  }

  private generateEvents(): void {
    const events: ReplayEvent[] = []
    const { priceData, state: backtestState, indicators } = this.backtestResult

    // Créer des événements pour chaque point de prix
    priceData.forEach((price, index) => {
      // Événement de mise à jour du prix
      events.push({
        timestamp: price.timestamp,
        index,
        type: 'price_update',
        data: { price, index }
      })

      // Événement de mise à jour des indicateurs
      events.push({
        timestamp: price.timestamp,
        index,
        type: 'indicator_update',
        data: { indicators, index }
      })
    })

    // Ajouter les événements de trades
    backtestState.trades.forEach(trade => {
      const priceIndex = priceData.findIndex(p => p.timestamp === trade.timestamp)
      if (priceIndex !== -1) {
        events.push({
          timestamp: trade.timestamp,
          index: priceIndex,
          type: 'trade',
          data: trade
        })
      }
    })

    // Trier les événements par timestamp
    events.sort((a, b) => a.timestamp - b.timestamp)
    this.state.events = events

    // Initialiser avec le premier état
    this.updateVisibleData(0)
  }

  private updateVisibleData(targetIndex: number): void {
    const { priceData, state: backtestState, indicators } = this.backtestResult

    // Calculer les index de début et fin de la fenêtre
    let startIndex: number
    let endIndex: number

    if (this.state.followPrice && priceData.length > this.state.windowSize) {
      // Mode fenêtre glissante : Positionné à 70% pour voir les nouvelles barres arriver à droite
      // La bougie actuelle est à 70% de la fenêtre, laissant 30% d'espace à droite
      const positionRatio = 0.7 // Position de la barre actuelle dans la fenêtre
      const leftMargin = Math.floor(this.state.windowSize * positionRatio)

      // La bougie actuelle sera à 70% de la fenêtre
      startIndex = Math.max(0, targetIndex - leftMargin)
      endIndex = startIndex + this.state.windowSize - 1

      // Si on dépasse la fin, recalculer depuis la fin
      if (endIndex >= priceData.length) {
        endIndex = priceData.length - 1
        startIndex = Math.max(0, endIndex - this.state.windowSize + 1)
      }

      // S'assurer que targetIndex est dans la fenêtre
      if (targetIndex < startIndex) {
        startIndex = Math.max(0, targetIndex)
        endIndex = Math.min(priceData.length - 1, startIndex + this.state.windowSize - 1)
      } else if (targetIndex > endIndex) {
        endIndex = targetIndex
        startIndex = Math.max(0, endIndex - this.state.windowSize + 1)
      }
    } else {
      // Mode traditionnel : du début jusqu'à l'index courant
      startIndex = 0
      endIndex = targetIndex
    }

    // Données de prix dans la fenêtre
    const visiblePrices = priceData.slice(startIndex, endIndex + 1)

    // Trades dans la fenêtre visible
    const currentTimestamp = priceData[targetIndex]?.timestamp || 0
    const windowStartTimestamp = priceData[startIndex]?.timestamp || 0
    const windowEndTimestamp = priceData[endIndex]?.timestamp || 0

    // Afficher tous les trades dans la fenêtre visible ET jusqu'au timestamp actuel
    // Cela permet d'afficher les trades à venir dans la fenêtre sans spoiler le futur
    const visibleTrades = backtestState.trades.filter(trade =>
      trade.timestamp >= windowStartTimestamp &&
      trade.timestamp <= Math.max(currentTimestamp, windowEndTimestamp)
    )

    // Indicateurs dans la fenêtre (même longueur que les prix pour synchronisation parfaite)
    const visibleIndicators: any = {}
    Object.keys(indicators).forEach(key => {
      if (indicators[key] && Array.isArray(indicators[key])) {
        // Prendre tous les indicateurs dans la fenêtre visible
        visibleIndicators[key] = indicators[key].slice(startIndex, endIndex + 1)
      }
    })

    this.state.visibleData = {
      prices: visiblePrices,
      trades: visibleTrades,
      indicators: visibleIndicators,
      startIndex,
      endIndex
    }

    this.state.currentIndex = targetIndex
    this.state.currentTimestamp = currentTimestamp

    this.notifyListeners()
  }

  // Contrôles de lecture
  play(): void {
    if (this.state.isPlaying) return

    this.state.isPlaying = true
    const baseDelay = 100 // ms entre chaque étape de base
    const delay = baseDelay / this.state.speed

    this.intervalId = setInterval(() => {
      if (this.state.currentIndex >= this.backtestResult.priceData.length - 1) {
        this.pause()
        return
      }

      this.updateVisibleData(this.state.currentIndex + 1)
    }, delay)

    this.notifyListeners()
  }

  pause(): void {
    this.state.isPlaying = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.notifyListeners()
  }

  stop(): void {
    this.pause()
    this.updateVisibleData(0)
  }

  // Navigation
  goToIndex(index: number): void {
    const targetIndex = Math.max(0, Math.min(index, this.backtestResult.priceData.length - 1))
    this.updateVisibleData(targetIndex)
  }

  goToTimestamp(timestamp: number): void {
    const index = this.backtestResult.priceData.findIndex(p => p.timestamp >= timestamp)
    if (index !== -1) {
      this.goToIndex(index)
    }
  }

  // Naviguer vers un trade spécifique et le centrer
  goToTradeAtTimestamp(timestamp: number): void {
    const priceData = this.backtestResult.priceData
    const tradeIndex = priceData.findIndex(p => p.timestamp === timestamp)

    if (tradeIndex !== -1) {
      // Définir le highlight
      this.state.highlightedTradeTimestamp = timestamp
      // Centrer le trade dans la fenêtre
      this.goToIndexCentered(tradeIndex)
      // Notifier les listeners
      this.notifyListeners()
    }
  }

  stepForward(): void {
    if (this.state.currentIndex < this.backtestResult.priceData.length - 1) {
      this.updateVisibleData(this.state.currentIndex + 1)
    }
  }

  stepBackward(): void {
    if (this.state.currentIndex > 0) {
      this.updateVisibleData(this.state.currentIndex - 1)
    }
  }

  // Contrôle de la vitesse
  setSpeed(speed: number): void {
    const wasPlaying = this.state.isPlaying

    // Toujours pause d'abord pour clear l'ancien intervalle
    this.pause()

    this.state.speed = Math.max(0.25, Math.min(10, speed))

    // Notifier même si on ne rejoue pas pour mettre à jour l'UI
    this.notifyListeners()

    // Relancer si c'était en cours
    if (wasPlaying) {
      this.play()
    }
  }

  // Contrôle de la fenêtre d'affichage
  setWindowSize(size: number): void {
    this.state.windowSize = Math.max(10, Math.min(150, size))
    this.updateVisibleData(this.state.currentIndex) // Recalculer avec la nouvelle taille
  }

  toggleFollowPrice(): void {
    this.state.followPrice = !this.state.followPrice
    this.updateVisibleData(this.state.currentIndex) // Recalculer avec le nouveau mode
  }

  setFollowPrice(follow: boolean): void {
    this.state.followPrice = follow
    this.updateVisibleData(this.state.currentIndex)
  }

  // Navigation par trade - centré au milieu de l'écran
  // On ne navigue que vers les SELL car ce sont les seuls affichés sur le graphique
  goToNextTrade(): void {
    // Utiliser le timestamp du trade actuellement mis en évidence, sinon le timestamp courant
    const referenceTimestamp = this.state.highlightedTradeTimestamp ?? this.state.currentTimestamp

    // Filtrer seulement les SELL trades (les seuls visibles sur le graphique)
    const sellTrades = this.backtestResult.state.trades.filter(trade => trade.type === 'SELL')

    // Trouver le prochain SELL trade après le timestamp de référence
    const nextTrade = sellTrades.find(trade => trade.timestamp > referenceTimestamp)

    if (nextTrade) {
      const priceData = this.backtestResult.priceData
      const tradeIndex = priceData.findIndex(p => p.timestamp === nextTrade.timestamp)
      if (tradeIndex !== -1) {
        // Définir le highlight AVANT de naviguer
        this.state.highlightedTradeTimestamp = nextTrade.timestamp
        this.goToIndexCentered(tradeIndex)
        // Forcer la notification pour s'assurer que le highlight est affiché
        this.notifyListeners()
      }
    }
  }

  goToPreviousTrade(): void {
    // Utiliser le timestamp du trade actuellement mis en évidence, sinon le timestamp courant
    const referenceTimestamp = this.state.highlightedTradeTimestamp ?? this.state.currentTimestamp

    // Filtrer seulement les SELL trades (les seuls visibles sur le graphique)
    const sellTrades = this.backtestResult.state.trades.filter(trade => trade.type === 'SELL')

    // Trouver tous les SELL trades avant le timestamp de référence
    const previousTrades = sellTrades.filter(trade => trade.timestamp < referenceTimestamp)

    if (previousTrades.length > 0) {
      const previousTrade = previousTrades[previousTrades.length - 1]
      const priceData = this.backtestResult.priceData
      const tradeIndex = priceData.findIndex(p => p.timestamp === previousTrade.timestamp)
      if (tradeIndex !== -1) {
        // Définir le highlight AVANT de naviguer
        this.state.highlightedTradeTimestamp = previousTrade.timestamp
        this.goToIndexCentered(tradeIndex)
        // Forcer la notification pour s'assurer que le highlight est affiché
        this.notifyListeners()
      }
    }
  }

  // Aller à un index en le centrant parfaitement dans la fenêtre
  private goToIndexCentered(index: number): void {
    const targetIndex = Math.max(0, Math.min(index, this.backtestResult.priceData.length - 1))
    const priceData = this.backtestResult.priceData

    // Centrer exactement le trade au milieu de la fenêtre
    // Pour 100 bougies, on veut 49 avant et 50 après (index 49 = centre)
    const beforeCenter = Math.floor((this.state.windowSize - 1) / 2)
    const afterCenter = this.state.windowSize - 1 - beforeCenter

    let startIndex = targetIndex - beforeCenter
    let endIndex = targetIndex + afterCenter

    // Ajuster si on dépasse le début
    if (startIndex < 0) {
      endIndex = endIndex - startIndex // Compenser
      startIndex = 0
    }

    // Ajuster si on dépasse la fin
    if (endIndex >= priceData.length) {
      startIndex = startIndex - (endIndex - priceData.length + 1)
      endIndex = priceData.length - 1
    }

    // S'assurer que startIndex n'est pas négatif après ajustement
    startIndex = Math.max(0, startIndex)

    // Mettre à jour les données visibles
    const visiblePrices = priceData.slice(startIndex, endIndex + 1)

    const currentTimestamp = priceData[targetIndex]?.timestamp || 0
    const windowStartTimestamp = priceData[startIndex]?.timestamp || 0
    const windowEndTimestamp = priceData[endIndex]?.timestamp || 0

    // Afficher TOUS les trades dans la fenêtre visible (pas juste jusqu'au current)
    const visibleTrades = this.backtestResult.state.trades.filter(trade =>
      trade.timestamp >= windowStartTimestamp &&
      trade.timestamp <= windowEndTimestamp
    )

    const visibleIndicators: any = {}
    const indicators = this.backtestResult.indicators
    Object.keys(indicators).forEach(key => {
      if (indicators[key] && Array.isArray(indicators[key])) {
        visibleIndicators[key] = indicators[key].slice(startIndex, endIndex + 1)
      }
    })

    this.state.visibleData = {
      prices: visiblePrices,
      trades: visibleTrades,
      indicators: visibleIndicators,
      startIndex,
      endIndex
    }

    this.state.currentIndex = targetIndex
    this.state.currentTimestamp = currentTimestamp

    this.notifyListeners()
  }

  // Gestion des listeners
  subscribe(listener: (state: ReplayState) => void): () => void {
    this.listeners.push(listener)

    // Retourner une fonction de désinscription
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }))
  }

  // Getters
  getState(): ReplayState {
    return { ...this.state }
  }

  getTotalDuration(): number {
    return this.backtestResult.priceData.length
  }

  getProgress(): number {
    const total = this.getTotalDuration()
    return total > 0 ? this.state.currentIndex / (total - 1) : 0
  }

  getCurrentPrice(): HistoricalPrice | null {
    return this.backtestResult.priceData[this.state.currentIndex] || null
  }

  getTradesInCurrentView(): any[] {
    return this.state.visibleData.trades
  }

  getWindowInfo(): { size: number, followPrice: boolean, startIndex: number, endIndex: number } {
    return {
      size: this.state.windowSize,
      followPrice: this.state.followPrice,
      startIndex: this.state.visibleData.startIndex,
      endIndex: this.state.visibleData.endIndex
    }
  }

  getBacktestResult(): BacktestResult {
    return this.backtestResult
  }

  // Méthodes utilitaires
  getTimeInfo(): { current: string, total: string, progress: number } {
    const currentPrice = this.getCurrentPrice()
    const totalPrices = this.backtestResult.priceData
    const firstPrice = totalPrices[0]
    const lastPrice = totalPrices[totalPrices.length - 1]

    return {
      current: currentPrice ? new Date(currentPrice.timestamp).toLocaleString('fr-FR') : '',
      total: `${new Date(firstPrice.timestamp).toLocaleDateString('fr-FR')} - ${new Date(lastPrice.timestamp).toLocaleDateString('fr-FR')}`,
      progress: this.getProgress()
    }
  }

  // Nettoyage
  destroy(): void {
    this.pause()
    this.listeners = []
    ReplayService.instance = null
  }
}