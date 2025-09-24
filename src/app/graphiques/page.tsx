"use client"

// AJOUT : Import pour utiliser la navigation cohérente
import SmartNavigation from '@/components/SmartNavigation'
import { useAuth } from '@/hooks/useAuth'

import Link from 'next/link'
import { TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Maximize2, Download, RotateCcw, Sparkles } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import TradingViewWidget from '@/components/TradingViewWidget'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices' // AJOUT
// Remplacez SmartCryptoSelector par un nouveau composant qui utilise les données CoinGecko
import CoinGeckoCryptoSelector from '@/components/CryptoSelector/CoinGeckoCryptoSelector'

import { Search, AlertCircle } from 'lucide-react'
import ImprovedCryptoSearch from '@/components/CryptoSelector/ImprovedCryptoSearch'

export default function GraphiquesPage() {
  // Hook pour récupérer l'utilisateur connecté (pour conditionner certains boutons)
  const { user } = useAuth()
  
  const [selectedPair, setSelectedPair] = useState('BINANCE:BTCEUR')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // AJOUT : Hook pour récupérer les données CoinGecko
  const { prices, loading, error, getCoinsWithTradingView } = useExtendedCoinGeckoPrices(200)

  // MODIFICATION : Infos crypto depuis CoinGecko au lieu du hardcodage
  const getCryptoInfo = (symbol: string) => {
    // Trouver la crypto dans les données CoinGecko
    const cryptoData = prices.find(coin => coin.tradingview_symbol === symbol)

    if (cryptoData) {
      return {
        name: cryptoData.name,
        description: `Classé #${cryptoData.market_cap_rank} par capitalisation boursière`,
        category: 'Top ' + Math.ceil(cryptoData.market_cap_rank / 10) * 10,
        price: cryptoData.current_price,
        change24h: cryptoData.price_change_percentage_24h,
        image: cryptoData.image
      }
    }

    // Fallback si pas trouvé
    const pair = symbol.includes(':') ? symbol.split(':')[1] : symbol
    const crypto = pair?.replace('EUR', '').replace('USD', '').replace('USDT', '') || 'BTC'
    return {
      name: crypto,
      description: 'Cryptomonnaie',
      category: 'Blockchain',
      price: null,
      change24h: null,
      image: null
    }
  }

  // AJOUT : Préparer les options pour le sélecteur depuis CoinGecko
  const cryptoOptions = useMemo(() => {
    return getCoinsWithTradingView().map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      tradingview_symbol: coin.tradingview_symbol,
      rank: coin.market_cap_rank,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      image: coin.image
    }))
  }, [prices])

  const currentCrypto = getCryptoInfo(selectedPair)
  const symbolWithoutExchange = selectedPair.includes(':') ? selectedPair.split(':')[1] : selectedPair

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Entrer en plein écran
        const chartContainer = document.getElementById('trading-chart-container')
        if (chartContainer) {
          await chartContainer.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        // Sortir du plein écran
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Erreur fullscreen:', error)
      // Fallback vers notre ancien système
      setIsFullscreen(!isFullscreen)
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      setIsFullscreen(false)
    } catch (error) {
      console.error('Erreur sortie fullscreen:', error)
      setIsFullscreen(false)
    }
  }

  // Écouter les changements de plein écran et gestion du clavier
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  return (
    <>
      {/* GARDEZ TOUS VOS STYLES EXISTANTS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
        }
        
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .tradingview-widget-copyright {
          font-size: 11px !important;
          line-height: 24px !important;
          text-align: center !important;
          vertical-align: middle !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif !important;
          color: #9CA3AF !important;
        }

        .tradingview-widget-copyright a {
          text-decoration: none !important;
          color: #6366F1 !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* GARDEZ VOTRE BACKGROUND PATTERN EXISTANT */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* MODIFICATION : Utiliser SmartNavigation au lieu de la navigation personnalisée */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight flex items-center space-x-3">
                  <span>Graphiques Cryptos</span>
                  <Sparkles className="w-8 h-8 text-[#6366F1]" />
                </h1>
                <p className="text-gray-400 text-xl font-light max-w-2xl">
                  Graphiques TradingView professionnels pour les principales cryptomonnaies
                  {/* AJOUT : Afficher le nombre de cryptos disponibles */}
                  {cryptoOptions.length > 0 && (
                    <span className="block text-sm mt-2 text-[#6366F1]">
                      {cryptoOptions.length} cryptomonnaies avec graphiques disponibles
                    </span>
                  )}
                </p>
              </div>
              
              <button 
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>

            {/* Section de recherche améliorée - TOUTE LARGEUR */}
            <div className="mb-8">
            <div className="glass-effect rounded-2xl border border-gray-800/40 p-6">
                <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-[#6366F1]" />
                    <span>Rechercher une cryptomonnaie</span>
                </h2>
                <p className="text-gray-400 text-sm">
                    Sélectionnez parmi {cryptoOptions.length} cryptomonnaies avec graphiques TradingView disponibles
                </p>
                </div>

                {loading ? (
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-700 rounded-xl mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-16 bg-gray-700 rounded-lg"></div>
                    ))}
                    </div>
                </div>
                ) : error ? (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="text-red-400 font-medium mb-2">Erreur de chargement</div>
                    <div className="text-gray-400 text-sm">{error}</div>
                </div>
                ) : (
                <ImprovedCryptoSearch
                    cryptoOptions={cryptoOptions}
                    selectedCrypto={selectedPair}
                    onCryptoSelect={setSelectedPair}
                />
                )}
            </div>
            </div>

            {/* MODIFICATION : Info Crypto avec données CoinGecko */}
            <div className="glass-effect rounded-2xl p-6 border border-gray-800/40 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-2">
                    {currentCrypto.image ? (
                      <img
                        src={currentCrypto.image}
                        alt={currentCrypto.name}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          // Fallback au texte si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className={`text-white text-2xl font-bold ${currentCrypto.image ? 'hidden' : ''}`}>
                      {symbolWithoutExchange.replace(/EUR|USD|USDT/g, '').slice(0, 2) || 'BT'}
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#F9FAFB] flex items-center space-x-3">
                      <span>{symbolWithoutExchange || 'BTCEUR'}</span>
                      {/* AJOUT : Prix en temps réel si disponible */}
                      {currentCrypto.price && (
                        <span className="text-xl text-gray-400">
                          €{currentCrypto.price.toLocaleString('fr-FR', { 
                            minimumFractionDigits: currentCrypto.price < 1 ? 4 : 2,
                            maximumFractionDigits: currentCrypto.price < 1 ? 4 : 2
                          })}
                        </span>
                      )}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                        <span className="text-[#16A34A] font-medium text-sm">LIVE</span>
                      </div>
                    </div>
                    <div className="text-gray-400 flex items-center space-x-2 flex-wrap gap-1">
                      <span>{currentCrypto.name}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] rounded-full text-xs font-medium">
                        {currentCrypto.category}
                      </span>
                      {/* AJOUT : Variation 24h */}
                      {currentCrypto.change24h && (
                        <>
                          <span>•</span>
                          <span className={`font-medium text-sm ${
                            currentCrypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {currentCrypto.change24h >= 0 ? '+' : ''}
                            {currentCrypto.change24h.toFixed(2)}%
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-gray-500">TradingView</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={toggleFullscreen}
                    className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    title="Mode plein écran"
                  >
                    <Maximize2 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    title="Actualiser le graphique"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {currentCrypto.description && (
                <div className="mt-4 text-gray-500 text-sm">
                  {currentCrypto.description}
                </div>
              )}
            </div>
          </div>

          {/* Chart Container avec mode plein écran */}
          <div
            id="trading-chart-container"
            className={`glass-effect rounded-2xl border border-gray-800/40 relative overflow-hidden ${
              isFullscreen ? 'bg-[#111827] h-screen w-screen' : ''
            }`}
            style={{ height: isFullscreen ? '100vh' : '70vh' }}
          >
            {isFullscreen && (
              <button
                onClick={exitFullscreen}
                className="absolute top-4 right-4 z-[10000] p-3 bg-gray-800/90 hover:bg-gray-700/90 rounded-xl text-white transition-colors backdrop-blur-sm shadow-lg border border-gray-600/50"
                title="Quitter le plein écran (Échap)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <TradingViewWidget
              key={`${selectedPair}-${refreshKey}`}
              symbol={selectedPair}
              theme="dark"
              width="100%"
              height="100%"
              locale="fr"
              toolbar_bg="#111827"
              allow_symbol_change={false}
              details={true}
              hotlist={false}
              calendar={false}
            />
          </div>

          {/* Actions rapides - MODIFICATION : Boutons conditionnels selon l'état de connexion */}
          <div className="mt-8 flex justify-center space-x-4">
            {user ? (
              <Link 
                href="/backtest" 
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-[#6366F1]/40"
              >
                <Activity className="w-5 h-5" />
                <span>Backtest {currentCrypto.name}</span>
              </Link>
            ) : (
              <div 
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700/50 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                title="Connexion requise pour le backtest"
              >
                <Activity className="w-5 h-5" />
                <span>Backtest {currentCrypto.name}</span>
              </div>
            )}
            
            {user ? (
              <Link 
                href="/portefeuille" 
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-[#F9FAFB] rounded-xl font-medium hover:bg-gray-700/50 hover:border-gray-600/50 transition-all"
              >
                <Wallet className="w-5 h-5" />
                <span>Ajouter au portefeuille</span>
              </Link>
            ) : (
              <div 
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800/30 border border-gray-700/30 text-gray-500 rounded-xl font-medium cursor-not-allowed"
                title="Connexion requise pour la gestion de portefeuille"
              >
                <Wallet className="w-5 h-5" />
                <span>Ajouter au portefeuille</span>
              </div>
            )}
          </div>

          {/* AJOUT : Message d'encouragement pour les utilisateurs non connectés */}
          {!user && (
            <div className="mt-12 glass-effect rounded-2xl p-6 border border-[#6366F1]/40 bg-[#6366F1]/5">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-[#6366F1] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">
                  Analysez vos stratégies avec nos outils avancés
                </h3>
                <p className="text-gray-400 mb-4">
                  Connectez-vous pour accéder au backtest de stratégies et à la gestion de portefeuille
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-6 py-3 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-all font-semibold"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}