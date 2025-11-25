'use client'

import { useState, useEffect } from 'react'
import { DatabaseAuthService } from '@/services/databaseAuthService'
import { ArrowDownCircle, ArrowUpCircle, RefreshCcw, TrendingUp, TrendingDown, Download, Filter, Calendar, DollarSign, Activity } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Transaction {
  id: string
  exchange: string
  type: string
  symbol?: string
  asset?: string
  price?: number
  quantity?: number
  amount?: any
  time: string
  timestamp: number
  [key: string]: any
}

interface ExchangeTransactionsProps {
  exchange: 'binance' | 'coinbase' | 'kraken'
  onClose?: () => void
}

export default function ExchangeTransactions({ exchange, onClose }: ExchangeTransactionsProps) {
  const { t } = useLanguage()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'deposit' | 'withdrawal'>('all')
  const [limit, setLimit] = useState(50)

  const loadTransactions = async () => {
    setLoading(true)
    setError(null)

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        setError('Non authentifié - Veuillez vous reconnecter')
        return
      }

      const response = await fetch(`/api/${exchange}/transactions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        const contentType = response.headers.get('content-type')

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage

          } catch (jsonError) {

          }
        } else {
          // Réponse en texte brut
          try {
            const errorText = await response.text()

            errorMessage = errorText.trim() || errorMessage
          } catch (textError) {

          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Unifier toutes les transactions
      let allTx: Transaction[] = []

      if (data.trades) allTx = [...allTx, ...data.trades]
      if (data.deposits) allTx = [...allTx, ...data.deposits]
      if (data.withdrawals) allTx = [...allTx, ...data.withdrawals]
      if (data.transactions) allTx = [...allTx, ...data.transactions]

      // Trier par date décroissante
      allTx.sort((a, b) => b.timestamp - a.timestamp)

      setTransactions(allTx)
    } catch (err: any) {

      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [exchange, limit])

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-5 h-5 text-[#00FF88]" />
      case 'sell':
        return <TrendingDown className="w-5 h-5 text-[#DC2626]" />
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-[#00FF88]" />
      case 'withdrawal':
        return <ArrowUpCircle className="w-5 h-5 text-[#FFA366]" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]'
      case 'sell':
        return 'bg-[#DC2626]/10 border-[#DC2626]/30 text-[#DC2626]'
      case 'deposit':
        return 'bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]'
      case 'withdrawal':
        return 'bg-[#FFA366]/10 border-[#FFA366]/30 text-[#FFA366]'
      default:
        return 'bg-gray-800/30 border-gray-700/30 text-gray-400'
    }
  }

  const formatAmount = (tx: Transaction) => {
    if (tx.quantity && tx.symbol) {
      return `${tx.quantity.toFixed(8)} ${tx.symbol.replace('USDT', '').replace('USD', '')}`
    }
    if (tx.amount?.value && tx.amount?.currency) {
      return `${tx.amount.value.toFixed(8)} ${tx.amount.currency}`
    }
    if (tx.amount && tx.asset) {
      return `${tx.amount.toFixed(8)} ${tx.asset}`
    }
    return 'N/A'
  }

  const formatValue = (tx: Transaction) => {
    if (tx.price && tx.quantity) {
      return `$${(tx.price * tx.quantity).toFixed(2)}`
    }
    if (tx.quoteQuantity) {
      return `$${tx.quoteQuantity.toFixed(2)}`
    }
    if (tx.nativeAmount?.value) {
      return `${tx.nativeAmount.value.toFixed(2)} ${tx.nativeAmount.currency}`
    }
    if (tx.cost) {
      return `$${tx.cost.toFixed(2)}`
    }
    return '-'
  }

  return (
    <div className="glass-effect-strong rounded-2xl p-6 border border-gray-800/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Activity className="w-6 h-6 text-[#00FF88]" />
            <span>Transactions {exchange.charAt(0).toUpperCase() + exchange.slice(1)}</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {filteredTransactions.length} transaction(s) • Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <button
          onClick={loadTransactions}
          disabled={loading}
          className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all border border-gray-700/50"
        >
          <RefreshCcw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'buy', 'sell', 'deposit', 'withdrawal'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f
                ? 'bg-[#00FF88] text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${transactions.length})`}
            {f !== 'all' && ` (${transactions.filter(tx => tx.type === f).length})`}
          </button>
        ))}
      </div>

      {/* Liste des transactions */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCcw className="w-8 h-8 text-[#00FF88] mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Chargement des transactions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-semibold mb-2">Erreur</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucune transaction trouvée</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="glass-effect rounded-xl p-4 hover:bg-gray-700/30 transition-all border border-gray-800/40 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Icône */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTransactionColor(tx.type)}`}>
                    {getTransactionIcon(tx.type)}
                  </div>

                  {/* Détails */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getTransactionColor(tx.type)}`}>
                        {tx.type.toUpperCase()}
                      </span>
                      {tx.symbol && (
                        <span className="text-white font-semibold">{tx.symbol}</span>
                      )}
                      {tx.asset && (
                        <span className="text-white font-semibold">{tx.asset}</span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatAmount(tx)}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(tx.time).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  {/* Valeur */}
                  <div className="text-right">
                    <div className="text-white font-bold font-mono">
                      {formatValue(tx)}
                    </div>
                    {tx.fee && (
                      <div className="text-gray-500 text-xs mt-1">
                        Frais: {tx.fee.toFixed(8)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }

        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-effect-strong {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  )
}
