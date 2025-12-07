"use client"

import { OptimizationAdvice } from '@/services/backtestOptimizationService'
import { AlertTriangle, AlertCircle, Lightbulb, CheckCircle, TrendingUp, Shield, Clock, BarChart3, Target } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface OptimizationAdviceProps {
  advice: OptimizationAdvice[]
}

export default function OptimizationAdviceComponent({ advice }: OptimizationAdviceProps) {
  const { t } = useLanguage()
  if (advice.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 p-8 text-center">
        <CheckCircle className="w-16 h-16 text-[#2563EB] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">{t('optimization.optimal_strategy')}</h3>
        <p className="text-gray-400">{t('optimization.no_optimization')}</p>
      </div>
    )
  }

  const getTypeStyles = (type: OptimizationAdvice['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-900/20',
          border: 'border-red-600/50',
          icon: 'text-red-400',
          text: 'text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-600/50',
          icon: 'text-yellow-400',
          text: 'text-yellow-400'
        }
      case 'suggestion':
        return {
          bg: 'bg-blue-900/20',
          border: 'border-blue-600/50',
          icon: 'text-blue-400',
          text: 'text-blue-400'
        }
      case 'success':
        return {
          bg: 'bg-green-900/20',
          border: 'border-green-600/50',
          icon: 'text-green-400',
          text: 'text-green-400'
        }
    }
  }

  const getIcon = (type: OptimizationAdvice['type']) => {
    switch (type) {
      case 'critical':
        return AlertTriangle
      case 'warning':
        return AlertCircle
      case 'suggestion':
        return Lightbulb
      case 'success':
        return CheckCircle
    }
  }

  const getCategoryIcon = (category: OptimizationAdvice['category']) => {
    switch (category) {
      case 'risk_management':
        return Shield
      case 'strategy':
        return Target
      case 'timing':
        return Clock
      case 'indicators':
        return BarChart3
      case 'performance':
        return TrendingUp
    }
  }

  const getImpactBadge = (impact: OptimizationAdvice['impact']) => {
    const styles = {
      high: 'bg-red-600/20 text-red-400 border-red-600/30',
      medium: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
      low: 'bg-blue-600/20 text-blue-400 border-blue-600/30'
    }

    const labels = {
      high: t('optimization.impact_high'),
      medium: t('optimization.impact_medium'),
      low: t('optimization.impact_low')
    }

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${styles[impact]}`}>
        {labels[impact]}
      </span>
    )
  }

  const getCategoryLabel = (category: OptimizationAdvice['category']) => {
    const labels = {
      risk_management: t('optimization.category.risk_management'),
      strategy: t('optimization.category.strategy'),
      timing: t('optimization.category.timing'),
      indicators: t('optimization.category.indicators'),
      performance: t('optimization.category.performance')
    }
    return labels[category]
  }

  // Grouper par catégorie
  const groupedAdvice = advice.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, OptimizationAdvice[]>)

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/40 overflow-hidden shadow-xl">
      <div className="border-b border-gray-700/30 px-6 py-4 bg-gradient-to-r from-[#2563EB]/10 to-[#8B5CF6]/10">
        <h3 className="text-xl font-bold text-[#F9FAFB] flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-[#2563EB]" />
          {t('optimization.title')}
          <span className="text-sm font-normal text-gray-400">
            ({advice.length} {t('optimization.suggestions_detected')
              .replace('{s}', advice.length > 1 ? 's' : '')
              .replace('{s}', advice.length > 1 ? 's' : '')})
          </span>
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {Object.entries(groupedAdvice).map(([category, items]) => {
          const CategoryIcon = getCategoryIcon(category as OptimizationAdvice['category'])

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className="w-5 h-5 text-[#8B5CF6]" />
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  {getCategoryLabel(category as OptimizationAdvice['category'])}
                </h4>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const styles = getTypeStyles(item.type)
                  const Icon = getIcon(item.type)

                  return (
                    <div
                      key={item.id}
                      className={`${styles.bg} border ${styles.border} rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${styles.icon}`} />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className={`text-base font-bold ${styles.text}`}>
                              {item.title}
                            </h5>
                            {getImpactBadge(item.impact)}
                          </div>

                          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                            {item.description}
                          </p>

                          {(item.currentValue || item.suggestedValue) && (
                            <div className="flex items-center gap-4 mb-3 p-2 bg-gray-800/50 rounded-lg">
                              {item.currentValue && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{t('optimization.current')}:</span>
                                  <span className="text-sm font-mono font-semibold text-gray-300">
                                    {item.currentValue}
                                  </span>
                                </div>
                              )}
                              {item.suggestedValue && (
                                <>
                                  <span className="text-gray-600">→</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{t('optimization.suggested')}:</span>
                                    <span className={`text-sm font-mono font-semibold ${styles.text}`}>
                                      {item.suggestedValue}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          <div className="bg-gray-800/30 border-l-4 border-[#2563EB] pl-3 py-2">
                            <p className="text-sm text-[#2563EB] font-medium">
                              💡 {item.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer avec résumé */}
      <div className="border-t border-gray-700/30 px-6 py-4 bg-gray-800/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400">
                {advice.filter(a => a.type === 'critical').length} {t('optimization.critical')}{advice.filter(a => a.type === 'critical').length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-400">
                {advice.filter(a => a.type === 'warning').length} {t('optimization.warning')}{advice.filter(a => a.type === 'warning').length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-400">
                {advice.filter(a => a.type === 'suggestion').length} {t('optimization.suggestion')}{advice.filter(a => a.type === 'suggestion').length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <span className="text-gray-500 italic">
            {t('optimization.analyzed_ai')} • {new Date().toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  )
}
