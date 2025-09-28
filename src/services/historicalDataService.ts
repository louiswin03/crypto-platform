// src/services/historicalDataService.ts

export interface HistoricalPrice {
  timestamp: number
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
  marketCap?: number
}

export interface HistoricalDataResponse {
  symbol: string
  coinId: string
  period: BacktestPeriod
  prices: HistoricalPrice[]
  startDate: string
  endDate: string
  totalDays: number
}

export enum BacktestPeriod {
  ONE_MONTH = '1M',
  THREE_MONTHS = '3M',
  SIX_MONTHS = '6M',
  ONE_YEAR = '1Y',
  TWO_YEARS = '2Y',
  FIVE_YEARS = '5Y',
  MAX = 'MAX'
}

// Mapping des cryptos supportées (facilement extensible)
export const SUPPORTED_CRYPTOS = {
  BTC: {
    coinGeckoId: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin'
  },
  ETH: {
    coinGeckoId: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum'
  }
  // Facile d'ajouter d'autres cryptos ici plus tard
  // SOL: { coinGeckoId: 'solana', symbol: 'SOL', name: 'Solana' },
  // ADA: { coinGeckoId: 'cardano', symbol: 'ADA', name: 'Cardano' },
} as const

export type SupportedCrypto = keyof typeof SUPPORTED_CRYPTOS

// Cache en mémoire pour éviter les appels répétés
class HistoricalDataCache {
  private cache = new Map<string, { data: HistoricalDataResponse; timestamp: number }>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  private generateCacheKey(coinId: string, period: BacktestPeriod): string {
    return `${coinId}-${period}`
  }

