"use client"

import React, { useState } from 'react'
import { Activity, TrendingUp, TrendingDown, Target, BarChart3, Download, FileText, Percent } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import BacktestConfiguration from '@/components/BacktestConfiguration'
import BacktestChart from '@/components/BacktestChart'
import OptimizationAdviceComponent from '@/components/OptimizationAdvice'
import type { BacktestConfig } from '@/components/BacktestConfiguration'
import { runBacktest, type BacktestResult } from '@/services/backtestEngine'
import { analyzeBacktest } from '@/services/backtestOptimizationService'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

// Fonction pour regrouper les trades en paires (ouverture + fermeture)
function groupTradesIntoPairs(trades: any[]) {
  const pairs = []
  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp)

  // Parcourir les trades et associer chaque BUY avec le SELL suivant
  let pairNumber = 1
  let i = 0

  while (i < sortedTrades.length) {
    const trade = sortedTrades[i]

    if (trade.type === 'BUY') {
      // Chercher le prochain SELL après ce BUY
      let j = i + 1
      while (j < sortedTrades.length && sortedTrades[j].type !== 'SELL') {
        j++
      }

      if (j < sortedTrades.length) {
        const openTrade = trade
        const closeTrade = sortedTrades[j]

        pairs.push({
          id: `trade-${pairNumber}`,
          number: pairNumber,
          openTrade,
          closeTrade,
          pnl: closeTrade.pnl || 0,
          pnlPercentage: closeTrade.pnlPercentage || 0,
          duration: closeTrade.timestamp - openTrade.timestamp
        })

        pairNumber++
        i = j + 1 // Continuer après le SELL
      } else {
        i++ // Pas de SELL trouvé, passer au suivant
      }
    } else {
      i++ // Si c'est un SELL orphelin, passer au suivant
    }
  }

  return pairs.reverse() // Les plus récents en premier
}

