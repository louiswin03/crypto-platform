"use client"

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FearGreedData {
  value: string
  value_classification: string
  timestamp: string
  time_until_update?: string
}

export default function FearAndGreedIndex() {
  const { t } = useLanguage()
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFearGreed = async () => {
      try {
        // Timeout de 10 secondes
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        // Utiliser l'API proxy au lieu d'appeler directement Alternative.me
        // Ajouter timestamp pour éviter le cache navigateur
        const timestamp = Date.now()
        const currentResponse = await fetch(`/api/crypto/fear-greed?limit=1&_t=${timestamp}`, {
          signal: controller.signal,
          cache: 'no-store' // Forcer le rafraîchissement
        })

        clearTimeout(timeoutId)

        if (!currentResponse.ok) {
          throw new Error('API response not ok')
        }

        const currentResult = await currentResponse.json()

        if (currentResult.data && currentResult.data.length > 0) {
          setData(currentResult.data[0])
        }

        setLoading(false)
        setError(null)
      } catch (err) {

        // Données de fallback
        const fallbackData = {
          value: '50',
          value_classification: 'Neutral',
          timestamp: Math.floor(Date.now() / 1000).toString(),
          time_until_update: '0'
        }

        setData(fallbackData)
        setError('Unable to load real-time data. Showing neutral state.')
        setLoading(false)
      }
    }

  useEffect(() => {
    // Force refresh au chargement initial
    fetchFearGreed()
    // Rafraîchir toutes les 2 minutes pour des données plus fraîches
    const interval = setInterval(fetchFearGreed, 2 * 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF88]" />
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  const value = parseInt(data.value)
  const classification = data.value_classification.toLowerCase()

  // Déterminer la couleur selon le sentiment
  const getColor = () => {
    if (value <= 25) return '#DC2626' // Extreme Fear - Rouge
    if (value <= 45) return '#FFA366' // Fear - Orange
    if (value <= 55) return '#9CA3AF' // Neutral - Gris
    if (value <= 75) return '#00FF88' // Greed - Vert
    return '#10B981' // Extreme Greed - Vert vif
  }

  const getLabel = () => {
    if (value <= 25) return t('fear_greed.extreme_fear')
    if (value <= 45) return t('fear_greed.fear')
    if (value <= 55) return t('fear_greed.neutral')
    if (value <= 75) return t('fear_greed.greed')
    return t('fear_greed.extreme_greed')
  }

  const getIcon = () => {
    if (value <= 45) return <TrendingDown className="w-6 h-6" />
    if (value <= 55) return <Activity className="w-6 h-6" />
    return <TrendingUp className="w-6 h-6" />
  }

  const color = getColor()
  const label = getLabel()

  return (
    <>
      <div className="glass-effect-strong rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center space-x-2 font-bold text-[#F9FAFB] text-base">
              <div className="p-1.5 bg-[#00FF88]/20 rounded-lg">
                {getIcon()}
              </div>
              <span>{t('fear_greed.title')}</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">
                {data?.timestamp && new Date(parseInt(data.timestamp) * 1000).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <button
                onClick={() => {
                  setLoading(true)
                  fetchFearGreed()
                }}
                className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                title={t('fear_greed.refresh')}
              >
                <Activity className="w-4 h-4 text-gray-400 hover:text-[#00FF88]" />
              </button>
            </div>
          </div>

          {/* Gauge circulaire - Centrée */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-36 h-36">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#374151"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke={color}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(value / 100) * 376.99} 376.99`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  style={{
                    filter: `drop-shadow(0 0 6px ${color})`
                  }}
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-black" style={{ color }}>
                  {value}
                </div>
                <div className="text-xs text-gray-400 mt-1">/ 100</div>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="text-center mb-4">
            <div
              className="inline-flex items-center px-5 py-2 rounded-xl font-bold text-base"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `2px solid ${color}40`
              }}
            >
              {label}
            </div>
          </div>

          {/* Échelle de référence - Compacte */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#DC2626] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">0-25</div>
              <div className="text-[9px] text-gray-500">{t('fear_greed.extreme')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#FFA366] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">26-45</div>
              <div className="text-[9px] text-gray-500">{t('fear_greed.fear')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#9CA3AF] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">46-55</div>
              <div className="text-[9px] text-gray-500">{t('fear_greed.neutral')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#00FF88] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">56-75</div>
              <div className="text-[9px] text-gray-500">{t('fear_greed.greed')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#10B981] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">76-100</div>
              <div className="text-[9px] text-gray-500">{t('fear_greed.extreme')}</div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            {t('fear_greed.based_on')}
          </div>
        </div>
      </div>
    </>
  )
}
