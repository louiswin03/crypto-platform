'use client'

import { useState, useEffect } from 'react'

interface KrakenConnectionProps {
  onConnectionChange?: (connected: boolean) => void
  onBalanceChange?: (balance: number) => void
}

export default function KrakenConnection({ onConnectionChange, onBalanceChange }: KrakenConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const token = localStorage.getItem('crypto_platform_auth')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/kraken/check', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setIsConnected(data.connected)
      setAccountInfo(data.accountInfo)
      onConnectionChange?.(data.connected)

      if (data.connected) {
        await loadBalance(token)
      }
    } catch (error) {
      console.error('Erreur vérification connexion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBalance = async (token: string) => {
    try {
      const response = await fetch('/api/kraken/balances', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        onBalanceChange?.(data.totalValueUsd || 0)
      }
    } catch (error) {
      console.error('Erreur chargement balance:', error)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('crypto_platform_auth')
      if (!token) {
        setError('Veuillez vous connecter')
        return
      }

      const response = await fetch('/api/kraken/connect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      setIsConnected(true)
      setAccountInfo(data.accountInfo)
      setShowModal(false)
      setApiKey('')
      setApiSecret('')
      onConnectionChange?.(true)

      // Charger les balances
      await loadBalance(token)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Kraken ?')) {
      return
    }

    try {
      const token = localStorage.getItem('crypto_platform_auth')
      const response = await fetch('/api/kraken/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de déconnexion')
      }

      setIsConnected(false)
      setAccountInfo(null)
      onConnectionChange?.(false)
      onBalanceChange?.(0)
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la déconnexion')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-2 border-[#5741D9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-500 font-medium">Connecté</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Non connecté</span>
        )}

        {isConnected ? (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Déconnecter
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#5741D9] hover:bg-[#4731C9] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Connecter
          </button>
        )}
      </div>

      {showModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full my-8 shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5741D9]/10 to-[#4731C9]/10 border-b border-gray-700/50 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white p-2">
              <img src="/kraken.png" alt="Kraken" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB]">Connecter Kraken</h2>
              <p className="text-sm text-gray-400">Mode lecture seule sécurisé</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowModal(false)
              setError('')
              setApiKey('')
              setApiSecret('')
            }}
            className="w-10 h-10 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-blue-400 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-300">
                    <p className="font-semibold mb-1">Comment obtenir vos clés API ?</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-blue-200">
                      <li>Allez sur kraken.com → Settings → API</li>
                      <li>Créez une nouvelle clé API</li>
                      <li>Permissions: <strong>Query Funds</strong> uniquement</li>
                      <li>Copiez la clé et le secret</li>
                    </ol>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="text-red-400 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Votre clé API Kraken"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#5741D9] transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-2">
                  Private Key (Secret)
                </label>
                <textarea
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="Votre clé privée Kraken (base64)"
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#5741D9] transition-colors font-mono text-sm resize-none"
                />
              </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="text-green-400 flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300">
                      <p className="font-semibold mb-1">🔒 Sécurité maximale</p>
                      <p className="text-gray-400">Vos clés sont chiffrées avec AES-256-GCM avant stockage. Elles ne peuvent être utilisées que pour consulter vos balances.</p>
                    </div>
                  </div>
                </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setError('')
                  setApiKey('')
                  setApiSecret('')
                }}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConnect}
                disabled={isSubmitting || !apiKey.trim() || !apiSecret.trim()}
                className="flex-1 py-3 bg-[#5741D9] hover:bg-[#4731C9] text-white font-bold rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Connexion...' : 'Connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  )
}
