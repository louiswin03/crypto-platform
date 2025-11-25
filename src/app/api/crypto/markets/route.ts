// src/app/api/crypto/markets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiCache, APICache } from '@/lib/cache'

/**
 * API Route pour les données de marché CoinGecko
 * Cache les résultats pour réduire les appels API
 *
 * GET /api/crypto/markets?ids=bitcoin,ethereum&vs_currency=usd
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Paramètres de la requête
    const ids = searchParams.get('ids') || ''
    const vsCurrency = searchParams.get('vs_currency') || 'usd'
    const order = searchParams.get('order') || 'market_cap_desc'
    const perPage = searchParams.get('per_page') || '100'
    const page = searchParams.get('page') || '1'
    const sparkline = searchParams.get('sparkline') || 'false'
    const priceChangePercentage = searchParams.get('price_change_percentage') || '24h'
    const forceRefresh = searchParams.get('_t') // Timestamp pour forcer le refresh

    // Générer une clé de cache unique basée sur les paramètres
    const cacheKey = APICache.generateKey(
      'coingecko',
      'markets',
      ids,
      vsCurrency,
      order,
      perPage,
      page,
      sparkline,
      priceChangePercentage
    )

    // Si _t est présent, ignorer le cache (force refresh)
    if (forceRefresh) {
      apiCache.delete(cacheKey)
    }

    // Utiliser le cache avec une durée de 45 secondes pour les prix (réduit pour plus de fraîcheur)
    const data = await apiCache.fetchWithCache(
      cacheKey,
      async () => {
        const params = new URLSearchParams({
          vs_currency: vsCurrency,
          order,
          per_page: perPage,
          page,
          sparkline,
          price_change_percentage: priceChangePercentage,
          locale: 'en'
        })

        // Ajouter les IDs seulement s'ils sont fournis
        if (ids) {
          params.set('ids', ids)
        }

        const url = `https://api.coingecko.com/api/v3/coins/markets?${params}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
            next: { revalidate: 60 } // Cache Next.js de 60 secondes
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`)
          }

          const data = await response.json()
          return data
        } catch (error) {
          clearTimeout(timeoutId)
          throw error
        }
      },
      45000 // Cache de 45 secondes (plus frais que 1 minute)
    )

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    })

  } catch (error: any) {

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch market data', details: error.message },
      { status: 500 }
    )
  }
}
