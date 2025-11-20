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
      const emaValue = indicators.ema1[localIndex]?.value
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
          stroke="#00FF88"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  if (indicators.ema2) {
    const ema2Path = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const emaValue = indicators.ema2[localIndex]?.value
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
      const smaValue = indicators.sma1[localIndex]?.value
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
          stroke="#FFA366"
          strokeWidth="2"
          opacity="0.8"
        />
      )
    }
  }

  if (indicators.sma2) {
    const sma2Path = data.map((candle: any, localIndex: number) => {
      const globalIndex = startIndex + localIndex
      const smaValue = indicators.sma2[localIndex]?.value
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
      const bollinger = indicators.bollinger[localIndex]
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
            fill="#00FF88"
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
          stroke="#00FF88"
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
          stroke="#00FF88"
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
          stroke="#00FF88"
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
      const vwapData = indicators.vwap[localIndex]
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
          stroke="#FFA366"
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
      const stValue = indicators.supertrend[localIndex]
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
      const ichimoku = indicators.ichimoku[localIndex]
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
      const ichimoku = indicators.ichimoku[localIndex]
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
      const ichimoku = indicators.ichimoku[localIndex]
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
      const pivot = indicators.pivotPoints[localIndex]
      if (pivot) {
        const x = indexToX(globalIndex)
        const levels = [
          { key: 'pivot', value: pivot.pivot, color: '#6B7280', label: 'P' },
          { key: 'r1', value: pivot.r1, color: '#DC2626', label: 'R1' },
          { key: 'r2', value: pivot.r2, color: '#DC2626', label: 'R2' },
          { key: 's1', value: pivot.s1, color: '#00FF88', label: 'S1' },
          { key: 's2', value: pivot.s2, color: '#00FF88', label: 'S2' }
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
  highlightedTradeTimestamp?: number | null
  disableZoom?: boolean
}

export default function CandlestickChart({ data, width, height, trades = [], indicators, config, highlightedTrade, highlightedTradeTimestamp, disableZoom = false }: CandlestickProps) {
  // Utiliser la taille du conteneur au lieu des props width/height
  const [containerSize, setContainerSize] = useState({ width: width || 800, height: height || 500 })
  // États pour le zoom et le déplacement
  const [viewStart, setViewStart] = useState(0)
  const [viewEnd, setViewEnd] = useState(1)
  const [zoomLocked, setZoomLocked] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [lastMouseX, setLastMouseX] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Réinitialiser la vue quand disableZoom change
  useEffect(() => {
    if (disableZoom) {
      setViewStart(0)
      setViewEnd(1)
      setZoomLocked(true)
    } else {
      setZoomLocked(false)
    }
  }, [disableZoom])

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
          return { width: newWidth, height: newHeight }
        })
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Gestionnaires d'événements pour le zoom et le déplacement
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (zoomLocked || disableZoom) {
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
      const margin = { top: 20, right: 80, bottom: 50, left: 80 }
      const chartWidth = containerSize.width - margin.left - margin.right
      const mouseRatio = (mouseX - margin.left) / chartWidth
      const centerPoint = viewStart + currentRange * mouseRatio

      const newStart = Math.max(0, centerPoint - newRange / 2)
      const newEnd = Math.min(1, newStart + newRange)

      setViewStart(newStart)
      setViewEnd(newEnd)
    }
  }, [viewStart, viewEnd, zoomLocked, disableZoom, containerSize.width])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disableZoom) {
      return
    }
    setIsPanning(true)
    setLastMouseX(e.clientX)
  }, [disableZoom])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return

    const deltaX = e.clientX - lastMouseX
    const range = viewEnd - viewStart
    const margin = { top: 20, right: 80, bottom: 50, left: 80 }
    const chartWidth = containerSize.width - margin.left - margin.right
    // Sensibilité augmentée pour un déplacement plus rapide
    const deltaRatio = (deltaX / chartWidth) * range * 1.5

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
  }, [isPanning, lastMouseX, viewStart, viewEnd, containerSize.width])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const resetZoom = useCallback(() => {
    setViewStart(0)
    setViewEnd(1)
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

      // Vérifier si le container ou l'un de ses enfants a le focus
      if (!container.contains(document.activeElement)) {
        return
      }

      const step = 0.05 // 5% de déplacement
      const range = viewEnd - viewStart

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (viewStart > 0) {
            setViewStart(Math.max(0, viewStart - step))
            setViewEnd(Math.max(step, viewEnd - step))
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (viewEnd < 1) {
            setViewStart(Math.min(1 - range, viewStart + step))
            setViewEnd(Math.min(1, viewEnd + step))
          }
          break
        case '+':
        case '=':
          e.preventDefault()
          if (range > 0.1) {
            const center = (viewStart + viewEnd) / 2
            const newRange = range * 0.9
            setViewStart(Math.max(0, center - newRange / 2))
            setViewEnd(Math.min(1, center + newRange / 2))
          }
          break
        case '-':
          e.preventDefault()
          if (range < 1) {
            const center = (viewStart + viewEnd) / 2
            const newRange = Math.min(1, range * 1.1)
            setViewStart(Math.max(0, center - newRange / 2))
            setViewEnd(Math.min(1, center + newRange / 2))
          }
          break
        case 'r':
        case 'R':
          e.preventDefault()
          resetZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [viewStart, viewEnd, resetZoom])

  // Exposer les contrôles sur window pour les boutons HTML
  useEffect(() => {
    const step = 0.1
    const range = viewEnd - viewStart

    window.chartControls = {
      moveLeft: () => {
        if (viewStart > 0) {
          setViewStart(Math.max(0, viewStart - step))
          setViewEnd(Math.max(step, viewEnd - step))
        }
      },
      moveRight: () => {
        if (viewEnd < 1) {
          setViewStart(Math.min(1 - range, viewStart + step))
          setViewEnd(Math.min(1, viewEnd + step))
        }
      },
      zoomIn: () => {
        if (range > 0.1) {
          const center = (viewStart + viewEnd) / 2
          const newRange = range * 0.8
          setViewStart(Math.max(0, center - newRange / 2))
          setViewEnd(Math.min(1, center + newRange / 2))
        }
      },
      zoomOut: () => {
        if (range < 1) {
          const center = (viewStart + viewEnd) / 2
          const newRange = Math.min(1, range * 1.2)
          setViewStart(Math.max(0, center - newRange / 2))
          setViewEnd(Math.min(1, center + newRange / 2))
        }
      },
      resetZoom,
      toggleZoomLock: () => setZoomLocked(prev => !prev)
    }

    return () => {
      delete window.chartControls
    }
  }, [viewStart, viewEnd, resetZoom])

  // Vérification des données - APRÈS tous les hooks
  if (!data || data.length === 0) {
    return <div className="text-gray-500 p-4">Aucune donnée de prix disponible</div>
  }

  // Calculer les données visibles selon le zoom
  const startIndex = Math.floor(viewStart * data.length)
  const endIndex = Math.ceil(viewEnd * data.length)
  const visibleData = data.slice(startIndex, endIndex)
  const visibleTrades = trades.filter(trade => {
    const tradeIndex = data.findIndex(d => d.timestamp === trade.timestamp)
    return tradeIndex >= startIndex && tradeIndex <= endIndex
  })

  // Calculer les valeurs min/max pour le scaling
  let chartMinPrice: number, chartMaxPrice: number, chartPriceRange: number

  if (disableZoom && visibleData.length > 0) {
    // MODE REPLAY : Plage STABLE qui s'adapte seulement si nécessaire
    // Prendre TOUTES les données visibles
    const allVisiblePrices = visibleData.flatMap(d => [d.high, d.low]).filter(p => !isNaN(p) && isFinite(p))

    if (allVisiblePrices.length === 0) {
      return <div className="text-red-500 p-4">Erreur: Aucune donnée de prix valide</div>
    }

    const dataMin = Math.min(...allVisiblePrices)
    const dataMax = Math.max(...allVisiblePrices)
    const center = (dataMin + dataMax) / 2
    const dataRange = dataMax - dataMin

    // Plage avec marge pour des bougies moins étirées
    const padding = dataRange * 0.1

    chartMinPrice = dataMin - padding
    chartMaxPrice = dataMax + padding
    chartPriceRange = chartMaxPrice - chartMinPrice
  } else {
    // MODE NORMAL : Calculer sur toutes les données visibles
    const validPrices = visibleData.flatMap(d => [d.open, d.high, d.low, d.close]).filter(p => !isNaN(p) && isFinite(p))

    if (validPrices.length === 0) {
      console.error('Aucun prix valide trouvé dans les données')
      return <div className="text-red-500 p-4">Erreur: Aucune donnée de prix valide</div>
    }

    const minPrice = Math.min(...validPrices)
    const maxPrice = Math.max(...validPrices)
    const priceRange = maxPrice - minPrice
    const padding = priceRange * 0.2
    chartMinPrice = minPrice - padding
    chartMaxPrice = maxPrice + padding
    chartPriceRange = chartMaxPrice - chartMinPrice
  }

  // Dimensions du graphique - utiliser des dimensions fixes pour le viewBox
  // Le SVG se redimensionnera automatiquement pour s'adapter au conteneur
  const actualWidth = 1400
  const actualHeight = 650

  // Marges ajustées - grande marge en bas pour les dates
  const margin = {
    top: 10,
    right: 50,
    bottom: 40,
    left: 50
  }
  const chartWidth = actualWidth - margin.left - margin.right
  const chartHeight = actualHeight - margin.top - margin.bottom

  // Tailles de police
  const fontSize = {
    axis: 10,
    labels: 12,
    tradeLabels: 10
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

  // Gestion des contrôles HTML (création des boutons)
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
  }, [viewStart, viewEnd])

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
      toggleZoomLock: () => {
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
  }, [viewStart, viewEnd])

  return (
    <div
      ref={containerRef}
      className="relative"
    >
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
                const emaValue = indicators.ema1[localIndex]?.value
                if (!emaValue) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(emaValue)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#00FF88"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.8"
            />
            {/* EMA2 */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const emaValue = indicators.ema2[localIndex]?.value
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
                const value = indicators.bollinger[localIndex]?.upper
                if (!value) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(value)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#FFA366"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.7"
            />
            {/* Bande médiane */}
            <path
              d={visibleData.map((d, localIndex) => {
                const globalIndex = startIndex + localIndex
                const value = indicators.bollinger[localIndex]?.middle
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
                const value = indicators.bollinger[localIndex]?.lower
                if (!value) return ''
                const x = indexToX(globalIndex)
                const y = priceToY(value)
                return localIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
              }).join(' ')}
              fill="none"
              stroke="#FFA366"
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
              stroke={isGreen ? "#00FF88" : "#DC2626"}
              strokeWidth="1"
            />

            {/* Mèche basse */}
            <line
              x1={x}
              y1={Math.max(openY, closeY)}
              x2={x}
              y2={lowY}
              stroke={isGreen ? "#00FF88" : "#DC2626"}
              strokeWidth="1"
            />

            {/* Corps de la bougie */}
            <rect
              x={x - candleWidth / 2}
              y={bodyY}
              width={candleWidth}
              height={Math.max(1, bodyHeight)}
              fill={isGreen ? "#00FF88" : "#DC2626"}
              stroke={isGreen ? "#00FF88" : "#DC2626"}
              strokeWidth="1"
              opacity="0.9"
            />
          </g>
        ))}

        {/* Lignes SL/TP pour positions ouvertes - DESIGN AMÉLIORÉ */}
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
              {/* Zone colorée pour Take Profit (zone verte semi-transparente) */}
              <rect
                x={startX}
                y={Math.min(entryY, takeProfitY)}
                width={endX - startX}
                height={Math.abs(takeProfitY - entryY)}
                fill="#10B981"
                opacity="0.08"
              />

              {/* Zone colorée pour Stop Loss (zone rouge semi-transparente) */}
              <rect
                x={startX}
                y={Math.min(entryY, stopLossY)}
                width={endX - startX}
                height={Math.abs(stopLossY - entryY)}
                fill="#EF4444"
                opacity="0.08"
              />

              {/* Ligne d'entrée - Plus épaisse et contrastée */}
              <line
                x1={startX}
                y1={entryY}
                x2={endX}
                y2={entryY}
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray="8 4"
                opacity="0.9"
              />

              {/* Ligne Stop Loss - Plus visible */}
              <line
                x1={startX}
                y1={stopLossY}
                x2={endX}
                y2={stopLossY}
                stroke="#EF4444"
                strokeWidth="3"
                strokeDasharray="6 3"
                opacity="0.9"
              />

              {/* Ligne Take Profit - Plus visible */}
              <line
                x1={startX}
                y1={takeProfitY}
                x2={endX}
                y2={takeProfitY}
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray="6 3"
                opacity="0.9"
              />

              {/* Labels - Badges texte en desktop, pastilles en mobile */}
              <g>
                {actualWidth > 600 ? (
                  // MODE DESKTOP : Badges avec texte
                  <>
                    {/* Badge Entry */}
                    <rect
                      x={startX - 5}
                      y={entryY - 12}
                      width="45"
                      height="16"
                      fill="#3B82F6"
                      rx="2"
                      opacity="0.9"
                    />
                    <text
                      x={startX}
                      y={entryY}
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      Entry
                    </text>

                    {/* Badge Stop Loss */}
                    <rect
                      x={startX - 5}
                      y={stopLossY - 12}
                      width="30"
                      height="16"
                      fill="#EF4444"
                      rx="2"
                      opacity="0.9"
                    />
                    <text
                      x={startX}
                      y={stopLossY}
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      SL
                    </text>

                    {/* Badge Take Profit */}
                    <rect
                      x={startX - 5}
                      y={takeProfitY - 12}
                      width="30"
                      height="16"
                      fill="#10B981"
                      rx="2"
                      opacity="0.9"
                    />
                    <text
                      x={startX}
                      y={takeProfitY}
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      TP
                    </text>
                  </>
                ) : (
                  // MODE MOBILE : Petites pastilles
                  <>
                    <circle cx={startX} cy={entryY} r="3" fill="#3B82F6" stroke="white" strokeWidth="1" />
                    <circle cx={startX} cy={stopLossY} r="3" fill="#EF4444" stroke="white" strokeWidth="1" />
                    <circle cx={startX} cy={takeProfitY} r="3" fill="#10B981" stroke="white" strokeWidth="1" />
                  </>
                )}

                {/* Prix en bout de ligne - supprimé pour simplifier */}
                {false && (
                  <>
                    <rect
                      x={endX + 5}
                      y={entryY - 12}
                      width="80"
                      height="18"
                      fill="rgba(59, 130, 246, 0.9)"
                      rx="4"
                    />
                    <text
                      x={endX + 12}
                      y={entryY + 1}
                      fill="white"
                      fontSize={fontSize.labels}
                      fontWeight="bold"
                    >
                      ${position.entryPrice.toFixed(2)}
                    </text>

                    <rect
                      x={endX + 5}
                      y={stopLossY - 12}
                      width="80"
                      height="18"
                      fill="rgba(239, 68, 68, 0.9)"
                      rx="4"
                    />
                    <text
                      x={endX + 12}
                      y={stopLossY + 1}
                      fill="white"
                      fontSize={fontSize.labels}
                      fontWeight="bold"
                    >
                      ${position.stopLossPrice.toFixed(2)}
                    </text>

                    <rect
                      x={endX + 5}
                      y={takeProfitY - 12}
                      width="80"
                      height="18"
                      fill="rgba(16, 185, 129, 0.9)"
                      rx="4"
                    />
                    <text
                      x={endX + 12}
                      y={takeProfitY + 1}
                      fill="white"
                      fontSize={fontSize.labels}
                      fontWeight="bold"
                    >
                      ${position.takeProfitPrice.toFixed(2)}
                    </text>
                  </>
                )}
              </g>
            </g>
          )
        })}

        {/* Points de trade - VERSION SIMPLE */}
        {tradePoints.map((point, index) => {
          if (!point) return null

          const isBuy = point.trade.type === 'BUY'

          // Ne pas afficher les points d'achat (bleu) - seulement les ventes
          if (isBuy) return null

          const isStopLoss = point.trade.reason?.includes('Stop Loss')
          const isTakeProfit = point.trade.reason?.includes('Take Profit')
          const isHighlighted = highlightedTradeTimestamp === point.trade.timestamp

          // Couleur selon le résultat
          let color = '#10B981'  // Vert par défaut
          if (isStopLoss) {
            color = '#EF4444'  // Rouge pour Stop Loss
          } else if (isTakeProfit) {
            color = '#10B981'  // Vert pour Take Profit
          } else {
            const tradeProfit = point.trade.profit || 0
            color = tradeProfit >= 0 ? '#10B981' : '#EF4444'
          }

          return (
            <g key={`trade-${index}`}>
              {/* Cercle de mise en évidence pour le trade ciblé */}
              {isHighlighted && (
                <>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={20}
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3"
                    opacity="0.8"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={14}
                    fill="#FBBF24"
                    opacity="0.3"
                  />
                </>
              )}
              {/* Simple cercle */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isHighlighted ? 8 : 6}
                fill={color}
                stroke={isHighlighted ? "#FBBF24" : "white"}
                strokeWidth={isHighlighted ? 3 : 2}
              />
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
            strokeWidth={1}
          />

          {/* Labels de prix */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const price = chartMinPrice + (chartPriceRange * ratio)
            const y = priceToY(price)
            return (
              <g key={ratio}>
                <line
                  x1={margin.left - 5}
                  y1={y}
                  x2={margin.left}
                  y2={y}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 8}
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
            strokeWidth={1}
          />

          {/* Labels de dates */}
          {[0, 0.33, 0.66, 1].map(ratio => {
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
                  y2={actualHeight - margin.bottom + 5}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={actualHeight - margin.bottom + 16}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize={fontSize.axis}
                >
                  {candle.displayDate.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

    </div>
  )
}