'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function KrakenBalances() {
  const { t } = useLanguage()
  const [balances, setBalances] = useState<any[]>([])
  const [totalValueUsd, setTotalValueUsd] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    loadBalances()
  }, [])

  const loadBalances = async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('crypto_platform_auth')
      if (!token) {
        setError(t('portfolio.not_authenticated'))
        return
      }

      const response = await fetch('/api/kraken/balances', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('portfolio.loading_error'))
      }

      const data = await response.json()
      setBalances(data.balances || [])
      setTotalValueUsd(data.totalValueUsd || 0)
      setLastUpdate(data.lastUpdate || '')
    } catch (err: any) {
      setError(err.message || t('portfolio.loading_error'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-[#5741D9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-red-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={loadBalances}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              {t('portfolio.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">🐙</div>
        <p className="text-gray-400 text-sm">{t('portfolio.no_assets')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2">
            <img src="/kraken.png" alt="Kraken" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F9FAFB]">{t('portfolio.kraken_portfolio')}</h3>
            {lastUpdate && (
              <p className="text-xs text-gray-500 mt-1">
                {t('portfolio.last_update_label')}: {new Date(lastUpdate).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={loadBalances}
          className="p-2 text-gray-400 hover:text-[#5741D9] transition-colors"
          title={t('portfolio.refresh_button')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="bg-gradient-to-br from-[#5741D9] to-[#4731C9] rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">{t('portfolio.total_value')}</p>
        <p className="text-3xl font-bold">${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-[#1A1B23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {balances.filter(balance => balance.valueUsd > 0.1).map((balance, index) => (
            <div key={index} className="p-4 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5741D9] to-[#4731C9] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {balance.asset.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#F9FAFB]">{balance.asset}</p>
                    <p className="text-xs text-gray-500">
                      {balance.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#F9FAFB]">
                    ${balance.valueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {((balance.valueUsd / totalValueUsd) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
