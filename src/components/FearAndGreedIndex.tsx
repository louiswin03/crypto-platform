"use client"

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Loader2, ChartLine, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface FearGreedData {
  value: string
  value_classification: string
  timestamp: string
  time_until_update?: string
}

export default function FearAndGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [historicalData, setHistoricalData] = useState<FearGreedData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        // Récupérer les données actuelles et historiques (180 jours = 6 mois)
        const [currentResponse, historicalResponse] = await Promise.all([
          fetch('https://api.alternative.me/fng/?limit=1'),
          fetch('https://api.alternative.me/fng/?limit=180')
        ])

        const currentResult = await currentResponse.json()
        const historicalResult = await historicalResponse.json()

        if (currentResult.data && currentResult.data.length > 0) {
          setData(currentResult.data[0])
        }

        if (historicalResult.data && historicalResult.data.length > 0) {
          setHistoricalData(historicalResult.data.reverse()) // Inverser pour ordre chronologique
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching Fear & Greed Index:', err)
        setError('Unable to load data')
        setLoading(false)
      }
    }

    fetchFearGreed()
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchFearGreed, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" />
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
    if (value <= 45) return '#F59E0B' // Fear - Orange
    if (value <= 55) return '#9CA3AF' // Neutral - Gris
    if (value <= 75) return '#16A34A' // Greed - Vert
    return '#10B981' // Extreme Greed - Vert vif
  }

  const getLabel = () => {
    if (value <= 25) return 'Peur Extrême'
    if (value <= 45) return 'Peur'
    if (value <= 55) return 'Neutre'
    if (value <= 75) return 'Avidité'
    return 'Avidité Extrême'
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
    if (val <= 45) return '#F59E0B' // Fear - Orange
    if (val <= 55) return '#9CA3AF' // Neutral - Gris
    if (val <= 75) return '#16A34A' // Greed - Vert
    return '#10B981' // Extreme Greed - Vert vif
  }

  return (
    <>
      <div className="glass-effect-strong rounded-2xl p-6 border border-gray-700/50 relative overflow-hidden">
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center space-x-2 font-bold text-[#F9FAFB] text-base">
              <div className="p-1.5 bg-[#6366F1]/20 rounded-lg">
                {getIcon()}
              </div>
              <span>Fear & Greed Index</span>
            </h3>
            <div className="text-xs text-gray-500">
              Mis à jour il y a {Math.floor((Date.now() - parseInt(data.timestamp) * 1000) / 60000)}min
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
              <div className="text-[9px] text-gray-500">Extrême</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#F59E0B] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">26-45</div>
              <div className="text-[9px] text-gray-500">Peur</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#9CA3AF] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">46-55</div>
              <div className="text-[9px] text-gray-500">Neutre</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#16A34A] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">56-75</div>
              <div className="text-[9px] text-gray-500">Avidité</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1.5 bg-[#10B981] rounded"></div>
              <div className="text-[10px] text-gray-400 mt-1">76-100</div>
              <div className="text-[9px] text-gray-500">Extrême</div>
            </div>
          </div>

          {/* Bouton Voir l'historique */}
          <button
            onClick={() => setShowChart(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 border border-[#6366F1]/40 text-[#6366F1] px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm"
          >
            <ChartLine className="w-4 h-4" />
            Voir l'historique
          </button>

          {/* Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Basé sur la volatilité, le momentum, les réseaux sociaux et les sondages
          </div>
        </div>
      </div>

      {/* Modal Graphique Historique */}
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowChart(false)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#F9FAFB]">Fear & Greed Index - 6 derniers mois</h3>
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
                        let color = '#DC2626'
                        let sentiment = 'Peur Extrême'
                        if (val > 25) { color = '#F59E0B'; sentiment = 'Peur' }
                        if (val > 45) { color = '#9CA3AF'; sentiment = 'Neutre' }
                        if (val > 55) { color = '#16A34A'; sentiment = 'Avidité' }
                        if (val > 75) { color = '#10B981'; sentiment = 'Avidité Extrême' }

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
                  <ReferenceLine y={45} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
                  <ReferenceLine y={55} stroke="#9CA3AF" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />
                  <ReferenceLine y={75} stroke="#16A34A" strokeDasharray="3 3" strokeOpacity={0.5} strokeWidth={1.5} />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366F1"
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
                    activeDot={{ r: 8, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Légende */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#DC2626] rounded"></div>
                <span className="text-gray-400">Peur Extrême</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#F59E0B] rounded"></div>
                <span className="text-gray-400">Peur</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#9CA3AF] rounded"></div>
                <span className="text-gray-400">Neutre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#16A34A] rounded"></div>
                <span className="text-gray-400">Avidité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-[#10B981] rounded"></div>
                <span className="text-gray-400">Avidité Extrême</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
