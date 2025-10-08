'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { TrendingUp, BarChart3, Wallet, User, LogOut, Loader2, Lock, Settings, Shield, Clock, ChevronDown } from 'lucide-react'
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SmartNavigation() {
  const { user, profile, loading, signOut } = useAuth()
  const { isDarkMode } = useTheme()
  const { t } = useLanguage()
  const { saveCurrentLocationForRedirect } = useRedirectAfterLogin()
  const router = useRouter()
  const pathname = usePathname()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleAuthClick = () => {
    // Sauvegarder la page actuelle avant d'aller vers l'auth
    saveCurrentLocationForRedirect(pathname)
  }

  // Fermer les menus si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className={`relative z-50 sticky top-0 transition-colors duration-300 ${
      isDarkMode
        ? 'border-b border-gray-800/40 glass-effect'
        : 'border-b border-gray-200/60 bg-white/90 backdrop-blur-24'
    }`}>
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
                <div className="text-xs text-gray-500 font-medium tracking-[0.15em] uppercase">{t('nav.platform')}</div>
              </div>
            </div>
          </Link>

          {/* Menu burger mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800/40 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Navigation */}
          <nav className="hidden lg:flex space-x-12">
            {/* Pages toujours accessibles */}
            <Link href="/cryptos" className={`group flex items-center space-x-2 transition-all duration-300 font-medium relative ${
              pathname === '/cryptos'
                ? 'text-[#F9FAFB] font-semibold'
                : 'text-gray-400 hover:text-[#F9FAFB]'
            }`}>
              <TrendingUp className={`w-4 h-4 transition-colors duration-300 ${
                pathname === '/cryptos'
                  ? 'text-[#6366F1]'
                  : 'group-hover:text-[#6366F1]'
              }`} />
              <span className="relative">
                {t('nav.cryptos')}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-300 ${
                  pathname === '/cryptos'
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}></span>
              </span>
            </Link>
            <Link href="/graphiques" className={`group flex items-center space-x-2 transition-all duration-300 font-medium relative ${
              pathname === '/graphiques'
                ? 'text-[#F9FAFB] font-semibold'
                : 'text-gray-400 hover:text-[#F9FAFB]'
            }`}>
              <BarChart3 className={`w-4 h-4 transition-colors duration-300 ${
                pathname === '/graphiques'
                  ? 'text-[#6366F1]'
                  : 'group-hover:text-[#6366F1]'
              }`} />
              <span className="relative">
                {t('nav.charts')}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-300 ${
                  pathname === '/graphiques'
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`}></span>
              </span>
            </Link>

            {/* Pages nécessitant une connexion */}
            <Link href="/backtest" className={`group flex items-center space-x-2 transition-all duration-300 font-medium relative ${
              !user ? 'text-gray-600 hover:text-gray-500' :
              pathname === '/backtest'
                ? 'text-[#F9FAFB] font-semibold'
                : 'text-gray-400 hover:text-[#F9FAFB]'
            }`}>
              <BarChart3 className={`w-4 h-4 transition-colors duration-300 ${
                !user ? 'text-gray-600' :
                pathname === '/backtest'
                  ? 'text-[#6366F1]'
                  : 'group-hover:text-[#6366F1]'
              }`} />
              <span className="relative flex items-center gap-1">
                {t('nav.backtest')}
                {!user && <Lock className="w-3 h-3" />}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-300 ${
                  user && pathname === '/backtest'
                    ? 'w-full'
                    : user ? 'w-0 group-hover:w-full' : 'w-0'
                }`}></span>
              </span>
            </Link>

            <Link href="/portefeuille" className={`group flex items-center space-x-2 transition-all duration-300 font-medium relative ${
              !user ? 'text-gray-600 hover:text-gray-500' :
              pathname === '/portefeuille'
                ? 'text-[#F9FAFB] font-semibold'
                : 'text-gray-400 hover:text-[#F9FAFB]'
            }`}>
              <Wallet className={`w-4 h-4 transition-colors duration-300 ${
                !user ? 'text-gray-600' :
                pathname === '/portefeuille'
                  ? 'text-[#6366F1]'
                  : 'group-hover:text-[#6366F1]'
              }`} />
              <span className="relative flex items-center gap-1">
                {t('nav.portfolio')}
                {!user && <Lock className="w-3 h-3" />}
                <span className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-300 ${
                  user && pathname === '/portefeuille'
                    ? 'w-full'
                    : user ? 'w-0 group-hover:w-full' : 'w-0'
                }`}></span>
              </span>
            </Link>
          </nav>

          {/* Partie droite - Auth ou User Menu */}
          <div className="flex items-center space-x-3 lg:space-x-5">
            {loading ? (
              // État de chargement
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : user ? (
              // Utilisateur connecté - Menu utilisateur
              <>
                {/* Menu Profil Utilisateur */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 hover:bg-gray-800/40 rounded-xl p-2 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-sm font-semibold text-[#F9FAFB]">
                        {user.email?.split('@')[0] || t('nav.user')}
                      </div>
                      <div className="text-xs text-gray-400">{t('nav.plan')} {profile?.plan || 'free'}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Menu déroulant */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 glass-effect rounded-2xl border border-gray-800/40 shadow-2xl overflow-hidden">
                      {/* Header du menu avec infos user */}
                      <div className="px-4 py-4 border-b border-gray-800/40 bg-gray-900/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white font-bold">
                            {user.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#F9FAFB]">
                              {user.email?.split('@')[0] || t('nav.user')}
                            </div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                            <div className="text-xs text-[#6366F1] font-medium uppercase">
                              {t('nav.plan')} {profile?.plan || 'free'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/account"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <div>
                            <div className="text-sm font-medium">{t('nav.my_profile')}</div>
                            <div className="text-xs text-gray-500">{t('nav.personal_info')}</div>
                          </div>
                        </Link>

                        <Link
                          href="/account?tab=settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <div>
                            <div className="text-sm font-medium">{t('nav.settings')}</div>
                            <div className="text-xs text-gray-500">{t('nav.account_config')}</div>
                          </div>
                        </Link>

                        <Link
                          href="/account?tab=security"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 transition-colors border-t border-gray-800/40"
                        >
                          <Shield className="w-5 h-5" />
                          <div>
                            <div className="text-sm font-medium">{t('nav.security')}</div>
                            <div className="text-xs text-gray-500">{t('nav.password_2fa')}</div>
                          </div>
                        </Link>

                        <Link
                          href="/account?tab=activity"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 transition-colors"
                        >
                          <Clock className="w-5 h-5" />
                          <div>
                            <div className="text-sm font-medium">{t('nav.activity')}</div>
                            <div className="text-xs text-gray-500">{t('nav.recent_actions')}</div>
                          </div>
                        </Link>

                        <div className="border-t border-gray-800/40 my-2"></div>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[#DC2626] hover:bg-red-500/10 transition-colors w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          <div>
                            <div className="text-sm font-medium">{t('nav.signout')}</div>
                            <div className="text-xs text-gray-500">{t('nav.quit_session')}</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Utilisateur non connecté - Boutons de connexion
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium px-3 sm:px-5 py-2.5 rounded-xl hover:bg-gray-800/40 relative group text-sm sm:text-base"
                >
                  <span className="relative z-10">{t('nav.signin')}</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="relative bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-4 sm:px-7 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#6366F1]/40 text-sm sm:text-base"
                >
                  <span className="relative z-10">{t('nav.signup')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden absolute top-full left-0 right-0 glass-effect-strong border-t border-gray-800/40 z-40">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <nav className="space-y-4">
                {/* Navigation mobile */}
                <Link
                  href="/cryptos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    pathname === '/cryptos'
                      ? 'bg-[#6366F1]/10 text-[#6366F1]'
                      : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">{t('nav.cryptos')}</span>
                </Link>

                <Link
                  href="/graphiques"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    pathname === '/graphiques'
                      ? 'bg-[#6366F1]/10 text-[#6366F1]'
                      : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">{t('nav.charts')}</span>
                </Link>

                <Link
                  href="/backtest"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    !user ? 'text-gray-600 cursor-not-allowed' :
                    pathname === '/backtest'
                      ? 'bg-[#6366F1]/10 text-[#6366F1]'
                      : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium flex items-center gap-2">
                    {t('nav.backtest')}
                    {!user && <Lock className="w-4 h-4" />}
                  </span>
                </Link>

                <Link
                  href="/portefeuille"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    !user ? 'text-gray-600 cursor-not-allowed' :
                    pathname === '/portefeuille'
                      ? 'bg-[#6366F1]/10 text-[#6366F1]'
                      : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium flex items-center gap-2">
                    {t('nav.portfolio')}
                    {!user && <Lock className="w-4 h-4" />}
                  </span>
                </Link>

                {/* Auth mobile */}
                {!user && (
                  <div className="border-t border-gray-800/40 pt-4 mt-4">
                    <div className="space-y-3">
                      <Link
                        href="/auth/signin"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          handleAuthClick()
                        }}
                        className="block w-full text-center px-6 py-3 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 rounded-xl transition-colors font-medium"
                      >
                        {t('nav.signin')}
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          handleAuthClick()
                        }}
                        className="block w-full text-center px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                      >
                        {t('nav.signup')}
                      </Link>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .glass-effect {
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .glass-effect-strong {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </header>
  )
}