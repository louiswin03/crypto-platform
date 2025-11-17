// src/hooks/useExtendedCoinGeckoPrices.ts
"use client"

import { useState, useEffect, useCallback } from 'react'

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

// Mapping étendu pour TradingView - Utilisation du format CRYPTO: avec USD
const TRADINGVIEW_MAPPING: Record<string, string> = {
  // Top cryptocurrencies - format CRYPTO: avec USD pour une meilleure compatibilité
  'bitcoin': 'CRYPTO:BTCUSD',
  'ethereum': 'CRYPTO:ETHUSD',
  'binancecoin': 'CRYPTO:BNBUSD',
  'solana': 'CRYPTO:SOLUSD',
  'ripple': 'CRYPTO:XRPUSD',
  'cardano': 'CRYPTO:ADAUSD',
  'avalanche-2': 'CRYPTO:AVAXUSD',
  'chainlink': 'CRYPTO:LINKUSD',
  'polkadot': 'CRYPTO:DOTUSD',
  'polygon': 'CRYPTO:MATICUSD',
  'litecoin': 'CRYPTO:LTCUSD',
  'shiba-inu': 'CRYPTO:SHIBUSD',
  'uniswap': 'CRYPTO:UNIUSD',
  'dogecoin': 'CRYPTO:DOGEUSD',
  'cosmos': 'CRYPTO:ATOMUSD',
  'filecoin': 'CRYPTO:FILUSD',
  'tron': 'CRYPTO:TRXUSD',
  'ethereum-classic': 'CRYPTO:ETCUSD',
  'stellar': 'CRYPTO:XLMUSD',
  'vechain': 'CRYPTO:VETUSD',
  'algorand': 'CRYPTO:ALGOUSD',
  'fantom': 'CRYPTO:FTMUSD',
  'sandbox': 'CRYPTO:SANDUSD',
  'decentraland': 'CRYPTO:MANAUSD',
  'axie-infinity': 'CRYPTO:AXSUSD',
  'gala': 'CRYPTO:GALAUSD',
  'chiliz': 'CRYPTO:CHZUSD',
  'enjincoin': 'CRYPTO:ENJUSD',
  'flow': 'CRYPTO:FLOWUSD',
  // Stablecoins
  'tether': 'CRYPTO:USDTUSD',
  'usd-coin': 'CRYPTO:USDCUSD',
  'dai': 'CRYPTO:DAIUSD',
  'binance-usd': 'CRYPTO:BUSDUSD',
  'true-usd': 'CRYPTO:TUSDUSD',
  'frax': 'CRYPTO:FRAXUSD',
  // Autres cryptos populaires
  'bitcoin-cash': 'CRYPTO:BCHUSD',
  'monero': 'CRYPTO:XMRUSD',
  'zcash': 'CRYPTO:ZECUSD',
  'dash': 'CRYPTO:DASHUSD',
  'eos': 'CRYPTO:EOSUSD',
  'nem': 'CRYPTO:XEMUSD',
  'iota': 'CRYPTO:IOTAUSD',
  'neo': 'CRYPTO:NEOUSD',
  'aave': 'CRYPTO:AAVEUSD',
  'compound': 'CRYPTO:COMPUSD',
  'maker': 'CRYPTO:MKRUSD',
  'curve-dao-token': 'CRYPTO:CRVUSD',
  'yearn-finance': 'CRYPTO:YFIUSD',
  'balancer': 'CRYPTO:BALUSD',
  '1inch': 'CRYPTO:1INCHUSD',
  'sushiswap': 'CRYPTO:SUSHIUSD',
  'pancakeswap-token': 'CRYPTO:CAKEUSD',
  'terra-luna': 'CRYPTO:LUNAUSD',
  'terra-luna-2': 'CRYPTO:LUNA2USD',
  'thorchain': 'CRYPTO:RUNEUSD',
  'helium': 'CRYPTO:HNTUSD',
  'the-graph': 'CRYPTO:GRTUSD',
  'basic-attention-token': 'CRYPTO:BATUSD',
  'matic-network': 'CRYPTO:MATICUSD',
  'synthetix-network-token': 'CRYPTO:SNXUSD',
  'loopring': 'CRYPTO:LRCUSD',
  'omg': 'CRYPTO:OMGUSD',
  'band-protocol': 'CRYPTO:BANDUSD',
  'kyber-network': 'CRYPTO:KNCUSD',
  'republic-protocol': 'CRYPTO:RENUSD',
  'storj': 'CRYPTO:STORJUSD',
  'golem': 'CRYPTO:GLMUSD',
  'augur': 'CRYPTO:REPUSD',
  'civic': 'CRYPTO:CIVICUSD',
  'district0x': 'CRYPTO:DNTUSD',
  'gnosis': 'CRYPTO:GNOUSD',
  'aragon': 'CRYPTO:ANTUSD',
  'status': 'CRYPTO:SNTUSD',
  'metal': 'CRYPTO:MTLUSD',
  'tenx': 'CRYPTO:PAYUSD',
  'power-ledger': 'CRYPTO:POWRUSD',
  'request-network': 'CRYPTO:REQUSD',
  'salt': 'CRYPTO:SALTUSD',
  'waltonchain': 'CRYPTO:WTCUSD',
  'icon': 'CRYPTO:ICXUSD',
  'aelf': 'CRYPTO:ELFUSD',
  'zilliqa': 'CRYPTO:ZILUSD',
  'ontology': 'CRYPTO:ONTUSD',
  'qtum': 'CRYPTO:QTUMUSD',
  'lisk': 'CRYPTO:LSKUSD',
  'stratis': 'CRYPTO:STRATUSD',
  'waves': 'CRYPTO:WAVESUSD',
  'bytecoin-bcn': 'CRYPTO:BCNUSD',
  'siacoin': 'CRYPTO:SCUSD',
  'verge': 'CRYPTO:XVGUSD',
  'reddcoin': 'CRYPTO:RDDUSD',
  'digitalbits': 'CRYPTO:XDBUSD',
  'kin': 'CRYPTO:KINUSD',
  'electroneum': 'CRYPTO:ETNUSD',
  'metal': 'CRYPTO:MTLUSD',
  // Layer 2 et nouvelles
  'optimism': 'CRYPTO:OPUSD',
  'arbitrum': 'CRYPTO:ARBUSD',
  'immutable-x': 'CRYPTO:IMXUSD',
  'loopring': 'CRYPTO:LRCUSD',
}

