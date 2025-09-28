"use client"

// AJOUT : Import pour utiliser la navigation cohérente
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'

import Link from 'next/link'
import { TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Maximize2, Download, RotateCcw, Sparkles, Star } from 'lucide-react'
import SupabaseAddToWatchlistButton from '@/components/SupabaseAddToWatchlistButton'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWatchlistContext } from '@/contexts/WatchlistContext'
import TradingViewWidget from '@/components/TradingViewWidget'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices' // AJOUT
// Remplacez SmartCryptoSelector par un nouveau composant qui utilise les données CoinGecko
import CoinGeckoCryptoSelector from '@/components/CryptoSelector/CoinGeckoCryptoSelector'

import { Search, AlertCircle } from 'lucide-react'
import ImprovedCryptoSearch from '@/components/CryptoSelector/ImprovedCryptoSearch'

export default function GraphiquesPage() {
  // Hook pour récupérer l'utilisateur connecté (pour conditionner certains boutons)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [selectedPair, setSelectedPair] = useState('CRYPTO:BTCUSD')
  const [selectedCryptoId, setSelectedCryptoId] = useState('bitcoin') // ID CoinGecko pour le bouton watchlist
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // AJOUT : Hook pour récupérer les données CoinGecko (réduit pour optimiser)
  const { prices, loading, error } = useExtendedCoinGeckoPrices(50)

  // AJOUT : Hook pour récupérer les listes de suivi via le contexte (synchronisé)
  const { watchlists, loading: watchlistLoading } = useWatchlistContext()

  // Fonction pour sélectionner une crypto et mettre à jour l'ID CoinGecko
  const handleCryptoSelection = (tradingViewSymbol: string, coinGeckoId?: string) => {
    setSelectedPair(tradingViewSymbol)

    if (coinGeckoId) {
      // ID fourni directement (depuis les listes de suivi)
      setSelectedCryptoId(coinGeckoId)
      console.log('🎯 SELECTION - Direct ID provided:', coinGeckoId, 'for symbol:', tradingViewSymbol)
    } else {
      // Trouver l'ID dans les données CoinGecko (depuis la recherche)
      const cryptoData = prices.find(coin => coin.tradingview_symbol === tradingViewSymbol)
      if (cryptoData?.id) {
        setSelectedCryptoId(cryptoData.id)
        console.log('🎯 SELECTION - Found ID in data:', cryptoData.id, 'for symbol:', tradingViewSymbol)
      } else {
        // Fallback - mapping manuel
        const cleanSymbol = tradingViewSymbol.replace(/CRYPTO:|USD|EUR|USDT/g, '').toLowerCase()
        const symbolToIdMapping: Record<string, string> = {
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'bnb': 'binancecoin',
          'ada': 'cardano',
          'sol': 'solana',
          'dot': 'polkadot',
          'avax': 'avalanche-2',
          'matic': 'polygon',
          'uni': 'uniswap',
          'link': 'chainlink',
          'ltc': 'litecoin',
          'xrp': 'ripple'
        }
        const mappedId = symbolToIdMapping[cleanSymbol] || 'bitcoin'
        setSelectedCryptoId(mappedId)
        console.log('⚠️ SELECTION - Using fallback ID:', mappedId, 'for symbol:', cleanSymbol)
      }
    }
  }

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

  // AJOUT : Préparer les options pour le sélecteur depuis CoinGecko (TOUTES les cryptos maintenant)
  const cryptoOptions = useMemo(() => {
    return prices.map(coin => ({
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

  // AJOUT : Gestion de la sélection automatique via URL
  useEffect(() => {
    const cryptoParam = searchParams.get('crypto')
    if (cryptoParam && prices.length > 0) {
      // Trouver la crypto dans les données
      const foundCrypto = prices.find(coin => coin.id === cryptoParam)
      if (foundCrypto && foundCrypto.tradingview_symbol) {
        console.log('🔗 URL: Sélection automatique de', foundCrypto.name, 'avec symbol', foundCrypto.tradingview_symbol)
        handleCryptoSelection(foundCrypto.tradingview_symbol, foundCrypto.id)
      } else {
        console.log('⚠️ URL: Crypto non trouvée ou pas de symbol TradingView pour:', cryptoParam)
      }
    }
  }, [searchParams, prices])

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

        .glass-effect-strong {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .font-display {
          font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(8px) rotate(-1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 20px currentColor;
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 40px currentColor;
          }
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
        {/* Background Pattern avec effets animés */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>

        {/* Background Effects animés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#6366F1]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px] animate-pulse-glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#A855F7]/8 to-transparent rounded-full blur-[100px] animate-float"></div>
        </div>
        
        {/* MODIFICATION : Utiliser SmartNavigation au lieu de la navigation personnalisée */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
          {/* Page Header Premium */}
          <div className="mb-16 relative">
            {/* Hero background effects */}
            <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#6366F1]/15 via-[#8B5CF6]/8 to-transparent rounded-full blur-[120px] animate-pulse-glow"></div>
            <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-[#A855F7]/12 to-transparent rounded-full blur-[100px] animate-float"></div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12 relative z-10">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1] py-4">
                  <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent animate-gradient-shift font-display flex items-center justify-center lg:justify-start space-x-4">
                    <span>Graphiques</span>
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-[#6366F1] animate-pulse" />
                  </span>
                  <div className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent font-display font-semibold mt-4 animate-shimmer">
                    Analyse Technique Avancée
                  </div>
                </h1>
                <p className="text-gray-300 text-xl md:text-2xl font-light max-w-3xl leading-relaxed font-display">
                  Graphiques TradingView professionnels et outils d'analyse technique pour les cryptomonnaies
                  {cryptoOptions.length > 0 && (
                    <span className="block text-lg mt-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent font-semibold">
                      {cryptoOptions.length} cryptomonnaies avec graphiques disponibles
                    </span>
                  )}
                </p>
              </div>
              
              <button
                onClick={handleRefresh}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/50 rounded-2xl text-gray-300 hover:text-white hover:border-[#6366F1]/50 hover:from-[#6366F1]/20 hover:to-[#8B5CF6]/20 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-bold"
              >
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Actualiser les Données</span>
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
                    Sélectionnez parmi {cryptoOptions.length} cryptomonnaies avec graphiques professionnels
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
                    onCryptoSelect={(symbol) => handleCryptoSelection(symbol)}
                />
                )}
            </div>
            </div>

            {/* Mes Listes de Suivi - Section pour naviguer rapidement */}
            {user && watchlists.length > 0 && (
              <div className="mb-12">
                <div className="glass-effect-strong rounded-3xl border border-gray-700/50 p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-3 flex items-center space-x-3 font-display">
                      <div className="p-2 bg-[#F59E0B]/20 rounded-xl">
                        <Star className="w-6 h-6 text-[#F59E0B]" />
                      </div>
                      <span>Mes Listes de Suivi</span>
                      <div className="text-sm bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] px-3 py-1 rounded-full font-bold">
                        {watchlists.length} liste{watchlists.length > 1 ? 's' : ''}
                      </div>
                    </h2>
                    <p className="text-gray-400 font-display">
                      Accédez rapidement aux graphiques de vos cryptomonnaies favorites
                    </p>
                  </div>

                  {/* Grille des listes de suivi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {watchlists.map((list) => (
                      <div
                        key={list.id}
                        className="relative p-6 rounded-2xl border border-gray-600/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 hover:scale-105 group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>

                        {/* Header de la liste */}
                        <div className="flex items-center space-x-4 mb-4 relative z-10">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                            style={{ backgroundColor: list.color || '#6366F1' }}
                          >
                            {list.icon || '📋'}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-white text-lg font-display flex items-center space-x-2">
                              <span>{list.name}</span>
                              {list.is_pinned && <Star className="w-4 h-4 text-[#F59E0B] fill-current" />}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {list.items?.length || 0} crypto{(list.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Cryptos de la liste avec boutons graphiques */}
                        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-gray-800/20 scrollbar-thumb-gray-600/50 relative z-10">
                          {list.items?.map((item: any) => {
                            // Trouver les données TradingView pour cette crypto
                            const cryptoData = prices.find(coin => coin.id === item.crypto_id)
                            // Améliorer le mapping TradingView avec fallbacks plus intelligents
                            let tradingViewSymbol = cryptoData?.tradingview_symbol

                            if (!tradingViewSymbol) {
                              // Fallback intelligent selon le symbol - utilisation du format CRYPTO: avec USD
                              const upperSymbol = item.symbol.toUpperCase()
                              if (upperSymbol === 'BTC') tradingViewSymbol = 'CRYPTO:BTCUSD'
                              else if (upperSymbol === 'ETH') tradingViewSymbol = 'CRYPTO:ETHUSD'
                              else if (upperSymbol === 'BNB') tradingViewSymbol = 'CRYPTO:BNBUSD'
                              else if (upperSymbol === 'ADA') tradingViewSymbol = 'CRYPTO:ADAUSD'
                              else if (upperSymbol === 'SOL') tradingViewSymbol = 'CRYPTO:SOLUSD'
                              else if (upperSymbol === 'DOT') tradingViewSymbol = 'CRYPTO:DOTUSD'
                              else if (upperSymbol === 'AVAX') tradingViewSymbol = 'CRYPTO:AVAXUSD'
                              else if (upperSymbol === 'MATIC') tradingViewSymbol = 'CRYPTO:MATICUSD'
                              else if (upperSymbol === 'UNI') tradingViewSymbol = 'CRYPTO:UNIUSD'
                              else if (upperSymbol === 'LINK') tradingViewSymbol = 'CRYPTO:LINKUSD'
                              else if (upperSymbol === 'LTC') tradingViewSymbol = 'CRYPTO:LTCUSD'
                              else if (upperSymbol === 'XRP') tradingViewSymbol = 'CRYPTO:XRPUSD'
                              else tradingViewSymbol = `CRYPTO:${upperSymbol}USD`
                            }

                            return (
                              <button
                                key={item.crypto_id}
                                onClick={() => handleCryptoSelection(tradingViewSymbol, item.crypto_id)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group/crypto ${
                                  selectedPair === tradingViewSymbol
                                    ? 'bg-[#6366F1]/20 border border-[#6366F1]/40 shadow-lg shadow-[#6366F1]/20'
                                    : 'hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {item.image && (
                                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                                  )}
                                  <div className="text-left">
                                    <div className="font-semibold text-white text-sm">{item.symbol.toUpperCase()}</div>
                                    <div className="text-gray-400 text-xs">{item.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {selectedPair === tradingViewSymbol && (
                                    <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-pulse"></div>
                                  )}
                                  <BarChart3 className={`w-4 h-4 transition-colors ${
                                    selectedPair === tradingViewSymbol ? 'text-[#6366F1]' : 'text-gray-400 group-hover/crypto:text-[#6366F1]'
                                  }`} />
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Liens vers la gestion des listes */}
                  <div className="mt-8 text-center">
                    <Link
                      href="/cryptos"
                      onClick={() => {
                        // Forcer le mode watchlist via localStorage pour synchronisation
                        localStorage.setItem('cryptos-view-mode', 'watchlist')
                      }}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#6366F1]/40 text-[#6366F1] rounded-xl font-bold hover:scale-105 transition-all duration-300"
                    >
                      <Star className="w-5 h-5" />
                      <span>Gérer mes listes</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Message pour encourager à créer des listes si pas connecté ou aucune liste */}
            {user && watchlists.length === 0 && !watchlistLoading && (
              <div className="mb-12">
                <div className="glass-effect-strong rounded-3xl border border-gray-700/50 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-display">
                    Créez vos premières listes de suivi
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto font-display">
                    Organisez vos cryptomonnaies favorites et accédez rapidement à leurs graphiques depuis cette page
                  </p>
                  <Link
                    href="/cryptos"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    <Star className="w-5 h-5" />
                    <span>Créer ma première liste</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Info Crypto Premium avec données CoinGecko */}
            <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50 mb-12 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>


              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                <div className="flex items-center space-x-6">
                  <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] p-3 animate-pulse-glow">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-3xl blur-xl"></div>
                    {currentCrypto.image ? (
                      <img
                        src={currentCrypto.image}
                        alt={currentCrypto.name}
                        className="w-full h-full object-contain rounded-2xl relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className={`text-white text-3xl font-bold font-display relative z-10 ${currentCrypto.image ? 'hidden' : ''}`}>
                      {symbolWithoutExchange.replace(/EUR|USD|USDT/g, '').slice(0, 2) || 'BT'}
                    </span>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#F9FAFB] flex flex-wrap items-center gap-4 mb-2 font-display">
                      <span className="bg-gradient-to-r from-[#F9FAFB] to-[#6366F1] bg-clip-text text-transparent">{symbolWithoutExchange || 'BTCUSD'}</span>
                      {currentCrypto.price && (
                        <span className="text-2xl text-gray-300 font-mono">
                          ${currentCrypto.price.toLocaleString('en-US', {
                            minimumFractionDigits: currentCrypto.price < 1 ? 4 : 2,
                            maximumFractionDigits: currentCrypto.price < 1 ? 4 : 2
                          })}
                        </span>
                      )}
                      <div className="flex items-center space-x-2 bg-[#16A34A]/20 px-3 py-1 rounded-full border border-[#16A34A]/30">
                        <div className="w-3 h-3 bg-[#16A34A] rounded-full animate-pulse-glow shadow-lg shadow-[#16A34A]/50"></div>
                        <span className="text-[#16A34A] font-bold text-sm">LIVE</span>
                      </div>
                    </div>
                    <div className="text-gray-300 flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-lg font-display">{currentCrypto.name}</span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span className="px-3 py-1 bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#6366F1] rounded-full text-sm font-bold border border-[#6366F1]/30">
                        {currentCrypto.category}
                      </span>
                      {currentCrypto.change24h && (
                        <>
                          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                          <span className={`font-bold text-lg px-3 py-1 rounded-full ${
                            currentCrypto.change24h >= 0
                              ? 'text-[#16A34A] bg-[#16A34A]/10 border border-[#16A34A]/30'
                              : 'text-[#DC2626] bg-[#DC2626]/10 border border-[#DC2626]/30'
                          }`}>
                            {currentCrypto.change24h >= 0 ? '+' : ''}
                            {currentCrypto.change24h.toFixed(2)}%
                          </span>
                        </>
                      )}
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-400 text-sm font-mono">TradingView Pro</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={toggleFullscreen}
                    className="group/btn p-4 rounded-2xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-[#6366F1]/20 hover:to-[#4F46E5]/20 border border-gray-600/50 hover:border-[#6366F1]/60 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[#6366F1]/20"
                    title="Mode plein écran"
                  >
                    <Maximize2 className="w-6 h-6 text-gray-400 group-hover/btn:text-[#6366F1] transition-colors" />
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="group/btn p-4 rounded-2xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-[#8B5CF6]/20 hover:to-[#7C3AED]/20 border border-gray-600/50 hover:border-[#8B5CF6]/60 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[#8B5CF6]/20"
                    title="Actualiser le graphique"
                  >
                    <RotateCcw className="w-6 h-6 text-gray-400 group-hover/btn:text-[#8B5CF6] group-hover/btn:rotate-180 transition-all duration-500" />
                  </button>
                </div>
              </div>

              {currentCrypto.description && (
                <div className="mt-6 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                  <div className="text-gray-300 font-medium font-display">
                    {currentCrypto.description}
                  </div>
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

          {/* Actions rapides Premium */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {/* Bouton Watchlist - toujours disponible si connecté */}
            {user && (
              <div className="transform hover:scale-110 transition-transform duration-300">
                <SupabaseAddToWatchlistButton
                  crypto={{
                    id: selectedCryptoId, // Utilisation directe de l'ID stocké
                    symbol: symbolWithoutExchange.replace(/USD|EUR|USDT/g, ''),
                    name: currentCrypto.name,
                    image: currentCrypto.image,
                    current_price: currentCrypto.price,
                    price_change_percentage_24h: currentCrypto.change24h,
                    market_cap_rank: typeof currentCrypto.category === 'string' && currentCrypto.category.includes('Top') ?
                      parseInt(currentCrypto.category.replace('Top ', '')) : undefined
                  }}
                  className="p-3 text-lg"
                />
              </div>
            )}

            {/* Bouton Backtest */}
            {user ? (
              <Link
                href="/backtest"
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-[#6366F1]/40 relative overflow-hidden"
              >
                <Activity className="w-6 h-6 animate-pulse" />
                <span>Backtest {currentCrypto.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
              </Link>
            ) : (
              <div
                className="flex items-center space-x-3 px-8 py-4 bg-gray-700/50 text-gray-500 rounded-2xl font-bold cursor-not-allowed opacity-60"
                title="Connexion requise pour le backtest"
              >
                <Activity className="w-6 h-6" />
                <span>Backtest {currentCrypto.name}</span>
              </div>
            )}

            {/* Bouton Portefeuille */}
            {user ? (
              <Link
                href="/portefeuille"
                className="group flex items-center space-x-3 px-8 py-4 glass-effect-strong border border-gray-600/50 text-[#F9FAFB] rounded-2xl font-bold hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <Wallet className="w-6 h-6" />
                <span>Ajouter au Portefeuille</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
              </Link>
            ) : (
              <div
                className="flex items-center space-x-3 px-8 py-4 bg-gray-800/30 border border-gray-700/30 text-gray-500 rounded-2xl font-bold cursor-not-allowed opacity-60"
                title="Connexion requise pour la gestion de portefeuille"
              >
                <Wallet className="w-6 h-6" />
                <span>Ajouter au Portefeuille</span>
              </div>
            )}

            {/* Bouton Cryptos - Navigation vers la page cryptomonnaies */}
            <Link
              href="/cryptos"
              className="group flex items-center space-x-3 px-8 py-4 glass-effect-strong border border-gray-600/50 text-gray-300 hover:text-white rounded-2xl font-bold hover:border-[#6366F1]/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <BarChart3 className="w-6 h-6 group-hover:text-[#6366F1]" />
              <span>Explorer les Cryptos</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6366F1]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </Link>
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

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}