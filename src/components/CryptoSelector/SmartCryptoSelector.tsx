// src/components/CryptoSelector/SmartCryptoSelector.tsx
"use client"

import { useState, useMemo, useEffect } from 'react'
import { Search, X, ChevronDown, ChevronUp, Star, Clock, TrendingUp, Layers, Coins, Diamond, Flame, Sparkles, Zap, Badge, AlertCircle } from 'lucide-react'
import { searchCryptosWithFallback, MULTI_EXCHANGE_MAPPING } from '@/data/multiExchangeMapping'

interface SmartCryptoSelectorProps {
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
  className?: string
}

// Catégories de cryptos avec icônes et couleurs
const CRYPTO_CATEGORIES = [
  { id: 'all', name: 'Toutes', icon: Coins, color: 'text-gray-400' },
  { id: 'layer1', name: 'Layer 1', icon: Layers, color: 'text-blue-400' },
  { id: 'defi', name: 'DeFi', icon: TrendingUp, color: 'text-green-400' },
  { id: 'nft', name: 'NFT', icon: Diamond, color: 'text-purple-400' },
  { id: 'meme', name: 'Meme', icon: Flame, color: 'text-red-400' },
  { id: 'ai', name: 'AI', icon: Sparkles, color: 'text-pink-400' }
];

// Icônes de liquidité
const LIQUIDITY_ICONS = {
  high: { icon: <Zap className="w-3 h-3" />, color: 'text-[#16A34A]', label: 'Haute liquidité' },
  medium: { icon: <Badge className="w-3 h-3" />, color: 'text-[#F59E0B]', label: 'Liquidité moyenne' },
  low: { icon: <AlertCircle className="w-3 h-3" />, color: 'text-[#DC2626]', label: 'Faible liquidité' }
}

