"use client"

import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { TrendingUp, Activity, BarChart3, Maximize2, Download, RotateCcw, Search, Star, X, ChevronDown, ChevronUp } from 'lucide-react'
import SupabaseAddToWatchlistButton from '@/components/SupabaseAddToWatchlistButton'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWatchlistContext } from '@/contexts/WatchlistContext'
import TradingViewWidget from '@/components/TradingViewWidget'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices'
import { useTheme } from '@/contexts/ThemeContext'
import ImprovedCryptoSearch from '@/components/CryptoSelector/ImprovedCryptoSearch'

// Composant pour affichage accordéon des listes
function WatchlistAccordion({ watchlists, prices, selectedPair, onCryptoSelect }: any) {
  const { t } = useLanguage()
  const [expandedList, setExpandedList] = useState<string | null>(null)

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
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
                    {list.items?.length || 0} crypto{(list.items?.length || 0) !== 1 ? 's' : ''}
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
              <div className="px-3 pb-3 space-y-1 border-t border-gray-700/30 pt-2">
                {list.items?.map((item: any) => {
                  const cryptoData = prices.find((coin: any) => coin.id === item.crypto_id)
                  const tradingViewSymbol = cryptoData?.tradingview_symbol || `CRYPTO:${item.symbol.toUpperCase()}USD`

                  return (
                    <button
                      key={item.crypto_id}
                      onClick={() => onCryptoSelect(tradingViewSymbol, item.crypto_id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
                        selectedPair === tradingViewSymbol
                          ? 'bg-[#2563EB]/20 border border-[#2563EB]/40'
                          : 'hover:bg-gray-600/30 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {cryptoData?.image && (
                          <img src={cryptoData.image} alt={item.symbol} className="w-6 h-6 rounded-full" />
                        )}
                        <div className="text-left">
                          <div className="font-semibold text-white text-sm">{item.symbol.toUpperCase()}</div>
                          <div className="text-xs text-gray-400">{cryptoData?.name || item.symbol}</div>
                        </div>
                      </div>
                      {cryptoData?.current_price && (
                        <div className="text-right">
                          <div className="font-bold text-white text-sm">${cryptoData.current_price.toLocaleString()}</div>
                          {cryptoData.price_change_percentage_24h !== null && (
                            <div className={`text-xs ${cryptoData.price_change_percentage_24h >= 0 ? 'text-[#2563EB]' : 'text-[#DC2626]'}`}>
                              {cryptoData.price_change_percentage_24h >= 0 ? '+' : ''}{cryptoData.price_change_percentage_24h.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function GraphiquesPageContent() {
  const { t } = useLanguage()
  const { isDarkMode } = useTheme()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { watchlists, loading: watchlistLoading } = useWatchlistContext()

  const [selectedPair, setSelectedPair] = useState('CRYPTO:BTCUSD')
  const [selectedCryptoId, setSelectedCryptoId] = useState('bitcoin')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)

  // Hook pour charger toutes les cryptos depuis CoinGecko
  const { prices, loading, error, refetch, searchCoins } = useExtendedCoinGeckoPrices(250, false)

  const handleCryptoSelection = (symbol: string, cryptoId?: string) => {
    setSelectedPair(symbol)

    // Si cryptoId n'est pas fourni, le trouver à partir du symbol
    if (cryptoId) {
      setSelectedCryptoId(cryptoId)
    } else {
      // Chercher la crypto dans prices par son tradingview_symbol
      const crypto = prices.find(p => p.tradingview_symbol === symbol)
      if (crypto) {
        setSelectedCryptoId(crypto.id)
      }
    }

    // Fermer le modal
    setShowSearchModal(false)
  }

  const getCryptoInfo = (symbol: string) => {
    const cryptoData = prices.find(p => p.tradingview_symbol === symbol || p.id === selectedCryptoId)

    if (cryptoData) {
      return {
        name: cryptoData.name,
        description: cryptoData.description || 'Cryptomonnaie',
        category: `Top ${cryptoData.market_cap_rank}`,
        price: cryptoData.current_price,
        change24h: cryptoData.price_change_percentage_24h,
        image: cryptoData.image
      }
    }

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

  const currentCrypto = getCryptoInfo(selectedPair)
  const symbolWithoutExchange = selectedPair.includes(':') ? selectedPair.split(':')[1] : selectedPair

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetch()
  }

  // Bloquer le scroll de la page quand le modal est ouvert
  useEffect(() => {
    if (showSearchModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showSearchModal])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const chartContainer = document.getElementById('trading-chart-container')
        if (chartContainer) {
          await chartContainer.requestFullscreen()
          setIsFullscreen(true)
        }
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
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
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Préparer les options de cryptos pour ImprovedCryptoSearch
  const cryptoOptions = useMemo(() => {
    return prices.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      tradingview_symbol: coin.tradingview_symbol || `CRYPTO:${coin.symbol.toUpperCase()}USD`,
      rank: coin.market_cap_rank || 999,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      image: coin.image
    }))
  }, [prices])

  return (
    <>
      <style jsx global>{`
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 1);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-in-out;
        }
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
        }
      `}</style>

      <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-[#0A0E1A]' : 'bg-gray-50'}`}>
        {/* Background Pattern */}
        <div className={`fixed inset-0 pattern-dots ${
          isDarkMode ? 'opacity-30' : 'opacity-10'
        }`}></div>

        <SmartNavigation />

        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
          {/* Header Simple */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className={`${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#F9FAFB] via-[#2563EB] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-shift'
                  : 'text-[#1E293B]'
              }`}>
                {t('charts.page_title')}
              </span>
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('charts.description')}
            </p>
          </div>

          {/* Info Crypto + Bouton Changer (Barre Compacte) */}
          <div className={`rounded-2xl p-4 border mb-6 ${
            isDarkMode ? 'glass-effect border-gray-700/50' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              {/* Info Crypto Actuelle */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-gray-800/50 border border-gray-700/50 p-2">
                  {currentCrypto.image ? (
                    <img src={currentCrypto.image} alt={currentCrypto.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {symbolWithoutExchange.replace(/EUR|USD|USDT/g, '').slice(0, 2) || 'BT'}
                    </span>
                  )}
                </div>
                <div>
                  <div className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'}`}>
                    <span>{symbolWithoutExchange || 'BTCUSD'}</span>
                    <div className="flex items-center space-x-1 bg-[#2563EB]/20 px-2 py-0.5 rounded-full border border-[#2563EB]/30">
                      <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse"></div>
                      <span className="text-[#2563EB] font-bold text-xs">LIVE</span>
                    </div>
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">{currentCrypto.name}</span>
                    <span className="mx-2">•</span>
                    <span className="text-xs bg-[#2563EB]/20 text-[#2563EB] px-2 py-0.5 rounded-full">
                      {currentCrypto.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutons Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="px-4 py-2 bg-[#2563EB]/20 hover:bg-[#2563EB]/30 border border-[#2563EB]/40 text-[#2563EB] rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Changer</span>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 hover:border-[#2563EB]/60 rounded-lg transition-all"
                  title="Plein écran"
                >
                  <Maximize2 className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 hover:border-[#8B5CF6]/60 rounded-lg transition-all"
                  title="Actualiser"
                >
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Graphique TradingView */}
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
              >
                <X className="w-5 h-5" />
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

          {/* Actions rapides */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user && (
              <SupabaseAddToWatchlistButton
                crypto={{
                  id: selectedCryptoId,
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
            )}

            {user && (
              <Link
                href="/backtest"
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#A855F7] text-white rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <Activity className="w-6 h-6" />
                <span>Backtest {currentCrypto.name}</span>
              </Link>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Modal Recherche Simplifié */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowSearchModal(false)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header fixe */}
            <div className="p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Changer de cryptomonnaie</h3>
                <button onClick={() => setShowSearchModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne gauche : Recherche (2/3 de l'espace) */}
                <div className="lg:col-span-2">
                  <ImprovedCryptoSearch
                    cryptoOptions={cryptoOptions}
                    selectedCrypto={selectedPair}
                    onCryptoSelect={(symbol) => handleCryptoSelection(symbol)}
                    searchCoins={searchCoins}
                    hideFilters={true}
                    hideRecentSearches={true}
                  />
                </div>

                {/* Colonne droite : Listes de suivi (1/3 de l'espace) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-[#F59E0B]" />
                      <h3 className="text-base font-semibold text-white">
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
        </div>
      )}
    </>
  )
}

export default function GraphiquesPageSimple() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Chargement...</div>
        </div>
      </div>
    }>
      <GraphiquesPageContent />
    </Suspense>
  )
}
