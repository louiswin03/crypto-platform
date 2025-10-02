"use client"

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'

// Type pour window.chartControls
declare global {
  interface Window {
    chartControls?: {
      moveLeft: () => void
      moveRight: () => void
      zoomIn: () => void
      zoomOut: () => void
      resetZoom: () => void
      toggleFullscreen: () => void
      toggleZoomLock: () => void
    }
  }
}

// Composant pour afficher les lignes des indicateurs de prix (EMA, SMA, Bollinger)
const PriceIndicators = ({ data, indicators, config, priceMin, priceMax, chartHeight, chartWidth, candleWidth, margin, indexToX, startIndex }: any) => {
  if (!indicators) return null

  const priceToY = (price: number) => {
    const priceRange = priceMax - priceMin
    return margin.top + ((priceMax - price) / priceRange) * chartHeight
  }

  const elements = []

  // EMA 1 et 2
  if (indicators.ema1) {
    const emaPath = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const emaValue = indicators.ema1[globalIndex]?.value
      if (emaValue) {
        const x = indexToX(globalIndex)
        const y = priceToY(emaValue)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    if (emaPath) {
      elements.push(
        <path
          key="ema1"
          d={emaPath}
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  if (indicators.ema2) {
    const ema2Path = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const emaValue = indicators.ema2[globalIndex]?.value
      if (emaValue) {
        const x = indexToX(globalIndex)
        const y = priceToY(emaValue)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    if (ema2Path) {
      elements.push(
        <path
          key="ema2"
          d={ema2Path}
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  // SMA 1 et 2
  if (indicators.sma1) {
    const smaPath = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const smaValue = indicators.sma1[globalIndex]?.value
      if (smaValue) {
        const x = indexToX(globalIndex)
        const y = priceToY(smaValue)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    if (smaPath) {
      elements.push(
        <path
          key="sma1"
          d={smaPath}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  if (indicators.sma2) {
    const sma2Path = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const smaValue = indicators.sma2[globalIndex]?.value
      if (smaValue) {
        const x = indexToX(globalIndex)
        const y = priceToY(smaValue)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    if (sma2Path) {
      elements.push(
        <path
          key="sma2"
          d={sma2Path}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  // Bollinger Bands
  if (indicators.bollinger) {
    const upperPath = []
    const lowerPath = []
    const middlePath = []
    const areaPoints = []

    data.forEach((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const bollinger = indicators.bollinger[globalIndex]
      if (bollinger?.upper && bollinger?.lower && bollinger?.middle) {
        const x = indexToX(globalIndex)
        const upperY = priceToY(bollinger.upper)
        const lowerY = priceToY(bollinger.lower)
        const middleY = priceToY(bollinger.middle)

        upperPath.push(localIndex === 0 ? `M ${x} ${upperY}` : `L ${x} ${upperY}`)
        lowerPath.push(localIndex === 0 ? `M ${x} ${lowerY}` : `L ${x} ${lowerY}`)
        middlePath.push(localIndex === 0 ? `M ${x} ${middleY}` : `L ${x} ${middleY}`)

        // Points pour la zone remplie
        areaPoints.push({ x, upper: upperY, lower: lowerY })
      }
    })

    if (upperPath.length > 0) {
      // Zone entre les bandes
      if (areaPoints.length > 0) {
        const pathData = `M ${areaPoints[0].x} ${areaPoints[0].upper} ` +
          areaPoints.slice(1).map(p => `L ${p.x} ${p.upper}`).join(' ') +
          ` L ${areaPoints[areaPoints.length - 1].x} ${areaPoints[areaPoints.length - 1].lower} ` +
          areaPoints.slice(0, -1).reverse().map(p => `L ${p.x} ${p.lower}`).join(' ') + ' Z'

        elements.push(
          <path
            key="bollinger-area"
            d={pathData}
            fill="#6366F1"
            opacity="0.1"
          />
        )
      }

      // Lignes des bandes
      elements.push(
        <path
          key="bollinger-upper"
          d={upperPath.join(' ')}
          fill="none"
          stroke="#6366F1"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.6"
        />
      )
      elements.push(
        <path
          key="bollinger-lower"
          d={lowerPath.join(' ')}
          fill="none"
          stroke="#6366F1"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.6"
        />
      )
      elements.push(
        <path
          key="bollinger-middle"
          d={middlePath.join(' ')}
          fill="none"
          stroke="#6366F1"
          strokeWidth="1"
          opacity="0.8"
        />
      )
    }
  }

  // VWAP
  if (indicators.vwap) {
    const vwapPath = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const vwapData = indicators.vwap[globalIndex]
      if (vwapData && vwapData.vwap !== null && vwapData.vwap !== undefined) {
        const vwapValue = vwapData.vwap
        const x = indexToX(globalIndex)
        const y = priceToY(vwapValue)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    if (vwapPath) {
      elements.push(
        <path
          key="vwap"
          d={vwapPath}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
          opacity="0.9"
        />
      )
    }
  }

  // SuperTrend
  if (indicators.supertrend) {
    const supertrendPath = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const stValue = indicators.supertrend[globalIndex]
      if (stValue && stValue.supertrend !== null && stValue.supertrend !== undefined) {
        const x = indexToX(globalIndex)
        const y = priceToY(stValue.supertrend)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    if (supertrendPath) {
      elements.push(
        <path
          key="supertrend"
          d={supertrendPath}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  // Ichimoku
  if (indicators.ichimoku) {
    // Tenkan-sen (Conversion Line)
    const tenkanPath = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const ichimoku = indicators.ichimoku[globalIndex]
      if (ichimoku && ichimoku.tenkanSen !== null && ichimoku.tenkanSen !== undefined) {
        const x = indexToX(globalIndex)
        const y = priceToY(ichimoku.tenkanSen)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    // Kijun-sen (Base Line)
    const kijunPath = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const ichimoku = indicators.ichimoku[globalIndex]
      if (ichimoku && ichimoku.kijunSen !== null && ichimoku.kijunSen !== undefined) {
        const x = indexToX(globalIndex)
        const y = priceToY(ichimoku.kijunSen)
        return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
      }
      return ''
    }).filter(Boolean).join(' ')

    // Cloud (Kumo)
    const cloudPoints: any[] = []
    data.forEach((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const ichimoku = indicators.ichimoku[globalIndex]
      if (ichimoku &&
          ichimoku.senkouSpanA !== null && ichimoku.senkouSpanA !== undefined &&
          ichimoku.senkouSpanB !== null && ichimoku.senkouSpanB !== undefined) {
        const x = indexToX(globalIndex)
        const spanAY = priceToY(ichimoku.senkouSpanA)
        const spanBY = priceToY(ichimoku.senkouSpanB)
        cloudPoints.push({ x, spanA: spanAY, spanB: spanBY })
      }
    })

    // Zone du nuage
    if (cloudPoints.length > 0) {
      const cloudPath = `M ${cloudPoints[0].x} ${cloudPoints[0].spanA} ` +
        cloudPoints.slice(1).map(p => `L ${p.x} ${p.spanA}`).join(' ') +
        ` L ${cloudPoints[cloudPoints.length - 1].x} ${cloudPoints[cloudPoints.length - 1].spanB} ` +
        cloudPoints.slice(0, -1).reverse().map(p => `L ${p.x} ${p.spanB}`).join(' ') + ' Z'

      elements.push(
        <path
          key="ichimoku-cloud"
          d={cloudPath}
          fill="#8B5CF6"
          opacity="0.1"
        />
      )
    }

    if (tenkanPath) {
      elements.push(
        <path
          key="ichimoku-tenkan"
          d={tenkanPath}
          fill="none"
          stroke="#EF4444"
          strokeWidth="1"
          opacity="0.8"
        />
      )
    }

    if (kijunPath) {
      elements.push(
        <path
          key="ichimoku-kijun"
          d={kijunPath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1"
          opacity="0.8"
        />
      )
    }
  }

  // Pivot Points
  if (indicators.pivotPoints) {
    data.forEach((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const pivot = indicators.pivotPoints[globalIndex]
      if (pivot) {
        const x = indexToX(globalIndex)
        const levels = [
          { key: 'pivot', value: pivot.pivot, color: '#6B7280', label: 'P' },
          { key: 'r1', value: pivot.r1, color: '#DC2626', label: 'R1' },
          { key: 'r2', value: pivot.r2, color: '#DC2626', label: 'R2' },
          { key: 's1', value: pivot.s1, color: '#16A34A', label: 'S1' },
          { key: 's2', value: pivot.s2, color: '#16A34A', label: 'S2' }
        ]

        levels.forEach(level => {
          if (level.value !== null) {
            const y = priceToY(level.value)
            elements.push(
              <line
                key={`${level.key}-${globalIndex}`}
                x1={x - candleWidth / 2}
                x2={x + candleWidth / 2}
                y1={y}
                y2={y}
                stroke={level.color}
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.6"
              />
            )
          }
        })
      }
    })
  }

  return <g>{elements}</g>
}

interface CandleData {
  timestamp: number
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
  displayDate: string
  trade?: any
}

interface CandlestickProps {
  data: CandleData[]
  width: number
  height: number
  trades?: any[]
  indicators?: any
  config?: any
  highlightedTrade?: any
  disableZoom?: boolean
}

export default function CandlestickChart({ data, width, height, trades = [], indicators, config, highlightedTrade, disableZoom = false }: CandlestickProps) {
  // Utiliser la taille du conteneur au lieu des props width/height
  const [containerSize, setContainerSize] = useState({ width: width || 800, height: height || 500 })
  // États pour le zoom et le déplacement
  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(1)
  const [zoomLocked, setZoomLocked] = useState(false)

  // Réinitialiser la vue quand disableZoom change
  useEffect(() => {
    if (disableZoom) {
      console.log('Mode replay activé - réinitialisation de la vue zoom')
      setViewStart(0)
      setViewEnd(1)
      setZoomLocked(true)
    } else {
      setZoomLocked(false)
    }
  }, [disableZoom])
  const [isPanning, setIsPanning] = useState(false)
  const [lastMouseX, setLastMouseX] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Observer pour détecter les changements de taille
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width: newWidth, height: newHeight } = entry.contentRect
        // Éviter les redimensionnements trop fréquents
        setContainerSize(prev => {
          if (Math.abs(prev.width - newWidth) < 5 && Math.abs(prev.height - newHeight) < 5) {
            return prev // Pas de changement significatif
          }
          console.log(`CandlestickChart resize: ${prev.width}x${prev.height} → ${newWidth}x${newHeight}`)
          return { width: newWidth, height: newHeight }
        })
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  if (!data || data.length === 0) {
    console.log('CandlestickChart: Aucune donnée reçue')
    return <div className="text-gray-500 p-4">Aucune donnée de prix disponible</div>
  }

  console.log('CandlestickChart: Données reçues:', {
    dataLength: data.length,
    firstCandle: data[0],
    tradesLength: trades.length
  })

  // Calculer les données visibles selon le zoom
  const startIndex = Math.floor(viewStart * data.length)
  const endIndex = Math.ceil(viewEnd * data.length)
  const visibleData = data.slice(startIndex, endIndex)
  const visibleTrades = trades.filter(trade => {
    const tradeIndex = data.findIndex(d => d.timestamp === trade.timestamp)
    return tradeIndex >= startIndex && tradeIndex <= endIndex
  })

  // Calculer les valeurs min/max pour le scaling (seulement sur les données visibles)
  const validPrices = visibleData.flatMap(d => [d.open, d.high, d.low, d.close]).filter(p => !isNaN(p) && isFinite(p))

  if (validPrices.length === 0) {
    console.error('Aucun prix valide trouvé dans les données')
    return <div className="text-red-500 p-4">Erreur: Aucune donnée de prix valide</div>
  }

  const minPrice = Math.min(...validPrices)
  const maxPrice = Math.max(...validPrices)
  const priceRange = maxPrice - minPrice
  const padding = priceRange * 0.1 // 10% de padding
  const chartMinPrice = minPrice - padding
  const chartMaxPrice = maxPrice + padding
  const chartPriceRange = chartMaxPrice - chartMinPrice

  // Dimensions dynamiques selon le mode
  const actualWidth = isFullscreen ? window.innerWidth - 40 : containerSize.width
  const actualHeight = isFullscreen ? window.innerHeight - 40 : containerSize.height

  // Dimensions du graphique adaptées selon la taille
  const marginScale = isFullscreen ? 1.5 : 1
  const margin = {
    top: 20 * marginScale,
    right: 80 * marginScale,
    bottom: 50 * marginScale,
    left: 80 * marginScale
  }
  const chartWidth = actualWidth - margin.left - margin.right
  const chartHeight = actualHeight - margin.top - margin.bottom

  // Tailles adaptatives
  const fontSize = {
    axis: isFullscreen ? 14 : 10,
    labels: isFullscreen ? 16 : 12,
    tradeLabels: isFullscreen ? 12 : 10
  }

  // Fonction pour convertir le prix en coordonnée Y
  const priceToY = (price: number) => {
    if (!isFinite(price) || isNaN(price)) return margin.top + chartHeight / 2 // Centre si invalide
    return margin.top + ((chartMaxPrice - price) / chartPriceRange) * chartHeight
  }

  // Fonction pour convertir l'index en coordonnée X (pour les données visibles)
  const indexToX = (globalIndex: number) => {
    if (visibleData.length <= 1) return margin.left + chartWidth / 2
    const localIndex = globalIndex - startIndex
    return margin.left + (localIndex / (visibleData.length - 1)) * chartWidth
  }

  // Largeur d'une bougie (adaptée au zoom)
  const candleWidth = Math.max(2, chartWidth / visibleData.length * 0.8)

  // Gestionnaires d'événements pour le zoom et le déplacement
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (zoomLocked || disableZoom) {
      console.log('Zoom bloqué (mode replay ou verrou)')
      return
    }

    e.preventDefault()

    // Sensibilité encore plus réduite
    const zoomFactor = e.deltaY > 0 ? 1.02 : 0.98
    const currentRange = viewEnd - viewStart
    const newRange = Math.max(0.01, Math.min(1, currentRange * zoomFactor))

    // Centrer le zoom sur la position de la souris
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseRatio = (mouseX - margin.left) / chartWidth
      const centerPoint = viewStart + currentRange * mouseRatio

      const newStart = Math.max(0, centerPoint - newRange / 2)
      const newEnd = Math.min(1, newStart + newRange)

      console.log(`Zoom via molette: [${viewStart.toFixed(3)}, ${viewEnd.toFixed(3)}] → [${newStart.toFixed(3)}, ${newEnd.toFixed(3)}]`)
      setViewStart(newStart)
      setViewEnd(newEnd)
    }
  }, [viewStart, viewEnd, zoomLocked, disableZoom, chartWidth, margin.left])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disableZoom) {
      console.log('Panning désactivé en mode replay')
      return
    }
    setIsPanning(true)
    setLastMouseX(e.clientX)
  }, [disableZoom])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return

    const deltaX = e.clientX - lastMouseX
    const range = viewEnd - viewStart
    // Sensibilité encore plus réduite pour un déplacement très fluide
    const deltaRatio = (deltaX / chartWidth) * range * 0.3

    let newStart = viewStart - deltaRatio
    let newEnd = viewEnd - deltaRatio

    // Limites
    if (newStart < 0) {
      newEnd += (0 - newStart)
      newStart = 0
    }
    if (newEnd > 1) {
      newStart -= (newEnd - 1)
      newEnd = 1
    }

    setViewStart(Math.max(0, newStart))
    setViewEnd(Math.min(1, newEnd))
    setLastMouseX(e.clientX)
  }, [isPanning, lastMouseX, viewStart, viewEnd, chartWidth])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const resetZoom = useCallback(() => {
    setViewStart(0)
    setViewEnd(1)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Gestion des touches du clavier (seulement quand le graphique est focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas intercepter si on tape dans un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Ne pas intercepter si le graphique n'est pas visible ou focus
      const container = containerRef.current
      if (!container || !document.contains(container)) {
        return
      }

      // Seulement si le graphique ou un de ses enfants a le focus
      if (!container.contains(document.activeElement) && document.activeElement !== document.body) {
        return
      }

      const center = (viewStart + viewEnd) / 2
      const currentRange = viewEnd - viewStart

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault()
          // Zoom avant
          const newRangeIn = Math.max(0.02, currentRange * 0.9)
          const newStartIn = Math.max(0, center - newRangeIn / 2)
          const newEndIn = Math.min(1, newStartIn + newRangeIn)
          setViewStart(newStartIn)
          setViewEnd(newEndIn)
          break

        case '-':
        case '_':
          e.preventDefault()
          // Zoom arrière
          const newRangeOut = Math.min(1, currentRange * 1.1)
          const newStartOut = Math.max(0, center - newRangeOut / 2)
          const newEndOut = Math.min(1, newStartOut + newRangeOut)
          setViewStart(newStartOut)
          setViewEnd(newEndOut)
          break

        case 'ArrowLeft':
          e.preventDefault()
          // Déplacer vers la gauche
          const shiftLeft = currentRange * 0.1
          setViewStart(Math.max(0, viewStart - shiftLeft))
          setViewEnd(Math.max(currentRange, viewEnd - shiftLeft))
          break

        case 'ArrowRight':
          e.preventDefault()
          // Déplacer vers la droite
          const shiftRight = currentRange * 0.1
          setViewStart(Math.min(1 - currentRange, viewStart + shiftRight))
          setViewEnd(Math.min(1, viewEnd + shiftRight))
          break

        case '0':
        case 'r':
        case 'R':
          e.preventDefault()
          // Reset zoom
          setViewStart(0)
          setViewEnd(1)
          break

        case 'f':
        case 'F':
          e.preventDefault()
          // Toggle fullscreen
          toggleFullscreen()
          break
      }
    }

    // Ajouter l'écouteur d'événements
    window.addEventListener('keydown', handleKeyDown)

    // Nettoyer l'écouteur au démontage
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [viewStart, viewEnd, toggleFullscreen])

  // Calculer les niveaux SL/TP pour chaque position ouverte
  const positionLevels = useMemo(() => {
    const levels: Array<{
      startIndex: number
      endIndex: number
      entryPrice: number
      stopLossPrice: number
      takeProfitPrice: number
      type: 'BUY' | 'SELL'
    }> = []

    let currentPosition: any = null

    trades.forEach((trade, index) => {
      if (trade.type === 'BUY' && !currentPosition) {
        // Nouvelle position longue
        const stopLossPrice = trade.price * (1 - (config?.riskManagement?.stopLoss || 5) / 100)
        const takeProfitPrice = trade.price * (1 + (config?.riskManagement?.takeProfit || 10) / 100)

        currentPosition = {
          startIndex: data.findIndex(d => d.timestamp === trade.timestamp),
          entryPrice: trade.price,
          stopLossPrice,
          takeProfitPrice,
          type: 'BUY'
        }
      } else if (trade.type === 'SELL' && currentPosition) {
        // Fermeture de position
        currentPosition.endIndex = data.findIndex(d => d.timestamp === trade.timestamp)
        levels.push(currentPosition)
        currentPosition = null
      }
    })

    // Si position encore ouverte à la fin
    if (currentPosition) {
      currentPosition.endIndex = data.length - 1
      levels.push(currentPosition)
    }

    return levels
  }, [trades, data, config])

  // Créer les bougies (seulement les visibles)
  const candles = visibleData.map((candle, localIndex) => {
    const globalIndex = startIndex + localIndex
    // Vérifier que toutes les valeurs sont valides
    const open = isFinite(candle.open) ? candle.open : candle.close
    const high = isFinite(candle.high) ? candle.high : Math.max(candle.open, candle.close)
    const low = isFinite(candle.low) ? candle.low : Math.min(candle.open, candle.close)
    const close = isFinite(candle.close) ? candle.close : candle.open

    const x = indexToX(globalIndex)
    const openY = priceToY(open)
    const closeY = priceToY(close)
    const highY = priceToY(high)
    const lowY = priceToY(low)

    const isGreen = close >= open
    const bodyHeight = Math.abs(closeY - openY)
    const bodyY = Math.min(openY, closeY)

    return {
      x,
      openY,
      closeY,
      highY,
      lowY,
      bodyHeight,
      bodyY,
      isGreen,
      candle,
      index: globalIndex
    }
  })

  // Créer les points de trade (seulement les visibles)
  const tradePoints = visibleTrades.map(trade => {
    const candleIndex = data.findIndex(d => d.timestamp === trade.timestamp)
    if (candleIndex === -1) return null

    const x = indexToX(candleIndex)
    const y = priceToY(trade.price)

    // Vérifier que x et y sont valides
    if (!isFinite(x) || !isFinite(y) || isNaN(x) || isNaN(y)) {
      console.warn('Trade point invalide:', { x, y, trade })
      return null
    }

    return {
      x,
      y,
      trade,
      candleIndex
    }
  }).filter(Boolean)

  // Rendre les contrôles dans l'en-tête
  useEffect(() => {
    const controlsContainer = document.getElementById('chart-controls')
    if (!controlsContainer) return

    const controlsHTML = `
      <button
        onclick="window.chartControls?.moveLeft()"
        class="px-1.5 py-0.5 bg-gray-700/80 hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="Déplacer vers la gauche"
        ${viewStart === 0 ? 'disabled' : ''}
      >
        ←
      </button>
      <button
        onclick="window.chartControls?.moveRight()"
        class="px-1.5 py-0.5 bg-gray-700/80 hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="Déplacer vers la droite"
        ${viewEnd === 1 ? 'disabled' : ''}
      >
        →
      </button>
      <button
        onclick="window.chartControls?.zoomIn()"
        class="px-1.5 py-0.5 bg-gray-700/80 hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="Zoom avant"
      >
        +
      </button>
      <button
        onclick="window.chartControls?.zoomOut()"
        class="px-1.5 py-0.5 bg-gray-700/80 hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="Zoom arrière"
      >
        -
      </button>
      <button
        onclick="window.chartControls?.resetZoom()"
        class="px-2 py-0.5 bg-gray-700/80 hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="Vue complète"
      >
        🔍 All
      </button>
      <button
        onclick="window.chartControls?.toggleFullscreen()"
        class="px-2 py-0.5 bg-gray-700/80 hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="${isFullscreen ? "Quitter le plein écran" : "Mode plein écran"}"
      >
        ${isFullscreen ? '🗗' : '🗖'}
      </button>
      <button
        onclick="window.chartControls?.toggleZoomLock()"
        class="px-2 py-0.5 ${zoomLocked ? 'bg-red-600/80' : 'bg-gray-700/80'} hover:bg-gray-600/90 text-white rounded text-xs transition-all duration-200 border border-gray-600/50"
        title="${zoomLocked ? "Débloquer le zoom" : "Bloquer le zoom"}"
      >
        ${zoomLocked ? '🔒' : '🔓'}
      </button>
      <div class="px-2 py-0.5 bg-gray-800/90 text-gray-300 rounded text-xs border border-gray-600/50">
        ${Math.round((1 / (viewEnd - viewStart)) * 100)}%
      </div>
    `

    controlsContainer.innerHTML = controlsHTML

    // Exposer les fonctions de contrôle
    window.chartControls = {
      moveLeft: () => {
        const range = viewEnd - viewStart
        const shift = range * 0.05
        setViewStart(Math.max(0, viewStart - shift))
        setViewEnd(Math.max(range, viewEnd - shift))
      },
      moveRight: () => {
        const range = viewEnd - viewStart
        const shift = range * 0.05
        setViewStart(Math.min(1 - range, viewStart + shift))
        setViewEnd(Math.min(1, viewEnd + shift))
      },
      zoomIn: () => {
        const center = (viewStart + viewEnd) / 2
        const newRange = Math.max(0.02, (viewEnd - viewStart) * 0.9)
        const newStart = Math.max(0, center - newRange / 2)
        const newEnd = Math.min(1, newStart + newRange)
        setViewStart(newStart)
        setViewEnd(newEnd)
      },
      zoomOut: () => {
        const center = (viewStart + viewEnd) / 2
        const newRange = Math.min(1, (viewEnd - viewStart) * 1.1)
        const newStart = Math.max(0, center - newRange / 2)
        const newEnd = Math.min(1, newStart + newRange)
        setViewStart(newStart)
        setViewEnd(newEnd)
      },
      resetZoom,
      toggleFullscreen,
      toggleZoomLock: () => {
        console.log(`Toggle zoom lock: ${zoomLocked} → ${!zoomLocked}`)
        setZoomLocked(prev => !prev)
      }
    }

    // Nettoyage
    return () => {
      if (controlsContainer) {
        controlsContainer.innerHTML = ''
      }
      delete window.chartControls
    }
  }, [viewStart, viewEnd, isFullscreen])

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-5' : ''}`}
    >

      {/* Instructions discrètes */}
      <div className="absolute bottom-2 left-2 z-10 text-xs text-gray-500 bg-gray-900/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-700/30 opacity-60 hover:opacity-100 transition-opacity duration-200 max-w-sm">
        🖱️ Glisser: déplacer • 🎯 Molette: zoom • ⌨️ <kbd className="px-1 bg-gray-700/50 rounded text-xs">+/-</kbd>/<kbd className="px-1 bg-gray-700/50 rounded text-xs">←→</kbd>/<kbd className="px-1 bg-gray-700/50 rounded text-xs">R</kbd>/<kbd className="px-1 bg-gray-700/50 rounded text-xs">F</kbd>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${actualWidth} ${actualHeight}`}
        className="bg-gray-900/50 rounded-lg border border-gray-700/50 cursor-move w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ userSelect: 'none' }}
      >
        {/* Grille de fond */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Indicateurs techniques en arrière-plan */}
        {config?.strategy === 'ema_cross' && indicators?.ema1 && indicators?.ema2 && (
          <g>
            {/* EMA1 */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const emaValue = indicators.ema1[globalIndex]?.value
                if (!emaValue) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(emaValue)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#16A34A"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.8"
            />
            {/* EMA2 */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const emaValue = indicators.ema2[globalIndex]?.value
                if (!emaValue) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(emaValue)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.8"
            />
          </g>
        )}

        {/* Bollinger Bands */}
        {config?.strategy === 'bollinger_mean_reversion' && indicators?.bollinger && (
          <g>
            {/* Bande supérieure */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const value = indicators.bollinger[globalIndex]?.upper
                if (!value) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(value)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            {/* Bande médiane */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const value = indicators.bollinger[globalIndex]?.middle
                if (!value) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(value)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            {/* Bande inférieure */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const value = indicators.bollinger[globalIndex]?.lower
                if (!value) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(value)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
          </g>
        )}

        {/* Indicateurs de prix (EMA, SMA, Bollinger) */}
        <PriceIndicators
          data={visibleData}
          indicators={indicators}
          config={config}
          priceMin={chartMinPrice}
          priceMax={chartMaxPrice}
          chartHeight={chartHeight}
          chartWidth={chartWidth}
          candleWidth={candleWidth}
          margin={margin}
          indexToX={indexToX}
          startIndex={startIndex}
        />

        {/* Bougies japonaises */}
        {candles.map(({ x, openY, closeY, highY, lowY, bodyHeight, bodyY, isGreen, candle, index }) => (
          <g key={index}>
            {/* Mèche haute */}
            <line
              x1={x}
              y1={highY}
              x2={x}
              y2={Math.min(openY, closeY)}
              stroke={isGreen ? "#16A34A" : "#DC2626"}
              strokeWidth="1"
            />

            {/* Mèche basse */}
            <line
              x1={x}
              y1={Math.max(openY, closeY)}
              x2={x}
              y2={lowY}
              stroke={isGreen ? "#16A34A" : "#DC2626"}
              strokeWidth="1"
            />

            {/* Corps de la bougie */}
            <rect
              x={x - candleWidth / 2}
              y={bodyY}
              width={candleWidth}
              height={Math.max(1, bodyHeight)}
              fill={isGreen ? "#16A34A" : "#DC2626"}
              stroke={isGreen ? "#16A34A" : "#DC2626"}
              strokeWidth="1"
              opacity="0.9"
            />
          </g>
        ))}

        {/* Lignes SL/TP pour positions ouvertes */}
        {positionLevels.map((position, index) => {
          const startIndexVisible = Math.max(position.startIndex, startIndex)
          const endIndexVisible = Math.min(position.endIndex, endIndex)

          if (startIndexVisible > endIndexVisible) return null

          const startX = indexToX(startIndexVisible)
          const endX = indexToX(endIndexVisible)

          const entryY = priceToY(position.entryPrice)
          const stopLossY = priceToY(position.stopLossPrice)
          const takeProfitY = priceToY(position.takeProfitPrice)

          return (
            <g key={`position-${index}`}>
              {/* Ligne d'entrée */}
              <line
                x1={startX}
                y1={entryY}
                x2={endX}
                y2={entryY}
                stroke="#6366F1"
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.8"
              />

              {/* Ligne Stop Loss */}
              <line
                x1={startX}
                y1={stopLossY}
                x2={endX}
                y2={stopLossY}
                stroke="#DC2626"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />

              {/* Ligne Take Profit */}
              <line
                x1={startX}
                y1={takeProfitY}
                x2={endX}
                y2={takeProfitY}
                stroke="#16A34A"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />

              {/* Labels adaptatifs */}
              {isFullscreen && (
                <>
                  <text x={endX + 10} y={entryY - 8} fill="#6366F1" fontSize={fontSize.labels} fontWeight="bold">
                    Entry: ${position.entryPrice.toFixed(2)}
                  </text>
                  <text x={endX + 10} y={stopLossY - 8} fill="#DC2626" fontSize={fontSize.labels} fontWeight="bold">
                    Stop Loss: ${position.stopLossPrice.toFixed(2)}
                  </text>
                  <text x={endX + 10} y={takeProfitY + 20} fill="#16A34A" fontSize={fontSize.labels} fontWeight="bold">
                    Take Profit: ${position.takeProfitPrice.toFixed(2)}
                  </text>
                </>
              )}
              {!isFullscreen && (
                <>
                  {/* Petits labels simplifiés en mode normal */}
                  <circle cx={endX} cy={entryY} r="3" fill="#6366F1" opacity="0.8" />
                  <circle cx={endX} cy={stopLossY} r="3" fill="#DC2626" opacity="0.8" />
                  <circle cx={endX} cy={takeProfitY} r="3" fill="#16A34A" opacity="0.8" />
                </>
              )}
            </g>
          )
        })}

        {/* Points de trade */}
        {tradePoints.map((point, index) => {
          if (!point) return null

          const isStopLoss = point.trade.reason?.includes('Stop Loss')
          const isTakeProfit = point.trade.reason?.includes('Take Profit')
          const isBuy = point.trade.type === 'BUY'

          // Vérifier si c'est le trade mis en évidence
          const isHighlighted = highlightedTrade && (
            point.trade.timestamp === highlightedTrade.openTrade.timestamp ||
            point.trade.timestamp === highlightedTrade.closeTrade.timestamp
          )

          let color = isBuy ? '#16A34A' : '#DC2626'
          if (isStopLoss) color = '#DC2626'
          if (isTakeProfit) color = '#16A34A'

          // Couleur spéciale pour le trade mis en évidence
          if (isHighlighted) {
            color = '#F59E0B' // Orange vif pour le trade sélectionné
          }

          return (
            <g key={`trade-${index}`}>
              {/* Ligne verticale étendue */}
              <line
                x1={point.x}
                y1={margin.top}
                x2={point.x}
                y2={actualHeight - margin.bottom}
                stroke={color}
                strokeWidth={isHighlighted ? "4" : "2"}
                strokeDasharray={isHighlighted ? "8 4" : "6 6"}
                opacity={isHighlighted ? "1" : "0.8"}
                opacity="0.4"
              />

              {/* Cercle principal adaptatif */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isHighlighted ? (isFullscreen ? 18 : 12) : (isFullscreen ? 15 : 10)}
                fill={color}
                stroke="white"
                strokeWidth={isHighlighted ? (isFullscreen ? 5 : 3) : (isFullscreen ? 4 : 2)}
                opacity={isHighlighted ? "1" : "0.95"}
              />

              {/* Cercle interne pour plus de visibilité */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isHighlighted ? (isFullscreen ? 12 : 8) : (isFullscreen ? 10 : 7)}
                fill="white"
                opacity={isHighlighted ? "0.4" : "0.3"}
              />

              {/* Halo pour le trade mis en évidence */}
              {isHighlighted && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isFullscreen ? 25 : 18}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.3"
                  strokeDasharray="4 4"
                >
                  <animate
                    attributeName="r"
                    values={`${isFullscreen ? 18 : 12};${isFullscreen ? 28 : 20};${isFullscreen ? 18 : 12}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.1;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Icône adaptative */}
              <text
                x={point.x}
                y={point.y + (isFullscreen ? 3 : 2)}
                textAnchor="middle"
                fill="white"
                fontSize={isFullscreen ? 16 : 10}
                fontWeight="bold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {isStopLoss ? '🛑' : isTakeProfit ? '🎯' : isBuy ? '⬆' : '⬇'}
              </text>

              {/* Label avec les détails - Adaptatif */}
              {isFullscreen && (
                <>
                  <rect
                    x={point.x + 20}
                    y={point.y - 20}
                    width="140"
                    height="40"
                    fill="rgba(0,0,0,0.85)"
                    stroke={color}
                    strokeWidth="2"
                    rx="6"
                  />
                  <text
                    x={point.x + 30}
                    y={point.y - 5}
                    fill="white"
                    fontSize={fontSize.tradeLabels}
                    fontWeight="bold"
                  >
                    {point.trade.type}: ${point.trade.price.toFixed(2)}
                  </text>
                  <text
                    x={point.x + 30}
                    y={point.y + 10}
                    fill={color}
                    fontSize={fontSize.tradeLabels - 1}
                  >
                    {point.trade.reason.substring(0, 20)}
                  </text>
                </>
              )}
              {!isFullscreen && (
                /* Petit label simplifié */
                <text
                  x={point.x + 15}
                  y={point.y - 5}
                  fill={color}
                  fontSize="9"
                  fontWeight="bold"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  ${point.trade.price.toFixed(0)}
                </text>
              )}
            </g>
          )
        })}

        {/* Axes et labels */}
        {/* Axe Y (prix) */}
        <g>
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={actualHeight - margin.bottom}
            stroke="#9CA3AF"
            strokeWidth={isFullscreen ? 2 : 1}
          />

          {/* Labels de prix - Plus nombreux en plein écran */}
          {(isFullscreen ? [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1] : [0, 0.25, 0.5, 0.75, 1]).map(ratio => {
            const price = chartMinPrice + (chartPriceRange * ratio)
            const y = priceToY(price)
            return (
              <g key={ratio}>
                <line
                  x1={margin.left - (isFullscreen ? 8 : 5)}
                  y1={y}
                  x2={margin.left}
                  y2={y}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - (isFullscreen ? 12 : 8)}
                  y={y + fontSize.axis / 3}
                  textAnchor="end"
                  fill="#9CA3AF"
                  fontSize={fontSize.axis}
                >
                  ${price.toFixed(0)}
                </text>
              </g>
            )
          })}
        </g>

        {/* Axe X (temps) */}
        <g>
          <line
            x1={margin.left}
            y1={actualHeight - margin.bottom}
            x2={actualWidth - margin.right}
            y2={actualHeight - margin.bottom}
            stroke="#9CA3AF"
            strokeWidth={isFullscreen ? 2 : 1}
          />

          {/* Labels de dates - Plus nombreux en plein écran */}
          {(isFullscreen ? [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1] : [0, 0.33, 0.66, 1]).map(ratio => {
            const index = Math.floor(ratio * (visibleData.length - 1))
            const candle = visibleData[index]
            if (!candle) return null

            const globalIndex = startIndex + index
            const x = indexToX(globalIndex)
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={actualHeight - margin.bottom}
                  x2={x}
                  y2={actualHeight - margin.bottom + (isFullscreen ? 8 : 5)}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={actualHeight - margin.bottom + (isFullscreen ? 22 : 16)}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize={fontSize.axis}
                >
                  {isFullscreen ? candle.displayDate : candle.displayDate.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

    </div>
  )
}