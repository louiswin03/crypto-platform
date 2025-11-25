"use client"

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Loader2, ChartLine, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
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
  const [historicalData, setHistoricalData] = useState<FearGreedData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showChart, setShowChart] = useState(false)

  const fetchFearGreed = async () => {
      try {
        // Timeout de 10 secondes
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        // Utiliser l'API proxy au lieu d'appeler directement Alternative.me
        // Ajouter timestamp pour éviter le cache navigateur
        const timestamp = Date.now()
        const [currentResponse, historicalResponse] = await Promise.all([
          fetch(`/api/crypto/fear-greed?limit=1&_t=${timestamp}`, {
            signal: controller.signal,
            cache: 'no-store' // Forcer le rafraîchissement
          }),
          fetch(`/api/crypto/fear-greed?limit=180&_t=${timestamp}`, {
            signal: controller.signal,
            cache: 'no-store' // Forcer le rafraîchissement
          })
        ])

        clearTimeout(timeoutId)

        if (!currentResponse.ok || !historicalResponse.ok) {
          throw new Error('API response not ok')
        }

        const currentResult = await currentResponse.json()
        const historicalResult = await historicalResponse.json()

        if (currentResult.data && currentResult.data.length > 0) {
          setData(currentResult.data[0])
        }

        if (historicalResult.data && historicalResult.data.length > 0) {
          setHistoricalData(historicalResult.data.reverse()) // Inverser pour ordre chronologique
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

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  // Fonction pour obtenir la couleur selon la valeur
  const getColorForValue = (val: number) => {
    if (val <= 25) return '#DC2626' // Extreme Fear - Rouge
    if (val <= 45) return '#FFA366' // Fear - Orange
    if (val <= 55) return '#9CA3AF' // Neutral - Gris
    if (val <= 75) return '#00FF88' // Greed - Vert
    return '#10B981' // Extreme Greed - Vert vif
  }

  // Fonction pour obtenir le label selon la valeur
  const getLabelForValue = (val: number) => {
    if (val <= 25) return t('fear_greed.extreme_fear')
    if (val <= 45) return t('fear_greed.fear')
    if (val <= 55) return t('fear_greed.neutral')
    if (val <= 75) return t('fear_greed.greed')
    return t('fear_greed.extreme_greed')
  }

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

          {/* Bouton Voir l'historique */}
          <button
            onClick={() => setShowChart(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#00FF88]/20 hover:bg-[#00FF88]/30 border border-[#00FF88]/40 text-[#00FF88] px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm"
          >
            <ChartLine className="w-4 h-4" />
            {t('fear_greed.view_history')}
          </button>

          {/* Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            {t('fear_greed.based_on')}
          </div>
        </div>
      </div>

      {/* Modal Graphique Historique */}
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowChart(false)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#F9FAFB]">{t('fear_greed.history_title')}</h3>
              <button
                onClick={() => setShowChart(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicalData.map(item => ({
                    date: formatDate(item.timestamp),
                    value: parseInt(item.value),
                    timestamp: parseInt(item.timestamp)
                  }))}
                  margin={{ top: 20, right: 40, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={Math.floor(historicalData.length / 10)}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    domain={[0, 100]}
                    ticks={[0, 25, 45, 55, 75, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].value
                        const fullDate = new Date(payload[0].payload.timestamp * 1000).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                        const color = getColorForValue(val)
                        const sentiment = getLabelForValue(val)

                        return (
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
                            <p className="text-gray-300 text-sm mb-2">{fullDate}</p>
                            <p className="font-black text-2xl mb-1" style={{ color }}>{val}</p>
                            <p className="text-sm font-semibold" style={{ color }}>{sentiment}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {/* Zones colorées de référence */}
                  <ReferenceLine y={25} stroke="#DC2626" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
                  <ReferenceLine y={45} stroke="#FFA366" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
                  <ReferenceLine y={55} stroke="#9CA3AF" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
                  <ReferenceLine y={75} stroke="#00FF88" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00FF88"
                    strokeWidth={2}
                    dot={(props: any) => {
                      const { cx, cy, payload, index } = props
                      const dotColor = getColorForValue(payload.value)
                      return (
                        <circle
                          key={`dot-${index}-${payload.timestamp}`}
                          cx={cx}
                          cy={cy}
                          r={3.5}
                          fill={dotColor}
                          stroke={dotColor}
                          strokeWidth={1.5}
                          opacity={0.9}
                        />
                      )
                    }}
                    activeDot={{ r: 8, fill: '#00FF88', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Légende */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#DC2626] rounded"></div>
                <span className="text-gray-400">{t('fear_greed.extreme_fear')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#FFA366] rounded"></div>
                <span className="text-gray-400">{t('fear_greed.fear')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#9CA3AF] rounded"></div>
                <span className="text-gray-400">{t('fear_greed.neutral')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#00FF88] rounded"></div>
                <span className="text-gray-400">{t('fear_greed.greed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#10B981] rounded"></div>
                <span className="text-gray-400">{t('fear_greed.extreme_greed')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
