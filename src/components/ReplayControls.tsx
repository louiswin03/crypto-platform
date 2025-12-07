"use client"

import React, { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react'
import { ReplayService, ReplayState } from '@/services/replayService'

interface ReplayControlsProps {
  replayService: ReplayService | null
}

export default function ReplayControls({ replayService }: ReplayControlsProps) {
  const [replayState, setReplayState] = useState<ReplayState | null>(null)

  useEffect(() => {
    if (!replayService) return

    const unsubscribe = replayService.subscribe(setReplayState)
    setReplayState(replayService.getState())

    return unsubscribe
  }, [replayService])

  if (!replayService || !replayState) {
    return null
  }

  const timeInfo = replayService.getTimeInfo()
  const totalDuration = replayService.getTotalDuration()

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const targetIndex = Math.floor(percentage * (totalDuration - 1))
    replayService.goToIndex(targetIndex)
  }

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10]

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl p-4">
      {/* En-tête compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] bg-clip-text text-transparent">Contrôles</h3>
        </div>

        <div className="text-sm text-[#9CA3AF] font-medium">
          {replayState.currentIndex + 1} / {totalDuration}
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div
          className="w-full h-3 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-full cursor-pointer relative overflow-hidden shadow-inner"
          onClick={handleProgressClick}
        >
          {/* Progression */}
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] via-[#8B5CF6] to-[#A855F7] rounded-full transition-all duration-200 shadow-lg"
            style={{ width: `${timeInfo.progress * 100}%` }}
          />

          {/* Marqueurs de trades */}
          {replayState.visibleData.trades.map((trade, index) => {
            // Approximation de la position basée sur l'index actuel
            const position = (replayState.currentIndex / (totalDuration - 1)) * 100
            const isBuy = trade.type === 'BUY'

            return (
              <div
                key={`${trade.timestamp}-${index}`}
                className={`absolute top-0 h-full w-1 ${
                  isBuy ? 'bg-green-400' : 'bg-red-400'
                } opacity-80`}
                style={{ left: `${Math.min(position, 100)}%` }}
                title={`${trade.type} à ${trade.price}$ - ${new Date(trade.timestamp).toLocaleString('fr-FR')}`}
              />
            )
          })}
        </div>

        {/* Info temporelle */}
        <div className="flex justify-between items-center mt-2 text-xs text-[#9CA3AF] font-medium">
          <span>{timeInfo.current}</span>
          <span className="text-center">{timeInfo.total}</span>
        </div>
      </div>

      {/* Contrôles principaux */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {/* Navigation par trade */}
        <button
          onClick={() => replayService.goToPreviousTrade()}
          className="p-2.5 bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] text-[#E5E7EB] rounded-lg transition-all duration-200 hover:scale-105"
          title="Trade précédent"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Step backward */}
        <button
          onClick={() => replayService.stepBackward()}
          className="p-2.5 bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] text-[#E5E7EB] rounded-lg transition-all duration-200 hover:scale-105"
          title="Étape précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => replayState.isPlaying ? replayService.pause() : replayService.play()}
          className={`p-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
            replayState.isPlaying
              ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white hover:scale-105'
              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:scale-105'
          }`}
          title={replayState.isPlaying ? "Pause" : "Play"}
        >
          {replayState.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        {/* Stop */}
        <button
          onClick={() => replayService.stop()}
          className="p-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          title="Stop"
        >
          <Square className="w-4 h-4" />
        </button>

        {/* Step forward */}
        <button
          onClick={() => replayService.stepForward()}
          className="p-2.5 bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] text-[#E5E7EB] rounded-lg transition-all duration-200 hover:scale-105"
          title="Étape suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Navigation par trade */}
        <button
          onClick={() => replayService.goToNextTrade()}
          className="p-2.5 bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] text-[#E5E7EB] rounded-lg transition-all duration-200 hover:scale-105"
          title="Trade suivant"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Contrôle de vitesse compact */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-[#9CA3AF] font-medium">Vitesse:</span>
        </div>

        <div className="flex items-center gap-1">
          {speedOptions.map(speed => (
            <button
              key={speed}
              onClick={() => replayService.setSpeed(speed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                replayState.speed === speed
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] text-white shadow-lg scale-105'
                  : 'bg-white/[0.05] backdrop-blur-sm border border-white/10 hover:bg-white/[0.1] text-[#E5E7EB]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Contrôles compacts */}
      <div className="mt-2 pt-2 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Mode suivi du prix */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {replayState.followPrice ? (
                <Eye className="w-3 h-3 text-blue-400" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
              <span className="text-gray-400">Suivi:</span>
            </div>
            <button
              onClick={() => replayService.toggleFollowPrice()}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                replayState.followPrice
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
              }`}
            >
              {replayState.followPrice ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Taille fenêtre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-green-400" />
              <span className="text-gray-400">Bougies:</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => replayService.setWindowSize(replayState.windowSize - 5)}
                className="px-1 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded text-xs w-5 h-5 flex items-center justify-center"
                disabled={replayState.windowSize <= 10}
              >
                -
              </button>
              <span className="text-xs font-medium text-[#F9FAFB] min-w-[2rem] text-center">
                {replayState.windowSize}
              </span>
              <button
                onClick={() => replayService.setWindowSize(replayState.windowSize + 5)}
                className="px-1 py-0.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded text-xs w-5 h-5 flex items-center justify-center"
                disabled={replayState.windowSize >= 150}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats compactes */}
      <div className="mt-2 pt-2 border-t border-gray-700/50">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-gray-400">Trades</div>
            <div className="font-medium text-[#F9FAFB]">
              {replayState.visibleData.trades.length}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Prix</div>
            <div className="font-medium text-[#F9FAFB]">
              {replayService.getCurrentPrice()?.close.toFixed(0) || '-'}$
            </div>
          </div>
          <div>
            <div className="text-gray-400">Progrès</div>
            <div className="font-medium text-[#F9FAFB]">
              {Math.round(timeInfo.progress * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}