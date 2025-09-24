'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { TrendingUp, BarChart3, Wallet, User, Bell, LogOut, Loader2, Lock } from 'lucide-react'
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin'

export default function SmartNavigation() {
  const { user, profile, loading, signOut } = useAuth()
  const { saveCurrentLocationForRedirect } = useRedirectAfterLogin()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleAuthClick = () => {
    // Sauvegarder la page actuelle avant d'aller vers l'auth
    saveCurrentLocationForRedirect(pathname)
  }

  return (
    <header className="relative z-50 border-b border-gray-800/40 glass-effect sticky top-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-2xl flex items-center justify-center shadow-2xl">
                <TrendingUp className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight">CryptoBacktest</span>
                <div className="text-xs text-gray-500 font-medium tracking-[0.15em] uppercase">Plateforme française</div>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex space-x-12">
            {/* Pages toujours accessibles */}
            <Link href="/cryptos" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
              <TrendingUp className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
              <span className="relative">
                Cryptomonnaies
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link href="/graphiques" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
              <BarChart3 className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
              <span className="relative">
                Graphiques
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            
            {/* Pages nécessitant une connexion */}
            <Link href="/backtest" className={`group flex items-center space-x-2 transition-all duration-300 font-medium relative ${
              user ? 'text-gray-400 hover:text-[#F9FAFB]' : 'text-gray-600 hover:text-gray-500'
            }`}>
              <BarChart3 className={`w-4 h-4 transition-colors duration-300 ${
                user ? 'group-hover:text-[#6366F1]' : 'text-gray-600'
              }`} />
              <span className="relative flex items-center gap-1">
                Backtest
                {!user && <Lock className="w-3 h-3" />}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            
            <Link href="/portefeuille" className={`group flex items-center space-x-2 transition-all duration-300 font-medium relative ${
              user ? 'text-gray-400 hover:text-[#F9FAFB]' : 'text-gray-600 hover:text-gray-500'
            }`}>
              <Wallet className={`w-4 h-4 transition-colors duration-300 ${
                user ? 'group-hover:text-[#6366F1]' : 'text-gray-600'
              }`} />
              <span className="relative flex items-center gap-1">
                Portefeuille
                {!user && <Lock className="w-3 h-3" />}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>

            {/* Lien compte seulement si connecté */}
            {user && (
              <Link href="/account" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                <User className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                <span className="relative">
                  Compte
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            )}
          </nav>

          {/* Partie droite - Auth ou User Menu */}
          <div className="flex items-center space-x-5">
            {loading ? (
              // État de chargement
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : user ? (
              // Utilisateur connecté - Menu utilisateur
              <>
                <button className="p-2 rounded-xl hover:bg-gray-800/40 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#DC2626] rounded-full"></div>
                </button>
                
                <div className="flex items-center space-x-3">
                  <Link href="/account" className="flex items-center space-x-3 hover:bg-gray-800/40 rounded-xl p-2 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold text-[#F9FAFB]">
                        {user.email?.split('@')[0] || 'Utilisateur'}
                      </div>
                      <div className="text-xs text-gray-400">Plan {profile?.plan || 'free'}</div>
                    </div>
                  </Link>
                </div>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl hover:bg-gray-800/40 transition-colors text-gray-400 hover:text-[#DC2626]"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              // Utilisateur non connecté - Boutons de connexion
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth/signin"
                  className="text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800/40 relative group"
                >
                  <span className="relative z-10">Connexion</span>
                </Link>
                <Link 
                  href="/auth/signup"
                  className="relative bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-7 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#6366F1]/40"
                >
                  <span className="relative z-10">S'inscrire</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}