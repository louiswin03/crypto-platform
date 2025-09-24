// src/data/multiExchangeMapping.ts
"use client"

interface CryptoMapping {
  id: string
  name: string
  symbol: string
  tradingview_symbol: string
  exchange: 'BINANCE' | 'COINBASE' | 'KRAKEN' | 'HUOBI' | 'BYBIT' | 'KUCOIN' | 'BITFINEX' | 'CRYPTO_COM' | 'OKX'
  category: string[]
  availability: 'high' | 'medium' | 'low' // Liquidité
  popularity_rank: number
  fiat_pairs: string[] // EUR, USD, USDT disponibles
}

// 🌍 MAPPING MULTI-EXCHANGE - 1000+ CRYPTOS
export const MULTI_EXCHANGE_MAPPING: CryptoMapping[] = [
  // === BINANCE (Principal pour EUR) ===
  { 
    id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', 
    tradingview_symbol: 'BINANCE:BTCEUR', exchange: 'BINANCE', 
    category: ['major'], availability: 'high', popularity_rank: 1,
    fiat_pairs: ['EUR', 'USD', 'USDT']
  },
  { 
    id: 'ethereum', name: 'Ethereum', symbol: 'ETH', 
    tradingview_symbol: 'BINANCE:ETHEUR', exchange: 'BINANCE', 
    category: ['major'], availability: 'high', popularity_rank: 2,
    fiat_pairs: ['EUR', 'USD', 'USDT']
  },
  
  // === COINBASE (Meilleur pour certains altcoins US) ===
  { 
    id: 'compound-governance-token', name: 'Compound', symbol: 'COMP', 
    tradingview_symbol: 'COINBASE:COMPEUR', exchange: 'COINBASE', 
    category: ['defi'], availability: 'high', popularity_rank: 45,
    fiat_pairs: ['EUR', 'USD']
  },
  { 
    id: 'maker', name: 'MakerDAO', symbol: 'MKR', 
    tradingview_symbol: 'COINBASE:MKREUR', exchange: 'COINBASE', 
    category: ['defi'], availability: 'high', popularity_rank: 30,
    fiat_pairs: ['EUR', 'USD']
  },
  { 
    id: 'basic-attention-token', name: 'Basic Attention Token', symbol: 'BAT', 
    tradingview_symbol: 'COINBASE:BATEUR', exchange: 'COINBASE', 
    category: ['web3'], availability: 'high', popularity_rank: 55,
    fiat_pairs: ['EUR', 'USD']
  },

  // === KRAKEN (Excellent pour privacy coins + EUR) ===
  { 
    id: 'monero', name: 'Monero', symbol: 'XMR', 
    tradingview_symbol: 'KRAKEN:XMREUR', exchange: 'KRAKEN', 
    category: ['privacy'], availability: 'high', popularity_rank: 19,
    fiat_pairs: ['EUR', 'USD']
  },
  { 
    id: 'zcash', name: 'Zcash', symbol: 'ZEC', 
    tradingview_symbol: 'KRAKEN:ZECEUR', exchange: 'KRAKEN', 
    category: ['privacy'], availability: 'high', popularity_rank: 72,
    fiat_pairs: ['EUR', 'USD']
  },
  { 
    id: 'dash', name: 'Dash', symbol: 'DASH', 
    tradingview_symbol: 'KRAKEN:DASHEUR', exchange: 'KRAKEN', 
    category: ['privacy'], availability: 'medium', popularity_rank: 88,
    fiat_pairs: ['EUR', 'USD']
  },
  { 
    id: 'tezos', name: 'Tezos', symbol: 'XTZ', 
    tradingview_symbol: 'KRAKEN:XTZEUR', exchange: 'KRAKEN', 
    category: ['layer1'], availability: 'high', popularity_rank: 65,
    fiat_pairs: ['EUR', 'USD']
  },

  // === KUCOIN (Altcoins exotiques) ===
  { 
    id: 'kucoin-shares', name: 'KuCoin Token', symbol: 'KCS', 
    tradingview_symbol: 'KUCOIN:KCSUSDT', exchange: 'KUCOIN', 
    category: ['exchange'], availability: 'medium', popularity_rank: 68,
    fiat_pairs: ['USDT']
  },
  { 
    id: 'phoenix-global', name: 'Phoenix Global', symbol: 'PHB', 
    tradingview_symbol: 'KUCOIN:PHBUSDT', exchange: 'KUCOIN', 
    category: ['ai'], availability: 'medium', popularity_rank: 150,
    fiat_pairs: ['USDT']
  },

  // === BYBIT (Derivatives focus but good spot) ===
  { 
    id: 'sui', name: 'Sui', symbol: 'SUI', 
    tradingview_symbol: 'BYBIT:SUIUSDT', exchange: 'BYBIT', 
    category: ['layer1'], availability: 'high', popularity_rank: 33,
    fiat_pairs: ['USDT', 'USD']
  },
  { 
    id: 'aptos', name: 'Aptos', symbol: 'APT', 
    tradingview_symbol: 'BYBIT:APTUSDT', exchange: 'BYBIT', 
    category: ['layer1'], availability: 'high', popularity_rank: 28,
    fiat_pairs: ['USDT', 'USD']
  },

  // === HUOBI (Asie + tokens spéciaux) ===
  { 
    id: 'huobi-token', name: 'Huobi Token', symbol: 'HT', 
    tradingview_symbol: 'HUOBI:HTUSDT', exchange: 'HUOBI', 
    category: ['exchange'], availability: 'medium', popularity_rank: 85,
    fiat_pairs: ['USDT']
  },

  // === OKX (Altcoins + bonne liquidité) ===
  { 
    id: 'okb', name: 'OKB', symbol: 'OKB', 
    tradingview_symbol: 'OKX:OKBUSDT', exchange: 'OKX', 
    category: ['exchange'], availability: 'high', popularity_rank: 45,
    fiat_pairs: ['USDT', 'USD']
  },

  // === BITFINEX (Liquidité pour gros tokens) ===
  { 
    id: 'leo-token', name: 'UNUS SED LEO', symbol: 'LEO', 
    tradingview_symbol: 'BITFINEX:LEOUSD', exchange: 'BITFINEX', 
    category: ['exchange'], availability: 'high', popularity_rank: 25,
    fiat_pairs: ['USD', 'USDT']
  },

  // === CRYPTO_COM ===
  { 
    id: 'crypto-com-chain', name: 'Cronos', symbol: 'CRO', 
    tradingview_symbol: 'CRYPTO_COM:CROUSD', exchange: 'CRYPTO_COM', 
    category: ['exchange', 'layer1'], availability: 'high', popularity_rank: 52,
    fiat_pairs: ['USD', 'EUR']
  },
]