  get(coinId: string, period: BacktestPeriod): HistoricalDataResponse | null {
    const key = this.generateCacheKey(coinId, period)
    const cached = this.cache.get(key)

    if (!cached) return null

    // Vérifier si le cache n'est pas expiré
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(coinId: string, period: BacktestPeriod, data: HistoricalDataResponse): void {
    const key = this.generateCacheKey(coinId, period)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

const cache = new HistoricalDataCache()

// Convertir la période en nombre de jours pour l'API CoinGecko
function periodToDays(period: BacktestPeriod): number {
  switch (period) {
    case BacktestPeriod.ONE_MONTH: return 30
    case BacktestPeriod.THREE_MONTHS: return 90
    case BacktestPeriod.SIX_MONTHS: return 180
    case BacktestPeriod.ONE_YEAR: return 365
    case BacktestPeriod.TWO_YEARS: return 730
    case BacktestPeriod.FIVE_YEARS: return 1825
    case BacktestPeriod.MAX: return 1825 // MAX = 5 ans pour le moment
    default: return 365
  }
}

// Fonction utilitaire pour formater les dates
function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0]
}


// Fonction principale pour récupérer les données historiques
export async function fetchHistoricalPrices(
  crypto: SupportedCrypto,
  period: BacktestPeriod = BacktestPeriod.ONE_YEAR
): Promise<HistoricalDataResponse> {
  const cryptoConfig = SUPPORTED_CRYPTOS[crypto]

  if (!cryptoConfig) {
    throw new Error(`Crypto non supportée: ${crypto}`)
  }

  // Vérifier le cache d'abord
  const cached = cache.get(cryptoConfig.coinGeckoId, period)
  if (cached) {
    console.log(`📊 Cache hit pour ${crypto} ${period}`)
    return cached
  }

  console.log(`🔄 Récupération des données historiques pour ${crypto} ${period}`)

  try {
    // Binance en premier, Yahoo Finance en fallback
    let response
    let data
    let prices: HistoricalPrice[] = []

    // 1. Essayer Binance API d'abord
    try {
      console.log(`🔄 Tentative avec Binance API pour ${crypto}...`)
      const binanceSymbol = crypto === 'BTC' ? 'BTCUSDT' : 'ETHUSDT'
      const days = periodToDays(period)
      const numDays = days

      console.log(`📊 Demande de ${numDays} jours pour ${crypto} (période: ${period})`)

      // Si on demande plus de 1000 jours, on fait plusieurs requêtes
      if (numDays > 1000) {
        console.log(`📊 Période longue détectée (${numDays} jours), requêtes multiples...`)

        const allPrices: any[] = []
        const batchSize = 1000
        const numBatches = Math.ceil(numDays / batchSize)
        const now = Date.now()

        for (let batch = 0; batch < numBatches; batch++) {
          const remainingDays = numDays - (batch * batchSize)
          const actualLimit = Math.min(batchSize, remainingDays)
          const endTime = now - (batch * batchSize * 24 * 60 * 60 * 1000)
          const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1d&limit=${actualLimit}&endTime=${endTime}`

          console.log(`📈 Batch ${batch + 1}/${numBatches}: demande de ${actualLimit} points (restant: ${remainingDays})`)

          try {
            const batchResponse = await fetch(url, {
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(15000)
            })

            if (batchResponse.ok) {
              const batchData = await batchResponse.json()
              if (Array.isArray(batchData)) {
                allPrices.unshift(...batchData)
                console.log(`✅ Batch ${batch + 1}/${numBatches}: récupéré ${batchData.length} points`)
              }
            }

            // Petite pause entre requêtes
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (batchError) {
            console.log(`⚠️ Erreur batch ${batch + 1}: ${batchError}`)
            break
          }
        }

        if (allPrices.length > 0) {
          prices = allPrices.map((kline: any[]) => ({
            timestamp: parseInt(kline[0]),
            date: formatDate(parseInt(kline[0])),
            open: parseFloat(parseFloat(kline[1]).toFixed(8)),
            high: parseFloat(parseFloat(kline[2]).toFixed(8)),
            low: parseFloat(parseFloat(kline[3]).toFixed(8)),
            close: parseFloat(parseFloat(kline[4]).toFixed(8)),
            volume: parseFloat(kline[5])
          }))

          // Supprimer les doublons et trier
          const uniquePrices = prices.filter((price, index, self) =>
            index === self.findIndex(p => p.timestamp === price.timestamp)
          )
          prices = uniquePrices.sort((a, b) => a.timestamp - b.timestamp)

          console.log(`✅ Binance API (multi-batch): ${prices.length} points récupérés pour ${crypto}`)

          const result: HistoricalDataResponse = {
            symbol: cryptoConfig.symbol,
            coinId: cryptoConfig.coinGeckoId,
            period,
            prices,
            startDate: prices[0]?.date || '',
            endDate: prices[prices.length - 1]?.date || '',
            totalDays: prices.length
          }

          cache.set(cryptoConfig.coinGeckoId, period, result)
          console.log(`✅ Données Binance récupérées: ${prices.length} points pour ${crypto} ${period}`)
          return result
        }
      } else {
        // Requête simple pour courtes périodes
        const limit = Math.min(numDays, 1000)
        response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1d&limit=${limit}`, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15000)
        })

        if (response.ok) {
          data = await response.json()
          if (Array.isArray(data) && data.length > 0) {
            prices = data.map((kline: any[]) => ({
              timestamp: parseInt(kline[0]),
              date: formatDate(parseInt(kline[0])),
              open: parseFloat(parseFloat(kline[1]).toFixed(8)),
              high: parseFloat(parseFloat(kline[2]).toFixed(8)),
              low: parseFloat(parseFloat(kline[3]).toFixed(8)),
              close: parseFloat(parseFloat(kline[4]).toFixed(8)),
              volume: parseFloat(kline[5])
            }))

            prices.sort((a, b) => a.timestamp - b.timestamp)

            const result: HistoricalDataResponse = {
              symbol: cryptoConfig.symbol,
              coinId: cryptoConfig.coinGeckoId,
              period,
              prices,
              startDate: prices[0]?.date || '',
              endDate: prices[prices.length - 1]?.date || '',
              totalDays: prices.length
            }

            cache.set(cryptoConfig.coinGeckoId, period, result)
            console.log(`✅ Binance API: ${prices.length} points récupérés pour ${crypto} ${period}`)
            return result
          }
        }
      }
    } catch (binanceError) {
      console.log(`⚠️ Binance API échec pour ${crypto}: ${binanceError}, tentative Yahoo Finance...`)
    }