// Note: Le cache et rate limiting sont maintenant gérés côté serveur (API routes)
// Plus besoin de cache client ni de rate limiting ici

// OPTIMISATION: Données de fallback pour les cas d'urgence
const FALLBACK_DATA = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45000, market_cap_rank: 1, price_change_percentage_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap_rank: 2, price_change_percentage_24h: 1.8, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 300, market_cap_rank: 3, price_change_percentage_24h: -0.5, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 100, market_cap_rank: 4, price_change_percentage_24h: 3.2, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.6, market_cap_rank: 5, price_change_percentage_24h: -1.1, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' }
]

export const useExtendedCoinGeckoPrices = (perPage: number = 100, includeSparkline: boolean = false) => {
  const [prices, setPrices] = useState<ExtendedCoinPrice[]>([])
  const [stats, setStats] = useState<CoinGeckoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCoins, setTotalCoins] = useState(0)

  const fetchGlobalStats = async () => {
    try {
      // Utiliser l'API proxy au lieu d'appeler directement CoinGecko
      // Ajouter timestamp pour forcer le rafraîchissement
      const timestamp = Date.now()
      const response = await fetch(`/api/crypto/global?_t=${timestamp}`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Forcer le rafraîchissement
      })

      if (!response.ok) {
        console.warn('Impossible de récupérer les stats globales')
        return
      }

      const data = await response.json()

      if (data && data.data) {
        const globalData = data.data
        setStats({
          totalMarketCap: globalData.total_market_cap?.usd || 0,
          totalVolume: globalData.total_volume?.usd || 0,
          btcDominance: globalData.market_cap_percentage?.btc || 0,
          ethDominance: globalData.market_cap_percentage?.eth || 0,
          marketCapChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
          volumeChange24h: 0
        })

        // Récupérer le nombre total de cryptos disponibles
        if (globalData.active_cryptocurrencies) {
          setTotalCoins(globalData.active_cryptocurrencies)
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des stats globales:', err)
    }
  }

  const fetchPrices = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setError(null)
      if (!append) setLoading(true)

      // Paramètres optimisés - réduire les données demandées
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage.toString(),
        page: pageNum.toString(),
        sparkline: includeSparkline.toString(),
        price_change_percentage: '24h', // Réduit à 24h seulement pour économiser la bande passante
        locale: 'en' // Changé en anglais pour réduire la charge
      })

      // Utiliser l'API proxy au lieu d'appeler directement CoinGecko
      // Ajouter timestamp pour éviter le cache navigateur
      const timestamp = Date.now()
      const url = `/api/crypto/markets?${params}&_t=${timestamp}`

      // OPTIMISATION: Ajouter retry logic et timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes timeout (augmenté)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Forcer le rafraîchissement des données
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Le serveur gère maintenant le rate limiting et le cache
        // En cas d'erreur, utiliser les données de fallback
        if ((response.status === 429 || response.status >= 500) && pageNum === 1) {
          console.warn(`⚠️ Erreur API (${response.status}). Utilisation du fallback.`)

          const enrichedFallback = FALLBACK_DATA.map((coin: any) => ({
            ...coin,
            tradingview_symbol: TRADINGVIEW_MAPPING[coin.id] || `CRYPTO:${coin.symbol.toUpperCase()}USD`,
            has_tradingview: true
          }))
          setPrices(enrichedFallback)
          setLoading(false)
          setError('Erreur temporaire. Données limitées affichées.')
          return
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        setHasMore(false)
        return
      }

      // Le cache est maintenant géré côté serveur

      // Enrichir les données avec le mapping TradingView (automatique pour tous)
      const enrichedData: ExtendedCoinPrice[] = data.map((coin: any) => {
        // Utiliser le mapping s'il existe, sinon créer automatiquement
        let tradingViewSymbol = TRADINGVIEW_MAPPING[coin.id]

        if (!tradingViewSymbol) {
          // Créer automatiquement un symbol TradingView basé sur le symbol de la crypto
          const cleanSymbol = coin.symbol.toUpperCase()
          tradingViewSymbol = `CRYPTO:${cleanSymbol}USD`
        }

        return {
          ...coin,
          tradingview_symbol: tradingViewSymbol,
          has_tradingview: true // Maintenant toutes les cryptos ont un symbol TradingView
        }
      })

      if (append) {
        setPrices(prev => [...prev, ...enrichedData])
      } else {
        setPrices(enrichedData)
      }

      // Récupérer les stats globales via l'API CoinGecko /global
      if (pageNum === 1) {
        fetchGlobalStats()
      }

      // Vérifier s'il y a plus de pages disponibles
      setHasMore(data.length === perPage)
      setLoading(false)
    } catch (err) {
      // OPTIMISATION: Gestion d'erreur améliorée avec retry automatique

      // Vérifier si c'est une erreur AbortError (timeout)
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.warn('⏱️ Timeout de la requête API - Retry automatique...')
        setError('Chargement en cours, veuillez patienter...')
        // Retry automatique après 3 secondes avec timeout plus long
        setTimeout(() => {
          fetchPrices(pageNum, append)
        }, 3000)
        setLoading(false)
        return
      }

      console.error('🚨 Erreur lors de la récupération des prix CoinGecko:', err)

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Erreur de connexion - Rechargement automatique dans 5 secondes...')
        // Retry automatique après 5 secondes pour les erreurs de réseau
        setTimeout(() => {
          fetchPrices(pageNum, append)
        }, 5000)
      } else if (err instanceof Error && err.message.includes('429')) {
        setError('Limite API atteinte - Utilisation des données de secours...')
        // Utiliser les données de fallback en cas de limite API
        useFallbackData()
      } else if (err instanceof Error) {
        setError(`Erreur API: ${err.message} - Données de secours chargées`)
        useFallbackData()
      } else {
        setError('Erreur inconnue - Données de secours chargées')
        useFallbackData()
      }
      setLoading(false)
    }
  }

  // OPTIMISATION: Fonction pour utiliser les données de fallback
  const useFallbackData = () => {
    const enrichedData: ExtendedCoinPrice[] = FALLBACK_DATA.map((coin: any) => {
      let tradingViewSymbol = TRADINGVIEW_MAPPING[coin.id]
      if (!tradingViewSymbol) {
        const cleanSymbol = coin.symbol.toUpperCase()
        tradingViewSymbol = `CRYPTO:${cleanSymbol}USD`
      }
      return {
        ...coin,
        tradingview_symbol: tradingViewSymbol,
        has_tradingview: true,
        market_cap: coin.current_price * 21000000, // Estimation simple
        total_volume: coin.current_price * 1000000,
        high_24h: coin.current_price * 1.05,
        low_24h: coin.current_price * 0.95,
        price_change_24h: coin.current_price * (coin.price_change_percentage_24h / 100),
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: coin.price_change_percentage_24h,
        circulating_supply: 21000000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: coin.current_price * 2,
        ath_change_percentage: -50,
        ath_date: '2021-11-10T14:24:11.849Z',
        atl: coin.current_price * 0.1,
        atl_change_percentage: 900,
        atl_date: '2013-07-06T00:00:00.000Z',
        last_updated: new Date().toISOString(),
        fully_diluted_valuation: coin.current_price * 21000000
      }
    })

    setPrices(enrichedData)
    setHasMore(false)
    setLoading(false)
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

  // État pour la recherche externe
  const [searchResults, setSearchResults] = useState<ExtendedCoinPrice[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Recherche avancée avec fallback API (mémorisée)
  const searchCoins = useCallback(async (query: string) => {
    const lowerQuery = query.toLowerCase()

    // D'abord chercher localement
    const localResults = prices.filter(coin =>
      coin.name.toLowerCase().includes(lowerQuery) ||
      coin.symbol.toLowerCase().includes(lowerQuery) ||
      coin.id.toLowerCase().includes(lowerQuery)
    )

    // Si on a des résultats locaux, les retourner
    if (localResults.length > 0) {
      setSearchResults([])
      return localResults
    }

    // Sinon, chercher via l'API CoinGecko (charger plus de cryptos)
    if (query.length >= 2) {
      setIsSearching(true)
      try {
        // Charger les 250 premières cryptos et filtrer
        const timestamp = Date.now()
        const searchResponse = await fetch(`/api/crypto/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h&locale=en&_t=${timestamp}`, {
          cache: 'no-store' // Forcer le rafraîchissement
        })

        if (searchResponse.ok) {
          const allData = await searchResponse.json()
          const filteredData = allData.filter((coin: any) =>
            coin.name.toLowerCase().includes(lowerQuery) ||
            coin.symbol.toLowerCase().includes(lowerQuery) ||
            coin.id.toLowerCase().includes(lowerQuery)
          )

          if (filteredData.length > 0) {
            const enrichedData: ExtendedCoinPrice[] = filteredData.map((coin: any) => {
              let tradingViewSymbol = TRADINGVIEW_MAPPING[coin.id]
              if (!tradingViewSymbol) {
                const cleanSymbol = coin.symbol.toUpperCase()
                tradingViewSymbol = `CRYPTO:${cleanSymbol}USD`
              }
              return {
                ...coin,
                tradingview_symbol: tradingViewSymbol,
                has_tradingview: true
              }
            })

            setSearchResults(enrichedData)
            setIsSearching(false)
            return enrichedData
          }
        }
      } catch (err) {
        console.error('Erreur lors de la recherche externe:', err)
      } finally {
        setIsSearching(false)
      }
    }

    setSearchResults([])
    return []
  }, [prices]) // Dépend uniquement de prices pour éviter les re-renders inutiles

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
    // Force refresh au chargement initial
    fetchPrices()

    // OPTIMISATION: Rafraîchir automatiquement toutes les 60 secondes
    const interval = setInterval(() => {
      fetchPrices(1, false) // Refresh seulement la première page
    }, 60000) // Réduit à 1 minute (60 secondes) pour des données plus fraîches

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Retirer perPage de la dépendance pour éviter les rechargements inutiles

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
    isSearching,
    searchResults,
    // Utilitaires
    formatters: {
      price: (price: number | null | undefined) => {
        if (price == null) return 'N/A'
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: price < 1 ? 4 : 2,
        }).format(price)
      },
      
      marketCap: (cap: number | null | undefined) => {
        if (cap == null || cap === 0) return 'N/A'
        if (cap >= 1e12) return (cap / 1e12).toFixed(1) + ' T$'
        if (cap >= 1e9) return (cap / 1e9).toFixed(1) + ' Md$'
        if (cap >= 1e6) return (cap / 1e6).toFixed(1) + ' M$'
        if (cap >= 1e3) return (cap / 1e3).toFixed(1) + ' K$'
        return cap.toFixed(0) + ' $'
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