"use client"

import { useState, useEffect } from 'react'
import { Shield, Key, CheckCircle, AlertTriangle, ExternalLink, Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BinanceConnectionPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountInfo, setAccountInfo] = useState<any>(null)

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    try {
      const authData = localStorage.getItem('auth_user')
      if (!authData) {
        setError('Non authentifié. Veuillez vous connecter.')
        return
      }

      const { token } = JSON.parse(authData)

      const response = await fetch('/api/binance/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
        if (data.connected) {
          setAccountInfo(data.accountInfo)
        }
      }
    } catch (err) {
      console.error('Erreur vérification connexion:', err)
    }
  }

  const handleConnect = async () => {
    console.log('🔵 handleConnect called')
    setError('')
    setIsLoading(true)

    try {
      const authData = localStorage.getItem('auth_user')
      console.log('🔵 authData:', authData ? 'exists' : 'null')
      if (!authData) {
        setError('Non authentifié. Veuillez vous reconnecter.')
        setIsLoading(false)
        return
      }

      const { token } = JSON.parse(authData)

      console.log('🔵 Sending request to /api/binance/connect')
      const response = await fetch('/api/binance/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey, apiSecret })
      })

      const data = await response.json()
      console.log('🔵 Response:', response.status, data)

      if (response.ok) {
        setIsConnected(true)
        setAccountInfo(data.accountInfo)
        setApiKey('')
        setApiSecret('')
        // Redirect to portfolio
        router.push('/portefeuille')
      } else {
        setError(data.error || 'Erreur de connexion')
      }
    } catch (err) {
      console.error('🔴 Error:', err)
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const authData = localStorage.getItem('auth_user')
      if (!authData) return

      const { token } = JSON.parse(authData)

      await fetch('/api/binance/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setIsConnected(false)
      setAccountInfo(null)
    } catch (err) {
      console.error('Erreur déconnexion:', err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B] to-[#F8D12F] mb-6">
            <Shield className="w-10 h-10 text-[#0F172A]" />
          </div>
          <h1 className="text-4xl font-bold text-[#F9FAFB] mb-4">
            Connexion Binance
          </h1>
          <p className="text-gray-400 text-lg">
            Connectez votre compte Binance en mode lecture seule pour synchroniser votre portefeuille
          </p>
        </div>

        {/* Status Card */}
        {isConnected ? (
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-2 border-green-600/50 rounded-2xl p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-600/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Compte Binance Connecté</h3>
                  <p className="text-gray-300 mb-4">
                    Votre compte est synchronisé en mode lecture seule
                  </p>
                  {accountInfo && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Type de compte:</span>
                        <span className="font-mono text-gray-300">{accountInfo.accountType || 'SPOT'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Permissions:</span>
                        <span className="font-mono text-green-400">Lecture seule ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Déconnecter
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6 flex items-center gap-3">
                <Key className="w-6 h-6 text-[#F0B90B]" />
                Comment obtenir vos clés API Binance
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-2">Accédez à la gestion des API Binance</h3>
                    <p className="text-gray-400 mb-3">
                      Connectez-vous à Binance et allez dans la section API Management
                    </p>
                    <a
                      href="https://www.binance.com/en/my/settings/api-management"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0F172A] font-semibold rounded-lg transition-colors"
                    >
                      Ouvrir Binance API Management
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-2">Créez une nouvelle API Key</h3>
                    <p className="text-gray-400 mb-2">Cliquez sur "Create API" et sélectionnez "System generated"</p>
                    <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 mt-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-yellow-200 font-semibold mb-1">Important - Permissions</p>
                          <p className="text-yellow-200/90 text-sm">
                            Activez UNIQUEMENT la permission <strong>"Enable Reading"</strong>.
                            Ne cochez JAMAIS "Enable Spot & Margin Trading" ou "Enable Withdrawals".
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-2">Copiez vos clés</h3>
                    <p className="text-gray-400">
                      Copiez votre API Key et Secret Key, puis collez-les dans les champs ci-dessous
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Form */}
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
              <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Connecter votre compte</h2>

              {error && (
                <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Votre API Key Binance"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] focus:outline-none focus:border-[#F0B90B] transition-colors font-mono text-sm"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Votre Secret Key Binance"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] focus:outline-none focus:border-[#F0B90B] transition-colors font-mono text-sm pr-24"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {apiSecret && (
                        <button
                          onClick={() => copyToClipboard(apiSecret)}
                          className="p-2 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        {showSecret ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-200 font-semibold mb-1">Sécurité garantie</p>
                      <p className="text-blue-200/90 text-sm">
                        Vos clés API sont chiffrées avec AES-256 avant stockage.
                        Avec les permissions lecture seule, personne ne peut trader ou retirer des fonds.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={!apiKey || !apiSecret || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-[#F0B90B] to-[#F8D12F] text-[#0F172A] font-bold rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? 'Connexion en cours...' : 'Connecter mon compte Binance'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* FAQ / Security Info */}
        <div className="mt-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8">
          <h3 className="text-xl font-bold text-[#F9FAFB] mb-6">Questions fréquentes</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">🔒 Mes clés API sont-elles en sécurité ?</h4>
              <p className="text-gray-400 text-sm">
                Oui. Vos clés sont chiffrées avec AES-256 et stockées de manière sécurisée.
                De plus, avec les permissions lecture seule, personne ne peut effectuer de transactions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2">📊 Quelles données sont synchronisées ?</h4>
              <p className="text-gray-400 text-sm">
                Votre portefeuille, historique de trades, et performances sont synchronisés automatiquement.
                Aucune transaction ne peut être effectuée depuis notre plateforme.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2">🔄 Puis-je déconnecter mon compte à tout moment ?</h4>
              <p className="text-gray-400 text-sm">
                Absolument. Vous pouvez déconnecter votre compte Binance à tout moment.
                Vos clés seront immédiatement supprimées de nos serveurs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2">⚠️ Que faire si mes clés sont compromises ?</h4>
              <p className="text-gray-400 text-sm">
                Déconnectez immédiatement votre compte ici, puis supprimez l'API Key depuis votre compte Binance.
                Créez ensuite une nouvelle API Key si nécessaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
