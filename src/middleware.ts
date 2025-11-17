import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Protection contre le clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Empêcher le MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Protection XSS pour les anciens navigateurs
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Politique de referrer stricte
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Désactiver les fonctionnalités dangereuses du navigateur
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // Générer un nonce pour les scripts inline (CSP)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Content Security Policy (CSP) - Sécurisé
  // 'unsafe-eval' retiré pour la sécurité
  // 'unsafe-inline' conservé temporairement pour compatibilité avec TradingView
  // TODO: Migrer vers des nonces pour tous les scripts inline
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com https://s3.tradingview.com https://s.tradingview.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://muolutawyjkfoyywpjhm.supabase.co https://api.binance.com https://api.kraken.com https://api.coinbase.com https://api.coingecko.com https://api.alternative.me https://api.tradingview.com https://*.tradingview.com",
      "frame-src 'self' https://s.tradingview.com https://www.tradingview.com https://tradingview-widget.com https://www.tradingview-widget.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  )

  // Stocker le nonce pour l'utiliser dans les composants
  response.headers.set('X-Nonce', nonce)

  // HSTS (Strict-Transport-Security) - force HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Protection CSRF pour les requêtes mutantes (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Vérifier que l'origine correspond au host (même origine)
    if (origin) {
      const originUrl = new URL(origin)
      if (originUrl.host !== host) {
        return NextResponse.json(
          { error: 'CSRF protection: Origin mismatch' },
          { status: 403 }
        )
      }
    }
  }

  return response
}

// Configurer les routes où le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - public (dossier public)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
