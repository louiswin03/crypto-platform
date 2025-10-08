"use client"

import { useState, useEffect } from 'react'
import { Shield, Key, CheckCircle, AlertTriangle, ExternalLink, Copy, Eye, EyeOff, Trash2, RefreshCcw } from 'lucide-react'

interface CoinbaseConnectionProps {
  onConnectionChange?: (connected: boolean) => void
  onBalanceChange?: (balance: number) => void
}

export default function CoinbaseConnection({ onConnectionChange, onBalanceChange }: CoinbaseConnectionProps) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [showConnectionModal, setShowConnectionModal] = useState(false)

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      const authData = localStorage.getItem('crypto_platform_auth')
      if (!authData) return

      const { token } = JSON.parse(authData)

      const response = await fetch('/api/coinbase/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
        if (data.connected) {
          setAccountInfo(data.accountInfo)
          loadBalance(token)
        }
        onConnectionChange?.(data.connected)
      }
    } catch (err) {
      console.error('Erreur vérification connexion:', err)
    }
  }

  const loadBalance = async (token: string) => {
    try {
      const response = await fetch('/api/coinbase/balances', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        onBalanceChange?.(data.totalValueUsd || 0)
      }
    } catch (err) {
      console.error('Erreur chargement balance:', err)
    }
  }

  const handleConnect = async () => {
    setError('')
    setIsLoading(true)

    try {
      const authData = localStorage.getItem('crypto_platform_auth')
      if (!authData) {
        setError('Non authentifié. Veuillez vous reconnecter.')
        setIsLoading(false)
        return
      }

      const { token } = JSON.parse(authData)

      const response = await fetch('/api/coinbase/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey, apiSecret })
      })

      const data = await response.json()

      if (response.ok) {
        setIsConnected(true)
        setAccountInfo(data.accountInfo)
        setApiKey('')
        setApiSecret('')
        setShowConnectionModal(false)
        onConnectionChange?.(true)
        loadBalance(token)
      } else {
        setError(data.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter votre compte Coinbase ?')) return

    try {
      const authData = localStorage.getItem('crypto_platform_auth')
      if (!authData) return

      const { token } = JSON.parse(authData)

      await fetch('/api/coinbase/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setIsConnected(false)
      setAccountInfo(null)
      onConnectionChange?.(false)
      onBalanceChange?.(0)
    } catch (err) {
      console.error('Erreur déconnexion:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      {/* Bouton de connexion ou status */}
      {!isConnected ? (
        <button
          onClick={() => setShowConnectionModal(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#0052FF] to-[#1652F0] text-white rounded-xl hover:scale-105 transition-all text-sm font-bold shadow-lg hover:shadow-xl"
        >
          <Key className="w-4 h-4" />
          <span>Connecter</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Connecté</span>
            </div>
            <p className="text-xs text-gray-300">
              Lecture seule
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => checkExistingConnection()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 hover:scale-105 transition-all text-sm font-semibold"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Sync</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#DC2626] hover:border-[#DC2626]/50 hover:scale-105 transition-all text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Déco</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de connexion */}
      {showConnectionModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 animate-fadeIn overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full my-8 shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0052FF]/10 to-[#1652F0]/10 border-b border-gray-700/50 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white">
              <img src="https://assets.coingecko.com/coins/images/44/small/Coinbase_Coin_Primary.png" alt="Coinbase" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#F9FAFB]">Connecter Coinbase</h2>
              <p className="text-sm text-gray-400">Mode lecture seule sécurisé</p>
            </div>
          </div>
          <button
            onClick={() => setShowConnectionModal(false)}
            className="w-10 h-10 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 font-semibold mb-2">Comment obtenir vos clés API</p>
                <ol className="text-blue-200/90 text-sm space-y-2 list-decimal list-inside">
                  <li>Allez sur <strong>Coinbase Developer Platform</strong></li>
                  <li>Créez une nouvelle API Key (Cloud API)</li>
                  <li>Sélectionnez les permissions <strong>View</strong> uniquement</li>
                  <li>Copiez le <strong>Key Name complet</strong> (organizations/xxx/apiKeys/xxx)</li>
                  <li>Téléchargez et copiez votre <strong>Private Key</strong></li>
                </ol>
                <a
                  href="https://www.coinbase.com/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#0052FF] hover:bg-[#1652F0] text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Ouvrir Coinbase API Settings
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Avertissement sécurité */}
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-semibold mb-1">⚠️ Important</p>
                <p className="text-yellow-200/90 text-sm">
                  N'activez JAMAIS les permissions "Trade" ou "Transfer".
                  Seule la permission "View" doit être cochée.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API Key Name (format complet)</label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="organizations/xxx-xxx/apiKeys/xxx-xxx"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] focus:outline-none focus:border-[#0052FF] transition-colors font-mono text-xs"
                />
                {apiKey && (
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Format: organizations/[org-id]/apiKeys/[key-id]
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Private Key (clé privée EC complète)</label>
              <div className="relative">
                <textarea
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="-----BEGIN EC PRIVATE KEY-----&#10;...&#10;-----END EC PRIVATE KEY-----"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] focus:outline-none focus:border-[#0052FF] transition-colors font-mono text-xs resize-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Copiez-collez toute la clé privée EC incluant les lignes BEGIN et END
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-200 font-semibold mb-1">🔒 Sécurité</p>
                  <p className="text-green-200/90 text-sm">
                    Vos clés sont chiffrées avec AES-256. Avec les permissions lecture seule,
                    personne ne peut trader ou retirer des fonds.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowConnectionModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConnect}
                disabled={!apiKey || !apiSecret || isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-[#0052FF] to-[#1652F0] text-white font-bold rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Connexion...' : 'Connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
      )}
    </>
  )
}
