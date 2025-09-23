"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw } from 'lucide-react'

export default function CryptosPage() {
  // Mock data - remplacer par vraies données CoinGecko plus tard
  const cryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 43250.67, change24h: 2.3, marketCap: 847250000000, volume: 23450000000 },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: 2580.45, change24h: -1.2, marketCap: 310150000000, volume: 15670000000 },
    { id: 3, name: 'Binance Coin', symbol: 'BNB', price: 315.23, change24h: 4.7, marketCap: 48750000000, volume: 1890000000 },
    { id: 4, name: 'Solana', symbol: 'SOL', price: 98.67, change24h: -3.1, marketCap: 42850000000, volume: 2340000000 },
    { id: 5, name: 'XRP', symbol: 'XRP', price: 0.6234, change24h: 1.8, marketCap: 33670000000, volume: 1250000000 },
    { id: 6, name: 'Cardano', symbol: 'ADA', price: 0.4987, change24h: -0.9, marketCap: 17850000000, volume: 890000000 },
    { id: 7, name: 'Avalanche', symbol: 'AVAX', price: 37.89, change24h: 6.2, marketCap: 14230000000, volume: 567000000 },
    { id: 8, name: 'Chainlink', symbol: 'LINK', price: 15.67, change24h: -2.4, marketCap: 9870000000, volume: 445000000 },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: price < 1 ? 4 : 2,
    }).format(price)
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return (cap / 1e12).toFixed(1) + ' T€'
    if (cap >= 1e9) return (cap / 1e9).toFixed(1) + ' Md€'
    if (cap >= 1e6) return (cap / 1e6).toFixed(1) + ' M€'
    return cap.toFixed(0) + ' €'
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
                <Link href="/cryptos" className="group flex items-center space-x-2 text-[#6366F1] font-semibold relative">
                  <TrendingUp className="w-4 h-4" />
                  <span className="relative">
                    Cryptomonnaies
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"></span>
                  </span>
                </Link>
                <Link href="/graphiques" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <BarChart3 className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Graphiques
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
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
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight">
                  Cryptomonnaies
                </h1>
                <p className="text-gray-400 text-xl font-light max-w-2xl">
                  Suivez les prix et performances des principales cryptomonnaies en temps réel
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-4">
                <div className="glass-effect rounded-2xl p-6 text-center min-w-[140px]">
                  <div className="text-2xl font-bold text-[#16A34A] mb-1 font-mono">€2.1T</div>
                  <div className="text-gray-400 text-sm font-medium">Market Cap Total</div>
                </div>
                <div className="glass-effect rounded-2xl p-6 text-center min-w-[140px]">
                  <div className="text-2xl font-bold text-[#6366F1] mb-1 font-mono">€89.4Md</div>
                  <div className="text-gray-400 text-sm font-medium">Volume 24h</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="glass-effect rounded-2xl p-6 mb-8 border border-gray-800/40">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher une cryptomonnaie..."
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <button className="flex items-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all">
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Filtres</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all">
                  <RefreshCcw className="w-4 h-4" />
                  <span className="font-medium">Actualiser</span>
                </button>
              </div>
            </div>
          </div>

          {/* Crypto Table */}
          <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
            {/* Table Header */}
            <div className="border-b border-gray-800/40 bg-gray-900/30">
              <div className="grid grid-cols-6 lg:grid-cols-7 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                <div>Rang</div>
                <div className="col-span-2">Nom</div>
                <div className="text-right">Prix</div>
                <div className="text-right">24h</div>
                <div className="text-right hidden lg:block">Market Cap</div>
                <div className="text-right">Volume</div>
              </div>
            </div>

            {/* Table Body */}
            <div>
              {cryptos.map((crypto, index) => (
                <div key={crypto.id} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors group">
                  <div className="grid grid-cols-6 lg:grid-cols-7 gap-4 p-6 items-center">
                    {/* Rang */}
                    <div className="text-gray-400 font-medium">#{index + 1}</div>
                    
                    {/* Nom */}
                    <div className="col-span-2 flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold">
                        {crypto.symbol[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors">
                          {crypto.name}
                        </div>
                        <div className="text-gray-400 text-sm font-mono">{crypto.symbol}</div>
                      </div>
                    </div>
                    
                    {/* Prix */}
                    <div className="text-right font-mono font-semibold text-[#F9FAFB]">
                      {formatPrice(crypto.price)}
                    </div>
                    
                    {/* Change 24h */}
                    <div className={`text-right font-mono font-semibold flex items-center justify-end space-x-1 ${
                      crypto.change24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}>
                      {crypto.change24h >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{Math.abs(crypto.change24h).toFixed(1)}%</span>
                    </div>
                    
                    {/* Market Cap */}
                    <div className="text-right font-mono text-gray-400 hidden lg:block">
                      {formatMarketCap(crypto.marketCap)}
                    </div>
                    
                    {/* Volume */}
                    <div className="text-right font-mono text-gray-400">
                      {formatMarketCap(crypto.volume)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-[#6366F1]/40">
              Charger plus de cryptomonnaies
            </button>
          </div>
        </main>
      </div>
    </>
  )
}