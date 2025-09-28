// src/hooks/useHistoricalData.ts
import { useState, useEffect, useCallback } from 'react'
import {
  fetchHistoricalPrices,
  fetchMultipleHistoricalPrices,
  type HistoricalDataResponse,
  type SupportedCrypto,
  BacktestPeriod
} from '@/services/historicalDataService'

interface UseHistoricalDataState {
  data: HistoricalDataResponse | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface UseMultipleHistoricalDataState {
  data: Record<SupportedCrypto, HistoricalDataResponse> | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

// Hook pour récupérer les données historiques d'une seule crypto
export function useHistoricalData(
  crypto: SupportedCrypto | null,
  period: BacktestPeriod = BacktestPeriod.ONE_YEAR,
  autoFetch: boolean = true
) {
  const [state, setState] = useState<UseHistoricalDataState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const fetchData = useCallback(async () => {
    if (!crypto) {
      setState(prev => ({ ...prev, data: null, error: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetchHistoricalPrices(crypto, period)
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [crypto, period])

  // Auto-fetch quand les paramètres changent
  useEffect(() => {
    if (autoFetch && crypto) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    })
  }, [])

  return {
    ...state,
    refetch,
    clearData,
    isReady: !state.loading && state.data !== null,
    isEmpty: !state.loading && state.data === null,
    hasError: state.error !== null
  }
}

// Hook pour récupérer les données de plusieurs cryptos
export function useMultipleHistoricalData(
  cryptos: SupportedCrypto[],
  period: BacktestPeriod = BacktestPeriod.ONE_YEAR,
  autoFetch: boolean = true
) {
  const [state, setState] = useState<UseMultipleHistoricalDataState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const fetchData = useCallback(async () => {
    if (cryptos.length === 0) {
      setState(prev => ({ ...prev, data: null, error: null }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetchMultipleHistoricalPrices(cryptos, period)
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [cryptos, period])

  // Auto-fetch quand les paramètres changent
  useEffect(() => {
    if (autoFetch && cryptos.length > 0) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    })
  }, [])

  return {
    ...state,
    refetch,
    clearData,
    isReady: !state.loading && state.data !== null,
    isEmpty: !state.loading && state.data === null,
    hasError: state.error !== null,
    successCount: state.data ? Object.keys(state.data).length : 0,
    expectedCount: cryptos.length
  }
}

// Hook simple pour tester la connection et la qualité des données
export function useHistoricalDataTest() {
  const [testResults, setTestResults] = useState<{
    btc: boolean | null
    eth: boolean | null
    loading: boolean
    errors: string[]
  }>({
    btc: null,
    eth: null,
    loading: false,
    errors: []
  })

  const runTest = useCallback(async () => {
    setTestResults(prev => ({ ...prev, loading: true, errors: [] }))

    const errors: string[] = []
    let btcSuccess = false
    let ethSuccess = false

    try {
      // Test BTC
      const btcData = await fetchHistoricalPrices('BTC', BacktestPeriod.ONE_MONTH)
      btcSuccess = btcData.prices.length > 0
      if (!btcSuccess) errors.push('BTC: Aucune donnée reçue')
    } catch (error) {
      errors.push(`BTC: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }

    try {
      // Test ETH
      const ethData = await fetchHistoricalPrices('ETH', BacktestPeriod.ONE_MONTH)
      ethSuccess = ethData.prices.length > 0
      if (!ethSuccess) errors.push('ETH: Aucune donnée reçue')
    } catch (error) {
      errors.push(`ETH: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }

    setTestResults({
      btc: btcSuccess,
      eth: ethSuccess,
      loading: false,
      errors
    })
  }, [])

  return {
    ...testResults,
    runTest,
    isSuccess: testResults.btc === true && testResults.eth === true,
    hasErrors: testResults.errors.length > 0
  }
}

// Hook pour obtenir des informations utiles sur les périodes
export function useBacktestPeriods() {
  const periods = [
    {
      value: BacktestPeriod.ONE_MONTH,
      label: '1 Mois',
      days: 30,
      description: 'Test rapide sur le dernier mois'
    },
    {
      value: BacktestPeriod.THREE_MONTHS,
      label: '3 Mois',
      days: 90,
      description: 'Analyse trimestrielle'
    },
    {
      value: BacktestPeriod.SIX_MONTHS,
      label: '6 Mois',
      days: 180,
      description: 'Vision semestrielle'
    },
    {
      value: BacktestPeriod.ONE_YEAR,
      label: '1 An',
      days: 365,
      description: 'Analyse annuelle complète'
    },
    {
      value: BacktestPeriod.TWO_YEARS,
      label: '2 Ans',
      days: 730,
      description: 'Tendance long terme'
    },
    {
      value: BacktestPeriod.FIVE_YEARS,
      label: '5 Ans',
      days: 1825,
      description: 'Analyse cycle complet (maximum)'
    }
  ]

  const getPeriodInfo = useCallback((period: BacktestPeriod) => {
    return periods.find(p => p.value === period) || periods[3] // Default to 1 year
  }, [])

  return {
    periods,
    getPeriodInfo,
    defaultPeriod: BacktestPeriod.ONE_YEAR
  }
}