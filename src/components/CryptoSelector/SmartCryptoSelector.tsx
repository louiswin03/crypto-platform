// src/components/CryptoSelector/SmartCryptoSelector.tsx
"use client"

import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, Badge, Zap, AlertCircle } from 'lucide-react'
import { getBestTradingViewSymbol, searchCryptosWithFallback, MULTI_EXCHANGE_MAPPING, getExchangeStats } from '@/data/multiExchangeMapping'

interface SmartCryptoSelectorProps {
  selectedCrypto: string
  onCryptoSelect: (symbol: string) => void
}

// Couleurs par exchange
const EXCHANGE_COLORS = {
  BINANCE: { bg: 'bg-[#F0B90B]/20', text: 'text-[#F0B90B]', border: 'border-[#F0B90B]/40' },
  COINBASE: { bg: 'bg-[#0052FF]/20', text: 'text-[#0052FF]', border: 'border-[#0052FF]/40' },
  KRAKEN: { bg: 'bg-[#5741D9]/20', text: 'text-[#5741D9]', border: 'border-[#5741D9]/40' },
  KUCOIN: { bg: 'bg-[#00D4AA]/20', text: 'text-[#00D4AA]', border: 'border-[#00D4AA]/40' },
  BYBIT: { bg: 'bg-[#FFA500]/20', text: 'text-[#FFA500]', border: 'border-[#FFA500]/40' },
  OKX: { bg: 'bg-[#000000]/20', text: 'text-white', border: 'border-gray-500/40' },
  HUOBI: { bg: 'bg-[#2E8AF6]/20', text: 'text-[#2E8AF6]', border: 'border-[#2E8AF6]/40' },
  BITFINEX: { bg: 'bg-[#16C784]/20', text: 'text-[#16C784]', border: 'border-[#16C784]/40' },
  CRYPTO_COM: { bg: 'bg-[#002D74]/20', text: 'text-[#002D74]', border: 'border-[#002D74]/40' }
}

// Icônes de liquidité
const LIQUIDITY_ICONS = {
  high: { icon: <Zap className="w-3 h-3" />, color: 'text-[#16A34A]', label: 'Haute liquidité' },
  medium: { icon: <Badge className="w-3 h-3" />, color: 'text-[#F59E0B]', label: 'Liquidité moyenne' },
  low: { icon: <AlertCircle className="w-3 h-3" />, color: 'text-[#DC2626]', label: 'Faible liquidité' }
}

export default function SmartCryptoSelector({ selectedCrypto, onCryptoSelect }: SmartCryptoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')

  const exchangeStats = useMemo(() => getExchangeStats(), [])
  
  const filteredCryptos = useMemo(() => {
    let results = searchTerm 
      ? searchCryptosWithFallback(searchTerm)
      : MULTI_EXCHANGE_MAPPING.slice(0, 100) // Limite initiale pour perf

    // Filtre par exchange
    if (selectedExchange !== 'all') {
      results = results.filter(c => c.exchange === selectedExchange)
    }

    return results.sort((a, b) => a.popularity_rank - b.popularity_rank)
  }, [searchTerm, selectedExchange])

  const currentCrypto = useMemo(() => {
    return MULTI_EXCHANGE_MAPPING.find(c => c.tradingview_symbol === selectedCrypto)
  }, [selectedCrypto])

  const handleCryptoSelect = (crypto: typeof MULTI_EXCHANGE_MAPPING[0]) => {
    onCryptoSelect(crypto.tradingview_symbol)
    setIsOpen(false)
  }

  const ExchangeBadge = ({ exchange, fiatPairs }: { exchange: string, fiatPairs: string[] }) => {
    const colors = EXCHANGE_COLORS[exchange as keyof typeof EXCHANGE_COLORS] || EXCHANGE_COLORS.BINANCE
    const hasEur = fiatPairs.includes('EUR')
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
        <span>{exchange}</span>
        {hasEur && <span className="text-[#16A34A]">EUR</span>}
        {fiatPairs.includes('USD') && !hasEur && <span className="text-[#6366F1]">USD</span>}
        {!hasEur && !fiatPairs.includes('USD') && <span className="text-gray-400">USDT</span>}
      </div>
    )
  }

  const CryptoItem = ({ crypto }: { crypto: typeof MULTI_EXCHANGE_MAPPING[0] }) => {
    const isSelected = selectedCrypto === crypto.tradingview_symbol
    const liquidity = LIQUIDITY_ICONS[crypto.availability]

    return (
      <div
        onClick={() => handleCryptoSelect(crypto)}
        className={`group p-4 cursor-pointer transition-all duration-200 border-b border-gray-800/20 ${
          isSelected
            ? 'bg-[#6366F1]/10 border-l-4 border-l-[#6366F1]'
            : 'hover:bg-gray-800/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500 font-mono text-sm w-8">
              #{crypto.popularity_rank}
            </div>
            
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
              isSelected 
                ? 'from-[#6366F1] to-[#8B5CF6]' 
                : 'from-gray-600 to-gray-700'
            } flex items-center justify-center text-white font-bold text-sm`}>
              {crypto.symbol.slice(0, 2)}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors">
                  {crypto.symbol}
                </span>
                <div className={`inline-flex items-center space-x-1 ${liquidity.color}`} title={liquidity.label}>
                  {liquidity.icon}
                </div>
              </div>
              
              <div className="text-gray-400 text-sm truncate mb-2">
                {crypto.name}
              </div>
              
              <div className="flex items-center space-x-2">
                <ExchangeBadge exchange={crypto.exchange} fiatPairs={crypto.fiat_pairs} />
                <div className="flex space-x-1">
                  {crypto.category.slice(0, 2).map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
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
              {currentCrypto && (
                <ExchangeBadge exchange={currentCrypto.exchange} fiatPairs={currentCrypto.fiat_pairs} />
              )}
            </div>
            <div className="text-gray-400 text-sm">
              {currentCrypto?.name || 'Bitcoin'}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#F9FAFB]">
                  Cryptomonnaies Multi-Exchange
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Rechercher une crypto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-3 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#6366F1]/50"
                />
              </div>

              {/* Exchange Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedExchange('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedExchange === 'all'
                      ? 'bg-[#6366F1] text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-[#F9FAFB]'
                  }`}
                >
                  Tous ({MULTI_EXCHANGE_MAPPING.length})
                </button>
                
                {Object.entries(exchangeStats).map(([exchange, stats]) => (
                  <button
                    key={exchange}
                    onClick={() => setSelectedExchange(exchange)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedExchange === exchange
                        ? 'bg-[#6366F1] text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:text-[#F9FAFB]'
                    }`}
                  >
                    <span>{exchange}</span>
                    <span className="text-xs opacity-75">({stats.count})</span>
                    {stats.eurPairs > 0 && (
                      <span className="text-[#16A34A] text-xs">EUR</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCryptos.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div className="font-medium mb-1">Aucune crypto trouvée</div>
                  <div className="text-sm">Essayez un autre terme de recherche</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/20">
                  {filteredCryptos.map((crypto) => (
                    <CryptoItem key={crypto.tradingview_symbol} crypto={crypto} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-800/40 bg-gray-900/50 text-xs text-gray-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  💡 <strong>EUR prioritaire</strong> - Conversion automatique USD/USDT si nécessaire
                </div>
                <div>
                  🌍 <strong>{Object.keys(exchangeStats).length} exchanges</strong> - Couverture maximale
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}