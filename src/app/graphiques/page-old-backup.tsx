"use client"

// AJOUT : Import pour utiliser la navigation cohérente
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'

import Link from 'next/link'
import { TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Maximize2, Download, RotateCcw, Sparkles, Star } from 'lucide-react'
import SupabaseAddToWatchlistButton from '@/components/SupabaseAddToWatchlistButton'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWatchlistContext } from '@/contexts/WatchlistContext'
import TradingViewWidget from '@/components/TradingViewWidget'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices' // AJOUT
// Remplacez SmartCryptoSelector par un nouveau composant qui utilise les données CoinGecko
import CoinGeckoCryptoSelector from '@/components/CryptoSelector/CoinGeckoCryptoSelector'
import { useTheme } from '@/contexts/ThemeContext'

import { Search, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import ImprovedCryptoSearch from '@/components/CryptoSelector/ImprovedCryptoSearch'

// Composant pour affichage accordéon des listes
function WatchlistAccordion({ watchlists, prices, selectedPair, onCryptoSelect }: any) {
  const { t } = useLanguage()
  const [expandedList, setExpandedList] = useState<string | null>(null)

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
      {watchlists.map((list: any) => {
        const isExpanded = expandedList === list.id

        return (
          <div
            key={list.id}
            className="border border-gray-600/50 bg-gray-800/30 rounded-xl overflow-hidden hover:border-gray-500/50 transition-all"
          >
            {/* Header cliquable de la liste */}
            <button
              onClick={() => setExpandedList(isExpanded ? null : list.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition-all"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: list.color || '#2563EB' }}
                >
                  {list.icon || '📋'}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                    <span>{list.name}</span>
                    {list.is_pinned && <Star className="w-3 h-3 text-[#F59E0B] fill-current" />}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {list.items?.length || 0} {(list.items?.length || 0) !== 1 ? t('charts.cryptos') : t('charts.crypto')}
                  </div>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Cryptos de la liste (accordéon) */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-1 border-t border-gray-700/30 pt-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {list.items?.map((item: any) => {
                  const cryptoData = prices.find((coin: any) => coin.id === item.crypto_id)
                  let tradingViewSymbol = cryptoData?.tradingview_symbol

                  if (!tradingViewSymbol) {
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
                      onClick={() => onCryptoSelect(tradingViewSymbol, item.crypto_id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 group/crypto ${
                        selectedPair === tradingViewSymbol
                          ? 'bg-[#2563EB]/20 border border-[#2563EB]/40'
                          : 'hover:bg-gray-600/30 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-5 h-5 rounded-full" />
                        )}
                        <div className="text-left">
                          <div className="font-semibold text-white text-xs">{item.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <BarChart3 className={`w-3.5 h-3.5 transition-colors ${
                        selectedPair === tradingViewSymbol ? 'text-[#2563EB]' : 'text-gray-400 group-hover/crypto:text-[#2563EB]'
                      }`} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Lien gérer les listes */}
      <Link
        href="/cryptos"
        onClick={() => {
          localStorage.setItem('cryptos-view-mode', 'watchlist')
        }}
        className="block text-center py-2 text-[#2563EB] hover:text-[#8B5CF6] text-sm font-semibold transition-colors"
      >
        {t('charts.manage_lists')}
      </Link>
    </div>
  )
}

// Component that uses useSearchParams - must be wrapped in Suspense
function GraphiquesPageContent() {
  // Hook pour récupérer l'utilisateur connecté (pour conditionner certains boutons)
  const { user } = useAuth()
  const { t } = useLanguage()
  const { isDarkMode } = useTheme()
  const searchParams = useSearchParams()

  const [selectedPair, setSelectedPair] = useState('CRYPTO:BTCUSD')
  const [selectedCryptoId, setSelectedCryptoId] = useState('bitcoin') // ID CoinGecko pour le bouton watchlist
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // AJOUT : Hook pour récupérer les données CoinGecko (augmenté à 250 cryptos)
  const { prices, loading, error, refetch, searchCoins } = useExtendedCoinGeckoPrices(250)

  // AJOUT : Hook pour récupérer les listes de suivi via le contexte (synchronisé)
  const { watchlists, loading: watchlistLoading } = useWatchlistContext()

  // Fonction pour sélectionner une crypto et mettre à jour l'ID CoinGecko
  const handleCryptoSelection = (tradingViewSymbol: string, coinGeckoId?: string) => {
    setSelectedPair(tradingViewSymbol)

    if (coinGeckoId) {
      // ID fourni directement (depuis les listes de suivi)
      setSelectedCryptoId(coinGeckoId)
    } else {
      // Trouver l'ID dans les données CoinGecko (depuis la recherche)
      const cryptoData = prices.find(coin => coin.tradingview_symbol === tradingViewSymbol)
      if (cryptoData?.id) {
        setSelectedCryptoId(cryptoData.id)
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
      // Trouver la crypto dans les données chargées
      const foundCrypto = prices.find(coin => coin.id === cryptoParam)
      if (foundCrypto && foundCrypto.tradingview_symbol) {
        handleCryptoSelection(foundCrypto.tradingview_symbol, foundCrypto.id)
      } else {
        // Si la crypto n'est pas trouvée dans les prix chargés, chercher via l'API
        searchCoins(cryptoParam).then((results) => {
          if (results && results.length > 0) {
            const crypto = results[0]
            if (crypto.tradingview_symbol) {
              handleCryptoSelection(crypto.tradingview_symbol, crypto.id)
            }
          }
        })
      }
    }
  }, [searchParams, prices, searchCoins])

  const currentCrypto = getCryptoInfo(selectedPair)
  const symbolWithoutExchange = selectedPair.includes(':') ? selectedPair.split(':')[1] : selectedPair

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    // Rafraîchir aussi les données CoinGecko
    refetch()
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
          color: #2563EB !important;
        }
      `}</style>
      
      <div className={`min-h-screen relative overflow-hidden ${
        isDarkMode ? 'bg-[#0A0E1A] text-[#F9FAFB]' : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Background Pattern avec effets animés */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>

        {/* Background Effects animés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#4F46E5]/10 via-[#8B5CF6]/8 to-transparent rounded-full blur-[100px] animate-pulse-glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#F59E0B]/10 via-[#A855F7]/6 to-transparent rounded-full blur-[100px] animate-float"></div>
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-[#2563EB]/8 to-transparent rounded-full blur-[100px] opacity-60"></div>
        </div>
        
        {/* MODIFICATION : Utiliser SmartNavigation au lieu de la navigation personnalisée */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
          {/* Page Header Premium */}
          <div className="mb-16 relative">
            {/* Hero background effects */}
            <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#2563EB]/15 via-[#8B5CF6]/8 to-transparent rounded-full blur-[120px] animate-pulse-glow"></div>
            <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-[#A855F7]/12 to-transparent rounded-full blur-[100px] animate-float"></div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12 relative z-10">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-[1.1] py-4">
                  <span className={`font-display ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#F9FAFB] via-[#2563EB] to-[#8B5CF6] bg-clip-text text-transparent'
                      : 'text-[#1E293B]'
                  }`}>
                    {t('charts.page_title')}
                  </span>
                  <div className={`text-2xl md:text-3xl lg:text-4xl font-display font-medium mt-3 ${
                    isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}>
                    {t('charts.advanced_analysis')}
                  </div>
                </h1>
                <p className={`text-xl md:text-2xl font-light max-w-3xl leading-relaxed font-display ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t('charts.description')}
                  {cryptoOptions.length > 0 && (
                    <span className={`block text-lg mt-3 font-semibold ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] bg-clip-text text-transparent'
                        : 'text-[#2563EB]'
                    }`}>
                      {cryptoOptions.length} {t('charts.available_charts')}
                    </span>
                  )}
                </p>
              </div>
              
              <button
                onClick={handleRefresh}
                className={`group flex items-center space-x-3 px-8 py-4 backdrop-blur-xl border rounded-2xl hover:border-[#2563EB]/50 hover:from-[#2563EB]/20 hover:to-[#8B5CF6]/20 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-bold ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/50 text-gray-300 hover:text-white'
                    : 'bg-white/90 border-gray-300 text-gray-700 hover:text-[#2563EB]'
                }`}
              >
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>{t('charts.refresh_data')}</span>
              </button>
            </div>

            {/* Section unifiée : Sélectionner une cryptomonnaie */}
            <div className="mb-6">
              <div className={`rounded-2xl border p-5 ${
                isDarkMode
                  ? 'glass-effect border-gray-800/40'
                  : 'bg-white/95 border-gray-200/60'
              }`}>
                {/* Header de la section */}
                <div className="mb-5">
                  <h2 className={`text-xl font-bold mb-2 flex items-center space-x-2 ${
                    isDarkMode ? 'text-white' : 'text-[#1E293B]'
                  }`}>
                    <BarChart3 className="w-5 h-5 text-[#2563EB]" />
                    <span>{t('charts.select_crypto')}</span>
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('charts.search_among')} {cryptoOptions.length} {t('charts.cryptos_or_lists')}
                  </p>
                </div>

                {/* Grille 2 colonnes : Recherche + Listes de suivi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Colonne gauche : Recherche */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <Search className="w-4 h-4 text-[#2563EB]" />
                      <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                        {t('charts.search_crypto')}
                      </h3>
                    </div>

                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-12 bg-gray-700 rounded-xl mb-4"></div>
                        <div className="space-y-2">
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
                        <div className="text-red-400 font-medium mb-2">{t('charts.loading_error')}</div>
                        <div className="text-gray-400 text-sm">{error}</div>
                      </div>
                    ) : (
                      <ImprovedCryptoSearch
                        cryptoOptions={cryptoOptions}
                        selectedCrypto={selectedPair}
                        onCryptoSelect={(symbol) => handleCryptoSelection(symbol)}
                        searchCoins={searchCoins}
                      />
                    )}
                  </div>

                  {/* Colonne droite : Listes de suivi */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                          {t('charts.my_watchlists')}
                        </h3>
                        {user && watchlists.length > 0 && (
                          <div className="text-xs bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] px-2 py-0.5 rounded-full font-bold">
                            {watchlists.length}
                          </div>
                        )}
                      </div>
                    </div>

                    {!user ? (
                      <div className="text-center py-8 border border-gray-700/50 rounded-xl bg-gray-800/30">
                        <Star className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-3">{t('charts.connect_for_lists')}</p>
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-[#8B5CF6] transition-all"
                        >
                          {t('charts.signin')}
                        </Link>
                      </div>
                    ) : watchlists.length === 0 ? (
                      <div className="text-center py-8 border border-gray-700/50 rounded-xl bg-gray-800/30">
                        <Star className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-3">{t('charts.create_first_list')}</p>
                        <Link
                          href="/cryptos"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 hover:border-[#2563EB]/40 rounded-lg text-sm transition-all duration-300"
                        >
                          <Star className="w-4 h-4" />
                          <span>{t('charts.create_list')}</span>
                        </Link>
                      </div>
                    ) : (
                      <WatchlistAccordion
                        watchlists={watchlists}
                        prices={prices}
                        selectedPair={selectedPair}
                        onCryptoSelect={handleCryptoSelection}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message pour encourager à créer des listes si pas connecté ou aucune liste */}
            {user && watchlists.length === 0 && !watchlistLoading && (
              <div className="mb-12">
                <div className={`rounded-3xl border p-12 text-center ${
                  isDarkMode
                    ? 'glass-effect-strong border-gray-700/50'
                    : 'bg-white/95 border-gray-200/60'
                }`}>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <Star className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 font-display ${
                    isDarkMode ? 'text-white' : 'text-[#1E293B]'
                  }`}>
                    {t('charts.create_first_lists')}
                  </h3>
                  <p className={`mb-6 max-w-md mx-auto font-display ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {t('charts.organize_favorites')}
                  </p>
                  <Link
                    href="/cryptos"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 hover:border-[#2563EB]/40 rounded-2xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <Star className="w-5 h-5" />
                    <span>{t('charts.create_my_first_list')}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Info Crypto Premium avec données CoinGecko */}
            <div className={`rounded-2xl p-5 border mb-8 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 ${
              isDarkMode
                ? 'glass-effect-strong border-gray-700/50'
                : 'bg-white/95 border-gray-200/60'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2563EB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>


              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-800/50 border border-gray-700/50 p-2">
                    {currentCrypto.image ? (
                      <img
                        src={currentCrypto.image}
                        alt={currentCrypto.name}
                        className="w-full h-full object-contain rounded-xl relative z-10"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className={`text-white text-2xl font-bold font-display relative z-10 ${currentCrypto.image ? 'hidden' : ''}`}>
                      {symbolWithoutExchange.replace(/EUR|USD|USDT/g, '').slice(0, 2) || 'BT'}
                    </span>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold flex flex-wrap items-center gap-2 mb-1 font-display ${
                      isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                    }`}>
                      <span className={`${
                        isDarkMode
                          ? 'bg-gradient-to-r from-[#F9FAFB] to-[#2563EB] bg-clip-text text-transparent'
                          : 'text-[#1E293B]'
                      }`}>
                        {symbolWithoutExchange || 'BTCUSD'}
                      </span>
                      <div className="flex items-center space-x-1.5 bg-[#2563EB]/20 px-2 py-0.5 rounded-full border border-[#2563EB]/30">
                        <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse-glow shadow-lg shadow-[#2563EB]/50"></div>
                        <span className="text-[#2563EB] font-bold text-xs">LIVE</span>
                      </div>
                    </div>
                    <div className={`flex flex-wrap items-center gap-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span className="font-semibold font-display">{currentCrypto.name}</span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-[#2563EB]/20 to-[#8B5CF6]/20 text-[#2563EB] rounded-full text-xs font-bold border border-[#2563EB]/30">
                        {currentCrypto.category}
                      </span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">
                        {t('charts.price_from_tradingview')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="group/btn p-2.5 rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-[#2563EB]/20 hover:to-[#3B82F6]/20 border border-gray-600/50 hover:border-[#2563EB]/60 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[#2563EB]/20"
                    title={t('charts.fullscreen_mode')}
                  >
                    <Maximize2 className="w-5 h-5 text-gray-400 group-hover/btn:text-[#2563EB] transition-colors" />
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="group/btn p-2.5 rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-[#8B5CF6]/20 hover:to-[#7C3AED]/20 border border-gray-600/50 hover:border-[#8B5CF6]/60 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[#8B5CF6]/20"
                    title={t('charts.refresh')}
                  >
                    <RotateCcw className="w-5 h-5 text-gray-400 group-hover/btn:text-[#8B5CF6] group-hover/btn:rotate-180 transition-all duration-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container avec mode plein écran */}
          <div
            id="trading-chart-container"
            className={`glass-effect rounded-2xl border border-gray-800/40 relative overflow-hidden ${
              isFullscreen ? 'bg-[#0A0E1A] h-screen w-screen' : ''
            }`}
            style={{ height: isFullscreen ? '100vh' : '70vh' }}
          >
            {isFullscreen && (
              <button
                onClick={exitFullscreen}
                className="absolute top-4 right-4 z-[10000] p-3 bg-gray-800/90 hover:bg-gray-700/90 rounded-xl text-white transition-colors backdrop-blur-sm shadow-lg border border-gray-600/50"
                title={t('charts.exit_fullscreen')}
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
              toolbar_bg="#0A0E1A"
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
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#A855F7] text-white rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-[#2563EB]/40 relative overflow-hidden"
              >
                <Activity className="w-6 h-6 animate-pulse" />
                <span>{t('charts.backtest')} {currentCrypto.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
              </Link>
            ) : (
              <div
                className="flex items-center space-x-3 px-8 py-4 bg-gray-700/50 text-gray-500 rounded-2xl font-bold cursor-not-allowed opacity-60"
                title={t('charts.login_required_backtest')}
              >
                <Activity className="w-6 h-6" />
                <span>{t('charts.backtest')} {currentCrypto.name}</span>
              </div>
            )}

            {/* Bouton Portefeuille */}
            {user ? (
              <Link
                href="/portefeuille"
                className="group flex items-center space-x-3 px-8 py-4 glass-effect-strong border border-gray-600/50 text-[#F9FAFB] rounded-2xl font-bold hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <Wallet className="w-6 h-6" />
                <span>{t('charts.add_to_portfolio')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
              </Link>
            ) : (
              <div
                className="flex items-center space-x-3 px-8 py-4 bg-gray-800/30 border border-gray-700/30 text-gray-500 rounded-2xl font-bold cursor-not-allowed opacity-60"
                title={t('charts.login_required_portfolio')}
              >
                <Wallet className="w-6 h-6" />
                <span>{t('charts.add_to_portfolio')}</span>
              </div>
            )}

            {/* Bouton Cryptos - Navigation vers la page cryptomonnaies */}
            <Link
              href="/cryptos"
              className="group flex items-center space-x-3 px-8 py-4 glass-effect-strong border border-gray-600/50 text-gray-300 hover:text-white rounded-2xl font-bold hover:border-[#2563EB]/50 transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <BarChart3 className="w-6 h-6 group-hover:text-[#2563EB]" />
              <span>{t('charts.explore_cryptos')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2563EB]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </Link>
          </div>

          {/* AJOUT : Message d'encouragement pour les utilisateurs non connectés */}
          {!user && (
            <div className={`mt-12 rounded-2xl p-6 border border-[#2563EB]/40 bg-[#2563EB]/5 ${
              isDarkMode ? 'glass-effect' : 'bg-blue-50/90'
            }`}>
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-[#2563EB] mx-auto mb-4" />
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                }`}>
                  {t('charts.analyze_strategies')}
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('charts.connect_for_tools')}
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#8B5CF6] transition-all font-semibold"
                >
                  {t('charts.signin')}
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

export default function GraphiquesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <GraphiquesPageContent />
    </Suspense>
  )
}