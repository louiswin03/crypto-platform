"use client"

import Link from 'next/link'
import { TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Maximize2, Download, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import TradingViewWidget from '@/components/TradingViewWidget'
import SmartCryptoSelector from '@/components/CryptoSelector/SmartCryptoSelector'

export default function GraphiquesPage() {
  const [selectedPair, setSelectedPair] = useState('BINANCE:BTCEUR')
  const [refreshKey, setRefreshKey] = useState(0)

  // Infos crypto
  const getCryptoInfo = (symbol: string) => {
    // Extraire la paire du symbole TradingView
    const pair = symbol.includes(':') ? symbol.split(':')[1] : symbol
    const crypto = pair?.replace('EUR', '').replace('USD', '').replace('USDT', '') || 'BTC'
    
    // Mapping basique des infos
    const cryptoInfoMap: Record<string, any> = {
      'BTC': { name: 'Bitcoin', description: 'La première et plus connue des cryptomonnaies', category: 'Layer 1' },
      'ETH': { name: 'Ethereum', description: 'Plateforme de contrats intelligents', category: 'Layer 1' },
      'XMR': { name: 'Monero', description: 'Cryptomonnaie axée sur la confidentialité', category: 'Privacy' },
      'COMP': { name: 'Compound', description: 'Protocole de prêt décentralisé', category: 'DeFi' },
      'MKR': { name: 'MakerDAO', description: 'Gouvernance du stablecoin DAI', category: 'DeFi' },
      'SUI': { name: 'Sui', description: 'Blockchain Layer 1 haute performance', category: 'Layer 1' },
      'APT': { name: 'Aptos', description: 'Blockchain Layer 1 sécurisée', category: 'Layer 1' },
    }
    
    return cryptoInfoMap[crypto] || { 
      name: crypto, 
      description: 'Cryptomonnaie', 
      category: 'Blockchain' 
    }
  }

  const currentCrypto = getCryptoInfo(selectedPair)
  const symbolWithoutExchange = selectedPair.includes(':') ? selectedPair.split(':')[1] : selectedPair

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
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-20">
          {/* Page Header avec Sélecteur Multi-Exchange */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight flex items-center space-x-3">
                  <span>Graphiques Cryptos</span>
                  <Sparkles className="w-8 h-8 text-[#6366F1]" />
                </h1>
                <p className="text-gray-400 text-xl font-light max-w-2xl">
                  Graphiques TradingView professionnels pour les principales cryptomonnaies
                </p>
              </div>
              
              <button 
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>

            {/* Nouveau Sélecteur Multi-Exchange */}
            <div className="mb-8">
              <div className="max-w-md">
                <SmartCryptoSelector
                  selectedCrypto={selectedPair}
                  onCryptoSelect={setSelectedPair}
                />
              </div>
            </div>

            {/* Info Crypto Sélectionnée */}
            <div className="glass-effect rounded-2xl p-6 border border-gray-800/40 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {symbolWithoutExchange.replace(/EUR|USD|USDT/g, '').slice(0, 2) || 'BT'}
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#F9FAFB] flex items-center space-x-3">
                      <span>{symbolWithoutExchange || 'BTCEUR'}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                        <span className="text-[#16A34A] font-medium text-sm">LIVE</span>
                      </div>
                    </div>
                    <div className="text-gray-400 flex items-center space-x-2 flex-wrap gap-1">
                      <span>{currentCrypto.name}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] rounded-full text-xs font-medium">
                        {currentCrypto.category}
                      </span>
                      <span>•</span>
                      <span className="text-gray-500">TradingView</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={handleRefresh}
                    className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    title="Actualiser le graphique"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {currentCrypto.description && (
                <div className="mt-4 text-gray-500 text-sm">
                  {currentCrypto.description}
                </div>
              )}
            </div>
          </div>

          {/* Chart Container */}
          <div className="glass-effect rounded-2xl border border-gray-800/40 relative overflow-hidden" style={{ height: '70vh' }}>
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

          {/* Actions rapides */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link 
              href="/backtest" 
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-[#6366F1]/40"
            >
              <Activity className="w-5 h-5" />
              <span>Backtest {currentCrypto.name}</span>
            </Link>
            
            <Link 
              href="/portefeuille" 
              className="flex items-center space-x-2 px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-[#F9FAFB] rounded-xl font-medium hover:bg-gray-700/50 hover:border-gray-600/50 transition-all"
            >
              <Wallet className="w-5 h-5" />
              <span>Ajouter au portefeuille</span>
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}