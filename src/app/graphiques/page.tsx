"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff } from 'lucide-react'

export default function GraphiquesPage() {
  const cryptoPairs = [
    { symbol: 'BTCEUR', name: 'Bitcoin', price: 43250.67, change: 2.3 },
    { symbol: 'ETHEUR', name: 'Ethereum', price: 2580.45, change: -1.2 },
    { symbol: 'BNBEUR', name: 'Binance Coin', price: 315.23, change: 4.7 },
    { symbol: 'SOLEUR', name: 'Solana', price: 98.67, change: -3.1 },
    { symbol: 'XRPEUR', name: 'XRP', price: 0.6234, change: 1.8 },
  ]

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M']
  const indicators = [
    { name: 'RSI', active: true, color: '#6366F1' },
    { name: 'MACD', active: false, color: '#8B5CF6' },
    { name: 'Bollinger', active: true, color: '#16A34A' },
    { name: 'EMA 20', active: false, color: '#F59E0B' },
    { name: 'SMA 50', active: true, color: '#DC2626' },
    { name: 'Volume', active: true, color: '#06B6D4' },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: price < 1 ? 4 : 2,
    }).format(price)
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

        .chart-grid {
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
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
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-800/40 glass-effect p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Crypto Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Paire de trading</h3>
                  <div className="space-y-2">
                    {cryptoPairs.map((pair) => (
                      <div key={pair.symbol} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/40 transition-colors cursor-pointer group">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {pair.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors">
                              {pair.symbol}
                            </div>
                            <div className="text-gray-400 text-sm">{pair.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm font-semibold text-[#F9FAFB]">
                            {formatPrice(pair.price)}
                          </div>
                          <div className={`text-xs font-mono ${
                            pair.change >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}>
                            {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeframes */}
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Intervalle de temps</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {timeframes.map((tf) => (
                      <button key={tf} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        tf === '1d' 
                          ? 'bg-[#6366F1] text-white shadow-lg' 
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-[#F9FAFB]'
                      }`}>
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Indicators */}
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Indicateurs techniques</h3>
                  <div className="space-y-3">
                    {indicators.map((indicator) => (
                      <div key={indicator.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: indicator.color }}
                          ></div>
                          <span className="text-[#F9FAFB] font-medium">{indicator.name}</span>
                        </div>
                        <button className={`p-1 rounded transition-colors ${
                          indicator.active 
                            ? 'text-[#16A34A] hover:text-[#22C55E]' 
                            : 'text-gray-500 hover:text-gray-400'
                        }`}>
                          {indicator.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Outils</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-[#F9FAFB]">
                      <Settings className="w-4 h-4" />
                      <span>Paramètres du graphique</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-[#F9FAFB]">
                      <Download className="w-4 h-4" />
                      <span>Exporter l'image</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-[#F9FAFB]">
                      <Maximize2 className="w-4 h-4" />
                      <span>Plein écran</span>
                    </button>
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
                      <div className="text-2xl font-bold text-[#F9FAFB] flex items-center space-x-2">
                        <span>BTCEUR</span>
                        <span className="text-[#16A34A] font-mono">+2.3%</span>
                      </div>
                      <div className="text-gray-400">Bitcoin / Euro • Binance</div>
                    </div>
                    <div className="flex space-x-8 text-sm">
                      <div>
                        <div className="text-gray-400">Ouverture</div>
                        <div className="font-mono text-[#F9FAFB] font-semibold">43,125.50€</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Haut</div>
                        <div className="font-mono text-[#16A34A] font-semibold">43,850.20€</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Bas</div>
                        <div className="font-mono text-[#DC2626] font-semibold">42,890.75€</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Volume</div>
                        <div className="font-mono text-[#F9FAFB] font-semibold">1,234 BTC</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#F9FAFB] font-mono">43,250.67€</div>
                    <div className="text-gray-400 text-sm">Dernière mise à jour: 12:34:56</div>
                  </div>
                </div>
              </div>

              {/* Chart Container */}
              <div className="flex-1 p-6">
                <div className="h-full glass-effect rounded-2xl border border-gray-800/40 relative overflow-hidden chart-grid">
                  {/* Mock Chart Content */}
                  <div className="absolute inset-6 flex flex-col justify-center items-center space-y-6 text-gray-400">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-[#F9FAFB] mb-2">
                        Graphique interactif BTC/EUR
                      </div>
                      <div className="text-gray-400 max-w-md">
                        Le graphique TradingView sera intégré ici avec tous les indicateurs techniques,
                        outils de dessin et fonctionnalités professionnelles.
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="px-4 py-2 bg-gray-800/50 rounded-lg">
                        <div className="text-xs text-gray-400">RSI (14)</div>
                        <div className="font-mono font-semibold text-[#6366F1]">68.4</div>
                      </div>
                      <div className="px-4 py-2 bg-gray-800/50 rounded-lg">
                        <div className="text-xs text-gray-400">MACD</div>
                        <div className="font-mono font-semibold text-[#16A34A]">+156.2</div>
                      </div>
                      <div className="px-4 py-2 bg-gray-800/50 rounded-lg">
                        <div className="text-xs text-gray-400">Volume</div>
                        <div className="font-mono font-semibold text-[#06B6D4]">12.4M</div>
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-[#16A34A]/20 border border-[#16A34A]/40 rounded-lg">
                      <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                      <span className="text-[#16A34A] text-sm font-semibold">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}