// src/components/HistoricalDataTest.tsx
"use client"

import React, { useState } from 'react'
import { Play, CheckCircle, XCircle, RefreshCcw, Database, Calendar, TrendingUp } from 'lucide-react'
import {
  useHistoricalData,
  useHistoricalDataTest,
  useBacktestPeriods
} from '@/hooks/useHistoricalData'
import { BacktestPeriod, type SupportedCrypto } from '@/services/historicalDataService'

export default function HistoricalDataTest() {
  const [selectedCrypto, setSelectedCrypto] = useState<SupportedCrypto>('BTC')
  const [selectedPeriod, setSelectedPeriod] = useState<BacktestPeriod>(BacktestPeriod.ONE_MONTH)

  const { periods } = useBacktestPeriods()
  const testResults = useHistoricalDataTest()
  const historicalData = useHistoricalData(selectedCrypto, selectedPeriod, false)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      {/* Test de connexion */}
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#2563EB]" />
          Test de Connexion aux Données
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <span className="text-gray-300">Bitcoin (BTC)</span>
            {testResults.btc === null ? (
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            ) : testResults.btc ? (
              <CheckCircle className="w-5 h-5 text-[#2563EB]" />
            ) : (
              <XCircle className="w-5 h-5 text-[#DC2626]" />
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <span className="text-gray-300">Ethereum (ETH)</span>
            {testResults.eth === null ? (
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            ) : testResults.eth ? (
              <CheckCircle className="w-5 h-5 text-[#2563EB]" />
            ) : (
              <XCircle className="w-5 h-5 text-[#DC2626]" />
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <span className="text-gray-300">Status Global</span>
            {testResults.loading ? (
              <RefreshCcw className="w-5 h-5 text-[#2563EB] animate-spin" />
            ) : testResults.isSuccess ? (
              <CheckCircle className="w-5 h-5 text-[#2563EB]" />
            ) : testResults.hasErrors ? (
              <XCircle className="w-5 h-5 text-[#DC2626]" />
            ) : (
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            )}
          </div>
        </div>

        <button
          onClick={testResults.runTest}
          disabled={testResults.loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{testResults.loading ? 'Test en cours...' : 'Tester la Connexion'}</span>
        </button>

        {testResults.hasErrors && (
          <div className="mt-4 p-4 bg-[#DC2626]/10 border border-[#DC2626]/40 rounded-xl">
            <h4 className="text-[#DC2626] font-semibold mb-2">Erreurs détectées :</h4>
            <ul className="space-y-1">
              {testResults.errors.map((error, index) => (
                <li key={index} className="text-[#DC2626] text-sm">• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Test de récupération de données */}
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2563EB]" />
          Test de Récupération de Données
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Sélection crypto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cryptomonnaie</label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value as SupportedCrypto)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
            </select>
          </div>

          {/* Sélection période */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Période</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as BacktestPeriod)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label} {period.days && `(${period.days} jours)`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={historicalData.refetch}
            disabled={historicalData.loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            <span>{historicalData.loading ? 'Chargement...' : 'Récupérer les Données'}</span>
          </button>

          {historicalData.data && (
            <button
              onClick={historicalData.clearData}
              className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-[#F9FAFB] rounded-xl hover:bg-gray-700/50 transition-all"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Résultats */}
        {historicalData.loading && (
          <div className="flex items-center justify-center p-8">
            <RefreshCcw className="w-8 h-8 text-[#2563EB] animate-spin mr-3" />
            <span className="text-gray-300">Récupération des données...</span>
          </div>
        )}

        {historicalData.hasError && (
          <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/40 rounded-xl">
            <h4 className="text-[#DC2626] font-semibold mb-2">Erreur :</h4>
            <p className="text-[#DC2626] text-sm">{historicalData.error}</p>
          </div>
        )}

        {historicalData.data && (
          <div className="space-y-4">
            {/* Informations générales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                <div className="text-gray-400 text-sm mb-1">Symbol</div>
                <div className="font-bold text-[#F9FAFB]">{historicalData.data.symbol}</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                <div className="text-gray-400 text-sm mb-1">Points de données</div>
                <div className="font-bold text-[#F9FAFB]">{historicalData.data.prices.length}</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                <div className="text-gray-400 text-sm mb-1">Début</div>
                <div className="font-bold text-[#F9FAFB]">{formatDate(historicalData.data.startDate)}</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                <div className="text-gray-400 text-sm mb-1">Fin</div>
                <div className="font-bold text-[#F9FAFB]">{formatDate(historicalData.data.endDate)}</div>
              </div>
            </div>

            {/* Échantillon de données */}
            <div className="p-4 bg-gray-800/30 rounded-xl">
              <h4 className="font-semibold text-[#F9FAFB] mb-3">Échantillon de données (5 premiers points) :</h4>
              <div className="space-y-2">
                {historicalData.data.prices.slice(0, 5).map((price, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{formatDate(price.date)}</span>
                      <span className="font-mono text-[#F9FAFB]">Close: ${formatNumber(price.close)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs ml-4">
                      <span className="text-gray-500">O: ${formatNumber(price.open)}</span>
                      <span className="text-green-400">H: ${formatNumber(price.high)}</span>
                      <span className="text-red-400">L: ${formatNumber(price.low)}</span>
                    </div>
                  </div>
                ))}
                {historicalData.data.prices.length > 5 && (
                  <div className="text-center text-gray-500 text-sm pt-2">
                    ... et {historicalData.data.prices.length - 5} autres points
                  </div>
                )}
              </div>
            </div>

            {/* Stats de prix */}
            {historicalData.data.prices.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                  <div className="text-gray-400 text-sm mb-1">Plus bas</div>
                  <div className="font-mono font-bold text-[#DC2626]">
                    ${formatNumber(Math.min(...historicalData.data.prices.map(p => p.low)))}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                  <div className="text-gray-400 text-sm mb-1">Plus haut</div>
                  <div className="font-mono font-bold text-[#2563EB]">
                    ${formatNumber(Math.max(...historicalData.data.prices.map(p => p.high)))}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                  <div className="text-gray-400 text-sm mb-1">Clôture moyenne</div>
                  <div className="font-mono font-bold text-[#F9FAFB]">
                    ${formatNumber(historicalData.data.prices.reduce((sum, p) => sum + p.close, 0) / historicalData.data.prices.length)}
                  </div>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-xl text-center">
                  <div className="text-gray-400 text-sm mb-1">Clôture actuelle</div>
                  <div className="font-mono font-bold text-[#2563EB]">
                    ${formatNumber(historicalData.data.prices[historicalData.data.prices.length - 1]?.close || 0)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}