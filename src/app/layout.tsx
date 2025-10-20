// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Image from 'next/image'
import { AuthProvider } from '@/components/AuthProvider'
import { WatchlistProvider } from '@/contexts/WatchlistContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'Cryptium - Votre plateforme d\'analyse crypto premium',
  description: 'Analysez les marchés, backtestez vos stratégies et suivez votre portfolio crypto. Gratuit et no-code. La plateforme tout-en-un pour optimiser vos investissements cryptomonnaies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <WatchlistProvider>
            <ThemeProvider>
              <LanguageProvider>
                {children}
                <CookieConsent />
              </LanguageProvider>
            </ThemeProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}