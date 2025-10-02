"use client"

import React, { useState } from 'react'
import { Activity } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import BacktestConfiguration from '@/components/BacktestConfiguration'
import BacktestChart from '@/components/BacktestChart'
import type { BacktestConfig } from '@/components/BacktestConfiguration'
import { runBacktest, type BacktestResult } from '@/services/backtestEngine'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'

// Fonction pour regrouper les trades en paires (ouverture + fermeture)
function groupTradesIntoPairs(trades: any[]) {
  const pairs = []
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp)

  for (let i = 0; i < sortedTrades.length - 1; i += 2) {
    const openTrade = sortedTrades[i]
    const closeTrade = sortedTrades[i + 1]

    if (openTrade && closeTrade &&
        openTrade.type === 'BUY' && closeTrade.type === 'SELL') {
      pairs.push({
        id: `trade-${Math.floor(i / 2) + 1}`,
        number: Math.floor(i / 2) + 1,
        openTrade,
        closeTrade,
        pnl: closeTrade.pnl || 0,
        pnlPercentage: closeTrade.pnlPercentage || 0,
        duration: closeTrade.timestamp - openTrade.timestamp
      })
    }
  }

  return pairs.reverse() // Les plus récents en premier
}

export default function BacktestPage() {
  const [currentTab, setCurrentTab] = useState('backtest') // 'backtest' | 'results'
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null) // Trade sélectionné pour le zoom
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()

  // Style global pour harmoniser avec les autres pages
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@200;300;400;500;600;700;800&display=swap');

    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .font-mono {
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
    }

    .font-display {
      font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .glass-effect {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .glass-effect-strong {
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .pattern-dots {
      background-image: radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(1deg); }
      66% { transform: translateY(10px) rotate(-1deg); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .float-animation {
      animation: float 6s ease-in-out infinite;
    }

    .shimmer-effect {
      position: relative;
      overflow: hidden;
    }

    .shimmer-effect::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%
      );
      transform: translateX(-100%);
      animation: shimmer 3s ease-in-out infinite;
    }

    .text-gradient-animate {
      background: linear-gradient(45deg, #6366F1, #8B5CF6, #A855F7, #EC4899, #6366F1);
      background-size: 200% 200%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradient-shift 3s ease-in-out infinite;
    }

    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `

  const handleStartBacktest = async (config: BacktestConfig) => {
    setIsRunning(true)
    try {
      console.log('🚀 Lancement du backtest avec config:', config)
      const results = await runBacktest(config)
      setBacktestResults(results)
      setCurrentTab('results')
    } catch (error) {
      console.error('❌ Erreur lors du backtest:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <ProtectedRoute>
      <style jsx global>{globalStyles}</style>

      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>

        {/* Navigation */}
        <SmartNavigation />

        {/* Hero Section - Masqué quand on a des résultats */}
        {currentTab === 'backtest' && !backtestResults && (
          <section className="relative pt-24 sm:pt-32 pb-16 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#8B5CF6]/10 via-[#A855F7]/5 to-transparent rounded-full blur-[100px] float-animation"></div>
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#6366F1]/8 via-[#8B5CF6]/4 to-transparent rounded-full blur-[80px] float-animation" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                {/* Badge */}
                <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect mb-8">
                  <Activity className="w-5 h-5 text-[#8B5CF6] mr-2" />
                  <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('backtest.badge')}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter font-display">
                  <span className="block text-[#F9FAFB] mb-2">{t('backtest.hero.title1')}</span>
                  <span className="block text-gradient-animate">
                    {t('backtest.hero.title2')}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto font-light leading-relaxed">
                  {t('backtest.hero.subtitle')}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm font-medium text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse"></div>
                    <span>{t('backtest.hero.stat1')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                    <span>{t('backtest.hero.stat2')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"></div>
                    <span>{t('backtest.hero.stat3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Smooth gradient transition between hero and navigation */}
        {currentTab === 'backtest' && !backtestResults && (
          <div className="h-32 -mt-16 relative" style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(17, 24, 39, 0.5) 50%, rgba(17, 24, 39, 0.95) 100%)'
          }}></div>
        )}

        {/* Navigation Tabs */}
        <div className={`sticky top-0 z-10 glass-effect-strong ${
          currentTab === 'backtest' && !backtestResults ? '-mt-16' : 'mt-24'
        }`} style={{
          borderBottom: '1px solid rgba(31, 41, 55, 0.2)'
        }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
              <button
                onClick={() => setCurrentTab('backtest')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === 'backtest'
                    ? 'border-[#6366F1] text-[#6366F1]'
                    : 'border-transparent text-gray-400 hover:text-[#F9FAFB] hover:border-gray-300'
                }`}
              >
                {t('backtest.tab.strategy')}
              </button>
              {currentTab === 'results' && (
                <button
                  onClick={() => setCurrentTab('results')}
                  className="py-4 px-2 border-b-2 border-[#16A34A] text-[#16A34A] font-medium text-sm"
                >
                  {t('backtest.tab.results')}
                </button>
              )}
              </div>

              {/* Utilisateur connecté */}
              {currentUser && (
                <div className="py-2 text-sm text-gray-400">
                  {t('backtest.connected_as')} {currentUser.displayName || currentUser.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentTab === 'backtest' ? (
          <main className="relative py-12 px-6 lg:px-8 max-w-7xl mx-auto">
            {(() => {
              console.log('🔍 État utilisateur dans rendu:', currentUser)
              return currentUser
            })() ? (
              <BacktestConfiguration onStartBacktest={handleStartBacktest} isRunning={isRunning} />
            ) : (
              <div className="text-center py-12">
                <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
                  <h2 className="text-2xl font-bold text-[#F9FAFB] mb-4">
                    {t('backtest.login_required')}
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {t('backtest.login_message')}
                  </p>
                  <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 mb-6">
                    <p className="text-blue-400 text-sm">
                      <strong>💡 Info:</strong> {t('backtest.login_info')}
                    </p>
                  </div>
                  {/* Gestion d'authentification supprimée - gérée par ProtectedRoute */}
                </div>
              </div>
            )}
          </main>
        ) : currentTab === 'results' ? (
          <main className="relative py-12 px-6 lg:px-8 max-w-7xl mx-auto">
            {backtestResults ? (
              <div className="space-y-8">
                {/* Header avec résultats clés */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-[#F9FAFB] mb-4">
                    {t('backtest.results.title')}
                  </h2>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-gray-400">{backtestResults.config.crypto}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                      {backtestResults.config.strategyType === 'custom' && backtestResults.config.customStrategy
                        ? backtestResults.config.customStrategy.name || t('backtest.results.custom_strategy')
                        : backtestResults.config.strategy.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">{backtestResults.duration} {t('backtest.results.days')}</span>
                  </div>
                </div>

                {/* Métriques principales */}
                {(() => {
                  const tradePairs = groupTradesIntoPairs(backtestResults.state.trades)
                  const totalTrades = tradePairs.length
                  const winningTrades = tradePairs.filter(pair => pair.pnl > 0).length
                  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 text-center">
                    <div className="text-gray-400 text-sm mb-2">{t('backtest.metrics.total_roi')}</div>
                    <div className={`text-3xl font-bold ${
                      backtestResults.metrics.totalReturnPercentage >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}>
                      {backtestResults.metrics.totalReturnPercentage >= 0 ? '+' : ''}
                      {backtestResults.metrics.totalReturnPercentage.toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      ${backtestResults.metrics.totalReturn.toFixed(2)}
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 text-center">
                    <div className="text-gray-400 text-sm mb-2">{t('backtest.metrics.win_rate')}</div>
                    <div className="text-3xl font-bold text-[#F9FAFB]">
                      {winRate.toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      {winningTrades}/{totalTrades} {t('backtest.metrics.trades')}
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 text-center">
                    <div className="text-gray-400 text-sm mb-2">{t('backtest.metrics.max_drawdown')}</div>
                    <div className="text-3xl font-bold text-[#DC2626]">
                      -{backtestResults.metrics.maxDrawdownPercentage.toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      -${backtestResults.metrics.maxDrawdown.toFixed(2)}
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 text-center">
                    <div className="text-gray-400 text-sm mb-2">{t('backtest.metrics.vs_hold')}</div>
                    <div className={`text-3xl font-bold ${
                      backtestResults.metrics.alpha >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                    }`}>
                      {backtestResults.metrics.alpha >= 0 ? '+' : ''}
                      {backtestResults.metrics.alpha.toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-sm">{t('backtest.metrics.alpha')}</div>
                  </div>
                    </div>
                  )
                })()}

                {/* Graphique de trading */}
                <BacktestChart
                  backtestData={backtestResults}
                  selectedTrade={selectedTrade}
                  onTradeZoomComplete={() => setSelectedTrade(null)}
                />

                {/* Comparaison des stratégies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">{t('backtest.comparison.title')}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{t('backtest.comparison.your_strategy')}</span>
                        <span className={`font-bold ${
                          backtestResults.metrics.totalReturnPercentage >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}>
                          {backtestResults.metrics.totalReturnPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{t('backtest.comparison.hold')}</span>
                        <span className={`font-bold ${
                          backtestResults.metrics.holdStrategyReturnPercentage >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}>
                          {backtestResults.metrics.holdStrategyReturnPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="border-t border-gray-700 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 font-medium">{t('backtest.comparison.difference')}</span>
                          <span className={`font-bold ${
                            backtestResults.metrics.alpha >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}>
                            {backtestResults.metrics.alpha >= 0 ? '+' : ''}
                            {backtestResults.metrics.alpha.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">{t('backtest.stats.title')}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('backtest.stats.num_trades')}</span>
                        <span className="text-[#F9FAFB]">{groupTradesIntoPairs(backtestResults.state.trades).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('backtest.stats.profit_factor')}</span>
                        <span className="text-[#F9FAFB]">{backtestResults.metrics.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('backtest.stats.avg_win')}</span>
                        <span className="text-[#16A34A]">+${backtestResults.metrics.averageWin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('backtest.stats.avg_loss')}</span>
                        <span className="text-[#DC2626]">-${backtestResults.metrics.averageLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('backtest.stats.total_fees')}</span>
                        <span className="text-gray-300">${backtestResults.metrics.totalFees.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste de tous les trades */}
                <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
                  {(() => {
                    const tradePairs = groupTradesIntoPairs(backtestResults.state.trades)
                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-[#F9FAFB]">{t('backtest.trades.title')}</h3>
                          <div className="text-sm text-gray-400">
                            {tradePairs.length} {t('backtest.trades.complete')}
                          </div>
                        </div>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-800/50 rounded">
                          <div className="space-y-4 p-4">
                            {tradePairs.map((pair) => (
                              <div key={pair.id} className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
                                {/* En-tête du trade */}
                                <div className="bg-gray-700/50 px-4 py-2 border-b border-gray-600/50">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-[#F9FAFB]">{t('backtest.trades.trade')} #{pair.number}</h4>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => setSelectedTrade(pair)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                                        title={t('backtest.trades.view')}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {t('backtest.trades.view')}
                                      </button>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        pair.pnl >= 0 ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-[#DC2626]/20 text-[#DC2626]'
                                      }`}>
                                        {pair.pnl >= 0 ? t('backtest.trades.gain') : t('backtest.trades.loss')}
                                      </span>
                                      <span className={`font-bold ${
                                        pair.pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                                      }`}>
                                        {pair.pnl >= 0 ? '+' : ''}${pair.pnl.toFixed(2)}
                                        <span className="text-xs ml-1">({pair.pnlPercentage >= 0 ? '+' : ''}{pair.pnlPercentage.toFixed(1)}%)</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Détails du trade */}
                                <div className="p-4 space-y-3">
                                  {/* Ouverture */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#16A34A]/20 text-[#16A34A]">
                                        {t('backtest.trades.open')}
                                      </span>
                                      <span className="text-sm text-gray-300">{pair.openTrade.date}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-mono text-[#F9FAFB]">${pair.openTrade.price.toFixed(2)}</div>
                                      <div className="text-xs text-gray-400">{pair.openTrade.quantity.toFixed(6)} BTC</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-16">{pair.openTrade.reason}</div>

                                  {/* Fermeture */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#DC2626]/20 text-[#DC2626]">
                                        {t('backtest.trades.close')}
                                      </span>
                                      <span className="text-sm text-gray-300">{pair.closeTrade.date}</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-mono text-[#F9FAFB]">${pair.closeTrade.price.toFixed(2)}</div>
                                      <div className="text-xs text-gray-400">{pair.closeTrade.quantity.toFixed(6)} BTC</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-16">{pair.closeTrade.reason}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentTab('backtest')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    ← {t('backtest.actions.new_strategy')}
                  </button>
                  <button
                    onClick={() => console.log('Export results:', backtestResults)}
                    className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                  >
                    📊 {t('backtest.actions.export')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-[#F9FAFB] mb-4">
                  {t('backtest.no_results')}
                </h2>
                <p className="text-gray-400 mb-8">
                  {t('backtest.no_results_desc')}
                </p>
                <button
                  onClick={() => setCurrentTab('backtest')}
                  className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                >
                  ← {t('backtest.back_to_config')}
                </button>
              </div>
            )}
          </main>
        ) : null}

        {/* Footer */}
        <Footer />

        {/* Debug temporaire */}
      </div>
    </ProtectedRoute>
  )
}