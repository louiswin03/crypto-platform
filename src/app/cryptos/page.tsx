"use client"

// AJOUT : Import pour utiliser la navigation cohérente
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCw, Loader2, AlertCircle, Clock, Eye, EyeOff, MoreHorizontal, ExternalLink, Image as ImageIcon, Calendar, Layers, ChevronDown, ChevronUp, Sparkles, Crown, TrendingUp as Rising, TrendingDown as Falling, Trophy, BarChart2, Menu, Bookmark, Heart, List, X, Trash2, Lock } from 'lucide-react'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices'
import { useWatchlistContext } from '@/contexts/WatchlistContext'
import { WatchlistDetailView } from '@/components/Watchlists'
import SupabaseAddToWatchlistButton from '@/components/SupabaseAddToWatchlistButton'
import CreateWatchlistModal from '@/components/CreateWatchlistModal'
import FearAndGreedIndex from '@/components/FearAndGreedIndex'
import { useState, useMemo, useEffect } from 'react'

type SortField = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'total_volume' | 'market_cap_rank' | 'ath_change_percentage'
type ViewMode = 'market' | 'watchlist'

export default function CompleteCryptosPage() {
  // Hook pour récupérer l'utilisateur connecté (pour les fonctionnalités watchlist)
  const { user } = useAuth()
  const { t } = useLanguage()

  const { prices, stats, loading, error, hasMore, totalCoins, refetch, loadMore, getCoinsWithTradingView, searchCoins, sortCoins, formatters } = useExtendedCoinGeckoPrices(50)
  const {
    watchlists,
    activeWatchlist,
    currentWatchlist,
    loading: watchlistLoading,
    error: watchlistError,
    getTotalWatchedCryptos,
    getWatchlistStats,
    isInWatchlist,
    createWatchlist,
    setActiveWatchlist,
    deleteWatchlist,
    clearError
  } = useWatchlistContext()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('market_cap_rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('market')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showOnlyTradingView, setShowOnlyTradingView] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Gestion du mode de vue en fonction de la watchlist active et localStorage
  useEffect(() => {
    // Vérifier d'abord le localStorage pour une redirection depuis graphiques
    const savedViewMode = localStorage.getItem('cryptos-view-mode')
    if (savedViewMode === 'watchlist' && user) {
      setViewMode('watchlist')
      localStorage.removeItem('cryptos-view-mode') // Nettoyer après usage
      return
    }

    // Logique normale
    if (user && activeWatchlist && activeWatchlist !== 'market') {
      setViewMode('watchlist')
    } else {
      setViewMode('market')
    }
  }, [activeWatchlist, user]) // Ajout de user dans les dépendances

  // Filtrage et tri avancés pour la vue marché
  const filteredAndSortedCryptos = useMemo(() => {
    if (viewMode === 'watchlist') return []
    
    let filtered = searchTerm ? searchCoins(searchTerm) : prices

    // Filtre TradingView
    if (showOnlyTradingView) {
      filtered = filtered.filter(coin => coin.has_tradingview)
    }

    return sortCoins(filtered, sortBy, sortOrder)
  }, [prices, searchTerm, sortBy, sortOrder, showOnlyTradingView, viewMode, searchCoins, sortCoins])

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder(field === 'market_cap_rank' ? 'asc' : 'desc')
    }
  }

  const topGainers = prices.slice().sort((a, b) => ((b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))).slice(0, 5)
  const topLosers = prices.slice().sort((a, b) => ((a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))).slice(0, 5)
  const totalWatchedCryptos = getTotalWatchedCryptos()

  return (
    <>
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

        .text-shadow {
          text-shadow: 0 2px 20px rgba(99, 102, 241, 0.3);
        }

        .text-shadow-xl {
          text-shadow: 0 4px 30px rgba(99, 102, 241, 0.4), 0 2px 10px rgba(0, 0, 0, 0.8);
        }

        .glow-effect {
          box-shadow: 0 0 50px rgba(99, 102, 241, 0.15);
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

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-shimmer-sweep {
          animation: shimmer-sweep 2s ease-in-out infinite;
        }

        .animate-counter {
          animation: counter 0.8s ease-out;
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

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes counter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-track-gray-800\/20 {
          scrollbar-color: rgba(107, 114, 128, 0.5) rgba(31, 41, 55, 0.2);
        }

        .scrollbar-thumb-gray-600\/50::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-thumb-gray-600\/50::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.2);
        }

        .scrollbar-thumb-gray-600\/50::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 4px;
        }

        .scrollbar-thumb-gray-600\/50::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }

        .font-display {
          font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        }
        
        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .crypto-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* MODIFICATION : Utiliser SmartNavigation au lieu de la navigation personnalisée */}
        <SmartNavigation />

        {/* Main Content - Interface simplifiée sans sidebar */}
        <main className="relative">
            <div className="px-6 lg:px-8 pt-12 pb-20">
              {/* Page Header avec Toggle Mode */}
              <div className="mb-16 relative">
                {/* Hero background effects */}
                <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#6366F1]/20 via-[#8B5CF6]/10 to-transparent rounded-full blur-[120px] animate-pulse-glow"></div>
                <div className="absolute -top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-[#A855F7]/15 to-transparent rounded-full blur-[100px] animate-float"></div>

                <div className="flex flex-col gap-10 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="text-center lg:text-left">
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1] py-4">
                        {viewMode === 'market' ? (
                          <>
                            <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent animate-gradient-shift font-display">
                              Cryptomonnaies
                            </span>
                            {totalCoins > 0 && (
                              <div className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent font-display font-semibold mt-4 animate-shimmer">
                                {totalCoins}+ marchés en temps réel
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent animate-gradient-shift font-display">
                            {t('cryptos.my_watchlists')}
                          </span>
                        )}
                      </h1>
                      <p className="text-gray-300 text-xl md:text-2xl font-light max-w-3xl leading-relaxed font-display">
                        {viewMode === 'market'
                          ? `Analysez ${totalCoins}+ cryptomonnaies ${user ? 'avec votre système de listes personnalisées avancé' : '• Connectez-vous pour débloquer les listes personnalisées et le backtest professionnel'}`
                          : `Organisez et surveillez vos ${totalWatchedCryptos} cryptomonnaies favorites réparties dans ${watchlists.length} listes intelligentes`
                        }
                      </p>
                    </div>
                    
                    {/* Onglets professionnels avec glass morphism */}
                    <div className="flex items-center justify-center lg:justify-end">
                      <div className="glass-effect-strong rounded-2xl p-2 border border-gray-700/50 shadow-2xl backdrop-blur-xl">
                        <button
                          onClick={() => setViewMode('market')}
                          className={`group flex items-center space-x-4 px-8 py-4 rounded-xl font-bold transition-all duration-500 relative overflow-hidden ${
                            viewMode === 'market'
                              ? 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white shadow-2xl shadow-[#6366F1]/40 scale-105 glow-effect'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:scale-102'
                          }`}
                        >
                          <TrendingUp className={`w-6 h-6 transition-all duration-300 ${
                            viewMode === 'market' ? 'animate-pulse' : 'group-hover:scale-110'
                          }`} />
                          <span className="text-lg">{t('cryptos.market_global')}</span>
                          <div className={`text-sm px-3 py-1 rounded-full font-bold ${
                            viewMode === 'market'
                              ? 'bg-white/25 text-white animate-shimmer'
                              : 'bg-gray-700/50 text-gray-400'
                          }`}>
                            {prices.length}
                          </div>
                          {viewMode === 'market' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep"></div>
                          )}
                        </button>
                        <button
                          onClick={() => setViewMode('watchlist')}
                          className={`group flex items-center space-x-4 px-8 py-4 rounded-xl font-bold transition-all duration-500 relative overflow-hidden ${
                            viewMode === 'watchlist'
                              ? 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white shadow-2xl shadow-[#6366F1]/40 scale-105 glow-effect'
                              : user ? 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:scale-102' : 'text-gray-500 cursor-not-allowed opacity-60'
                          }`}
                          disabled={!user}
                          title={!user ? t('cryptos.connection_required') : t('cryptos.your_custom_lists')}
                        >
                          <Star className={`w-6 h-6 transition-all duration-300 ${
                            viewMode === 'watchlist' ? 'animate-pulse' : user ? 'group-hover:scale-110' : ''
                          }`} />
                          <span className="text-lg">{t('cryptos.my_lists')}</span>
                          {user && watchlists.length > 0 ? (
                            <div className={`text-sm px-3 py-1 rounded-full font-bold ${
                              viewMode === 'watchlist'
                                ? 'bg-[#F59E0B] text-white animate-bounce-subtle'
                                : 'bg-[#F59E0B]/80 text-white'
                            }`}>
                              {watchlists.length}
                            </div>
                          ) : !user ? (
                            <div className="text-sm bg-gray-600/50 px-3 py-1 rounded-full flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>PRO</span>
                            </div>
                          ) : (
                            <div className="text-sm bg-gray-700/50 text-gray-400 px-3 py-1 rounded-full">
                              0
                            </div>
                          )}
                          {viewMode === 'watchlist' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep"></div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats Grid Premium avec animations */}
                  {viewMode === 'market' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-3xl font-bold text-[#16A34A] mb-2 font-mono text-shadow animate-counter">
                            {stats ? formatters.marketCap(stats.totalMarketCap) : '---'}
                          </div>
                          <div className="text-gray-300 text-sm font-semibold tracking-wide">{t('cryptos.market_cap_global')}</div>
                          <div className="text-xs text-[#16A34A] mt-2 opacity-70">{t('cryptos.total_markets')}</div>
                        </div>
                        {!loading && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-[#16A34A] rounded-full animate-pulse-glow shadow-lg shadow-[#16A34A]/50"></div>
                        )}
                      </div>

                      <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-3xl font-bold text-[#6366F1] mb-2 font-mono text-shadow animate-counter">
                            {stats ? formatters.marketCap(stats.totalVolume) : '---'}
                          </div>
                          <div className="text-gray-300 text-sm font-semibold tracking-wide">{t('cryptos.volume_24h')}</div>
                          <div className="text-xs text-[#6366F1] mt-2 opacity-70">{t('cryptos.global_trading')}</div>
                        </div>
                        {!loading && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-[#6366F1] rounded-full animate-pulse-glow shadow-lg shadow-[#6366F1]/50"></div>
                        )}
                      </div>

                      <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-3xl font-bold text-[#F59E0B] mb-2 font-mono text-shadow">
                            {stats ? `${stats.btcDominance.toFixed(1)}%` : '---'}
                          </div>
                          <div className="text-gray-300 text-sm font-semibold tracking-wide">{t('cryptos.dominance_btc')}</div>
                          <div className="text-xs text-[#F59E0B] mt-2 opacity-70">{t('cryptos.market_share')}</div>
                        </div>
                      </div>

                      <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-3xl font-bold text-[#8B5CF6] mb-2 font-mono text-shadow">
                            {stats ? `${stats.ethDominance.toFixed(1)}%` : '---'}
                          </div>
                          <div className="text-gray-300 text-sm font-semibold tracking-wide">{t('cryptos.dominance_eth')}</div>
                          <div className="text-xs text-[#8B5CF6] mt-2 opacity-70">Altcoin leader</div>
                        </div>
                      </div>

                      <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F9FAFB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-3xl font-bold text-[#F9FAFB] mb-2 font-mono text-shadow animate-counter">
                            {prices.length}
                          </div>
                          <div className="text-gray-300 text-sm font-semibold tracking-wide">Cryptos Live</div>
                          <div className="text-xs text-gray-400 mt-2 opacity-70">Données temps réel</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Stats watchlists premium avec animations
                    user && viewMode === 'watchlist' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-4xl font-bold text-[#F59E0B] mb-3 font-mono text-shadow animate-counter">
                              {totalWatchedCryptos}
                            </div>
                            <div className="text-gray-300 text-sm font-semibold tracking-wide">Cryptos Suivies</div>
                            <div className="text-xs text-[#F59E0B] mt-2 opacity-70">Votre portfolio</div>
                          </div>
                        </div>

                        <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-4xl font-bold text-[#6366F1] mb-3 font-mono text-shadow animate-counter">
                              {watchlists.length}
                            </div>
                            <div className="text-gray-300 text-sm font-semibold tracking-wide">Listes Actives</div>
                            <div className="text-xs text-[#6366F1] mt-2 opacity-70">Organisation</div>
                          </div>
                        </div>

                        <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-4xl font-bold text-[#8B5CF6] mb-3 font-mono text-shadow">
                              {watchlists.filter(l => l.is_pinned).length}
                            </div>
                            <div className="text-gray-300 text-sm font-semibold tracking-wide">Listes Épinglées</div>
                            <div className="text-xs text-[#8B5CF6] mt-2 opacity-70">Favoris</div>
                          </div>
                        </div>

                        <div className="glass-effect-strong rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-105 transition-all duration-300 glow-effect">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="text-4xl font-bold text-[#16A34A] mb-3 font-mono text-shadow animate-counter">
                              {watchlists.reduce((sum, list) => sum + list.items.length, 0)}
                            </div>
                            <div className="text-gray-300 text-sm font-semibold tracking-wide">Items Totaux</div>
                            <div className="text-xs text-[#16A34A] mt-2 opacity-70">Surveillance</div>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Fear & Greed Index */}
                  {viewMode === 'market' && (
                    <div className="mb-8">
                      <FearAndGreedIndex />
                    </div>
                  )}

                  {/* Top Gainers & Losers Premium avec animations */}
                  {viewMode === 'market' && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden group hover:scale-102 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <h3 className="flex items-center space-x-3 font-bold text-[#16A34A] mb-6 text-lg">
                            <div className="p-2 bg-[#16A34A]/20 rounded-xl">
                              <Trophy className="w-6 h-6 animate-bounce-subtle" />
                            </div>
                            <span className="text-shadow">{t('cryptos.top_performers')}</span>
                          </h3>
                          <div className="space-y-3">
                            {topGainers.slice(0, 3).map((coin, index) => (
                              <div key={coin.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-gray-400 font-mono text-sm">#{index + 1}</div>
                                  {coin.image && (
                                    <img src={coin.image} alt={coin.name} className="crypto-logo" />
                                  )}
                                  <div>
                                    <div className="font-semibold text-[#F9FAFB] text-sm">{coin.symbol.toUpperCase()}</div>
                                    <div className="text-gray-400 text-xs">{coin.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="text-right">
                                    <div className="font-mono text-[#F9FAFB] text-sm">{formatters.price(coin.current_price)}</div>
                                    <div className="font-mono text-[#16A34A] text-xs font-semibold">
                                      {formatters.percentage(coin.price_change_percentage_24h || 0)}
                                    </div>
                                  </div>
                                  {/* Boutons watchlist affichés seulement si user connecté */}
                                  {user && <SupabaseAddToWatchlistButton crypto={coin} />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden group hover:scale-102 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <h3 className="flex items-center space-x-3 font-bold text-[#DC2626] mb-6 text-lg">
                            <div className="p-2 bg-[#DC2626]/20 rounded-xl">
                              <Falling className="w-6 h-6 animate-bounce-subtle" />
                            </div>
                            <span className="text-shadow">{t('cryptos.top_declines')}</span>
                          </h3>
                          <div className="space-y-3">
                            {topLosers.slice(0, 3).map((coin, index) => (
                              <div key={coin.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-gray-400 font-mono text-sm">#{index + 1}</div>
                                  {coin.image && (
                                    <img src={coin.image} alt={coin.name} className="crypto-logo" />
                                  )}
                                  <div>
                                    <div className="font-semibold text-[#F9FAFB] text-sm">{coin.symbol.toUpperCase()}</div>
                                    <div className="text-gray-400 text-xs">{coin.name}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="text-right">
                                    <div className="font-mono text-[#F9FAFB] text-sm">{formatters.price(coin.current_price)}</div>
                                    <div className="font-mono text-[#DC2626] text-xs font-semibold">
                                      {formatters.percentage(coin.price_change_percentage_24h || 0)}
                                    </div>
                                  </div>
                                  {/* Boutons watchlist affichés seulement si user connecté */}
                                  {user && <SupabaseAddToWatchlistButton crypto={coin} />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenu Principal selon le Mode */}
              {viewMode === 'market' ? (
                <MarketView
                  cryptos={filteredAndSortedCryptos}
                  loading={loading}
                  error={error}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                  formatters={formatters}
                  refetch={refetch}
                  hasMore={hasMore}
                  loadMore={loadMore}
                  user={user}
                  t={t}
                />
              ) : (
                // Watchlist view : accessible seulement si connecté
                user ? (
                  <WatchlistView
                    watchlists={watchlists}
                    activeWatchlist={activeWatchlist}
                    totalWatchedCryptos={getTotalWatchedCryptos()}
                    onCreateWatchlist={() => setShowCreateModal(true)}
                    onDeleteWatchlist={deleteWatchlist}
                    t={t}
                  />
                ) : (
                  <div className="glass-effect rounded-2xl border border-gray-800/40 p-16 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Star className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">
                        Créez vos listes de suivi
                      </h2>
                      <p className="text-gray-400 mb-8 leading-relaxed">
                        Organisez vos cryptomonnaies favorites, suivez leurs performances et créez des listes personnalisées pour une meilleure analyse.
                      </p>
                      <div className="space-y-4">
                        <Link
                          href="/auth/signin"
                          className="block w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                          Se connecter pour commencer
                        </Link>
                        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Bookmark className="w-4 h-4" />
                            <span>Listes illimitées</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Suivi temps réel</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Message pour utilisateurs non connectés - affiché seulement en mode market */}
              {!user && viewMode === 'market' && (
                <div className="mt-8 glass-effect rounded-2xl p-6 border border-[#6366F1]/40 bg-[#6366F1]/5">
                  <div className="text-center">
                    <Star className="w-12 h-12 text-[#6366F1] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">
                      Créez vos listes de suivi personnalisées
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Connectez-vous pour organiser vos cryptomonnaies favorites, accéder au backtest et gérer votre portefeuille
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
            </div>
          </main>

          {/* Modal de création de watchlist */}
          <CreateWatchlistModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateWatchlist={createWatchlist}
            loading={watchlistLoading}
          />

          {/* Affichage des erreurs watchlist */}
          {watchlistError && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border border-red-400/20 max-w-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">Erreur</div>
                    <div className="text-xs opacity-90">{watchlistError}</div>
                  </div>
                  <button
                    onClick={clearError}
                    className="ml-2 p-1 hover:bg-red-600/50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <Footer />
      </div>
    </>
  )
}

// Vue Marché - Fonctionnalité de base accessible à tous
function MarketView({
  cryptos, loading, error, searchTerm, setSearchTerm, sortBy, sortOrder,
  handleSort, formatters,
  refetch, hasMore, loadMore,
  user, t
}: any) {
  return (
    <>
      {/* Filtres et Contrôles Premium */}
      <div className="glass-effect-strong rounded-3xl p-8 mb-12 border border-gray-700/50 space-y-8 shadow-2xl">
        {/* Ligne 1: Search Premium + Filters */}
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 max-w-xl">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="w-6 h-6 text-gray-400 group-hover:text-[#6366F1] transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t('cryptos.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/60 backdrop-blur-xl border border-gray-600/50 rounded-2xl pl-14 pr-6 py-5 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#6366F1]/60 focus:ring-4 focus:ring-[#6366F1]/20 transition-all duration-300 text-lg font-medium shadow-xl hover:shadow-2xl hover:scale-102 group"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#6366F1]/5 via-transparent to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={refetch}
              disabled={loading}
              className="group flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl border border-gray-600/50 rounded-2xl text-gray-300 hover:text-white hover:border-[#6366F1]/50 hover:from-[#6366F1]/20 hover:to-[#8B5CF6]/20 transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
              ) : (
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              )}
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Ligne 2: Sort Options Premium */}
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'market_cap_rank' as const, label: 'Classement', icon: Crown, color: 'from-[#F59E0B] to-[#D97706]' },
            { key: 'current_price' as const, label: t('cryptos.price'), icon: DollarSign, color: 'from-[#16A34A] to-[#15803D]' },
            { key: 'price_change_percentage_24h' as const, label: t('cryptos.variation'), icon: TrendingUp, color: 'from-[#6366F1] to-[#4F46E5]' },
            { key: 'market_cap' as const, label: t('cryptos.market_cap'), icon: Target, color: 'from-[#8B5CF6] to-[#7C3AED]' },
            { key: 'total_volume' as const, label: t('cryptos.volume'), icon: BarChart3, color: 'from-[#06B6D4] to-[#0891B2]' },
            { key: 'ath_change_percentage' as const, label: 'ATH Distance', icon: Trophy, color: 'from-[#F59E0B] to-[#D97706]' },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`group flex items-center space-x-3 px-5 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
                sortBy === key
                  ? `bg-gradient-to-r ${color} text-white shadow-xl scale-105 glow-effect`
                  : 'bg-gray-800/60 backdrop-blur-xl border border-gray-600/50 text-gray-300 hover:text-white hover:border-gray-500/50 hover:bg-gray-700/60 hover:scale-102'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${
                sortBy === key ? 'animate-bounce-subtle' : 'group-hover:scale-110'
              }`} />
              <span className="font-semibold">{label}</span>
              {sortBy === key && (
                <div className="flex items-center">
                  {sortOrder === 'desc' ?
                    <ChevronDown className="w-4 h-4 animate-bounce" /> :
                    <ChevronUp className="w-4 h-4 animate-bounce" />
                  }
                </div>
              )}
              {sortBy === key && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep"></div>
              )}
            </button>
          ))}
        </div>

        {/* Status Premium */}
        {!loading && !error && cryptos.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-[#16A34A]">
                <div className="w-3 h-3 bg-[#16A34A] rounded-full animate-pulse-glow shadow-lg shadow-[#16A34A]/50"></div>
                <span className="font-bold text-shadow">Données Live CoinGecko API</span>
              </div>
              <div className="text-xs bg-[#16A34A]/20 border border-[#16A34A]/30 text-[#16A34A] px-3 py-1 rounded-full font-semibold">
                TEMPS RÉEL
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-gray-300 font-semibold">
                {cryptos.length} cryptos affichées
              </div>
              <div className="text-xs bg-gray-700/50 text-gray-400 px-3 py-1 rounded-full">
                MAJ: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-gradient-to-r from-[#DC2626]/10 to-[#EF4444]/10 border border-[#DC2626]/30 rounded-2xl flex items-center space-x-4 shadow-xl">
            <div className="p-2 bg-[#DC2626]/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-[#DC2626] animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-[#DC2626] font-bold mb-1">Erreur de connexion</div>
              <div className="text-[#DC2626]/80 text-sm">{error}</div>
            </div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-[#DC2626]/20 hover:bg-[#DC2626]/30 border border-[#DC2626]/40 text-[#DC2626] rounded-xl font-bold transition-all duration-300 hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* Table des Cryptos */}
      <CryptoTable
        cryptos={cryptos}
        loading={loading}
        error={error}
        searchTerm={searchTerm}
        formatters={formatters}
        user={user}
        t={t}
      />

      {/* Load More - identiques */}
      {hasMore && !loading && (
        <div className="text-center mt-12">
          <button 
            onClick={loadMore}
            className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-[#6366F1]/40"
          >
            Charger 100 cryptos supplémentaires
          </button>
        </div>
      )}
    </>
  )
}

// Vue Watchlist simplifiée - Interface sans sidebar
function WatchlistView({
  watchlists,
  activeWatchlist,
  totalWatchedCryptos,
  onCreateWatchlist,
  onDeleteWatchlist,
  t
}: {
  watchlists: any[],
  activeWatchlist: string | null,
  totalWatchedCryptos: number,
  onCreateWatchlist: () => void,
  onDeleteWatchlist: (listId: string) => Promise<boolean>,
  t: any
}) {
  const [selectedList, setSelectedList] = useState<string | null>(activeWatchlist)

  if (watchlists.length === 0) {
    return (
      <div className="glass-effect rounded-2xl border border-gray-800/40 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <List className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">
            Aucune liste créée
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            {t('cryptos.create_first_list')}
          </p>
          <div className="space-y-4">
            <button
              onClick={onCreateWatchlist}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Créer ma première liste
            </button>
            <div className="text-sm text-gray-500">
              {t('cryptos.tip')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Sélecteur de listes en haut */}
      <div className="glass-effect rounded-2xl border border-gray-800/40 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#F9FAFB] flex items-center space-x-2">
            <Star className="w-6 h-6 text-[#6366F1]" />
            <span>{t('cryptos.my_watchlists')}</span>
          </h2>
          <button
            onClick={onCreateWatchlist}
            className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-300 text-sm"
          >
            + Nouvelle liste
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlists.map((list) => (
            <div
              key={list.id}
              className={`relative p-4 rounded-xl border transition-all group ${
                selectedList === list.id
                  ? 'border-[#6366F1] bg-[#6366F1]/10 shadow-lg shadow-[#6366F1]/20'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-800/50'
              }`}
            >
              {/* Bouton de suppression - visible au hover si pas une liste par défaut */}
              {/* Temporairement permettre la suppression de toutes les listes */}
              {true && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la liste "${list.name}" ?\n\nCette action est irréversible et supprimera également toutes les cryptomonnaies de cette liste.`)) {
                      // Si on supprime la liste actuellement sélectionnée, revenir à null
                      if (selectedList === list.id) {
                        setSelectedList(null)
                      }
                      onDeleteWatchlist(list.id)
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 z-10"
                  title={t('cryptos.delete_list')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Contenu de la liste - maintenant cliquable */}
              <div
                onClick={() => setSelectedList(list.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{list.icon}</div>
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: list.color || '#6366F1' }}
                    ></div>
                    <h3 className="font-semibold text-[#F9FAFB] truncate flex items-center space-x-1">
                      <span>{list.name}</span>
                      {list.is_pinned && <Crown className="w-3 h-3 text-[#F59E0B] ml-1 flex-shrink-0" />}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-2 ml-11">
                  {list.items?.length || 0} cryptomonnaies
                </div>
                <div className="text-xs text-gray-500 ml-11">
                  Modifié {new Date(list.updated_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu de la liste sélectionnée */}
      {selectedList ? (
        <WatchlistDetailView listId={selectedList} />
      ) : (
        <div className="glass-effect rounded-2xl border border-gray-800/40 p-12 text-center">
          <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">
            Sélectionnez une liste
          </h3>
          <p className="text-gray-400">
            Choisissez une liste ci-dessus pour voir son contenu
          </p>
        </div>
      )}
    </div>
  )
}

// Table des cryptos - Accessible à tous avec fonctionnalités conditionnelles
function CryptoTable({ cryptos, loading, error, searchTerm, formatters, user, t }: any) {
  if (loading && cryptos.length === 0) {
    return (
      <div className="glass-effect rounded-2xl border border-gray-800/40 p-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#6366F1] mx-auto mb-4" />
        <div className="text-[#F9FAFB] font-semibold mb-2">Chargement des données...</div>
        <div className="text-gray-400 text-sm">Récupération de 100+ cryptomonnaies via CoinGecko</div>
      </div>
    )
  }

  if (error && cryptos.length === 0) {
    return (
      <div className="glass-effect rounded-2xl border border-gray-800/40 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
        <div className="text-[#F9FAFB] font-semibold mb-2">Erreur de chargement</div>
        <div className="text-gray-400 text-sm mb-4">{error}</div>
        <button className="bg-[#6366F1] hover:bg-[#5B21B6] text-white px-6 py-2 rounded-lg font-medium transition-all">
          Réessayer
        </button>
      </div>
    )
  }

  if (cryptos.length === 0) {
    return (
      <div className="glass-effect rounded-2xl border border-gray-800/40 p-12 text-center">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="text-[#F9FAFB] font-semibold mb-2">Aucun résultat</div>
        <div className="text-gray-400 text-sm">Aucune cryptomonnaie ne correspond à "{searchTerm}"</div>
      </div>
    )
  }

  return (
    <div className="glass-effect-strong rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
      {/* Table Header Premium */}
      <div className="border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-3 p-8 text-gray-300 font-bold text-sm uppercase tracking-[0.1em]">
          <div className="col-span-1 flex items-center space-x-2">
            <Crown className="w-4 h-4 text-[#F59E0B]" />
            <span>{t('cryptos.rank')}</span>
          </div>
          <div className="col-span-3 flex items-center space-x-2">
            <span>Cryptomonnaie</span>
          </div>
          <div className="col-span-2 text-right flex items-center justify-end space-x-2">
            <DollarSign className="w-4 h-4 text-[#16A34A]" />
            <span>{t('cryptos.price_and_hl')}</span>
          </div>
          <div className="col-span-1 text-right flex items-center justify-end space-x-2">
            <TrendingUp className="w-4 h-4 text-[#6366F1]" />
            <span>24h</span>
          </div>
          <div className="col-span-2 text-right flex items-center justify-end space-x-2">
            <Target className="w-4 h-4 text-[#8B5CF6]" />
            <span>{t('cryptos.market_cap')}</span>
          </div>
          <div className="col-span-1 text-right flex items-center justify-end space-x-2">
            <BarChart3 className="w-4 h-4 text-[#06B6D4]" />
            <span>Vol</span>
          </div>
          <div className="col-span-2 text-center">
            <span>Actions</span>
          </div>
        </div>
      </div>

      {/* Table Body Premium */}
      <div className="max-h-[1000px] overflow-y-auto scrollbar-thin scrollbar-track-gray-800/20 scrollbar-thumb-gray-600/50">
        {cryptos.map((crypto: any, index: number) => (
          <div key={crypto.id} className="border-b border-gray-800/30 hover:bg-gradient-to-r hover:from-gray-800/30 hover:via-gray-700/20 hover:to-gray-800/30 transition-all duration-300 group hover:scale-[1.01]">
            <div className="grid grid-cols-12 gap-3 p-8 items-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              {/* Rang Premium */}
              <div className="col-span-1 relative z-10">
                <div className={`font-bold text-lg ${
                  crypto.market_cap_rank <= 10 ? 'text-[#F59E0B] text-shadow' :
                  crypto.market_cap_rank <= 50 ? 'text-[#16A34A]' :
                  crypto.market_cap_rank <= 100 ? 'text-[#6366F1]' :
                  'text-gray-400'
                }`}>
                  #{crypto.market_cap_rank || index + 1}
                </div>
                {crypto.market_cap_rank <= 10 && (
                  <div className="text-xs text-[#F59E0B] font-semibold">TOP 10</div>
                )}
              </div>
              
              {/* Nom avec Logo Premium */}
              <div className="col-span-3 flex items-center space-x-4 relative z-10">
                <div className="relative">
                  {crypto.image && (
                    <>
                      <img src={crypto.image} alt={crypto.name} className="w-12 h-12 rounded-full border-2 border-gray-600/50 group-hover:border-[#6366F1]/50 transition-colors shadow-lg" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-lg text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors truncate text-shadow mb-1">
                    {crypto.name}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 font-mono uppercase font-semibold">{crypto.symbol}</span>
                    {crypto.market_cap_rank <= 10 && (
                      <div className="px-2 py-0.5 bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold rounded-full">
                        LEADER
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Prix avec High/Low Premium */}
              <div className="col-span-2 text-right relative z-10">
                <div className="font-mono font-bold text-xl text-[#F9FAFB] mb-2 text-shadow">
                  {formatters.price(crypto.current_price)}
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex justify-end items-center space-x-2">
                    <span className="text-[#16A34A]">MAX:</span>
                    <span className="font-mono font-semibold">{formatters.price(crypto.high_24h)}</span>
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    <span className="text-[#DC2626]">MIN:</span>
                    <span className="font-mono font-semibold">{formatters.price(crypto.low_24h)}</span>
                  </div>
                </div>
              </div>
              
              {/* Change 24h Premium */}
              <div className="col-span-1 text-right relative z-10">
                <div className={`font-mono font-bold text-lg flex items-center justify-end space-x-2 text-shadow ${
                  (crypto.price_change_percentage_24h || 0) >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}>
                  <div className={`p-1 rounded-lg ${
                    (crypto.price_change_percentage_24h || 0) >= 0 ? 'bg-[#16A34A]/20' : 'bg-[#DC2626]/20'
                  }`}>
                    {(crypto.price_change_percentage_24h || 0) >= 0 ? (
                      <TrendingUp className="w-5 h-5 animate-bounce-subtle" />
                    ) : (
                      <TrendingDown className="w-5 h-5 animate-bounce-subtle" />
                    )}
                  </div>
                  <span className="font-black">{formatters.percentage(crypto.price_change_percentage_24h || 0)}</span>
                </div>
              </div>
              
              {/* Market Cap Premium */}
              <div className="col-span-2 text-right relative z-10">
                <div className="font-mono font-bold text-lg text-[#F9FAFB] mb-1 text-shadow">
                  {formatters.marketCap(crypto.market_cap)}
                </div>
                {crypto.market_cap_change_percentage_24h != null && (
                  <div className={`text-sm font-mono font-semibold flex items-center justify-end space-x-1 ${
                    crypto.market_cap_change_percentage_24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                  }`}>
                    {crypto.market_cap_change_percentage_24h >= 0 ? '+' : ''}
                    {formatters.percentage(crypto.market_cap_change_percentage_24h)}
                  </div>
                )}
              </div>
              
              {/* Volume Premium */}
              <div className="col-span-1 text-right font-mono font-bold text-lg text-gray-300 text-shadow relative z-10">
                <div>{formatters.marketCap(crypto.total_volume)}</div>
              </div>

              {/* Actions Premium */}
              <div className="col-span-2 flex justify-center relative z-10">
                <div className="flex items-center space-x-2">
                  {/* Graphique - toujours disponible */}
                  <Link
                    href={`/graphiques?crypto=${crypto.id}`}
                    className="group/btn p-2.5 bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-[#6366F1]/20 hover:to-[#4F46E5]/20 border border-gray-600/50 hover:border-[#6366F1]/60 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[#6366F1]/20"
                    title={`Analyser les graphiques de ${crypto.name}`}
                  >
                    <BarChart3 className="w-4 h-4 text-gray-400 group-hover/btn:text-[#6366F1] transition-colors" />
                  </Link>

                  {/* SupabaseAddToWatchlistButton - seulement si connecté */}
                  {user ? (
                    <div className="transform hover:scale-110 transition-transform duration-300">
                      <SupabaseAddToWatchlistButton crypto={crypto} />
                    </div>
                  ) : (
                    <div
                      className="group/locked p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg opacity-60 cursor-not-allowed relative"
                      title="Connexion requise pour les listes de suivi personnalisées"
                    >
                      <Star className="w-4 h-4 text-gray-600" />
                      <Lock className="w-3 h-3 text-gray-600 absolute -top-1 -right-1" />
                    </div>
                  )}

                  {/* Backtest - seulement si connecté */}
                  {user ? (
                    <Link
                      href={`/backtest?crypto=${crypto.id}`}
                      className="group/btn p-2.5 bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-[#8B5CF6]/20 hover:to-[#7C3AED]/20 border border-gray-600/50 hover:border-[#8B5CF6]/60 rounded-lg transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-[#8B5CF6]/20"
                      title="Lancer un backtest stratégique"
                    >
                      <Activity className="w-4 h-4 text-gray-400 group-hover/btn:text-[#8B5CF6] transition-colors" />
                    </Link>
                  ) : (
                    <div
                      className="group/locked p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg opacity-60 cursor-not-allowed relative"
                      title="Connexion requise pour le backtest professionnel"
                    >
                      <Activity className="w-4 h-4 text-gray-600" />
                      <Lock className="w-3 h-3 text-gray-600 absolute -top-1 -right-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}