export default function SmartCryptoSelector({ selectedCrypto, onCryptoSelect, className = '' }: SmartCryptoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [recentCryptos, setRecentCryptos] = useState<typeof MULTI_EXCHANGE_MAPPING[0][]>([])
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cryptoFavorites') || '[]')
    }
    return []
  })

  // Filtrer les cryptos par terme de recherche, catégorie et favoris
  const filteredCryptos = useMemo(() => {
    let results = searchTerm
      ? searchCryptosWithFallback(searchTerm)
      : MULTI_EXCHANGE_MAPPING

    // Filtrer par catégorie si spécifiée
    if (selectedCategory !== 'all') {
      results = results.filter(crypto => 
        crypto.category.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
      )
    }

    // Filtrer les doublons en gardant la version la plus populaire
    const cryptoMap = new Map()
    results.forEach(crypto => {
      if (!cryptoMap.has(crypto.symbol) ||
          crypto.popularity_rank < (cryptoMap.get(crypto.symbol)?.popularity_rank || Infinity)) {
        cryptoMap.set(crypto.symbol, crypto)
      }
    })

    // Trier par popularité et favoris
    return Array.from(cryptoMap.values())
      .sort((a, b) => {
        const aIsFavorite = favorites.includes(a.id)
        const bIsFavorite = favorites.includes(b.id)
        
        if (aIsFavorite && !bIsFavorite) return -1
        if (!aIsFavorite && bIsFavorite) return 1
        return a.popularity_rank - b.popularity_rank
      })
  }, [searchTerm, selectedCategory, favorites])

  const currentCrypto = useMemo(() => {
    return MULTI_EXCHANGE_MAPPING.find(c => c.tradingview_symbol === selectedCrypto)
  }, [selectedCrypto])

  const handleCryptoSelect = (crypto: typeof MULTI_EXCHANGE_MAPPING[0]) => {
    onCryptoSelect(crypto.tradingview_symbol)
    
    // Ajouter aux récents (max 5)
    setRecentCryptos(prev => {
      const newRecents = [crypto, ...prev.filter(c => c.id !== crypto.id)].slice(0, 5)
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentCryptos', JSON.stringify(newRecents.map(c => c.id)))
      }
      return newRecents
    })
    
    setIsOpen(false)
    setSearchTerm('')
  }

  const toggleFavorite = (cryptoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newFavorites = favorites.includes(cryptoId)
      ? favorites.filter(id => id !== cryptoId)
      : [...favorites, cryptoId]
    
    setFavorites(newFavorites)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cryptoFavorites', JSON.stringify(newFavorites))
    }
  }

  // Charger les cryptos récentes au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRecents = localStorage.getItem('recentCryptos')
      if (savedRecents) {
        const recentIds = JSON.parse(savedRecents)
        const recentCryptos = recentIds
          .map((id: string) => MULTI_EXCHANGE_MAPPING.find(c => c.id === id))
          .filter(Boolean)
        setRecentCryptos(recentCryptos)
      }
      
      // Mettre à jour l'affichage pour forcer le rafraîchissement avec l'USD
      if (selectedCrypto) {
        const current = MULTI_EXCHANGE_MAPPING.find(c => 
          c.tradingview_symbol === selectedCrypto || 
          c.tradingview_symbol.replace('EUR', 'USD') === selectedCrypto
        )
        if (current) {
          const usdSymbol = current.tradingview_symbol.includes('EUR') 
            ? current.tradingview_symbol.replace('EUR', 'USD')
            : current.tradingview_symbol
          onCryptoSelect(usdSymbol)
        }
      }
    }
  }, [])

  const FiatBadge = ({ fiatPairs }: { fiatPairs: string[] }) => {
    const hasUsd = fiatPairs.includes('USD')
    const hasUsdt = fiatPairs.includes('USDT')
    
    if (hasUsd) {
      return <span className="text-xs text-[#6366F1] bg-[#6366F1]/10 px-2 py-1 rounded">USD</span>
    } else if (hasUsdt) {
      return <span className="text-xs text-[#16A34A] bg-[#16A34A]/10 px-2 py-1 rounded">USDT</span>
    }
    return <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">USDT</span>
  }

  const CryptoItem = ({ crypto, showFavorite = true, isFavorite = false }: { 
    crypto: typeof MULTI_EXCHANGE_MAPPING[0],
    showFavorite?: boolean,
    isFavorite?: boolean
  }) => {
    const isFav = isFavorite || favorites.includes(crypto.id)
    const category = crypto.category[0]?.toLowerCase() || 'other'
    const categoryInfo = CRYPTO_CATEGORIES.find(cat => cat.id === category) || CRYPTO_CATEGORIES[0]
    
    return (
      <div 
        onClick={() => handleCryptoSelect(crypto)}
        className="group flex items-center justify-between p-3 hover:bg-gray-800/60 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-700/50"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 group-hover:border-gray-700 transition-colors`}>
            <span className="font-bold text-sm text-gray-300">{crypto.symbol.slice(0, 2)}</span>
            <div className="absolute -bottom-1 -right-1">
              <FiatBadge fiatPairs={crypto.fiat_pairs} />
            </div>
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white truncate">{crypto.symbol}</span>
              {categoryInfo && (
                <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded ${categoryInfo.color} bg-opacity-10`}>
                  {categoryInfo.name}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 truncate">{crypto.name}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs font-mono bg-gray-800/50 px-2 py-1 rounded">
            #{crypto.popularity_rank}
          </div>
          {showFavorite && (
            <button 
              onClick={(e) => toggleFavorite(crypto.id, e)}
              className="text-gray-500 hover:text-yellow-400 transition-colors"
              title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star 
                size={16} 
                className={isFav ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} 
              />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Bouton de déclenchement */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-600/50 transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">
            {currentCrypto?.symbol.slice(0, 2) || 'BT'}
          </div>
          <div className="text-left">
            <div className="font-semibold text-[#F9FAFB] flex items-center space-x-2">
              <span>{currentCrypto?.symbol || 'BTC'}</span>
              <FiatBadge fiatPairs={currentCrypto?.fiat_pairs || []} />
            </div>
            <div className="text-gray-400 text-sm">
              {currentCrypto?.name || 'Bitcoin'}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-800 shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
            {/* En-tête avec recherche */}
            <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-900/80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une crypto (nom ou symbole)..."
                  className="w-full pl-11 pr-10 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchTerm ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSearchTerm('')
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 rounded-full hover:bg-gray-700/50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-gray-800/50 px-2 py-0.5 rounded-lg">
                    <kbd className="text-xs text-gray-400 border border-gray-700 rounded px-1.5 py-0.5">⌘</kbd>
                    <kbd className="text-xs text-gray-400">K</kbd>
                  </div>
                )}
              </div>
              
              {/* Catégories */}
              <div className="flex space-x-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {CRYPTO_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? `${category.color} bg-opacity-10 border ${category.color.replace('text', 'border')}/20`
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                    }`}
                  >
                    <category.icon size={14} className={selectedCategory === category.id ? category.color : 'text-gray-500'} />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des cryptos */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {filteredCryptos.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/50 mb-3">
                    <Search className="w-5 h-5 text-gray-500" />
                  </div>
                  <h4 className="text-white font-medium mb-1">Aucun résultat</h4>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">Essayez avec un autre terme de recherche ou une autre catégorie</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/40">
                  {/* Favoris */}
                  {favorites.length > 0 && !searchTerm && selectedCategory === 'all' && (
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center text-xs font-medium text-amber-400/80 mb-2">
                        <Star size={14} className="mr-1.5 fill-amber-400/20" />
                        Favoris
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {filteredCryptos
                          .filter(crypto => favorites.includes(crypto.id))
                          .slice(0, 3)
                          .map(crypto => (
                            <CryptoItem 
                              key={`fav-${crypto.id}`} 
                              crypto={crypto} 
                              showFavorite={true}
                              isFavorite={true}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Récents */}
                  {recentCryptos.length > 0 && !searchTerm && selectedCategory === 'all' && (
                    <div className="px-4 pt-2 pb-1">
                      <div className="flex items-center text-xs font-medium text-blue-400/80 mb-2">
                        <Clock size={14} className="mr-1.5 text-blue-400/50" />
                        Récents
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {recentCryptos
                          .slice(0, 3)
                          .map(crypto => (
                            <CryptoItem 
                              key={`recent-${crypto.id}`} 
                              crypto={crypto} 
                              showFavorite={false}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Toutes les cryptos */}
                  <div className="px-4 py-2">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-1">
                      {searchTerm 
                        ? `Résultats pour "${searchTerm}"` 
                        : selectedCategory === 'all' 
                          ? 'Toutes les cryptos' 
                          : `${CRYPTO_CATEGORIES.find(c => c.id === selectedCategory)?.name} (${filteredCryptos.length})`
                      }
                    </div>
                    <div className="space-y-1.5">
                      {filteredCryptos.map(crypto => (
                        <CryptoItem 
                          key={crypto.id} 
                          crypto={crypto} 
                          showFavorite={true}
                          isFavorite={favorites.includes(crypto.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div className="p-3 border-t border-gray-800/40 bg-gray-900/50 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-amber-400/70">
                    <Star size={12} className="fill-amber-400/20" />
                    <span>Favoris</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-400/70">
                    <Clock size={12} className="text-blue-400/50" />
                    <span>Récents</span>
                  </div>
                </div>
                <div className="text-gray-600">
                  {filteredCryptos.length} {filteredCryptos.length > 1 ? 'résultats' : 'résultat'}
                </div>
              </div>
            </div>
          </div>
          
          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(5px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.15s ease-out forwards;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </>
      )}
    </div>
  )
}