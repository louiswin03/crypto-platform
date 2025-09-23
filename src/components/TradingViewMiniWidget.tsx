// src/components/TradingViewMiniWidget.tsx
"use client"

import { useEffect, useRef } from 'react'

interface TradingViewMiniWidgetProps {
  symbol: string
  theme?: 'dark' | 'light'
  locale?: string
  width?: number | string
  height?: number | string
  onClick?: () => void
  isSelected?: boolean
}

export const TradingViewMiniWidget = ({
  symbol,
  theme = "dark",
  locale = "fr",
  width = "100%",
  height = 60,
  onClick,
  isSelected = false
}: TradingViewMiniWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Nettoyer le container
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Créer le script TradingView
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.type = 'text/javascript'
    script.async = true
    
    // Configuration du widget
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      locale: locale,
      dateRange: "12M",
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
    })

    // Ajouter le script au container
    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, theme, locale])

  return (
    <div 
      onClick={onClick} 
      className={`cursor-pointer rounded-xl transition-all duration-300 border ${ 
        isSelected 
          ? 'bg-[#6366F1]/20 border-[#6366F1]/40 shadow-lg shadow-[#6366F1]/20' 
          : 'border-transparent hover:bg-gray-800/40 hover:border-gray-700/60' 
      }`}
    >
      <div 
        ref={containerRef}
        style={{ width, height }}
        className="tradingview-mini-widget pointer-events-none"
      >
        <div className="tradingview-widget-container__widget h-full"></div>
      </div>
    </div>
  )
}

// Composant pour la liste des cryptos
interface TradingViewCryptoListProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  theme?: 'dark' | 'light'
}

export const TradingViewCryptoList = ({
  selectedSymbol,
  onSymbolChange,
  theme = "dark"
}: TradingViewCryptoListProps) => {
  const cryptoSymbols = [
    "BINANCE:BTCEUR",
    "BINANCE:ETHEUR", 
    "BINANCE:BNBEUR",
    "BINANCE:SOLEUR",
    "BINANCE:XRPEUR",
    "BINANCE:ADAEUR",
    "BINANCE:AVAXEUR",
    "BINANCE:LINKEUR"
  ]

  return (
    <div className="space-y-3">
      {cryptoSymbols.map((symbol) => (
        <TradingViewMiniWidget
          key={symbol}
          symbol={symbol}
          theme={theme}
          onClick={() => onSymbolChange(symbol)}
          isSelected={selectedSymbol === symbol}
          height={80}
        />
      ))}
    </div>
  )
}