    // 2. Si Binance échoue, essayer Yahoo Finance
    if (prices.length === 0) {
      try {
        console.log(`🔄 Tentative avec Yahoo Finance pour ${crypto}...`)
        const yahooSymbol = crypto === 'BTC' ? 'BTC-USD' : 'ETH-USD'
        const days = periodToDays(period)
        const numDays = days

        // Calculer les dates
        const endDate = Math.floor(Date.now() / 1000)
        const startDate = endDate - (numDays * 24 * 60 * 60)

        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startDate}&period2=${endDate}&interval=1d`

        response = await fetch(yahooUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(15000)
        })

        if (response.ok) {
          const responseText = await response.text()

          // Vérifier si c'est du JSON valide et non du HTML
          if (responseText.trim().startsWith('<')) {
            throw new Error('Yahoo Finance a retourné du HTML au lieu de JSON')
          }

          try {
            data = JSON.parse(responseText)
          } catch (parseError) {
            throw new Error('Impossible de parser la réponse Yahoo Finance')
          }

          const result = data?.chart?.result?.[0]

          if (result?.timestamp && result?.indicators?.quote?.[0]) {
            const timestamps = result.timestamp
            const quote = result.indicators.quote[0]
            const opens = quote.open || []
            const highs = quote.high || []
            const lows = quote.low || []
            const closes = quote.close || []
            const volumes = quote.volume || []

            prices = timestamps.map((ts: number, index: number) => ({
              timestamp: ts * 1000,
              date: formatDate(ts * 1000),
              open: parseFloat(parseFloat(opens[index] || closes[index]).toFixed(8)),
              high: parseFloat(parseFloat(highs[index] || closes[index]).toFixed(8)),
              low: parseFloat(parseFloat(lows[index] || closes[index]).toFixed(8)),
              close: parseFloat(parseFloat(closes[index]).toFixed(8)),
              volume: volumes[index] || undefined
            })).filter((price: any) => price.close !== null && !isNaN(price.close))

            if (prices.length > 0) {
              prices.sort((a, b) => a.timestamp - b.timestamp)

              const yahooResult: HistoricalDataResponse = {
                symbol: cryptoConfig.symbol,
                coinId: cryptoConfig.coinGeckoId,
                period,
                prices,
                startDate: prices[0]?.date || '',
                endDate: prices[prices.length - 1]?.date || '',
                totalDays: prices.length
              }

              cache.set(cryptoConfig.coinGeckoId, period, yahooResult)
              console.log(`✅ Yahoo Finance: ${prices.length} points récupérés pour ${crypto} ${period}`)
              return yahooResult
            }
          }
        }
      } catch (yahooError) {
        console.log(`⚠️ Yahoo Finance échec pour ${crypto}: ${yahooError}`)
      }
    }

    // Si aucune API n'a fonctionné
    if (prices.length === 0) {
      throw new Error(`Impossible de récupérer les données pour ${crypto}. Yahoo Finance et Binance ont échoué.`)
    }

  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des données pour ${crypto}:`, error)

    // Si on a des données en cache (même expirées), on les retourne plutôt que de fail
    const expiredCache = cache.get(cryptoConfig.coinGeckoId, period)
    if (expiredCache) {
      console.log(`🔄 Utilisation du cache expiré pour ${crypto} ${period}`)
      return expiredCache
    }

    // Si vraiment rien ne marche, on retourne une erreur claire
    throw error
  }
}

// Fonction pour récupérer plusieurs cryptos en parallèle
export async function fetchMultipleHistoricalPrices(
  cryptos: SupportedCrypto[],
  period: BacktestPeriod = BacktestPeriod.ONE_YEAR
): Promise<Record<SupportedCrypto, HistoricalDataResponse>> {
  console.log(`🔄 Récupération de ${cryptos.length} cryptos en parallèle`)

  try {
    const promises = cryptos.map(async (crypto) => {
      const data = await fetchHistoricalPrices(crypto, period)
      return { crypto, data }
    })

    const results = await Promise.allSettled(promises)
    const successResults: Record<string, HistoricalDataResponse> = {}
    const errors: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successResults[result.value.crypto] = result.value.data
      } else {
        errors.push(`${cryptos[index]}: ${result.reason}`)
      }
    })

    if (errors.length > 0) {
      console.warn('⚠️ Certaines cryptos ont échoué:', errors)
    }

    console.log(`✅ ${Object.keys(successResults).length}/${cryptos.length} cryptos récupérées avec succès`)

    return successResults as Record<SupportedCrypto, HistoricalDataResponse>

  } catch (error) {
    console.error('❌ Erreur lors de la récupération multiple:', error)
    throw error
  }
}

// Fonction utilitaire pour obtenir la liste des cryptos supportées
export function getSupportedCryptos(): Array<{ symbol: SupportedCrypto; name: string; coinGeckoId: string }> {
  return Object.entries(SUPPORTED_CRYPTOS).map(([symbol, config]) => ({
    symbol: symbol as SupportedCrypto,
    name: config.name,
    coinGeckoId: config.coinGeckoId
  }))
}

// Fonction pour vider le cache (utile pour le debug)
export function clearHistoricalDataCache(): void {
  cache.clear()
  console.log('🗑️ Cache des données historiques vidé')
}

// Fonction pour obtenir des stats sur le cache
export function getCacheStats(): { size: number; duration: string } {
  return {
    size: cache.size(),
    duration: '30 minutes'
  }
}

