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
  title: 'Cryptium - Plateforme française de backtest crypto',
  description: 'Testez vos stratégies de trading sur votre vrai portefeuille crypto',
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