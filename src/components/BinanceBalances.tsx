"use client"

import { useState, useEffect } from 'react'
import { RefreshCcw, TrendingUp, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Balance {
  asset: string
  free: number
  locked: number
  total: number
  valueUsd: number
  priceUsd: number
}

export default function BinanceBalances() {
  const { t } = useLanguage()
  const [balances, setBalances] = useState<Balance[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    loadBalances()
  }, [])

  const loadBalances = async () => {
    setIsLoading(true)
    setError('')

    try {
      const authData = localStorage.getItem('crypto_platform_auth')
      if (!authData) {
        setError(t('portfolio.not_authenticated'))
        setIsLoading(false)
        return
      }

      const { token } = JSON.parse(authData)

      const response = await fetch('/api/binance/balances', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setBalances(data.balances)
        setTotalValue(data.totalValueUsd)
        setLastUpdate(data.lastUpdate)
      } else {
        setError(data.error || t('portfolio.loading_error'))
      }
    } catch (err) {
      setError(t('portfolio.network_error'))
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatCrypto = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    })
  }

  if (isLoading) {
    return (
      <div className="glass-effect-strong rounded-3xl p-8 border border-gray-700/50">
        <div className="flex items-center justify-center py-12">
          <RefreshCcw className="w-8 h-8 text-[#F0B90B] animate-spin" />
          <span className="ml-3 text-gray-400">{t('portfolio.loading_wallet').replace('{exchange}', 'Binance')}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-effect-strong rounded-3xl p-8 border border-red-700/50 bg-red-900/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">{t('portfolio.error')}</h3>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={loadBalances}
              className="mt-3 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg transition-colors text-sm"
            >
              {t('portfolio.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec total */}
      <div className="glass-effect-strong rounded-3xl p-8 border border-[#F0B90B]/30 bg-gradient-to-br from-[#F0B90B]/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2">
              <img src="/Binance.png" alt="Binance" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB]">Binance</h2>
              <p className="text-sm text-gray-400">{t('portfolio.synced_wallet')}</p>
            </div>
          </div>
          <button
            onClick={loadBalances}
            className="p-3 hover:bg-gray-800/50 rounded-xl transition-colors"
            title={t('portfolio.refresh_tooltip')}
          >
            <RefreshCcw className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">{t('portfolio.total_value_label')}</div>
          <div className="text-4xl font-black text-[#F9FAFB] mb-1">
            {formatCurrency(totalValue)}
          </div>
          {lastUpdate && (
            <div className="text-xs text-gray-500">
              {t('portfolio.updated')}: {new Date(lastUpdate).toLocaleString('fr-FR')}
            </div>
          )}
        </div>
      </div>

      {/* Liste des assets */}
      <div className="glass-effect-strong rounded-3xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-[#F9FAFB] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#F0B90B]" />
          {t('portfolio.your_assets')} ({balances.filter(balance => balance.valueUsd > 0.1).length})
        </h3>

        {balances.length === 0 ? (
          <p className="text-center text-gray-400 py-8">{t('portfolio.no_assets')}</p>
        ) : (
          <div className="space-y-3">
            {balances.filter(balance => balance.valueUsd > 0.1).map((balance) => (
              <div
                key={balance.asset}
                className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0B90B] to-[#F8D12F] flex items-center justify-center font-bold text-[#0F172A]">
                      {balance.asset.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-[#F9FAFB]">{balance.asset}</div>
                      <div className="text-xs text-gray-400">
                        {balance.priceUsd > 0 ? formatCurrency(balance.priceUsd) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#F9FAFB]">
                      {formatCurrency(balance.valueUsd)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatCrypto(balance.total)} {balance.asset}
                    </div>
                  </div>
                </div>

                {balance.locked > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700/30 flex justify-between text-xs">
                    <span className="text-gray-400">{t('portfolio.available')}: {formatCrypto(balance.free)}</span>
                    <span className="text-yellow-400">{t('portfolio.locked')}: {formatCrypto(balance.locked)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
