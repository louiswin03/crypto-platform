// src/components/CryptoSelector/ImprovedCryptoSearch.tsx
"use client"

import { useState, useMemo, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Star, Hash, DollarSign, Filter, SortAsc, Clock, Flame } from 'lucide-react'

interface CryptoOption {
  id: string
  name: string
  symbol: string
  tradingview_symbol: string
  rank: number
  price: number | null
  change24h: number | null
  image?: string
}

interface ImprovedCryptoSearchProps {
  cryptoOptions: CryptoOption[]
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
}

type SortOption = 'rank' | 'price' | 'change24h' | 'name'
type FilterOption = 'all' | 'gainers' | 'losers' | 'favorites'

export default function ImprovedCryptoSearch({
  cryptoOptions,
  selectedCrypto,
  onCryptoSelect
}: ImprovedCryptoSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('rank')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Charger les recherches récentes depuis le localStorage
  useEffect(() => {
    const savedRecentSearches = localStorage.getItem('crypto-recent-searches')
    if (savedRecentSearches) {
      setRecentSearches(JSON.parse(savedRecentSearches))
    }
  }, [])

  // Ajouter à l'historique de recherche
  const addToRecentSearches = (term: string) => {
    if (!term.trim()) return
    const newRecentSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorage.setItem('crypto-recent-searches', JSON.stringify(newRecentSearches))
  }

  // Top cryptos populaires (affichage par défaut) - réduit à 3
  const topCryptos = cryptoOptions.slice(0, 3)
  
  // Résultats de recherche filtrés et triés
  const filteredOptions = useMemo(() => {
    let filtered = cryptoOptions

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrage par catégorie
    switch (filterBy) {
      case 'gainers':
        filtered = filtered.filter(crypto => crypto.change24h && crypto.change24h > 0)
        break
      case 'losers':
        filtered = filtered.filter(crypto => crypto.change24h && crypto.change24h < 0)
        break
      case 'favorites':
        // Favoris locaux supprimés - on peut garder le filtre mais vide pour l'instant
        filtered = []
        break
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.rank - b.rank
        case 'price':
          return (b.price || 0) - (a.price || 0)
        case 'change24h':
          return (b.change24h || 0) - (a.change24h || 0)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    // Limiter les résultats si pas de recherche - réduit à 3
    if (!searchTerm && !showAll) {
      return filtered.slice(0, 3)
    }

    return filtered
  }, [searchTerm, cryptoOptions, showAll, sortBy, filterBy])

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price)
  }

  const handleCryptoSelect = (crypto: CryptoOption) => {
    onCryptoSelect(crypto.tradingview_symbol)
    addToRecentSearches(crypto.name)
    setSearchTerm('') // Réinitialiser la recherche après sélection
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value) {
      addToRecentSearches(value)
    }
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche améliorée */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher Bitcoin, Ethereum, Solana... ou tapez un symbole (BTC, ETH...)"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full pl-12 pr-16 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none transition-all text-lg"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'text-[#6366F1] bg-[#6366F1]/10' : 'text-gray-400 hover:text-white'
              }`}
              title="Filtres avancés"
            >
              <Filter className="w-4 h-4" />
            </button>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-white transition-colors"
                title="Effacer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Recherches récentes */}
        {!searchTerm && recentSearches.length > 0 && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Récent:</span>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(term)}
                  className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-sm text-gray-300 hover:text-white hover:border-gray-600/50 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtres avancés */}
        {showFilters && (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtres par catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filtrer par</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Toutes', icon: Hash },
                    { value: 'gainers', label: 'Hausse', icon: TrendingUp },
                    { value: 'losers', label: 'Baisse', icon: TrendingDown },
                    { value: 'favorites', label: 'Favoris', icon: Star }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setFilterBy(value as FilterOption)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        filterBy === value
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trier par</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'rank', label: 'Rang' },
                    { value: 'price', label: 'Prix' },
                    { value: 'change24h', label: 'Variation 24h' },
                    { value: 'name', label: 'Nom' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSortBy(value as SortOption)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        sortBy === value
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <SortAsc className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Résultats de recherche ou suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            {searchTerm ? (
              `${filteredOptions.length} résultat${filteredOptions.length > 1 ? 's' : ''} trouvé${filteredOptions.length > 1 ? 's' : ''}`
            ) : (
              showAll ? 'Toutes les cryptomonnaies' : 'Cryptomonnaies populaires'
            )}
          </div>
          {!searchTerm && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[#6366F1] hover:text-[#5B21B6] transition-colors text-sm font-medium"
            >
              {showAll ? 'Voir moins' : `Voir toutes (${cryptoOptions.length})`}
            </button>
          )}
        </div>

        {filteredOptions.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-bounce" />
            <div className="text-gray-400 font-medium mb-2">Aucune crypto trouvée</div>
            <div className="text-gray-500 text-sm">
              Essayez de rechercher "Bitcoin", "ETH" ou "Solana"
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-2 ${showAll ? 'max-h-[400px] overflow-y-auto custom-scrollbar pr-2' : ''}`}>
            {filteredOptions.map((crypto, index) => (
              <button
                key={crypto.id}
                onClick={() => handleCryptoSelect(crypto)}
                className={`group p-2 rounded-lg border transition-all duration-300 text-left hover:scale-[1.02] animate-fade-in-up ${
                  crypto.tradingview_symbol === selectedCrypto
                    ? 'border-[#6366F1] bg-[#6366F1]/10'
                    : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50 hover:bg-gray-800/50'
                }`}
                style={{
                  animationDelay: `${index * 30}ms`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${
                      crypto.tradingview_symbol === selectedCrypto
                        ? 'ring-2 ring-[#6366F1]'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {crypto.image ? (
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className={`text-white text-xs font-bold ${crypto.image ? 'hidden' : ''}`}>
                        {crypto.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm group-hover:text-[#6366F1] transition-colors">
                        {crypto.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center space-x-1">
                        <span className="font-mono">{crypto.symbol}</span>
                        {crypto.price && (
                          <>
                            <span>•</span>
                            <span>{formatPrice(crypto.price)}</span>
                          </>
                        )}
                        {crypto.change24h !== null && (
                          <span className={crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {crypto.tradingview_symbol === selectedCrypto && (
                    <div className="w-5 h-5 bg-[#6366F1] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message d'encouragement si pas de recherche */}
      {!searchTerm && !showAll && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">
            💡 <strong>{cryptoOptions.length - topCryptos.length}</strong> autres cryptomonnaies disponibles
          </div>
        </div>
      )}
    </div>
  )
}