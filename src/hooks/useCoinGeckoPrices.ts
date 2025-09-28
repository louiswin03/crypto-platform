// src/hooks/useCoinGeckoPrices.ts
"use client"

import { useState, useEffect } from 'react'

interface CoinPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

const COINS_CONFIG = [
  { id: 'bitcoin', symbol: 'BINANCE:BTCEUR', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'BINANCE:ETHEUR', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BINANCE:BNBEUR', name: 'Binance Coin' },
  { id: 'solana', symbol: 'BINANCE:SOLEUR', name: 'Solana' },
  { id: 'ripple', symbol: 'BINANCE:XRPEUR', name: 'XRP' },
  { id: 'cardano', symbol: 'BINANCE:ADAEUR', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'BINANCE:AVAXEUR', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'BINANCE:LINKEUR', name: 'Chainlink' }
]

export const useCoinGeckoPrices = () => {
  const [prices, setPrices] = useState<CoinPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = async () => {
    try {
      setError(null)
      const coinIds = COINS_CONFIG.map(coin => coin.id).join(',')
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Mapper les données avec les symboles TradingView
      const mappedData = data.map((coinData: any) => {
        const config = COINS_CONFIG.find(c => c.id === coinData.id)
        return {
          id: coinData.id,
          symbol: config?.symbol || `BINANCE:${coinData.symbol.toUpperCase()}EUR`,
          name: config?.name || coinData.name,
          current_price: coinData.current_price,
          price_change_percentage_24h: coinData.price_change_percentage_24h,
          market_cap: coinData.market_cap,
          total_volume: coinData.total_volume
        }
      })

      setPrices(mappedData)
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors de la récupération des prix:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Récupérer les prix immédiatement
    fetchPrices()

    // Puis toutes les 30 secondes (respecte la limite de 30 calls/min de CoinGecko)
    const interval = setInterval(fetchPrices, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices
  }
}