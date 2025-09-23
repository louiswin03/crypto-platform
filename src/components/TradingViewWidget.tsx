// src/components/TradingViewWidget.tsx
"use client"

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol?: string
  width?: number | string
  height?: number | string
  interval?: string
  theme?: 'dark' | 'light'
  style?: string
  locale?: string
  toolbar_bg?: string
  enable_publishing?: boolean
  allow_symbol_change?: boolean
  details?: boolean
  hotlist?: boolean
  calendar?: boolean
  studies?: string[]
}

const TradingViewWidget = ({
  symbol = "BINANCE:BTCEUR",
  width = "100%", 
  height = "100%",
  interval = "D",
  theme = "dark",
  style = "1",
  locale = "fr",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  details = true,
  hotlist = true,
  calendar = false,
  studies = ["STD;RSI", "STD;MACD"]
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Nettoyer le container
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Créer le script TradingView
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    
    // Configuration du widget
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: "Europe/Paris",
      theme: theme,
      style: style,
      locale: locale,
      toolbar_bg: toolbar_bg,
      enable_publishing: enable_publishing,
      allow_symbol_change: allow_symbol_change,
      details: details,
      hotlist: hotlist,
      calendar: calendar,
      studies: studies,
      container_id: "tradingview_widget"
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
  }, [symbol, interval, theme, style, locale, toolbar_bg, enable_publishing, allow_symbol_change, details, hotlist, calendar])

  return (
    <div 
      ref={containerRef}
      id="tradingview_widget"
      style={{ width, height }}
      className="tradingview-widget-container"
    >
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://fr.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Suivez les marchés sur TradingView</span>
        </a>
      </div>
    </div>
  )
}

export default TradingViewWidget