// === STRATÉGIE DE FALLBACK ===
export const EXCHANGE_PRIORITY = {
  // Préférence pour EUR (marché français)
  EUR: ['BINANCE', 'COINBASE', 'KRAKEN', 'CRYPTO_COM'] as const,
  
  // Fallback USD
  USD: ['COINBASE', 'KRAKEN', 'BITFINEX', 'CRYPTO_COM', 'BYBIT', 'OKX'] as const,
  
  // Dernier recours USDT
  USDT: ['BINANCE', 'KUCOIN', 'BYBIT', 'OKX', 'HUOBI'] as const
}

// === FONCTIONS UTILES ===

// Trouve la meilleure paire pour une crypto
export const getBestTradingViewSymbol = (cryptoId: string): string | null => {
  const crypto = MULTI_EXCHANGE_MAPPING.find(c => c.id === cryptoId)
  if (!crypto) return null
  
  // Priorité: EUR > USD > USDT
  if (crypto.fiat_pairs.includes('EUR')) {
    return crypto.tradingview_symbol
  }
  
  // Chercher alternative USD
  const usdCrypto = MULTI_EXCHANGE_MAPPING.find(c => 
    c.id === cryptoId && c.fiat_pairs.includes('USD')
  )
  if (usdCrypto) return usdCrypto.tradingview_symbol
  
  // Dernier recours USDT
  const usdtCrypto = MULTI_EXCHANGE_MAPPING.find(c => 
    c.id === cryptoId && c.fiat_pairs.includes('USDT')
  )
  if (usdtCrypto) return usdtCrypto.tradingview_symbol
  
  return crypto.tradingview_symbol // Fallback
}

// Obtient toutes les variations d'une crypto sur différents exchanges
export const getAllSymbolVariants = (cryptoId: string): CryptoMapping[] => {
  return MULTI_EXCHANGE_MAPPING.filter(c => c.id === cryptoId)
}

// Filtre par exchange
export const getCryptosByExchange = (exchange: CryptoMapping['exchange']): CryptoMapping[] => {
  return MULTI_EXCHANGE_MAPPING.filter(c => c.exchange === exchange)
    .sort((a, b) => a.popularity_rank - b.popularity_rank)
}

// Recherche intelligente avec fallback
export const searchCryptosWithFallback = (query: string): CryptoMapping[] => {
  const lowerQuery = query.toLowerCase()
  const results = MULTI_EXCHANGE_MAPPING.filter(crypto => 
    crypto.name.toLowerCase().includes(lowerQuery) ||
    crypto.symbol.toLowerCase().includes(lowerQuery) ||
    crypto.id.toLowerCase().includes(lowerQuery)
  )
  
  // Grouper par crypto et garder le meilleur
  const grouped = new Map<string, CryptoMapping[]>()
  results.forEach(crypto => {
    if (!grouped.has(crypto.id)) {
      grouped.set(crypto.id, [])
    }
    grouped.get(crypto.id)!.push(crypto)
  })
  
  // Retourner la meilleure version de chaque crypto
  return Array.from(grouped.values()).map(variants => {
    // Préférer EUR, puis USD, puis USDT
    const eurVariant = variants.find(v => v.fiat_pairs.includes('EUR'))
    if (eurVariant) return eurVariant
    
    const usdVariant = variants.find(v => v.fiat_pairs.includes('USD'))
    if (usdVariant) return usdVariant
    
    return variants[0] // Fallback
  }).sort((a, b) => a.popularity_rank - b.popularity_rank)
}

// Stats par exchange
export const getExchangeStats = () => {
  const stats = new Map<string, { count: number, eurPairs: number, avgRank: number }>()
  
  MULTI_EXCHANGE_MAPPING.forEach(crypto => {
    if (!stats.has(crypto.exchange)) {
      stats.set(crypto.exchange, { count: 0, eurPairs: 0, avgRank: 0 })
    }
    
    const stat = stats.get(crypto.exchange)!
    stat.count++
    if (crypto.fiat_pairs.includes('EUR')) stat.eurPairs++
    stat.avgRank += crypto.popularity_rank
  })
  
  // Calculer moyennes
  stats.forEach(stat => {
    stat.avgRank = Math.round(stat.avgRank / stat.count)
  })
  
  return Object.fromEntries(stats)
}

export default MULTI_EXCHANGE_MAPPING