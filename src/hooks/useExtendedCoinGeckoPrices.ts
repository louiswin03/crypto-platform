// src/hooks/useExtendedCoinGeckoPrices.ts
"use client"

import { useState, useEffect } from 'react'

interface ExtendedCoinPrice {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  fully_diluted_valuation: number | null
  total_volume: number | null
  high_24h: number | null
  low_24h: number | null
  price_change_24h: number | null
  price_change_percentage_24h: number | null
  market_cap_change_24h: number | null
  market_cap_change_percentage_24h: number | null
  circulating_supply: number | null
  total_supply: number | null
  max_supply: number | null
  ath: number | null
  ath_change_percentage: number | null
  ath_date: string
  atl: number | null
  atl_change_percentage: number | null
  atl_date: string
  last_updated: string
  // Mapping TradingView (calculé côté client)
  tradingview_symbol?: string
  has_tradingview?: boolean
}

interface CoinGeckoStats {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  ethDominance: number
  marketCapChange24h: number
  volumeChange24h: number
}

// Mapping étendu pour TradingView
const TRADINGVIEW_MAPPING: Record<string, string> = {
  // Top cryptocurrencies sur Binance
  'bitcoin': 'BINANCE:BTCEUR',
  'ethereum': 'BINANCE:ETHEUR', 
  'binancecoin': 'BINANCE:BNBEUR',
  'solana': 'BINANCE:SOLEUR',
  'ripple': 'BINANCE:XRPEUR',
  'cardano': 'BINANCE:ADAEUR',
  'avalanche-2': 'BINANCE:AVAXEUR',
  'chainlink': 'BINANCE:LINKEUR',
  'polkadot': 'BINANCE:DOTEUR',
  'polygon': 'BINANCE:MATICEUR',
  'litecoin': 'BINANCE:LTCEUR',
  'shiba-inu': 'BINANCE:SHIBEUR',
  'uniswap': 'BINANCE:UNIEUR',
  'dogecoin': 'BINANCE:DOGEEUR',
  'cosmos': 'BINANCE:ATOMEUR',
  'filecoin': 'BINANCE:FILEUR',
  'tron': 'BINANCE:TRXEUR',
  'ethereum-classic': 'BINANCE:ETCEUR',
  'stellar': 'BINANCE:XLMEUR',
  'vechain': 'BINANCE:VETEUR',
  'algorand': 'BINANCE:ALGOEUR',
  'fantom': 'BINANCE:FTMEUR',
  'sandbox': 'BINANCE:SANDEUR',
  'decentraland': 'BINANCE:MANAEUR',
  'axie-infinity': 'BINANCE:AXSEUR',
  'gala': 'BINANCE:GALAEUR',
  'chiliz': 'BINANCE:CHZEUR',
  'enjincoin': 'BINANCE:ENJEUR',
  'flow': 'BINANCE:FLOWEUR',
  // Stablecoins
  'tether': 'BINANCE:USDTEUR',
  'usd-coin': 'BINANCE:USDCEUR',
  // Autres exchanges populaires
  'bitcoin-cash': 'COINBASE:BCHEUR',
  'monero': 'KRAKEN:XMREUR',
  'zcash': 'KRAKEN:ZECEUR',
}

