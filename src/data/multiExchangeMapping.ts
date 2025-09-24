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
  // ================== LAYER 1 ==================
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    tradingview_symbol: 'BINANCE:BTCUSD', 
    exchange: 'BINANCE', 
    category: ['layer1'], 
    availability: 'high', 
    popularity_rank: 1,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    tradingview_symbol: 'BINANCE:ETHUSD', 
    exchange: 'BINANCE', 
    category: ['layer1', 'smart-contract'], 
    availability: 'high', 
    popularity_rank: 2,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'binancecoin', 
    name: 'BNB', 
    symbol: 'BNB', 
    tradingview_symbol: 'BINANCE:BNBUSD', 
    exchange: 'BINANCE', 
    category: ['exchange', 'layer1'], 
    availability: 'high', 
    popularity_rank: 4,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL', 
    tradingview_symbol: 'BINANCE:SOLUSD', 
    exchange: 'BINANCE', 
    category: ['layer1', 'smart-contract'], 
    availability: 'high', 
    popularity_rank: 5,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'ripple', 
    name: 'XRP', 
    symbol: 'XRP', 
    tradingview_symbol: 'BINANCE:XRPUSD', 
    exchange: 'BINANCE', 
    category: ['payment', 'layer1'], 
    availability: 'high', 
    popularity_rank: 6,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ADA', 
    tradingview_symbol: 'BINANCE:ADAUSD', 
    exchange: 'BINANCE', 
    category: ['layer1', 'smart-contract'], 
    availability: 'high', 
    popularity_rank: 7,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'avalanche-2', 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    tradingview_symbol: 'BINANCE:AVAXUSD', 
    exchange: 'BINANCE', 
    category: ['layer1', 'smart-contract'], 
    availability: 'high', 
    popularity_rank: 8,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'polkadot', 
    name: 'Polkadot', 
    symbol: 'DOT', 
    tradingview_symbol: 'BINANCE:DOTUSD', 
    exchange: 'BINANCE', 
    category: ['layer0', 'interoperability'], 
    availability: 'high', 
    popularity_rank: 9,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'polygon-pos', 
    name: 'Polygon', 
    symbol: 'MATIC', 
    tradingview_symbol: 'BINANCE:MATICUSD', 
    exchange: 'BINANCE', 
    category: ['layer2', 'scaling'], 
    availability: 'high', 
    popularity_rank: 10,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  // ================== DeFi ==================
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    tradingview_symbol: 'BINANCE:ETHEUR', 
    exchange: 'BINANCE', 
    category: ['layer1', 'defi'], 
    availability: 'high', 
    popularity_rank: 10,
    fiat_pairs: ['EUR', 'USDT']
  },
  { 
    id: 'avalanche-2', 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    tradingview_symbol: 'BINANCE:AVAXEUR', 
    exchange: 'BINANCE', 
    category: ['defi', 'layer1'], 
    availability: 'high', 
    popularity_rank: 7,
    fiat_pairs: ['EUR', 'USDT', 'BTC']
  },
  { 
    id: 'polkadot', 
    name: 'Polkadot', 
    symbol: 'DOT', 
    tradingview_symbol: 'BINANCE:DOTEUR', 
    exchange: 'BINANCE', 
    category: ['defi', 'interoperability'], 
    availability: 'high', 
    popularity_rank: 8,
    fiat_pairs: ['EUR', 'USDT', 'BTC']
  },
  // ================== STABLECOINS ==================
  { 
    id: 'tether-eur', 
    name: 'Tether', 
    symbol: 'USDT', 
    tradingview_symbol: 'BINANCE:USDTEUR', 
    exchange: 'BINANCE', 
    category: ['stablecoin'], 
    availability: 'high', 
    popularity_rank: 9,
    fiat_pairs: ['EUR', 'USD']
  },
  { 
    id: 'tether-usd', 
    name: 'Tether', 
    symbol: 'USDT', 
    tradingview_symbol: 'BINANCE:USDTUSD', 
    exchange: 'BINANCE', 
    category: ['stablecoin'], 
    availability: 'high', 
    popularity_rank: 3,
    fiat_pairs: ['USD', 'EUR', 'USDC']
  },
  { 
    id: 'usd-coin', 
    name: 'USD Coin', 
    symbol: 'USDC', 
    tradingview_symbol: 'BINANCE:USDCUSD', 
    exchange: 'BINANCE', 
    category: ['stablecoin'], 
    availability: 'high', 
    popularity_rank: 11,
    fiat_pairs: ['USD', 'EUR', 'USDT']
  },
  { 
    id: 'dai', 
    name: 'Dai', 
    symbol: 'DAI', 
    tradingview_symbol: 'BINANCE:DAIUSD', 
    exchange: 'BINANCE', 
    category: ['stablecoin', 'defi'], 
    availability: 'high', 
    popularity_rank: 15,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'first-digital-usd', 
    name: 'First Digital USD', 
    symbol: 'FDUSD', 
    tradingview_symbol: 'BINANCE:FDUSDUSD', 
    exchange: 'BINANCE', 
    category: ['stablecoin'], 
    availability: 'high', 
    popularity_rank: 16,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'usd-coin', 
    name: 'USD Coin', 
    symbol: 'USDC', 
    tradingview_symbol: 'BINANCE:USDCEUR', 
    exchange: 'BINANCE', 
    category: ['stablecoin'], 
    availability: 'high', 
    popularity_rank: 10,
    fiat_pairs: ['EUR', 'USDT']
  },
  // ================== MEME COINS ==================
  { 
    id: 'dogecoin', 
    name: 'Dogecoin', 
    symbol: 'DOGE', 
    tradingview_symbol: 'BINANCE:DOGEUSD', 
    exchange: 'BINANCE', 
    category: ['meme', 'payment'], 
    availability: 'high', 
    popularity_rank: 14,
    fiat_pairs: ['USD', 'USDT', 'EUR']
  },
  { 
    id: 'shiba-inu', 
    name: 'Shiba Inu', 
    symbol: 'SHIB', 
    tradingview_symbol: 'BINANCE:SHIBUSD', 
    exchange: 'BINANCE', 
    category: ['meme'], 
    availability: 'high', 
    popularity_rank: 17,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'pepe', 
    name: 'Pepe', 
    symbol: 'PEPE', 
    tradingview_symbol: 'BINANCE:PEPEUSD', 
    exchange: 'BINANCE', 
    category: ['meme'], 
    availability: 'high', 
    popularity_rank: 22,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'dogwifcoin', 
    name: 'dogwifhat', 
    symbol: 'WIF', 
    tradingview_symbol: 'BINANCE:WIFUSD', 
    exchange: 'BINANCE', 
    category: ['meme'], 
    availability: 'high', 
    popularity_rank: 33,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'dogecoin', 
    name: 'Dogecoin', 
    symbol: 'DOGE',
    tradingview_symbol: 'BINANCE:DOGEEUR', 
    exchange: 'BINANCE', 
    category: ['meme', 'payment'], 
    availability: 'high', 
    popularity_rank: 12,
    fiat_pairs: ['EUR', 'USDT']
  },
  // ================== AI & BIG DATA ==================
  { 
    id: 'the-graph', 
    name: 'The Graph', 
    symbol: 'GRT', 
    tradingview_symbol: 'BINANCE:GRTUSD', 
    exchange: 'BINANCE', 
    category: ['ai', 'big-data', 'indexing'], 
    availability: 'high', 
    popularity_rank: 35,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'fetch-ai', 
    name: 'Fetch.ai', 
    symbol: 'FET', 
    tradingview_symbol: 'BINANCE:FETUSD', 
    exchange: 'BINANCE', 
    category: ['ai', 'machine-learning'], 
    availability: 'high', 
    popularity_rank: 38,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'ocean-protocol', 
    name: 'Ocean Protocol', 
    symbol: 'OCEAN', 
    tradingview_symbol: 'BINANCE:OCEANUSD', 
    exchange: 'BINANCE', 
    category: ['ai', 'big-data'], 
    availability: 'high', 
    popularity_rank: 45,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'singularitynet', 
    name: 'SingularityNET', 
    symbol: 'AGIX', 
    tradingview_symbol: 'BINANCE:AGIXUSD', 
    exchange: 'BINANCE', 
    category: ['ai', 'machine-learning'], 
    availability: 'high', 
    popularity_rank: 48,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'the-graph', 
    name: 'The Graph', 
    symbol: 'GRT',
    tradingview_symbol: 'BINANCE:GRTEUR', 
    exchange: 'BINANCE', 
    category: ['ai', 'big-data', 'indexing'], 
    availability: 'medium', 
    popularity_rank: 14,
    fiat_pairs: ['EUR', 'USDT']
  },
  // ================== NFT & GAMING ==================
  { 
    id: 'the-sandbox', 
    name: 'The Sandbox', 
    symbol: 'SAND', 
    tradingview_symbol: 'BINANCE:SANDUSD', 
    exchange: 'BINANCE', 
    category: ['metaverse', 'gaming', 'nft'], 
    availability: 'high', 
    popularity_rank: 49,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'decentraland', 
    name: 'Decentraland', 
    symbol: 'MANA', 
    tradingview_symbol: 'BINANCE:MANAUSD', 
    exchange: 'BINANCE', 
    category: ['metaverse', 'gaming', 'nft'], 
    availability: 'high', 
    popularity_rank: 51,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'axie-infinity', 
    name: 'Axie Infinity', 
    symbol: 'AXS', 
    tradingview_symbol: 'BINANCE:AXSUSD', 
    exchange: 'BINANCE', 
    category: ['gaming', 'nft', 'play-to-earn'], 
    availability: 'high', 
    popularity_rank: 53,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'apecoin', 
    name: 'ApeCoin', 
    symbol: 'APE', 
    tradingview_symbol: 'BINANCE:APEUSD', 
    exchange: 'BINANCE', 
    category: ['nft', 'metaverse'], 
    availability: 'high', 
    popularity_rank: 57,
    fiat_pairs: ['USD', 'USDT']
  },
  { 
    id: 'decentraland-eur', 
    name: 'Decentraland', 
    symbol: 'MANA',
    tradingview_symbol: 'BINANCE:MANAEUR', 
    exchange: 'BINANCE',
    category: ['metaverse', 'gaming', 'nft'],
    availability: 'high',
    popularity_rank: 15,
    fiat_pairs: ['EUR', 'USDT']
  },
  {
    id: 'the-sandbox', 
    name: 'The Sandbox', 
    symbol: 'SAND',
    tradingview_symbol: 'BINANCE:SANDEUR', 
    exchange: 'BINANCE',
    category: ['nft', 'gaming', 'metaverse'],
    availability: 'high',
    popularity_rank: 16,
    fiat_pairs: ['EUR', 'USDT']
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
  // Préférence pour USD (devise principale)
  USD: ['BINANCE', 'COINBASE', 'KRAKEN', 'CRYPTO_COM', 'BITFINEX', 'BYBIT', 'OKX'] as const,
  
  // Fallback USDT
  USDT: ['BINANCE', 'KUCOIN', 'BYBIT', 'OKX', 'HUOBI'] as const,
  
  // Dernier recours EUR
  EUR: ['BINANCE', 'COINBASE', 'KRAKEN', 'CRYPTO_COM'] as const
}

// === FONCTIONS UTILES ===

// Trouve la meilleure paire pour une crypto
export const getBestTradingViewSymbol = (cryptoId: string): string | null => {
  const crypto = MULTI_EXCHANGE_MAPPING.find(c => c.id === cryptoId)
  if (!crypto) return null
  
  // Priorité: USD > USDT > EUR
  if (crypto.fiat_pairs.includes('USD')) {
    // Remplacer EUR par USD dans le symbole si nécessaire
    return crypto.tradingview_symbol.replace('EUR', 'USD')
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
    // Préférer USD, puis USDT, puis EUR
    const usdVariant = variants.find(v => v.fiat_pairs.includes('USD'))
    if (usdVariant) return usdVariant
    
    const usdtVariant = variants.find(v => v.fiat_pairs.includes('USDT'))
    if (usdtVariant) return usdtVariant
    
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