// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { WatchlistProvider } from '@/contexts/WatchlistContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: 'CryptoBacktest - Plateforme française de backtest crypto',
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
              </LanguageProvider>
            </ThemeProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}