// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { WatchlistProvider } from '@/contexts/WatchlistContext'

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
      <body className="bg-gray-900 min-h-screen">
        <AuthProvider>
          <WatchlistProvider>
            {children}
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}