export const useExtendedCoinGeckoPrices = (perPage: number = 100, includeSparkline: boolean = false) => {
  const [prices, setPrices] = useState<ExtendedCoinPrice[]>([])
  const [stats, setStats] = useState<CoinGeckoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCoins, setTotalCoins] = useState(0)

  const fetchPrices = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError(null)
      if (!append) setLoading(true)
      
      // Paramètres étendus
      const params = new URLSearchParams({
        vs_currency: 'eur',
        order: 'market_cap_desc',
        per_page: perPage.toString(),
        page: pageNum.toString(),
        sparkline: includeSparkline.toString(),
        price_change_percentage: '24h,7d,30d', // Multi-timeframes
        locale: 'fr'
      })
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?${params}`,
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
      
      if (!data || data.length === 0) {
        setHasMore(false)
        return
      }

      // Enrichir les données avec le mapping TradingView
      const enrichedData: ExtendedCoinPrice[] = data.map((coin: any) => ({
        ...coin,
        tradingview_symbol: TRADINGVIEW_MAPPING[coin.id],
        has_tradingview: !!TRADINGVIEW_MAPPING[coin.id]
      }))

      if (append) {
        setPrices(prev => [...prev, ...enrichedData])
      } else {
        setPrices(enrichedData)
      }

      // Calculer les stats globales
      if (pageNum === 1) {
        const totalMarketCap = enrichedData.reduce((sum, coin) => sum + (coin.market_cap || 0), 0)
        const totalVolume = enrichedData.reduce((sum, coin) => sum + (coin.total_volume || 0), 0)
        const btcMarketCap = enrichedData.find(coin => coin.id === 'bitcoin')?.market_cap || 0
        const ethMarketCap = enrichedData.find(coin => coin.id === 'ethereum')?.market_cap || 0
        
        setStats({
          totalMarketCap,
          totalVolume,
          btcDominance: totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0,
          ethDominance: totalMarketCap > 0 ? (ethMarketCap / totalMarketCap) * 100 : 0,
          marketCapChange24h: enrichedData.reduce((sum, coin) => sum + (coin.market_cap_change_24h || 0), 0),
          volumeChange24h: 0 // Calculé différemment si nécessaire
        })
      }

      setTotalCoins(pageNum * perPage)
      setHasMore(data.length === perPage)
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors de la récupération des prix:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPrices(nextPage, true)
    }
  }

  const refetch = () => {
    setPage(1)
    setHasMore(true)
    fetchPrices(1, false)
  }

  // Filtrer par disponibilité TradingView
  const getCoinsWithTradingView = () => {
    return prices.filter(coin => coin.has_tradingview)
  }

  // Recherche avancée
  const searchCoins = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return prices.filter(coin => 
      coin.name.toLowerCase().includes(lowerQuery) ||
      coin.symbol.toLowerCase().includes(lowerQuery) ||
      coin.id.toLowerCase().includes(lowerQuery)
    )
  }

  // Tri avancé
  const sortCoins = (coins: ExtendedCoinPrice[], sortBy: keyof ExtendedCoinPrice, order: 'asc' | 'desc' = 'desc') => {
    return [...coins].sort((a, b) => {
      const aValue = a[sortBy] as number | null | undefined
      const bValue = b[sortBy] as number | null | undefined
      
      // Gérer les valeurs null/undefined - les mettre à la fin
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return order === 'desc' ? 1 : -1
      if (bValue == null) return order === 'desc' ? -1 : 1
      
      const aNum = typeof aValue === 'number' ? aValue : 0
      const bNum = typeof bValue === 'number' ? bValue : 0
      
      return order === 'desc' ? bNum - aNum : aNum - bNum
    })
  }

  useEffect(() => {
    fetchPrices()

    // Mise à jour automatique toutes les 45 secondes (limite API gratuite)
    const interval = setInterval(() => {
      fetchPrices(1, false) // Refresh seulement la première page
    }, 45000)

    return () => clearInterval(interval)
  }, [perPage])

  return {
    prices,
    stats,
    loading,
    error,
    hasMore,
    totalCoins,
    refetch,
    loadMore,
    getCoinsWithTradingView,
    searchCoins,
    sortCoins,
    // Utilitaires
    formatters: {
      price: (price: number | null | undefined) => {
        if (price == null) return 'N/A'
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: price < 1 ? 4 : 2,
        }).format(price)
      },
      
      marketCap: (cap: number | null | undefined) => {
        if (cap == null || cap === 0) return 'N/A'
        if (cap >= 1e12) return (cap / 1e12).toFixed(1) + ' T€'
        if (cap >= 1e9) return (cap / 1e9).toFixed(1) + ' Md€'
        if (cap >= 1e6) return (cap / 1e6).toFixed(1) + ' M€'
        if (cap >= 1e3) return (cap / 1e3).toFixed(1) + ' K€'
        return cap.toFixed(0) + ' €'
      },
      
      percentage: (pct: number | null | undefined) => {
        if (pct == null) return 'N/A'
        return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
      },
      
      supply: (supply: number | null | undefined) => {
        if (supply == null) return 'N/A'
        if (supply >= 1e9) return (supply / 1e9).toFixed(1) + ' Md'
        if (supply >= 1e6) return (supply / 1e6).toFixed(1) + ' M'
        if (supply >= 1e3) return (supply / 1e3).toFixed(1) + ' K'
        return supply.toFixed(0)
      },
      
      date: (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A'
        try {
          return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        } catch {
          return 'Date invalide'
        }
      }
    }
  }
}