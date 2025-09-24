"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2 } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'

export default function PortefeuillePage() {
  const exchanges = [
    { 
      name: 'Binance', 
      logo: '🔶', 
      connected: true, 
      lastSync: '2 min', 
      status: 'active',
      balance: 12450.67 
    },
    { 
      name: 'Coinbase', 
      logo: '🔵', 
      connected: false, 
      lastSync: null, 
      status: 'disconnected',
      balance: 0 
    },
    { 
      name: 'Kraken', 
      logo: '🟣', 
      connected: true, 
      lastSync: '5 min', 
      status: 'active',
      balance: 8750.32 
    },
  ]

  const holdings = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.28456, valueEur: 12300.45, change24h: 2.3, allocation: 58.2 },
    { symbol: 'ETH', name: 'Ethereum', amount: 4.8567, valueEur: 5240.89, change24h: -1.2, allocation: 24.8 },
    { symbol: 'BNB', name: 'Binance Coin', amount: 12.456, valueEur: 2890.12, change24h: 4.7, allocation: 13.7 },
    { symbol: 'SOL', name: 'Solana', amount: 45.67, valueEur: 980.67, change24h: -3.1, allocation: 4.6 },
  ]

  const transactions = [
    { id: 1, type: 'buy', symbol: 'BTC', amount: 0.0234, price: 43250.67, value: 1012.07, date: '2025-01-20 14:32', exchange: 'Binance' },
    { id: 2, type: 'sell', symbol: 'ETH', amount: 1.2, price: 2580.45, value: 3096.54, date: '2025-01-20 12:15', exchange: 'Kraken' },
    { id: 3, type: 'buy', symbol: 'BNB', amount: 5.0, price: 315.23, value: 1576.15, date: '2025-01-19 16:48', exchange: 'Binance' },
    { id: 4, type: 'buy', symbol: 'SOL', amount: 20.0, price: 98.67, value: 1973.40, date: '2025-01-19 10:22', exchange: 'Kraken' },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatCrypto = (amount: number) => {
    return amount.toLocaleString('fr-FR', { maximumFractionDigits: 8 })
  }

  const totalBalance = holdings.reduce((sum, holding) => sum + holding.valueEur, 0)

  return (
    <ProtectedRoute>
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
        
        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight">
                  Mon Portefeuille
                </h1>
                <p className="text-gray-400 text-xl font-light max-w-2xl">
                  Synchronisez vos exchanges et suivez vos investissements en temps réel
                </p>
              </div>
              
              {/* Portfolio Stats */}
              <div className="flex gap-6">
                <div className="glass-effect rounded-2xl p-6 text-center min-w-[160px]">
                  <div className="text-3xl font-bold text-[#16A34A] mb-1 font-mono">
                    {formatCurrency(totalBalance)}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Valeur totale</div>
                </div>
                <div className="glass-effect rounded-2xl p-6 text-center min-w-[160px]">
                  <div className="text-3xl font-bold text-[#6366F1] mb-1 font-mono">+12.4%</div>
                  <div className="text-gray-400 text-sm font-medium">Performance 30j</div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Connections */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F9FAFB]">Exchanges connectés</h2>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl">
                <Plus className="w-4 h-4" />
                <span>Ajouter un exchange</span>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {exchanges.map((exchange) => (
                <div key={exchange.name} className="glass-effect rounded-2xl p-6 border border-gray-800/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{exchange.logo}</div>
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">{exchange.name}</div>
                        <div className="text-gray-400 text-sm">
                          {exchange.connected ? `Sync: ${exchange.lastSync}` : 'Non connecté'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exchange.status === 'active' 
                        ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40'
                        : 'bg-gray-700/50 text-gray-400 border border-gray-700'
                    }`}>
                      {exchange.status === 'active' ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm mb-1">Solde</div>
                    <div className="font-mono font-bold text-[#F9FAFB] text-lg">
                      {formatCurrency(exchange.balance)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {exchange.connected ? (
                      <>
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm">
                          <Settings className="w-4 h-4" />
                          <span>Config</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-[#DC2626] hover:border-[#DC2626]/50 transition-all text-sm">
                          <Trash2 className="w-4 h-4" />
                          <span>Suppr</span>
                        </button>
                      </>
                    ) : (
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-all text-sm font-semibold">
                        <Key className="w-4 h-4" />
                        <span>Connecter</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="mt-6 glass-effect rounded-2xl p-6 border border-[#F59E0B]/40 bg-[#F59E0B]/5">
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[#F9FAFB] mb-2">Sécurité maximale</div>
                  <div className="text-gray-300 text-sm">
                    Nous utilisons uniquement des clés API en <strong>lecture seule</strong>. 
                    Impossible de trader ou retirer vos fonds. Chiffrement AES-256 pour toutes les données sensibles.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Breakdown */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Holdings */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Holdings</h2>
              <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
                {/* Table Header */}
                <div className="border-b border-gray-800/40 bg-gray-900/30">
                  <div className="grid grid-cols-6 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                    <div className="col-span-2">Asset</div>
                    <div className="text-right">Quantité</div>
                    <div className="text-right">Valeur</div>
                    <div className="text-right">24h</div>
                    <div className="text-right">Allocation</div>
                  </div>
                </div>

                {/* Holdings List */}
                <div>
                  {holdings.map((holding) => (
                    <div key={holding.symbol} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                      <div className="grid grid-cols-6 gap-4 p-6 items-center">
                        <div className="col-span-2 flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold">
                            {holding.symbol[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-[#F9FAFB]">{holding.symbol}</div>
                            <div className="text-gray-400 text-sm">{holding.name}</div>
                          </div>
                        </div>
                        
                        <div className="text-right font-mono text-[#F9FAFB]">
                          {formatCrypto(holding.amount)}
                        </div>
                        
                        <div className="text-right font-mono font-semibold text-[#F9FAFB]">
                          {formatCurrency(holding.valueEur)}
                        </div>
                        
                        <div className={`text-right font-mono font-semibold flex items-center justify-end space-x-1 ${
                          holding.change24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}>
                          {holding.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span>{Math.abs(holding.change24h).toFixed(1)}%</span>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-12 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                                style={{ width: `${holding.allocation}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-sm text-gray-400">{holding.allocation}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio Chart */}
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Répartition</h2>
              <div className="glass-effect rounded-2xl p-6 border border-gray-800/40">
                <div className="aspect-square flex items-center justify-center mb-6">
                  <div className="w-40 h-40 rounded-full border-8 border-[#6366F1] flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#F9FAFB]">4</div>
                      <div className="text-gray-400 text-sm">Assets</div>
                    </div>
                    {/* Mock pie slices would go here */}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {holdings.map((holding, index) => (
                    <div key={holding.symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: `hsl(${220 + index * 30}, 70%, 60%)` 
                          }}
                        ></div>
                        <span className="text-[#F9FAFB] font-medium">{holding.symbol}</span>
                      </div>
                      <div className="font-mono text-gray-400">{holding.allocation}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#F9FAFB]">Transactions récentes</h2>
              <button className="flex items-center space-x-2 text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium">
                <span>Voir tout</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
              {/* Table Header */}
              <div className="border-b border-gray-800/40 bg-gray-900/30">
                <div className="grid grid-cols-7 gap-4 p-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">
                  <div>Type</div>
                  <div>Asset</div>
                  <div className="text-right">Quantité</div>
                  <div className="text-right">Prix</div>
                  <div className="text-right">Valeur</div>
                  <div>Exchange</div>
                  <div className="text-right">Date</div>
                </div>
              </div>

              {/* Transactions List */}
              <div>
                {transactions.map((tx) => (
                  <div key={tx.id} className="border-b border-gray-800/20 hover:bg-gray-800/20 transition-colors">
                    <div className="grid grid-cols-7 gap-4 p-6 items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                        tx.type === 'buy' 
                          ? 'bg-[#16A34A]/20 text-[#16A34A]' 
                          : 'bg-[#DC2626]/20 text-[#DC2626]'
                      }`}>
                        {tx.type === 'buy' ? 'Achat' : 'Vente'}
                      </div>
                      
                      <div className="font-semibold text-[#F9FAFB]">{tx.symbol}</div>
                      
                      <div className="text-right font-mono text-[#F9FAFB]">
                        {formatCrypto(tx.amount)}
                      </div>
                      
                      <div className="text-right font-mono text-gray-400">
                        {formatCurrency(tx.price)}
                      </div>
                      
                      <div className="text-right font-mono font-semibold text-[#F9FAFB]">
                        {formatCurrency(tx.value)}
                      </div>
                      
                      <div className="text-gray-400">{tx.exchange}</div>
                      
                      <div className="text-right text-gray-400 text-sm font-mono">
                        {tx.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}