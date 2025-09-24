// src/components/CryptoSelector/CoinGeckoCryptoSelector.tsx
"use client"

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'

interface CryptoOption {
  id: string
  name: string
  symbol: string
  tradingview_symbol: string
  rank: number
  price: number | null
  change24h: number | null
}

interface CoinGeckoCryptoSelectorProps {
  cryptoOptions: CryptoOption[]
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
}

export default function CoinGeckoCryptoSelector({ 
  cryptoOptions, 
  selectedCrypto, 
  onCryptoSelect 
}: CoinGeckoCryptoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Trouver la crypto actuellement sélectionnée
  const selectedOption = cryptoOptions.find(crypto => crypto.tradingview_symbol === selectedCrypto)

  // Filtrer les options selon la recherche
  const filteredOptions = cryptoOptions.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50) // Limiter à 50 résultats pour les performances

  const handleSelect = (crypto: CryptoOption) => {
    onCryptoSelect(crypto.tradingview_symbol)
    setIsOpen(false)
    setSearchTerm('')
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price)
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-effect rounded-xl border border-gray-800/40 p-4 text-left hover:border-gray-700/50 transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {selectedOption?.symbol.slice(0, 2) || 'BT'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-white">
              {selectedOption?.name || 'Bitcoin'}
            </div>
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <span>#{selectedOption?.rank || 1}</span>
              <span>•</span>
              <span>{selectedOption?.symbol || 'BTC'}</span>
              {selectedOption?.price && (
                <>
                  <span>•</span>
                  <span>{formatPrice(selectedOption.price)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-effect rounded-xl border border-gray-800/40 max-h-96 overflow-hidden z-50">
          {/* Barre de recherche */}
          <div className="p-4 border-b border-gray-800/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher une crypto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {filteredOptions.length} crypto{filteredOptions.length > 1 ? 's' : ''} trouvée{filteredOptions.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Liste des options */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Aucune crypto trouvée
              </div>
            ) : (
              filteredOptions.map((crypto) => (
                <button
                  key={crypto.id}
                  onClick={() => handleSelect(crypto)}
                  className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-800/20 last:border-b-0 ${
                    crypto.tradingview_symbol === selectedCrypto ? 'bg-blue-600/20 border-blue-600/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {crypto.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center space-x-2">
                          <span>#{crypto.rank}</span>
                          <span>•</span>
                          <span>{crypto.symbol}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {crypto.price && (
                        <div className="font-medium text-white text-sm">
                          {formatPrice(crypto.price)}
                        </div>
                      )}
                      {crypto.change24h && (
                        <div className={`text-xs font-medium flex items-center space-x-1 ${
                          crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {crypto.change24h >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {crypto.change24h >= 0 ? '+' : ''}
                            {crypto.change24h.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}