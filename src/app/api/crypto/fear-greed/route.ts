// src/app/api/crypto/fear-greed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiCache, APICache } from '@/lib/cache'

/**
 * API Route pour le Fear & Greed Index
 * Cache les résultats pour 5 minutes
 *
 * GET /api/crypto/fear-greed?limit=1
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '1'

    const cacheKey = APICache.generateKey('alternative', 'fear-greed', limit)

    const data = await apiCache.fetchWithCache(
      cacheKey,
      async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        try {
          const response = await fetch(
            `https://api.alternative.me/fng/?limit=${limit}`,
            {
              signal: controller.signal,
              mode: 'cors',
              cache: 'default',
              next: { revalidate: 300 } // Cache Next.js de 5 minutes
            }
          )

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`Alternative.me API error: ${response.status}`)
          }

          const data = await response.json()
          return data
        } catch (error) {
          clearTimeout(timeoutId)
          throw error
        }
      },
      APICache.DURATIONS.SHORT // Cache de 1 minute seulement
    )

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 1 minute de cache
      }
    })

  } catch (error: any) {
    console.error('[API] Error fetching Fear & Greed Index:', error)

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch Fear & Greed Index', details: error.message },
      { status: 500 }
    )
  }
}
