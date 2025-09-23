"use client"

import Link from 'next/link'
import { TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Maximize2, Download, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import TradingViewWidget from '@/components/TradingViewWidget'
import { TradingViewCryptoList } from '@/components/TradingViewMiniWidget'

export default function GraphiquesPage() {
  const [selectedPair, setSelectedPair] = useState('BINANCE:BTCEUR')
  const [refreshKey, setRefreshKey] = useState(0)

  // Données statiques pour les infos supplémentaires (optionnel)
  const cryptoInfo = {
    'BINANCE:BTCEUR': { name: 'Bitcoin', description: 'La première et plus connue des cryptomonnaies' },
    'BINANCE:ETHEUR': { name: 'Ethereum', description: 'Plateforme de contrats intelligents' },
    'BINANCE:BNBEUR': { name: 'Binance Coin', description: 'Token natif de Binance' },
    'BINANCE:SOLEUR': { name: 'Solana', description: 'Blockchain haute performance' },
    'BINANCE:XRPEUR': { name: 'XRP', description: 'Monnaie numérique pour les paiements' },
    'BINANCE:ADAEUR': { name: 'Cardano', description: 'Blockchain proof-of-stake' },
    'BINANCE:AVAXEUR': { name: 'Avalanche', description: 'Plateforme de DeFi et dApps' },
    'BINANCE:LINKEUR': { name: 'Chainlink', description: 'Réseau d\'oracles décentralisé' }
  }

  const currentCrypto = cryptoInfo[selectedPair as keyof typeof cryptoInfo]

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

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

        /* TradingView custom styles */
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

        .tradingview-widget-copyright a:visited {
          color: #6366F1 !important;
        }

        .tradingview-widget-copyright a:hover .blue-text {
          color: #8B5CF6 !important;
        }

        .tradingview-widget-copyright a:active .blue-text {
          color: #A855F7 !important;
        }

        .tradingview-widget-copyright a:visited .blue-text {
          color: #6366F1 !important;
        }

        /* Style pour les mini widgets */
        .tradingview-mini-widget .tradingview-widget-copyright {
          display: none !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Header */}
        <header className="relative z-50 border-b border-gray-800/40 glass-effect sticky top-0">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-2xl flex items-center justify-center shadow-2xl">
                    <TrendingUp className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight">CryptoBacktest</span>
                    <div className="text-xs text-gray-500 font-medium tracking-[0.15em] uppercase">Plateforme française</div>
                  </div>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden lg:flex space-x-12">
                <Link href="/cryptos" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <TrendingUp className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Cryptomonnaies
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link href="/graphiques" className="group flex items-center space-x-2 text-[#6366F1] font-semibold relative">
                  <BarChart3 className="w-4 h-4" />
                  <span className="relative">
                    Graphiques
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"></span>
                  </span>
                </Link>
                <Link href="/backtest" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <Activity className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Backtest
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link href="/portefeuille" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <Wallet className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Portefeuille
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link href="/account" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <User className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Account
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </nav>

              {/* Auth */}
              <div className="flex items-center space-x-5">
                <button className="text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800/40 relative group">
                  <span className="relative z-10">Connexion</span>
                </button>
                <button className="relative bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-7 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#6366F1]/40">
                  <span className="relative z-10">S'inscrire</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative h-[calc(100vh-5rem)] max-w-[100vw] mx-auto overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar TradingView */}
            <div className="w-80 border-r border-gray-800/40 glass-effect p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#F9FAFB]">Cryptomonnaies</h3>
                  <button 
                    onClick={handleRefresh}
                    className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all hover:scale-110"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-400 hover:text-[#6366F1]" />
                  </button>
                </div>

                {/* TradingView Crypto List */}
                <div key={refreshKey}>
                  <TradingViewCryptoList 
                    selectedSymbol={selectedPair}
                    onSymbolChange={setSelectedPair}
                    theme="dark"
                  />
                </div>

                {/* Info Crypto */}
                {currentCrypto && (
                  <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
                    <h4 className="font-semibold text-[#F9FAFB] mb-2">{currentCrypto.name}</h4>
                    <p className="text-gray-400 text-sm">{currentCrypto.description}</p>
                  </div>
                )}

                {/* Info TradingView */}
                <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-full"></div>
                    <span className="text-[#F9FAFB] font-medium text-sm">Données TradingView</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Prix et graphiques synchronisés en temps réel avec TradingView. 
                    Données directement depuis les exchanges (Binance, etc.).
                  </p>
                </div>

                {/* Raccourcis */}
                <div className="glass-effect rounded-xl p-4 border border-gray-800/40">
                  <h4 className="font-semibold text-[#F9FAFB] mb-3">Actions rapides</h4>
                  <div className="space-y-2">
                    <Link 
                      href="/backtest" 
                      className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#6366F1]/30 text-[#6366F1] hover:border-[#6366F1]/50 transition-all text-sm"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Backtest {currentCrypto?.name || 'cette crypto'}</span>
                    </Link>
                    <Link 
                      href="/portefeuille" 
                      className="flex items-center space-x-2 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30 text-gray-300 hover:border-gray-600/50 hover:text-[#F9FAFB] transition-all text-sm"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Ajouter au portefeuille</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex flex-col">
              {/* Chart Header */}
              <div className="border-b border-gray-800/40 glass-effect p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="text-2xl font-bold text-[#F9FAFB] flex items-center space-x-3">
                        <span>{selectedPair.split(':')[1]?.replace('EUR', '/EUR') || selectedPair}</span>
                        <div className="flex items-center space-x-1 text-sm">
                          <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                          <span className="text-[#16A34A] font-medium">LIVE</span>
                        </div>
                      </div>
                      <div className="text-gray-400 flex items-center space-x-2">
                        <span>{currentCrypto?.name || 'Crypto'}</span>
                        <span>•</span>
                        <span>Binance</span>
                        <span>•</span>
                        <span>Données temps réel</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                      <Maximize2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="flex-1 p-6">
                <div className="h-full glass-effect rounded-2xl border border-gray-800/40 relative overflow-hidden">
                  {/* TradingView Advanced Chart */}
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}