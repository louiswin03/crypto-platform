"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Play, Pause, RotateCcw, Calendar, Clock, Percent, MousePointer, Move, Save, Copy, ChevronDown, ChevronRight } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'

export default function BacktestPage() {
  const strategyTemplates = [
    { 
      name: 'DCA Bitcoin', 
      description: 'Dollar Cost Averaging hebdomadaire sur BTC', 
      performance: '+324%', 
      winRate: 89,
      type: 'DCA',
      popular: true
    },
    { 
      name: 'RSI Oversold', 
      description: 'Achat quand RSI < 30, vente quand RSI > 70', 
      performance: '+156%', 
      winRate: 72,
      type: 'Technical',
      popular: true
    },
    { 
      name: 'Moving Average Cross', 
      description: 'Signal croisement EMA20 et EMA50', 
      performance: '+89%', 
      winRate: 65,
      type: 'Technical',
      popular: false
    },
    { 
      name: 'Bollinger Bands', 
      description: 'Trading sur les bandes de Bollinger', 
      performance: '+112%', 
      winRate: 68,
      type: 'Technical',
      popular: false
    },
  ]

  const backtestHistory = [
    {
      id: 1,
      name: 'DCA ETH Strategy',
      dateCreated: '2025-01-20',
      performance: '+245%',
      drawdown: '-12%',
      trades: 156,
      winRate: 78,
      status: 'completed'
    },
    {
      id: 2,
      name: 'BTC RSI Strategy',
      dateCreated: '2025-01-19',
      performance: '+89%',
      drawdown: '-8%',
      trades: 89,
      winRate: 65,
      status: 'completed'
    },
    {
      id: 3,
      name: 'Multi-Asset DCA',
      dateCreated: '2025-01-18',
      performance: '+167%',
      drawdown: '-15%',
      trades: 234,
      winRate: 82,
      status: 'running'
    },
  ]

  const currentStrategy = {
    name: 'Ma Stratégie DCA',
    description: 'DCA intelligent avec conditions RSI',
    settings: {
      asset: 'BTCEUR',
      amount: 100,
      frequency: 'weekly',
      rsiCondition: true,
      rsiThreshold: 45
    }
  }

  const backtestResults = {
    totalReturn: 324.5,
    buyHoldReturn: 186.2,
    maxDrawdown: -18.4,
    sharpeRatio: 1.89,
    winRate: 78.5,
    totalTrades: 156,
    avgTrade: 2.3,
    bestTrade: 15.2,
    worstTrade: -8.9,
    profitFactor: 2.1
  }

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

        .strategy-node {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          border: 2px solid rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        }

        .strategy-node:hover {
          border-color: rgba(99, 102, 241, 0.6);
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.2);
        }

        .connection-line {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.5), rgba(139, 92, 246, 0.5));
          height: 2px;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Navigation */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative h-[calc(100vh-5rem)] max-w-[100vw] mx-auto overflow-hidden">
          <div className="flex h-full">
            {/* Left Sidebar - Strategy Builder */}
            <div className="w-96 border-r border-gray-800/40 glass-effect overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">Créer une stratégie</h2>
                  <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Strategy Templates */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-[#F59E0B]" />
                    Templates populaires
                  </h3>
                  <div className="space-y-3">
                    {strategyTemplates.slice(0, 2).map((template) => (
                      <div key={template.name} className="p-4 rounded-xl glass-effect border border-gray-800/40 hover:border-[#6366F1]/40 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors">
                              {template.name}
                            </div>
                            {template.popular && (
                              <div className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold rounded-full">
                                HOT
                              </div>
                            )}
                          </div>
                          <div className="text-[#16A34A] font-mono font-bold text-sm">
                            {template.performance}
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm mb-2">{template.description}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Win Rate: {template.winRate}%</span>
                          <button className="text-[#6366F1] hover:text-[#8B5CF6] font-medium">
                            Utiliser →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategy Builder */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-[#6366F1]" />
                    Builder no-code
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Asset Selection */}
                    <div className="p-4 rounded-xl glass-effect border border-gray-800/40">
                      <div className="text-sm font-medium text-[#F9FAFB] mb-2">1. Choisir l'asset</div>
                      <select className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-[#F9FAFB] text-sm">
                        <option>BTCEUR - Bitcoin</option>
                        <option>ETHEUR - Ethereum</option>
                        <option>BNBEUR - Binance Coin</option>
                      </select>
                    </div>

                    {/* Strategy Type */}
                    <div className="p-4 rounded-xl glass-effect border border-gray-800/40">
                      <div className="text-sm font-medium text-[#F9FAFB] mb-2">2. Type de stratégie</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-3 rounded-lg bg-[#6366F1] text-white text-sm font-medium">
                          DCA
                        </button>
                        <button className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 text-sm font-medium hover:bg-gray-700/50">
                          Technical
                        </button>
                      </div>
                    </div>

                    {/* Parameters */}
                    <div className="p-4 rounded-xl glass-effect border border-gray-800/40">
                      <div className="text-sm font-medium text-[#F9FAFB] mb-3">3. Paramètres</div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Montant par achat</label>
                          <input 
                            type="number" 
                            defaultValue="100"
                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-[#F9FAFB] text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Fréquence</label>
                          <select className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-[#F9FAFB] text-sm">
                            <option>Hebdomadaire</option>
                            <option>Bi-hebdomadaire</option>
                            <option>Mensuel</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-400">Condition RSI</label>
                          <input type="checkbox" className="rounded" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl">
                    <Play className="w-4 h-4" />
                    <span>Lancer le backtest</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-800/50 border border-gray-700/50 text-[#F9FAFB] px-6 py-3 rounded-xl font-medium hover:bg-gray-700/50 transition-all">
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder la stratégie</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Center - Results & Chart */}
            <div className="flex-1 flex flex-col">
              {/* Backtest Header */}
              <div className="border-b border-gray-800/40 glass-effect p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#F9FAFB] mb-2">Backtest : {currentStrategy.name}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Asset: BTCEUR</span>
                      <span>•</span>
                      <span>Période: 1 Jan 2023 - 20 Jan 2025</span>
                      <span>•</span>
                      <span>Portefeuille: Binance</span>
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

                {/* Performance Metrics */}
                <div className="grid grid-cols-6 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#16A34A] font-mono">+{backtestResults.totalReturn}%</div>
                    <div className="text-gray-400 text-xs">Rendement Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-400 font-mono">+{backtestResults.buyHoldReturn}%</div>
                    <div className="text-gray-400 text-xs">Buy & Hold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#DC2626] font-mono">{backtestResults.maxDrawdown}%</div>
                    <div className="text-gray-400 text-xs">Max Drawdown</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#6366F1] font-mono">{backtestResults.sharpeRatio}</div>
                    <div className="text-gray-400 text-xs">Sharpe Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#F9FAFB] font-mono">{backtestResults.winRate}%</div>
                    <div className="text-gray-400 text-xs">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#F9FAFB] font-mono">{backtestResults.totalTrades}</div>
                    <div className="text-gray-400 text-xs">Trades</div>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex-1 p-6">
                <div className="h-full glass-effect rounded-2xl border border-gray-800/40 relative overflow-hidden">
                  <div className="absolute inset-6 flex flex-col justify-center items-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-2xl flex items-center justify-center">
                      <Activity className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#F9FAFB] mb-3">
                        Performance Backtest vs Buy & Hold
                      </div>
                      <div className="text-gray-400 max-w-lg">
                        Graphique de performance comparant votre stratégie DCA avec une approche Buy & Hold simple.
                        Votre stratégie surperforme de <strong className="text-[#16A34A]">+138.3%</strong> !
                      </div>
                    </div>
                    
                    {/* Performance Comparison */}
                    <div className="flex space-x-8 mt-8">
                      <div className="text-center">
                        <div className="w-4 h-4 bg-[#16A34A] rounded-full mx-auto mb-2"></div>
                        <div className="font-semibold text-[#F9FAFB]">Votre Stratégie</div>
                        <div className="text-[#16A34A] font-mono font-bold text-lg">+324.5%</div>
                        <div className="text-gray-400 text-sm">Finale: 42,450€</div>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-gray-500 rounded-full mx-auto mb-2"></div>
                        <div className="font-semibold text-[#F9FAFB]">Buy & Hold</div>
                        <div className="text-gray-400 font-mono font-bold text-lg">+186.2%</div>
                        <div className="text-gray-400 text-sm">Finale: 28,620€</div>
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-[#16A34A]/20 border border-[#16A34A]/40 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-[#16A34A] text-sm font-semibold">TERMINÉ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - History & Analytics */}
            <div className="w-80 border-l border-gray-800/40 glass-effect overflow-y-auto">
              <div className="p-6">
                {/* Backtest History */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#6366F1]" />
                    Historique des backtests
                  </h3>
                  <div className="space-y-3">
                    {backtestHistory.map((test) => (
                      <div key={test.id} className="p-4 rounded-xl glass-effect border border-gray-800/40 hover:border-[#6366F1]/40 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-[#F9FAFB] text-sm">{test.name}</div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            test.status === 'completed' 
                              ? 'bg-[#16A34A]/20 text-[#16A34A]'
                              : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                          }`}>
                            {test.status === 'completed' ? 'Terminé' : 'En cours'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-gray-400">Performance</div>
                            <div className="text-[#16A34A] font-mono font-semibold">{test.performance}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Win Rate</div>
                            <div className="text-[#F9FAFB] font-mono">{test.winRate}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Drawdown</div>
                            <div className="text-[#DC2626] font-mono font-semibold">{test.drawdown}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Trades</div>
                            <div className="text-gray-300 font-mono">{test.trades}</div>
                          </div>
                        </div>
                        <div className="text-gray-500 text-xs mt-2">{test.dateCreated}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Analytics */}
                <div className="mb-8">
                  <h3 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-[#8B5CF6]" />
                    Analytics avancées
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl glass-effect border border-gray-800/40">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Profit Factor</div>
                          <div className="font-mono font-semibold text-[#16A34A]">{backtestResults.profitFactor}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Avg Trade</div>
                          <div className="font-mono font-semibold text-[#F9FAFB]">+{backtestResults.avgTrade}%</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Best Trade</div>
                          <div className="font-mono font-semibold text-[#16A34A]">+{backtestResults.bestTrade}%</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Worst Trade</div>
                          <div className="font-mono font-semibold text-[#DC2626]">{backtestResults.worstTrade}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Metrics */}
                    <div className="p-4 rounded-xl glass-effect border border-gray-800/40">
                      <div className="text-sm font-medium text-[#F9FAFB] mb-3">Métriques de risque</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Volatilité</span>
                          <span className="font-mono text-[#F9FAFB] text-xs">24.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">VaR (95%)</span>
                          <span className="font-mono text-[#DC2626] text-xs">-12.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Calmar Ratio</span>
                          <span className="font-mono text-[#F9FAFB] text-xs">1.76</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-xs">Sortino Ratio</span>
                          <span className="font-mono text-[#16A34A] text-xs">2.34</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div>
                  <h3 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                    <Download className="w-4 h-4 mr-2 text-[#F59E0B]" />
                    Exporter les résultats
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-2 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-[#F9FAFB] text-sm">
                      <span>📊</span>
                      <span>Rapport PDF détaillé</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-[#F9FAFB] text-sm">
                      <span>📈</span>
                      <span>Données Excel/CSV</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-[#F9FAFB] text-sm">
                      <span>🔗</span>
                      <span>Lien de partage</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}