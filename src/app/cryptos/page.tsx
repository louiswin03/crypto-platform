"use client"

// AJOUT : Import pour utiliser la navigation cohérente
import SmartNavigation from '@/components/SmartNavigation'
import { useAuth } from '@/hooks/useAuth'

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCw, Loader2, AlertCircle, Clock, Eye, EyeOff, MoreHorizontal, ExternalLink, Image as ImageIcon, Calendar, Layers, ChevronDown, ChevronUp, Sparkles, Crown, TrendingUp as Rising, TrendingDown as Falling, Trophy, BarChart2, Menu, Bookmark, Heart, List, X } from 'lucide-react'
import { useExtendedCoinGeckoPrices } from '@/hooks/useExtendedCoinGeckoPrices'
import { useWatchlists } from '@/hooks/useWatchlists'
import { AddToWatchlistButton, WatchlistSidebar, WatchlistDetailView } from '@/components/Watchlists'
import { useState, useMemo, useEffect } from 'react'

type SortField = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'total_volume' | 'market_cap_rank' | 'ath_change_percentage'
type ViewMode = 'market' | 'watchlist'

export default function CompleteCryptosPage() {
  // Hook pour récupérer l'utilisateur connecté (pour les fonctionnalités watchlist)
  const { user } = useAuth()
  
  const { prices, stats, loading, error, hasMore, totalCoins, refetch, loadMore, getCoinsWithTradingView, searchCoins, sortCoins, formatters } = useExtendedCoinGeckoPrices(100)
  const { 
    watchlists, 
    activeWatchlist, 
    currentWatchlist, 
    getTotalWatchedCryptos, 
    getWatchlistStats,
    isInWatchlist 
  } = useWatchlists()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('market_cap_rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('market')
  const [showWatchlistSidebar, setShowWatchlistSidebar] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showOnlyTradingView, setShowOnlyTradingView] = useState(false)

  // Gestion du mode de vue en fonction de la watchlist active
  useEffect(() => {
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
        
        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .crypto-logo {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* MODIFICATION : Utiliser SmartNavigation au lieu de la navigation personnalisée */}
        <SmartNavigation />

        {/* Layout avec Sidebar */}
        <div className="flex">
          {/* Watchlist Sidebar - Affichée seulement si utilisateur connecté */}
          {user ? (
            <WatchlistSidebar 
              isOpen={showWatchlistSidebar} 
              onClose={() => setShowWatchlistSidebar(false)} 
            />
          ) : (
            /* Sidebar pour utilisateurs non connectés */
            showWatchlistSidebar && (
              <div className="fixed left-0 top-0 h-full w-80 bg-[#111827]/95 backdrop-blur-sm border-r border-gray-800/40 z-40 transform transition-transform duration-300">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#F9FAFB]">Listes de Suivi</h2>
                    <button
                      onClick={() => setShowWatchlistSidebar(false)}
                      className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Message de connexion */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-sm">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#F9FAFB] mb-2">
                        Créez vos listes personnalisées
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        Connectez-vous pour organiser vos cryptomonnaies favorites et créer des listes de suivi personnalisées
                      </p>
                      <Link
                        href="/auth/signin"
                        className="inline-flex items-center px-6 py-3 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-all font-semibold text-sm"
                      >
                        Se connecter
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Overlay pour fermer la sidebar */}
          {showWatchlistSidebar && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setShowWatchlistSidebar(false)}
            />
          )}

          {/* Main Content */}
          <main className={`flex-1 relative transition-all duration-300 ${user && showWatchlistSidebar ? 'lg:ml-80' : showWatchlistSidebar ? 'lg:ml-80' : ''}`}>
            <div className="px-6 lg:px-8 pt-12 pb-20">
              {/* Page Header avec Toggle Mode */}
              <div className="mb-12">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight">
                        {viewMode === 'market' ? (
                          <>Cryptomonnaies {totalCoins > 0 && <span className="text-[#6366F1]">({totalCoins}+)</span>}</>
                        ) : (
                          <>Mes Listes de Suivi</>
                        )}
                      </h1>
                      <p className="text-gray-400 text-xl font-light max-w-2xl">
                        {viewMode === 'market' 
                          ? `Données complètes sur ${totalCoins}+ cryptomonnaies${user ? ' avec listes de suivi personnalisées' : ' - Connectez-vous pour créer des listes personnalisées'}`
                          : `Gérez vos ${totalWatchedCryptos} cryptomonnaies suivies dans ${watchlists.length} listes`
                        }
                      </p>
                    </div>
                    
                    {/* View Toggle - Affiché seulement si user connecté */}
                    <div className="flex items-center space-x-4">
                      {user ? (
                        <>
                          <div className="flex bg-gray-900/50 rounded-xl p-1 border border-gray-800/40">
                            <button 
                              onClick={() => setViewMode('market')}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'market' 
                                  ? 'bg-[#6366F1] text-white shadow-lg' 
                                  : 'text-gray-400 hover:text-[#F9FAFB]'
                              }`}
                            >
                              <TrendingUp className="w-4 h-4" />
                              <span>Marché</span>
                            </button>
                            <button 
                              onClick={() => setViewMode('watchlist')}
                              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'watchlist' 
                                  ? 'bg-[#6366F1] text-white shadow-lg' 
                                  : 'text-gray-400 hover:text-[#F9FAFB]'
                              }`}
                            >
                              <Star className="w-4 h-4" />
                              <span>Mes Listes</span>
                              {totalWatchedCryptos > 0 && (
                                <span className="bg-[#F59E0B] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                  {totalWatchedCryptos}
                                </span>
                              )}
                            </button>
                          </div>
                          
                          <button
                            onClick={() => setShowWatchlistSidebar(!showWatchlistSidebar)}
                            className={`p-3 rounded-xl transition-all ${
                              showWatchlistSidebar 
                                ? 'bg-[#6366F1]/20 border border-[#6366F1]/40 text-[#6366F1]' 
                                : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50'
                            }`}
                          >
                            <Menu className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        /* Bouton pour utilisateurs non connectés */
                        <button
                          onClick={() => setShowWatchlistSidebar(!showWatchlistSidebar)}
                          className="p-3 rounded-xl transition-all bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50"
                        >
                          <List className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats Grid - Différent selon le mode */}
                  {viewMode === 'market' ? (
                    // Stats marché - identiques
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <div className="glass-effect rounded-2xl p-6 text-center relative">
                        <div className="text-2xl font-bold text-[#16A34A] mb-1 font-mono">
                          {stats ? formatters.marketCap(stats.totalMarketCap) : '---'}
                        </div>
                        <div className="text-gray-400 text-sm font-medium">Market Cap Total</div>
                        {!loading && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="glass-effect rounded-2xl p-6 text-center relative">
                        <div className="text-2xl font-bold text-[#6366F1] mb-1 font-mono">
                          {stats ? formatters.marketCap(stats.totalVolume) : '---'}
                        </div>
                        <div className="text-gray-400 text-sm font-medium">Volume 24h</div>
                        {!loading && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-[#6366F1] rounded-full animate-pulse"></div>
                        )}
                      </div>

                      <div className="glass-effect rounded-2xl p-6 text-center">
                        <div className="text-2xl font-bold text-[#F59E0B] mb-1 font-mono">
                          {stats ? `${stats.btcDominance.toFixed(1)}%` : '---'}
                        </div>
                        <div className="text-gray-400 text-sm font-medium">Dominance BTC</div>
                      </div>

                      <div className="glass-effect rounded-2xl p-6 text-center">
                        <div className="text-2xl font-bold text-[#8B5CF6] mb-1 font-mono">
                          {stats ? `${stats.ethDominance.toFixed(1)}%` : '---'}
                        </div>
                        <div className="text-gray-400 text-sm font-medium">Dominance ETH</div>
                      </div>

                      <div className="glass-effect rounded-2xl p-6 text-center">
                        <div className="text-2xl font-bold text-[#F9FAFB] mb-1 font-mono">
                          {prices.length}
                        </div>
                        <div className="text-gray-400 text-sm font-medium">Cryptos chargées</div>
                      </div>
                    </div>
                  ) : (
                    // Stats watchlists - seulement si user connecté ET en mode watchlist
                    user && viewMode === 'watchlist' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-effect rounded-2xl p-6 text-center">
                          <div className="text-2xl font-bold text-[#F59E0B] mb-1 font-mono">
                            {totalWatchedCryptos}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Cryptos Suivies</div>
                        </div>
                        
                        <div className="glass-effect rounded-2xl p-6 text-center">
                          <div className="text-2xl font-bold text-[#6366F1] mb-1 font-mono">
                            {watchlists.length}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Listes Créées</div>
                        </div>

                        <div className="glass-effect rounded-2xl p-6 text-center">
                          <div className="text-2xl font-bold text-[#8B5CF6] mb-1 font-mono">
                            {watchlists.filter(l => l.isPinned).length}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Listes Épinglées</div>
                        </div>

                        <div className="glass-effect rounded-2xl p-6 text-center">
                          <div className="text-2xl font-bold text-[#16A34A] mb-1 font-mono">
                            {watchlists.reduce((sum, list) => sum + list.items.length, 0)}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Total Items</div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Top Gainers & Losers - Seulement en mode marché - identiques */}
                  {viewMode === 'market' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
                        <h3 className="flex items-center space-x-2 font-semibold text-[#16A34A] mb-4">
                          <Trophy className="w-5 h-5" />
                          <span>Top Gagnants 24h</span>
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
                                {user && <AddToWatchlistButton crypto={coin} />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
                        <h3 className="flex items-center space-x-2 font-semibold text-[#DC2626] mb-4">
                          <Falling className="w-5 h-5" />
                          <span>Top Perdants 24h</span>
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
                                {user && <AddToWatchlistButton crypto={coin} />}
                              </div>
                            </div>
                          ))}
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
                />
              ) : (
                // Watchlist view : accessible seulement si connecté
                user ? (
                  <WatchlistView 
                    activeWatchlist={activeWatchlist}
                  />
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">Connexion requise</h2>
                    <p className="text-gray-400 mb-6">Connectez-vous pour accéder à vos listes de suivi personnalisées</p>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center px-6 py-3 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-all font-semibold"
                    >
                      Se connecter
                    </Link>
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
        </div>
      </div>
    </>
  )
}

// Vue Marché - Fonctionnalité de base accessible à tous
function MarketView({ 
  cryptos, loading, error, searchTerm, setSearchTerm, sortBy, sortOrder, 
  handleSort, formatters, 
  refetch, hasMore, loadMore,
  user
}: any) {
  return (
    <>
      {/* Filtres et Contrôles - identiques */}
      <div className="glass-effect rounded-2xl p-6 mb-8 border border-gray-800/40 space-y-6">
        {/* Ligne 1: Search + Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, symbole ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={refetch}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="font-medium">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Ligne 2: Sort Options - identiques */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'market_cap_rank' as const, label: 'Rang', icon: Crown },
            { key: 'current_price' as const, label: 'Prix', icon: DollarSign },
            { key: 'price_change_percentage_24h' as const, label: '24h %', icon: TrendingUp },
            { key: 'market_cap' as const, label: 'Market Cap', icon: Target },
            { key: 'total_volume' as const, label: 'Volume', icon: BarChart3 },
            { key: 'ath_change_percentage' as const, label: 'ATH %', icon: Trophy },
          ].map(({ key, label, icon: Icon }) => (
            <button 
              key={key}
              onClick={() => handleSort(key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                sortBy === key 
                  ? 'bg-[#6366F1]/20 border border-[#6366F1]/40 text-[#6366F1]' 
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {sortBy === key && (
                <span className="text-xs">
                  {sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Status - identiques */}
        {!loading && !error && cryptos.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-[#16A34A]">
              <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
              <span className="font-medium">Données live CoinGecko</span>
            </div>
            <div className="text-gray-400">
              {cryptos.length} cryptos affichées
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
            <div className="text-[#DC2626] text-sm">
              <strong>Erreur:</strong> {error}
            </div>
            <button 
              onClick={refetch}
              className="ml-auto px-3 py-1 bg-[#DC2626]/20 hover:bg-[#DC2626]/30 text-[#DC2626] rounded-lg text-xs font-medium transition-all"
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

// Vue Watchlist - identique (mais sera rendue seulement si user connecté)
function WatchlistView({ activeWatchlist }: { activeWatchlist: string | null }) {
  if (!activeWatchlist) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">📋</div>
        <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">Sélectionnez une liste</h2>
        <p className="text-gray-400 mb-6">Choisissez une liste dans la barre latérale pour voir son contenu</p>
        <div className="text-sm text-gray-500">
          💡 Astuce : Cliquez sur ⭐ dans la vue marché pour ajouter des cryptos à vos listes
        </div>
      </div>
    )
  }

  return <WatchlistDetailView listId={activeWatchlist} />
}

// Table des cryptos - Accessible à tous avec fonctionnalités conditionnelles
function CryptoTable({ cryptos, loading, error, searchTerm, formatters, user }: any) {
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
    <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-800/40 bg-gray-900/30">
        <div className="grid grid-cols-12 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Nom</div>
          <div className="col-span-2 text-right">Prix</div>
          <div className="col-span-1 text-right">24h</div>
          <div className="col-span-2 text-right">Market Cap</div>
          <div className="col-span-2 text-right">Volume</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-[800px] overflow-y-auto">
        {cryptos.map((crypto: any, index: number) => (
          <div key={crypto.id} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors group">
            <div className="grid grid-cols-12 gap-4 p-6 items-center">
              {/* Rang */}
              <div className="col-span-1">
                <div className="font-medium text-gray-400">#{crypto.market_cap_rank || index + 1}</div>
              </div>
              
              {/* Nom avec Logo */}
              <div className="col-span-3 flex items-center space-x-4">
                {crypto.image && (
                  <img src={crypto.image} alt={crypto.name} className="crypto-logo" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors truncate">
                    {crypto.name}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm font-mono uppercase">{crypto.symbol}</span>
                  </div>
                </div>
              </div>
              
              {/* Prix avec High/Low */}
              <div className="col-span-2 text-right">
                <div className="font-mono font-semibold text-[#F9FAFB] mb-1">
                  {formatters.price(crypto.current_price)}
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>H: {formatters.price(crypto.high_24h)}</div>
                  <div>L: {formatters.price(crypto.low_24h)}</div>
                </div>
              </div>
              
              {/* Change 24h */}
              <div className="col-span-1 text-right">
                <div className={`font-mono font-semibold flex items-center justify-end space-x-1 ${
                  (crypto.price_change_percentage_24h || 0) >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}>
                  {(crypto.price_change_percentage_24h || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{formatters.percentage(crypto.price_change_percentage_24h || 0)}</span>
                </div>
              </div>
              
              {/* Market Cap */}
              <div className="col-span-2 text-right">
                <div className="font-mono text-[#F9FAFB] mb-1">
                  {formatters.marketCap(crypto.market_cap)}
                </div>
                {crypto.market_cap_change_percentage_24h != null && (
                  <div className={`text-xs font-mono ${
                    crypto.market_cap_change_percentage_24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                  }`}>
                    {formatters.percentage(crypto.market_cap_change_percentage_24h)}
                  </div>
                )}
              </div>
              
              {/* Volume */}
              <div className="col-span-2 text-right font-mono text-gray-400">
                {formatters.marketCap(crypto.total_volume)}
              </div>
              
              {/* Actions - Fonctionnalités selon l'état de connexion */}
              <div className="col-span-1 flex justify-center">
                <div className="flex items-center space-x-2">
                  {/* Graphique - toujours disponible */}
                  <Link
                    href={`/graphiques?crypto=${crypto.id}`}
                    className="p-2 bg-gray-800/50 hover:bg-[#6366F1]/20 border border-gray-700/50 hover:border-[#6366F1]/40 rounded-lg transition-all group/btn"
                    title="Voir le graphique"
                  >
                    <BarChart3 className="w-4 h-4 text-gray-400 group-hover/btn:text-[#6366F1]" />
                  </Link>
                  
                  {/* AddToWatchlistButton - seulement si connecté */}
                  {user ? (
                    <AddToWatchlistButton crypto={crypto} />
                  ) : (
                    <div
                      className="p-2 bg-gray-800/30 border border-gray-700/30 rounded-lg opacity-50 cursor-not-allowed"
                      title="Connexion requise pour les listes de suivi"
                    >
                      <Star className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Backtest - seulement si connecté */}
                  {user ? (
                    <Link
                      href={`/backtest?crypto=${crypto.id}`}
                      className="p-2 bg-gray-800/50 hover:bg-[#8B5CF6]/20 border border-gray-700/50 hover:border-[#8B5CF6]/40 rounded-lg transition-all group/btn"
                      title="Lancer un backtest"
                    >
                      <Activity className="w-4 h-4 text-gray-400 group-hover/btn:text-[#8B5CF6]" />
                    </Link>
                  ) : (
                    <div
                      className="p-2 bg-gray-800/30 border border-gray-700/30 rounded-lg opacity-50 cursor-not-allowed"
                      title="Connexion requise pour le backtest"
                    >
                      <Activity className="w-4 h-4 text-gray-600" />
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