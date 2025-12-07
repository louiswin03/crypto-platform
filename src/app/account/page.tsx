"use client"

import Link from 'next/link'
import { TrendingUp, Activity, User, BarChart3, Shield, Target, Star, Settings, Lock, Camera, Mail, Phone, MapPin, Smartphone, Edit3, Check, Clock } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DatabaseAuthService } from '@/services/databaseAuthService'
import { createClient } from '@supabase/supabase-js'
import { useTheme } from '@/contexts/ThemeContext'
import { themeClasses, cn } from '@/utils/themeClasses'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserStats {
  watchlists_count: number
  exchanges_count: number
  cryptos_count: number
  strategies_count: number
}

interface ActivityItem {
  id: string
  action: string
  details: string
  timestamp: string
  type: 'backtest' | 'security' | 'auth' | 'billing'
}

type TabType = 'profile' | 'settings' | 'security' | 'activity'

// Fonction pour créer un client Supabase admin côté client
const createSupabaseAdmin = () => {
  // Récupérer la clé service depuis les variables d'environnement
  // ATTENTION: Ceci n'est qu'une solution temporaire pour le développement
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11b2x1dGF3eWprZm95eXdwamhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYxMjE0NywiZXhwIjoyMDc0MTg4MTQ3fQ.KUOCou3PLZqalgZk83f-n006MTnVGGLB5hWKN8YcVBU'

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Component that uses useSearchParams - must be wrapped in Suspense
function AccountPageContent() {
  const { user, signOut, resetPassword, loading: authLoading } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'profile'

  const [loading, setLoading] = useState(true)
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    email: user?.email || '',
    phone: '',
    location: ''
  })

  // État séparé pour l'affichage des données sauvegardées
  const [profileDisplay, setProfileDisplay] = useState({
    phone: '',
    location: ''
  })

  // Note: isDarkMode vient maintenant du context global

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      loadUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        console.error('Token d\'authentification manquant')
        setLoading(false)
        return
      }

      // Vérifier que authData et authData.id existent
      if (!authData || !authData.id) {
        console.error('❌ Données utilisateur invalides:', authData)
        setLoading(false)
        return
      }

      console.log('🔑 ID utilisateur:', authData.id)

      // 📋 Récupérer le profil directement depuis user_profiles
      const supabaseAdmin = createSupabaseAdmin()
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authData.id)
        .single()

      console.log('👤 Profil récupéré:', profile)


      if (profile) {

        // Mettre à jour les états avec les vraies données
        setEditForm({
          email: user.email || '',
          phone: profile.phone || '',
          location: profile.location || ''
        })

        setProfileDisplay({
          phone: profile.phone || '',
          location: profile.location || ''
        })
      } else {

        // Créer un profil vide si il n'existe pas
        const { data: newProfile, error: createError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: authData.id,
            plan: 'free',
            preferences: {}
          })
          .select()
          .single()

        if (!createError && newProfile) {
        }
      }

      // 📊 Récupérer les stats de listes de suivis
      const { data: watchlists, error: watchlistsError } = await supabaseAdmin
        .from('watchlists')
        .select('*')
        .eq('user_id', authData.id)

      console.log('📋 Watchlists récupérées:', watchlists?.length || 0, watchlistsError ? `(erreur: ${watchlistsError.message})` : '')

      // Récupérer les éléments de watchlist pour calculer le nombre total de cryptos suivies
      const { data: watchlistItems, error: watchlistItemsError } = await supabaseAdmin
        .from('watchlist_items')
        .select('*')
        .eq('user_id', authData.id)

      console.log('💰 Cryptos suivies:', watchlistItems?.length || 0, watchlistItemsError ? `(erreur: ${watchlistItemsError.message})` : '')

      // 📈 Récupérer les stratégies de backtest
      const { data: strategies, error: strategiesError } = await supabaseAdmin
        .from('strategies')
        .select('*')
        .eq('user_id', authData.id)

      console.log('📈 Stratégies:', strategies?.length || 0, strategiesError ? `(erreur: ${strategiesError.message})` : '')

      // 🔗 Récupérer les exchanges connectés (depuis exchange_keys)
      const { data: exchanges, error: exchangesError } = await supabaseAdmin
        .from('exchange_keys')
        .select('*')
        .eq('user_id', authData.id)
        .eq('status', 'active')

      console.log('🔗 Exchanges connectés:', exchanges?.length || 0, exchangesError ? `(erreur: ${exchangesError.message})` : '')

      const stats: UserStats = {
        watchlists_count: watchlists?.length || 0,
        exchanges_count: exchanges?.length || 0, // Nombre réel d'exchanges connectés
        cryptos_count: watchlistItems?.length || 0, // Nombre de cryptos suivies
        strategies_count: strategies?.length || 0 // Nombre de stratégies backtest sauvegardées
      }

      console.log('📊 Stats finales:', stats)
      setUserStats(stats)
      setActivityLog([]) // TODO: implémenter l'activité plus tard
      setPerformanceData(null) // TODO: implémenter les performances plus tard


    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // En cas d'erreur, utiliser des données par défaut
      setUserStats({
        watchlists_count: 0,
        exchanges_count: 0,
        cryptos_count: 0,
        strategies_count: 0
      })
      setActivityLog([])
    } finally {
      setLoading(false)
    }
  }

  const getUserLocation = () => {
    return 'Paris, France'
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    try {
      setSendingPasswordReset(true)
      const { success, error } = await resetPassword(user.email)

      if (success) {
        alert(t('security.password_reset_sent'))
      } else {
        alert(error || t('security.password_reset_error'))
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      alert(t('security.password_reset_error'))
    } finally {
      setSendingPasswordReset(false)
    }
  }

  // Note: toggleDarkMode est maintenant toggleTheme du context global

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setLoading(true)

      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) {
        console.error('Token d\'authentification manquant')
        alert('Session expirée, veuillez vous reconnecter')
        return
      }


      // Préparer les données à mettre à jour
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Toujours sauvegarder phone et location (même si vides)
      updateData.phone = editForm.phone || null
      updateData.location = editForm.location || null


      // Vérifier que authData et authData.id existent
      if (!authData || !authData.id) {
        console.error('Données utilisateur invalides:', authData)
        alert('Erreur: Impossible de récupérer votre identifiant')
        return
      }

      // Sauvegarder directement dans Supabase
      const supabaseAdmin = createSupabaseAdmin()
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: authData.id,
          ...updateData
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        throw new Error('Erreur lors de la sauvegarde: ' + error.message)
      }


      // Mettre à jour l'affichage immédiatement
      setProfileDisplay({
        phone: editForm.phone || '',
        location: editForm.location || ''
      })

      setIsEditing(false)

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return t('time.now')
    if (diffInHours < 24) return `${t('time.hours_ago')} ${diffInHours}h`.trim()
    if (diffInHours < 48) return t('time.yesterday')

    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getMemberSince = () => {
    if (!user?.profile?.created_at) return t('profile.recently')

    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(user?.profile?.created_at || user?.createdAt || new Date()))
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'settings', label: t('tabs.settings'), icon: Settings },
    { id: 'security', label: t('tabs.security'), icon: Shield },
    { id: 'activity', label: t('tabs.activity'), icon: Clock },
  ] as const

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">{t('account.loading')}</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@200;300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .font-display {
          font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

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

        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .pattern-grid {
          background-image:
            linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen bg-[#0A0E1A] relative overflow-hidden">
        {/* Background with gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#1E293B] to-[#0A0E1A]"></div>
        <div className="fixed inset-0 pattern-grid opacity-20"></div>

        {/* Gradient orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl"></div>
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/8 rounded-full blur-3xl"></div>

        {/* Navigation */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 sm:pb-20">
          {/* Page Header with enhanced styling */}
          <div className="mb-8 sm:mb-12 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6 md:mb-0">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#2563EB] via-[#8B5CF6] to-[#A855F7] rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-2xl shadow-[#2563EB]/25">
                    {getUserInitials()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#2563EB] border-3 sm:border-4 border-[#0A0E1A] rounded-full"></div>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className={cn("text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-display mb-1 sm:mb-2", themeClasses.text.primary(isDarkMode))}>
                    {user?.email?.split('@')[0] || t('account.title')}
                  </h1>
                  <p className={cn("text-base sm:text-lg", themeClasses.text.secondary(isDarkMode))}>
                    {t('account.subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation with improved design */}
            <div className="glass-effect-strong rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-xl overflow-x-auto scrollbar-hide">
              <div className="flex space-x-1 sm:space-x-2 min-w-max sm:min-w-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg sm:rounded-xl transition-all duration-300 font-medium border-2 min-w-[110px] sm:min-w-[130px] ${
                      activeTab === tab.id
                        ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30 shadow-sm'
                        : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 border-transparent'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${activeTab === tab.id ? '' : ''}`} />
                    <span className="text-sm sm:text-base whitespace-nowrap">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-slide-up">
            {activeTab === 'profile' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Profile Info */}
                <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
                  isDarkMode
                    ? 'glass-effect-strong'
                    : 'bg-white/95 backdrop-blur-40 border border-gray-200 shadow-xl'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                    <h2 className={cn("text-xl sm:text-2xl font-bold font-display", themeClasses.text.primary(isDarkMode))}>{t('profile.title')}</h2>
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={loading}
                      className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 border-2 text-sm sm:text-base ${
                        isEditing
                          ? 'bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30 hover:border-[#2563EB]/40 shadow-sm hover:shadow-md'
                          : 'bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30 hover:border-[#2563EB]/40 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {loading ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isEditing ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <span>{isEditing ? t('profile.save') : t('profile.edit')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
                    <div className="space-y-6 sm:space-y-8">
                      {/* User Avatar & Basic Info */}
                      <div className="text-center lg:text-left">
                        <div className="relative inline-block mb-4 sm:mb-6">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-2xl">
                            {getUserInitials()}
                          </div>
                          <button className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 rounded-full flex items-center justify-center hover:bg-[#2563EB]/20 hover:border-[#2563EB]/40 transition-all duration-300 shadow-sm">
                            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <div className={cn("text-xl sm:text-2xl font-bold font-display", themeClasses.text.primary(isDarkMode))}>
                            {user?.email?.split('@')[0] || 'Utilisateur'}
                          </div>
                          <div className={cn("text-sm sm:text-base", themeClasses.text.secondary(isDarkMode))}>{t('profile.member_since')} {getMemberSince()}</div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4 sm:space-y-6">
                        <h3 className={cn("text-base sm:text-lg font-semibold pb-2",
                          themeClasses.text.primary(isDarkMode),
                          isDarkMode ? "border-b border-gray-800/40" : "border-b border-gray-200"
                        )}>{t('contact.title')}</h3>

                        <div className="space-y-3 sm:space-y-4">
                          <div className={cn("flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl",
                            isDarkMode ? "glass-effect" : "bg-gray-50 border border-gray-200"
                          )}>
                            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className={cn("font-medium text-sm sm:text-base truncate", themeClasses.text.primary(isDarkMode))}>{user?.email}</div>
                              <div className={cn("text-xs sm:text-sm", themeClasses.text.secondary(isDarkMode))}>{t('contact.email')}</div>
                            </div>
                            <div className="px-2 py-0.5 sm:py-1 bg-[#2563EB]/20 text-[#2563EB] text-[10px] sm:text-xs rounded-full font-semibold whitespace-nowrap flex-shrink-0">
                              {t('contact.verified')}
                            </div>
                          </div>

                          <div className={cn("flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl",
                            isDarkMode ? "glass-effect" : "bg-gray-50 border border-gray-200"
                          )}>
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5CF6] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <input
                                  type="tel"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                  placeholder={t('contact.phone_placeholder')}
                                  className={cn("w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#2563EB] focus:outline-none transition-colors",
                                    isDarkMode
                                      ? "bg-gray-800/50 border-gray-700/50 text-[#F9FAFB] placeholder-gray-500"
                                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                  )}
                                />
                              ) : (
                                <>
                                  <div className={cn("font-medium text-sm sm:text-base", themeClasses.text.primary(isDarkMode))}>
                                    {profileDisplay.phone || t('contact.not_provided')}
                                  </div>
                                  <div className={cn("text-xs sm:text-sm", themeClasses.text.secondary(isDarkMode))}>{t('contact.phone')}</div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className={cn("flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl",
                            isDarkMode ? "glass-effect" : "bg-gray-50 border border-gray-200"
                          )}>
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                  placeholder={t('contact.location_placeholder')}
                                  className={cn("w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-[#2563EB] focus:outline-none transition-colors",
                                    isDarkMode
                                      ? "bg-gray-800/50 border-gray-700/50 text-[#F9FAFB] placeholder-gray-500"
                                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                                  )}
                                />
                              ) : (
                                <>
                                  <div className={cn("font-medium text-sm sm:text-base", themeClasses.text.primary(isDarkMode))}>
                                    {profileDisplay.location || t('contact.not_provided')}
                                  </div>
                                  <div className={cn("text-xs sm:text-sm", themeClasses.text.secondary(isDarkMode))}>{t('contact.location')}</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex flex-col space-y-3 pt-2 sm:pt-4">
                          <button
                            onClick={() => {
                              setIsEditing(false)
                              setEditForm({
                                email: user?.email || '',
                                phone: profileDisplay.phone,
                                location: profileDisplay.location
                              })
                            }}
                            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800/50 text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-700/50 transition-colors font-semibold text-sm sm:text-base"
                          >
                            {t('profile.cancel')}
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className={cn("text-base sm:text-lg font-semibold mb-4 sm:mb-6 pb-2",
                        themeClasses.text.primary(isDarkMode),
                        isDarkMode ? "border-b border-gray-800/40" : "border-b border-gray-200"
                      )}>{t('stats.title')}</h3>

                      <div className="grid grid-cols-2 gap-4 sm:gap-4 lg:gap-6">
                        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-4 lg:p-6 hover:scale-105 hover:shadow-xl hover:shadow-[#2563EB]/10 transition-all duration-300 border border-gray-800/50 hover:border-[#2563EB]/30">
                          <div className="flex items-center justify-between mb-3 sm:mb-3">
                            <div className="p-2 sm:p-2 bg-[#2563EB]/20 rounded-lg sm:rounded-xl">
                              <Star className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#2563EB]" />
                            </div>
                          </div>
                          <div className="text-3xl sm:text-3xl lg:text-4xl font-bold text-[#2563EB] mb-2 sm:mb-2 font-display">
                            {userStats?.watchlists_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm sm:text-sm font-medium">{t('stats.watchlists')}</div>
                          {userStats?.watchlists_count === 0 && (
                            <div className="mt-2 sm:mt-2">
                              <Link
                                href="/portfolio"
                                className="text-xs sm:text-xs text-[#2563EB] hover:text-[#8B5CF6] transition-colors"
                              >
                                {t('stats.create_first')}
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-4 lg:p-6 hover:scale-105 hover:shadow-xl hover:shadow-[#2563EB]/10 transition-all duration-300 border border-gray-800/50 hover:border-[#2563EB]/30">
                          <div className="flex items-center justify-between mb-3 sm:mb-3">
                            <div className="p-2 sm:p-2 bg-[#2563EB]/20 rounded-lg sm:rounded-xl">
                              <Activity className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#2563EB]" />
                            </div>
                          </div>
                          <div className="text-3xl sm:text-3xl lg:text-4xl font-bold text-[#2563EB] mb-2 sm:mb-2 font-display">
                            {userStats?.exchanges_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm sm:text-sm font-medium">{t('stats.exchanges')}</div>
                        </div>
                        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-4 lg:p-6 hover:scale-105 hover:shadow-xl hover:shadow-[#F59E0B]/10 transition-all duration-300 border border-gray-800/50 hover:border-[#F59E0B]/30">
                          <div className="flex items-center justify-between mb-3 sm:mb-3">
                            <div className="p-2 sm:p-2 bg-[#F59E0B]/20 rounded-lg sm:rounded-xl">
                              <TrendingUp className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#F59E0B]" />
                            </div>
                          </div>
                          <div className="text-3xl sm:text-3xl lg:text-4xl font-bold text-[#F59E0B] mb-2 sm:mb-2 font-display">
                            {userStats?.cryptos_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm sm:text-sm font-medium">{t('stats.cryptos')}</div>
                          {userStats?.cryptos_count === 0 && (
                            <div className="mt-2 sm:mt-2">
                              <Link
                                href="/portfolio"
                                className="text-xs sm:text-xs text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
                              >
                                {t('stats.add_cryptos')}
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-4 lg:p-6 hover:scale-105 hover:shadow-xl hover:shadow-[#8B5CF6]/10 transition-all duration-300 border border-gray-800/50 hover:border-[#8B5CF6]/30">
                          <div className="flex items-center justify-between mb-3 sm:mb-3">
                            <div className="p-2 sm:p-2 bg-[#8B5CF6]/20 rounded-lg sm:rounded-xl">
                              <Target className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#8B5CF6]" />
                            </div>
                          </div>
                          <div className="text-3xl sm:text-3xl lg:text-4xl font-bold text-[#8B5CF6] mb-2 sm:mb-2 font-display">
                            {userStats?.strategies_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm sm:text-sm font-medium">{t('stats.strategies')}</div>
                          {userStats?.strategies_count === 0 && (
                            <div className="mt-2 sm:mt-2">
                              <Link
                                href="/backtest"
                                className="text-xs sm:text-xs text-[#8B5CF6] hover:text-[#A855F7] transition-colors"
                              >
                                {t('stats.create_first')}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-8 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <h4 className="font-semibold text-[#F9FAFB] mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB] mr-2" />
                          {t('performance.title')}
                        </h4>
                        {performanceData ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">{t('performance.this_month')}</span>
                              <span className={`font-semibold ${
                                performanceData.monthly_return >= 0 ? 'text-[#2563EB]' : 'text-[#DC2626]'
                              }`}>
                                {performanceData.monthly_return >= 0 ? '+' : ''}{(performanceData.monthly_return * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">{t('performance.last_3_months')}</span>
                              <span className={`font-semibold ${
                                performanceData.quarterly_return >= 0 ? 'text-[#2563EB]' : 'text-[#DC2626]'
                              }`}>
                                {performanceData.quarterly_return >= 0 ? '+' : ''}{(performanceData.quarterly_return * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">{t('performance.this_year')}</span>
                              <span className={`font-semibold ${
                                performanceData.yearly_return >= 0 ? 'text-[#2563EB]' : 'text-[#DC2626]'
                              }`}>
                                {performanceData.yearly_return >= 0 ? '+' : ''}{(performanceData.yearly_return * 100).toFixed(1)}%
                              </span>
                            </div>
                            {performanceData.sharpe_ratio > 0 && (
                              <div className="flex justify-between items-center border-t border-gray-700/30 pt-3">
                                <span className="text-gray-400">{t('performance.sharpe_ratio')}</span>
                                <span className="font-semibold text-[#8B5CF6]">
                                  {performanceData.sharpe_ratio.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {performanceData.max_drawdown < 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">{t('performance.max_drawdown')}</span>
                                <span className="font-semibold text-[#DC2626]">
                                  {(performanceData.max_drawdown * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">{t('performance.no_data')}</p>
                            <p className="text-xs">{t('performance.create_backtest')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-6 sm:mb-8 font-display">{t('settings.title')}</h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-[#F9FAFB] text-sm sm:text-base">{t('settings.email_notifications')}</div>
                        <div className="text-gray-400 text-xs sm:text-sm mt-1">{t('settings.email_notifications_desc')}</div>
                      </div>
                      <button className="relative w-12 h-6 bg-[#2563EB] rounded-full transition-colors flex-shrink-0 self-start sm:self-center">
                        <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full transition-transform"></div>
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-[#F9FAFB] text-sm sm:text-base">{t('settings.dark_mode')}</div>
                        <div className="text-gray-400 text-xs sm:text-sm mt-1">{t('settings.dark_mode_desc')}</div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 self-start sm:self-center ${
                          isDarkMode ? 'bg-[#2563EB]' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          isDarkMode ? 'right-0.5' : 'left-0.5'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-[#F9FAFB] text-sm sm:text-base">{t('settings.language')}</div>
                        <div className="text-gray-400 text-xs sm:text-sm mt-1">{t('settings.language_desc')}</div>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-[#F9FAFB] focus:border-[#2563EB] focus:outline-none text-sm sm:text-base flex-shrink-0"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-[#F9FAFB] text-sm sm:text-base">{t('settings.currency')}</div>
                        <div className="text-gray-400 text-xs sm:text-sm mt-1">{t('settings.currency_desc')}</div>
                      </div>
                      <select className="bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-[#F9FAFB] focus:border-[#2563EB] focus:outline-none text-sm sm:text-base flex-shrink-0">
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="BTC">BTC (₿)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-6 sm:mb-8 font-display">{t('security.title')}</h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2563EB]/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#F9FAFB] text-sm sm:text-base">{t('security.password')}</div>
                          <div className="text-gray-400 text-xs sm:text-sm">{t('security.password_changed')} 2 {t('security.password_days')}</div>
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordReset}
                        disabled={sendingPasswordReset}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 hover:border-[#2563EB]/40 rounded-lg sm:rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm hover:shadow-md text-sm sm:text-base"
                      >
                        {sendingPasswordReset ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('security.sending')}</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>{t('security.modify')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F59E0B]/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#F59E0B]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#F9FAFB] text-sm sm:text-base">{t('security.2fa')}</div>
                          <div className="text-gray-400 text-xs sm:text-sm">{t('security.2fa_desc')}</div>
                        </div>
                      </div>
                      <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800/50 text-gray-400 rounded-lg sm:rounded-xl cursor-not-allowed font-semibold text-sm sm:text-base">
                        {t('security.coming_soon')}
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h3 className="font-semibold text-[#F9FAFB] mb-3 sm:mb-4 text-sm sm:text-base">{t('security.active_sessions')}</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#2563EB]/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#F9FAFB] flex flex-wrap items-center gap-2 text-sm sm:text-base">
                              <span>{t('security.current_session')}</span>
                              <span className="px-2 py-0.5 sm:py-1 bg-[#2563EB]/20 text-[#2563EB] text-[10px] sm:text-xs font-semibold rounded-full">
                                {t('security.active')}
                              </span>
                            </div>
                            <div className="text-gray-400 text-xs sm:text-sm mt-1">
                              {getUserLocation()} • {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full sm:w-auto text-[#DC2626] hover:text-[#EF4444] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          {t('security.disconnect')}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-6 sm:mb-8 font-display">{t('activity.title')}</h2>

                <div className="space-y-3 sm:space-y-4">
                  {activityLog.length > 0 ? (
                    activityLog.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-6 glass-effect rounded-2xl hover:bg-gray-800/20 transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`w-3 h-3 rounded-full mt-2 animate-pulse-slow ${
                          activity.type === 'backtest' ? 'bg-[#2563EB]' :
                          activity.type === 'security' ? 'bg-[#F59E0B]' :
                          activity.type === 'auth' ? 'bg-[#2563EB]' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-[#F9FAFB]">{activity.action}</div>
                            <div className="text-gray-400 text-sm font-medium">
                              {formatDate(activity.timestamp)}
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm">{activity.details}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">{t('activity.no_activity')}</p>
                      <p className="text-sm">{t('activity.no_activity_desc')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement...</p>
          </div>
        </div>
      </ProtectedRoute>
    }>
      <AccountPageContent />
    </Suspense>
  )
}