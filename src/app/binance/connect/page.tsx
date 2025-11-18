"use client"

import { useState, useEffect } from 'react'
import { Shield, Key, CheckCircle, AlertTriangle, ExternalLink, Copy, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BinanceConnectPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleConnect = async () => {
    setError('')
    setIsLoading(true)

    try {
      const authData = localStorage.getItem('auth_user')
      if (!authData) {
        setError('Non authentifié. Veuillez vous reconnecter.')
        setIsLoading(false)
        return
      }

      const { token } = JSON.parse(authData)

      const response = await fetch('/api/binance/connect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey, apiSecret })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/portefeuille')
        }, 2000)
      } else {
        setError(data.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-600/20 border-2 border-green-600 mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-[#F9FAFB] mb-4">
            ✅ Connexion réussie !
          </h1>
          <p className="text-gray-400 mb-6">
            Votre compte Binance est maintenant connecté en mode lecture seule.
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers votre portefeuille...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/portefeuille"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#F9FAFB] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au portefeuille
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B] to-[#F8D12F] mb-6">
            <Shield className="w-10 h-10 text-[#0F172A]" />
          </div>
          <h1 className="text-4xl font-bold text-[#F9FAFB] mb-4">
            Connecter Binance
          </h1>
          <p className="text-gray-400 text-lg">
            Synchronisez votre portefeuille Binance en mode lecture seule sécurisé
          </p>
        </div>

        {/* Instructions complètes */}
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
              <div className="flex-1">
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
              <div className="flex-1">
                <h3 className="font-semibold text-[#F9FAFB] mb-2">Créez une nouvelle API Key</h3>
                <p className="text-gray-400 mb-3">
                  Cliquez sur "Create API" et sélectionnez "System generated"
                </p>
                <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-200 font-semibold mb-1">⚠️ CRITIQUE - Permissions</p>
                      <p className="text-yellow-200/90 text-sm mb-2">
                        Activez UNIQUEMENT la permission <strong>"Enable Reading"</strong>.
                      </p>
                      <p className="text-yellow-200/90 text-sm">
                        ❌ Ne cochez JAMAIS "Enable Spot & Margin Trading"<br />
                        ❌ Ne cochez JAMAIS "Enable Withdrawals"
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

        {/* Formulaire de connexion */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Entrez vos clés API</h2>

          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 font-semibold mb-1">Erreur de connexion</p>
                <p className="text-red-200/90 text-sm">{error}</p>
              </div>
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
                  placeholder="Collez votre API Key Binance ici"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] focus:outline-none focus:border-[#F0B90B] transition-colors font-mono text-sm pr-12"
                />
                {apiKey && (
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded transition-colors"
                    title="Copier"
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
                  placeholder="Collez votre Secret Key Binance ici"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-[#F9FAFB] focus:outline-none focus:border-[#F0B90B] transition-colors font-mono text-sm pr-24"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {apiSecret && (
                    <button
                      onClick={() => copyToClipboard(apiSecret)}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                      title="Copier"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                    title={showSecret ? "Masquer" : "Afficher"}
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

            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-200 font-semibold mb-1">🔒 Sécurité maximale</p>
                  <ul className="text-green-200/90 text-sm space-y-1">
                    <li>✅ Vos clés sont chiffrées avec AES-256-GCM (niveau bancaire)</li>
                    <li>✅ Stockage sécurisé en base de données</li>
                    <li>✅ Permissions lecture seule vérifiées automatiquement</li>
                    <li>✅ Impossible de trader ou retirer des fonds</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={!apiKey || !apiSecret || isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#F0B90B] to-[#F8D12F] text-[#0F172A] font-bold rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                '🔐 Connecter mon compte Binance'
              )}
            </button>
          </div>
        </div>

        {/* FAQ / Sécurité */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8">
          <h3 className="text-xl font-bold text-[#F9FAFB] mb-6">Questions fréquentes</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F0B90B]" />
                Mes clés API sont-elles vraiment en sécurité ?
              </h4>
              <p className="text-gray-400 text-sm">
                Oui. Vos clés sont chiffrées avec AES-256-GCM (algorithme militaire) AVANT d'être stockées.
                Même si quelqu'un accède à la base de données, il ne voit que du charabia indéchiffrable.
                La clé de déchiffrement est stockée séparément sur le serveur.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Peut-on trader ou retirer mes fonds ?
              </h4>
              <p className="text-gray-400 text-sm">
                <strong className="text-red-400">NON, absolument impossible !</strong> Le système vérifie automatiquement
                que vos clés sont en mode lecture seule. Si les permissions de trading/retrait sont activées,
                la connexion est refusée. Personne ne peut effectuer de transaction avec vos clés.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                Puis-je déconnecter mon compte à tout moment ?
              </h4>
              <p className="text-gray-400 text-sm">
                Oui. Depuis votre portefeuille, cliquez sur "Déconnecter" et vos clés seront immédiatement
                supprimées de la base de données. Vous pouvez aussi supprimer l'API Key depuis Binance directement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Que faire si mes clés sont compromises ?
              </h4>
              <p className="text-gray-400 text-sm">
                1) Déconnectez immédiatement votre compte ici<br />
                2) Supprimez l'API Key depuis votre compte Binance<br />
                3) Créez une nouvelle API Key si nécessaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