export default function BacktestPage() {
  const [currentTab, setCurrentTab] = useState('backtest') // 'backtest' | 'results'
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null)
  const [lastUsedConfig, setLastUsedConfig] = useState<BacktestConfig | null>(null) // Nouvelle state pour garder la config
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null) // Trade sélectionné pour le zoom
  const [showExportMenu, setShowExportMenu] = useState(false)
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  const { isDarkMode } = useTheme()

  // Fonction pour exporter en CSV
  const exportToCSV = () => {
    if (!backtestResults) return

    const { state, config } = backtestResults

    // En-têtes CSV
    let csv = 'Type,Date,Prix,Capital,Quantité,P&L,Frais,Raison\n'

    // Ajouter toutes les transactions
    state.trades.forEach(trade => {
      const date = new Date(trade.timestamp).toLocaleString('fr-FR')
      const row = [
        trade.type,
        `"${date}"`,
        trade.price?.toFixed(2) || '',
        trade.capital?.toFixed(2) || '',
        trade.quantity?.toFixed(8) || '',
        trade.pnl?.toFixed(2) || '',
        trade.fees?.toFixed(2) || '',
        `"${trade.reason || ''}"`
      ].join(',')
      csv += row + '\n'
    })

    // Ajouter le résumé
    csv += '\n\nRÉSUMÉ\n'
    csv += `Trades Totaux,${state.summary?.totalTrades || 0}\n`
    csv += `Trades Gagnants,${state.summary?.winningTrades || 0}\n`
    csv += `Trades Perdants,${state.summary?.losingTrades || 0}\n`
    csv += `Taux de Réussite,${((state.summary?.winRate || 0) * 100).toFixed(2)}%\n`
    csv += `P&L Total,$${state.summary?.totalPnL?.toFixed(2) || '0.00'}\n`
    csv += `Rendement Total,${((state.summary?.totalReturn || 0) * 100).toFixed(2)}%\n`
    csv += `Capital Final,$${state.capital?.toFixed(2) || config.initialCapital}\n`
    csv += `Capital Initial,$${config.initialCapital}\n`
    csv += `Profit Moyen,$${state.summary?.averageWin?.toFixed(2) || '0.00'}\n`
    csv += `Perte Moyenne,$${state.summary?.averageLoss?.toFixed(2) || '0.00'}\n`
    csv += `Max Drawdown,${((state.summary?.maxDrawdown || 0) * 100).toFixed(2)}%\n`

    // Télécharger le fichier avec BOM UTF-8 pour compatibilité Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `backtest_${config.crypto}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportMenu(false)
  }

  // Fonction pour exporter en JSON
  const exportToJSON = () => {
    if (!backtestResults) return

    const { state, config, indicators } = backtestResults

    const exportData = {
      config: {
        crypto: config.crypto,
        period: config.period,
        strategy: config.strategy,
        initialCapital: config.initialCapital,
        positionSize: config.positionSize,
        stopLoss: config.riskManagement.stopLoss,
        takeProfit: config.riskManagement.takeProfit
      },
      summary: state.summary,
      trades: state.trades.map(trade => ({
        type: trade.type,
        date: new Date(trade.timestamp).toISOString(),
        price: trade.price,
        capital: trade.capital,
        quantity: trade.quantity,
        pnl: trade.pnl,
        fees: trade.fees,
        reason: trade.reason
      })),
      capitalHistory: state.capitalHistory,
      indicators: Object.keys(indicators).filter(key => indicators[key])
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `backtest_${config.crypto}_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportMenu(false)
  }

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
      background: linear-gradient(45deg, #00FF88, #00D9FF, #00FFD9, #00FF88);
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

    /* Styles pour la barre de scrubbing */
    input[type="range"].slider-thumb {
      -webkit-appearance: none;
      appearance: none;
    }

    input[type="range"].slider-thumb::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #00FF88;
      cursor: pointer;
      border: 3px solid #1F2937;
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
      transition: all 0.2s ease;
    }

    input[type="range"].slider-thumb::-webkit-slider-thumb:hover {
      width: 22px;
      height: 22px;
      box-shadow: 0 0 12px rgba(0, 255, 136, 0.8);
    }

    input[type="range"].slider-thumb::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #00FF88;
      cursor: pointer;
      border: 3px solid #1F2937;
      box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
      transition: all 0.2s ease;
    }

    input[type="range"].slider-thumb::-moz-range-thumb:hover {
      width: 22px;
      height: 22px;
      box-shadow: 0 0 12px rgba(0, 255, 136, 0.8);
    }
  `

  const handleStartBacktest = async (config: BacktestConfig) => {
    setIsRunning(true)
    try {
      const results = await runBacktest(config)
      setBacktestResults(results)
      setLastUsedConfig(config) // Sauvegarder la config utilisée
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

      <div className={`min-h-screen relative overflow-hidden ${
        isDarkMode ? 'bg-[#0A0E1A] text-[#F9FAFB]' : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>

        {/* Background Effects globaux */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#FFA366]/10 via-[#00D9FF]/6 to-transparent rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#8B5CF6]/8 to-transparent rounded-full blur-[100px]"></div>
        </div>

        {/* Navigation */}
        <SmartNavigation />

        {/* Hero Section - Simplifié et épuré */}
        {currentTab === 'backtest' && (
          <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20">
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                {/* Badge épuré */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mb-8">
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-sm font-medium text-[#8B5CF6]">
                    {t('backtest.badge')}
                  </span>
                </div>

                {/* Title simplifié */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className={`block ${isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'}`}>
                    {t('backtest.hero.title1')}
                  </span>
                  <span className="block bg-gradient-to-r from-[#00FF88] via-[#00D9FF] to-[#8B5CF6] bg-clip-text text-transparent">
                    {t('backtest.hero.title2')}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className={`text-lg mb-10 max-w-2xl mx-auto ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('backtest.hero.subtitle')}
                </p>

                {/* Quick Stats - Plus épuré */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00FF88] rounded-full"></div>
                    <span>{t('backtest.hero.stat1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00D9FF] rounded-full"></div>
                    <span>{t('backtest.hero.stat2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#FFA366] rounded-full"></div>
                    <span>{t('backtest.hero.stat3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Navigation Tabs - Épurée et moderne */}
        <div className={`sticky top-20 z-10 backdrop-blur-xl border-b ${
          isDarkMode
            ? 'bg-[#0A0E1A]/95 border-gray-800/50'
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentTab('backtest')}
                  className={`relative px-6 py-4 font-medium text-sm transition-all duration-200 ${
                    currentTab === 'backtest'
                      ? 'text-[#00FF88]'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{t('backtest.tab.strategy')}</span>
                  {currentTab === 'backtest' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00FF88]"></div>
                  )}
                </button>
                {backtestResults && (
                  <button
                    onClick={() => setCurrentTab('results')}
                    className={`relative px-6 py-4 font-medium text-sm transition-all duration-200 ${
                      currentTab === 'results'
                        ? 'text-[#00FF88]'
                        : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{t('backtest.tab.results')}</span>
                    {currentTab === 'results' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00FF88]"></div>
                    )}
                  </button>
                )}
              </div>

              {/* Utilisateur connecté - Plus discret */}
              {currentUser && (
                <div className={`text-sm hidden md:block ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentTab === 'backtest' ? (
          <main className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            {/* Disclaimer Légal - Plus épuré */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className={`rounded-xl p-4 border ${
                isDarkMode
                  ? 'bg-yellow-500/5 border-yellow-500/20'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-yellow-200/90' : 'text-yellow-900'
                }`}>
                  <span className="font-semibold">⚠️ {t('warning.short')} :</span> {t('warning.past_performance')} <strong>{t('warning.significant_risks')}</strong>. {t('warning.risk_capital')} <strong>{t('warning.not_advice')}</strong>.
                </p>
              </div>
            </div>

            {currentUser ? (
              <BacktestConfiguration
                onStartBacktest={handleStartBacktest}
                isRunning={isRunning}
                initialConfig={lastUsedConfig || undefined}
              />
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className={`rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md mx-auto ${
                  isDarkMode ? 'glass-effect' : 'bg-white/95 border border-gray-200'
                }`}>
                  <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                    isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                  }`}>
                    {t('backtest.login_required')}
                  </h2>
                  <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('backtest.login_message')}
                  </p>
                  <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-blue-400 text-xs sm:text-sm">
                      <strong>💡 Info:</strong> {t('backtest.login_info')}
                    </p>
                  </div>
                  {/* Gestion d'authentification supprimée - gérée par ProtectedRoute */}
                </div>
              </div>
            )}
          </main>
        ) : currentTab === 'results' ? (
          <main className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {backtestResults ? (
              <div className="space-y-10">
                {/* Header avec résultats clés - Épuré */}
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                  }`}>
                    {t('backtest.results.title')}
                  </h2>
                  <div className={`flex flex-wrap items-center justify-center gap-3 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">{backtestResults.config.crypto}</span>
                    <span>•</span>
                    <span>
                      {backtestResults.config.strategyType === 'custom' && backtestResults.config.customStrategy
                        ? backtestResults.config.customStrategy.name || t('backtest.results.custom_strategy')
                        : backtestResults.config.strategy.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{backtestResults.duration} {t('backtest.results.days')}</span>
                  </div>
                </div>

                {/* Métriques principales - Design professionnel avec icônes */}
                {(() => {
                  const tradePairs = groupTradesIntoPairs(backtestResults.state.trades)
                  const totalTrades = tradePairs.length
                  const winningTrades = tradePairs.filter(pair => pair.pnl > 0).length
                  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* ROI Total */}
                      <div className={`group rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                        isDarkMode
                          ? 'glass-effect border-gray-700/50 hover:border-[#00FF88]/30'
                          : 'bg-white border-gray-200 hover:border-[#00FF88]/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl ${
                            backtestResults.metrics.totalReturnPercentage >= 0
                              ? 'bg-[#00FF88]/10'
                              : 'bg-[#DC2626]/10'
                          }`}>
                            {backtestResults.metrics.totalReturnPercentage >= 0 ? (
                              <TrendingUp className="w-5 h-5 text-[#00FF88]" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-[#DC2626]" />
                            )}
                          </div>
                        </div>
                        <div className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {t('backtest.metrics.total_roi')}
                        </div>
                        <div className={`text-3xl font-bold mb-1 ${
                          backtestResults.metrics.totalReturnPercentage >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                        }`}>
                          {backtestResults.metrics.totalReturnPercentage >= 0 ? '+' : ''}
                          {backtestResults.metrics.totalReturnPercentage.toFixed(2)}%
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          ${backtestResults.metrics.totalReturn.toFixed(2)}
                        </div>
                      </div>

                      {/* Win Rate */}
                      <div className={`group rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                        isDarkMode
                          ? 'glass-effect border-gray-700/50 hover:border-[#8B5CF6]/30'
                          : 'bg-white border-gray-200 hover:border-[#8B5CF6]/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10">
                            <Target className="w-5 h-5 text-[#8B5CF6]" />
                          </div>
                        </div>
                        <div className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {t('backtest.metrics.win_rate')}
                        </div>
                        <div className={`text-3xl font-bold mb-1 ${
                          isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                        }`}>
                          {winRate.toFixed(1)}%
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {winningTrades}/{totalTrades} {t('backtest.metrics.trades')}
                        </div>
                      </div>

                      {/* Max Drawdown */}
                      <div className={`group rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                        isDarkMode
                          ? 'glass-effect border-gray-700/50 hover:border-[#DC2626]/30'
                          : 'bg-white border-gray-200 hover:border-[#DC2626]/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 rounded-xl bg-[#DC2626]/10">
                            <TrendingDown className="w-5 h-5 text-[#DC2626]" />
                          </div>
                        </div>
                        <div className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {t('backtest.metrics.max_drawdown')}
                        </div>
                        <div className="text-3xl font-bold mb-1 text-[#DC2626]">
                          -{backtestResults.metrics.maxDrawdownPercentage.toFixed(2)}%
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          -${backtestResults.metrics.maxDrawdown.toFixed(2)}
                        </div>
                      </div>

                      {/* Alpha vs Hold */}
                      <div className={`group rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                        isDarkMode
                          ? 'glass-effect border-gray-700/50 hover:border-[#00D9FF]/30'
                          : 'bg-white border-gray-200 hover:border-[#00D9FF]/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl ${
                            backtestResults.metrics.alpha >= 0
                              ? 'bg-[#00D9FF]/10'
                              : 'bg-gray-500/10'
                          }`}>
                            <Percent className={`w-5 h-5 ${
                              backtestResults.metrics.alpha >= 0 ? 'text-[#00D9FF]' : 'text-gray-500'
                            }`} />
                          </div>
                        </div>
                        <div className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {t('backtest.metrics.vs_hold')}
                        </div>
                        <div className={`text-3xl font-bold mb-1 ${
                          backtestResults.metrics.alpha >= 0 ? 'text-[#00D9FF]' : 'text-gray-500'
                        }`}>
                          {backtestResults.metrics.alpha >= 0 ? '+' : ''}
                          {backtestResults.metrics.alpha.toFixed(2)}%
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {t('backtest.metrics.alpha')}
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
                    isDarkMode ? 'glass-effect border-gray-700/50' : 'bg-white/95 border-gray-200'
                  }`}>
                    <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                      isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                    }`}>
                      {t('backtest.comparison.title')}
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center text-sm sm:text-base">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.comparison.your_strategy')}
                        </span>
                        <span className={`font-bold ${
                          backtestResults.metrics.totalReturnPercentage >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                        }`}>
                          {backtestResults.metrics.totalReturnPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm sm:text-base">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.comparison.hold')}
                        </span>
                        <span className={`font-bold ${
                          backtestResults.metrics.holdStrategyReturnPercentage >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                        }`}>
                          {backtestResults.metrics.holdStrategyReturnPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className={`border-t pt-2 sm:pt-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('backtest.comparison.difference')}
                          </span>
                          <span className={`font-bold ${
                            backtestResults.metrics.alpha >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                          }`}>
                            {backtestResults.metrics.alpha >= 0 ? '+' : ''}
                            {backtestResults.metrics.alpha.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
                    isDarkMode ? 'glass-effect border-gray-700/50' : 'bg-white/95 border-gray-200'
                  }`}>
                    <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                      isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                    }`}>
                      {t('backtest.stats.title')}
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.stats.num_trades')}
                        </span>
                        <span className={isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'}>
                          {groupTradesIntoPairs(backtestResults.state.trades).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.stats.profit_factor')}
                        </span>
                        <span className={isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'}>
                          {backtestResults.metrics.profitFactor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.stats.avg_win')}
                        </span>
                        <span className="text-[#00FF88]">+${backtestResults.metrics.averageWin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.stats.avg_loss')}
                        </span>
                        <span className="text-[#DC2626]">-${backtestResults.metrics.averageLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {t('backtest.stats.total_fees')}
                        </span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          ${backtestResults.metrics.totalFees.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste de tous les trades */}
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
                  isDarkMode ? 'glass-effect border-gray-700/50' : 'bg-white/95 border-gray-200'
                }`}>
                  {(() => {
                    const tradePairs = groupTradesIntoPairs(backtestResults.state.trades)
                    return (
                      <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                          <h3 className={`text-lg sm:text-xl font-bold ${
                            isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                          }`}>
                            {t('backtest.trades.title')}
                          </h3>
                          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {tradePairs.length} {t('backtest.trades.complete')}
                          </div>
                        </div>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-800/50 rounded-lg sm:rounded-xl">
                          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4">
                            {tradePairs.map((pair) => (
                              <div key={pair.id} className="bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
                                {/* En-tête du trade */}
                                <div className="bg-gray-700/50 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-600/50">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                    <h4 className="text-sm sm:text-base font-bold text-[#F9FAFB]">{t('backtest.trades.trade')} #{pair.number}</h4>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                      <button
                                        onClick={() => setSelectedTrade(pair)}
                                        className="px-2.5 sm:px-3 py-1.5 sm:py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                                        title={t('backtest.trades.view')}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="hidden sm:inline">{t('backtest.trades.view')}</span>
                                      </button>
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        pair.pnl >= 0 ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-[#DC2626]/20 text-[#DC2626]'
                                      }`}>
                                        {pair.pnl >= 0 ? t('backtest.trades.gain') : t('backtest.trades.loss')}
                                      </span>
                                      <span className={`font-bold text-sm sm:text-base ${
                                        pair.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                                      }`}>
                                        {pair.pnl >= 0 ? '+' : ''}${pair.pnl.toFixed(2)}
                                        <span className="text-xs ml-1">({pair.pnlPercentage >= 0 ? '+' : ''}{pair.pnlPercentage.toFixed(1)}%)</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Détails du trade */}
                                <div className="p-3 sm:p-4 space-y-3">
                                  {/* Ouverture */}
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#00FF88]/20 text-[#00FF88]">
                                        {t('backtest.trades.open')}
                                      </span>
                                      <span className="text-xs sm:text-sm text-gray-300">{pair.openTrade.date}</span>
                                    </div>
                                    <div className="text-left sm:text-right">
                                      <div className="text-sm sm:text-base font-mono text-[#F9FAFB]">${pair.openTrade.price.toFixed(2)}</div>
                                      <div className="text-xs text-gray-400">{pair.openTrade.quantity.toFixed(6)} BTC</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-0 sm:ml-16 pl-2 border-l-2 border-gray-700/50 sm:border-0 sm:pl-0">{pair.openTrade.reason}</div>

                                  {/* Fermeture */}
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-[#DC2626]/20 text-[#DC2626]">
                                        {t('backtest.trades.close')}
                                      </span>
                                      <span className="text-xs sm:text-sm text-gray-300">{pair.closeTrade.date}</span>
                                    </div>
                                    <div className="text-left sm:text-right">
                                      <div className="text-sm sm:text-base font-mono text-[#F9FAFB]">${pair.closeTrade.price.toFixed(2)}</div>
                                      <div className="text-xs text-gray-400">{pair.closeTrade.quantity.toFixed(6)} BTC</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 ml-0 sm:ml-16 pl-2 border-l-2 border-gray-700/50 sm:border-0 sm:pl-0">{pair.closeTrade.reason}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Conseils d'Optimisation */}
                <div className="mb-8">
                  <OptimizationAdviceComponent advice={analyzeBacktest(backtestResults, t)} />
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setCurrentTab('backtest')}
                    className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base"
                  >
                    ← {t('backtest.actions.new_strategy')}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="w-full sm:w-auto bg-[#00FF88]/10 hover:bg-[#00FF88]/15 text-[#00FF88] border-2 border-[#00FF88]/30 hover:border-[#00FF88]/40 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base"
                    >
                      📊 {t('backtest.actions.export')}
                    </button>
                    {showExportMenu && (
                      <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-48 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl shadow-xl z-50">
                        <button
                          onClick={exportToCSV}
                          className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-700 text-green-400 font-medium rounded-t-lg sm:rounded-t-xl transition-colors flex items-center gap-2 text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {t('backtest.actions.export_csv')}
                        </button>
                        <button
                          onClick={exportToJSON}
                          className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-700 text-blue-400 font-medium rounded-b-lg sm:rounded-b-xl transition-colors flex items-center gap-2 text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          {t('backtest.actions.export_json')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <h2 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-[#F9FAFB]' : 'text-[#1E293B]'
                }`}>
                  {t('backtest.no_results')}
                </h2>
                <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('backtest.no_results_desc')}
                </p>
                <button
                  onClick={() => setCurrentTab('backtest')}
                  className="bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 hover:text-white border-2 border-gray-700/50 hover:border-[#00FF88]/30 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base"
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