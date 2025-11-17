// src/app/api/crypto/global/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiCache, APICache } from '@/lib/cache'

/**
 * API Route pour les statistiques globales du marché crypto (CoinGecko)
 * Cache les résultats pour 2 minutes
 *
 * GET /api/crypto/global
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('_t') // Timestamp pour forcer le refresh

    const cacheKey = APICache.generateKey('coingecko', 'global')

    // Si _t est présent, ignorer le cache (force refresh)
    if (forceRefresh) {
      apiCache.delete(cacheKey)
    }

    const data = await apiCache.fetchWithCache(
      cacheKey,
      async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        try {
          const response = await fetch('https://api.coingecko.com/api/v3/global', {
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
            next: { revalidate: 300 } // Cache Next.js de 5 minutes
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
      120000 // Cache de 2 minutes (plus frais que 5 minutes)
    )

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })

  } catch (error: any) {
    console.error('[API] Error fetching global stats:', error)

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch global stats', details: error.message },
      { status: 500 }
    )
  }
}
