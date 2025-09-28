"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Play, Pause, RotateCcw, Calendar, Clock, Percent, MousePointer, Move, Save, Copy, ChevronDown, ChevronRight, Bell, CreditCard, LogOut, Camera, Mail, Phone, MapPin, Globe, Smartphone, Loader2, Edit3, X, Check } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface UserStats {
  backtests_count: number
  exchanges_count: number
  strategies_count: number
  success_rate: number
}

interface ActivityItem {
  id: string
  action: string
  details: string
  timestamp: string
  type: 'backtest' | 'security' | 'auth' | 'billing'
}

type TabType = 'profile' | 'settings' | 'security' | 'activity'

export default function AccountPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'profile'

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    email: user?.email || '',
    phone: '',
    location: ''
  })

  // Charger les données utilisateur
  useEffect(() => {
    if (user && profile) {
      loadUserData()
    }
  }, [user, profile])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Charger les statistiques (simulées pour l'instant)
      const stats: UserStats = {
        backtests_count: 12,
        exchanges_count: 3,
        strategies_count: 8,
        success_rate: 74
      }
      setUserStats(stats)

      // Charger l'activité récente (simulée)
      const activities: ActivityItem[] = [
        {
          id: '1',
          action: 'Backtest créé',
          details: 'Stratégie DCA Bitcoin',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1h ago
          type: 'backtest'
        },
        {
          id: '2',
          action: 'Connexion réussie',
          details: `Depuis ${getUserLocation()}`,
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2h ago
          type: 'auth'
        },
        {
          id: '3',
          action: 'Mot de passe modifié',
          details: 'Sécurité renforcée',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          type: 'security'
        },
        {
          id: '4',
          action: 'Exchange connecté',
          details: 'Binance - API en lecture seule',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          type: 'security'
        }
      ]
      setActivityLog(activities)

      // Pré-remplir le formulaire d'édition
      setEditForm({
        email: user.email || '',
        phone: profile.preferences?.phone || '',
        location: profile.preferences?.location || ''
      })

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
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

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferences: {
            ...profile.preferences,
            phone: editForm.phone,
            location: editForm.location
          }
        })
        .eq('id', user.id)

      if (error) throw error

      await loadUserData()
      setIsEditing(false)

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'À l\'instant'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 48) return 'Hier'

    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getMemberSince = () => {
    if (!profile?.member_since) return 'Récemment'

    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(profile.member_since))
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'activity', label: 'Activité', icon: Clock },
  ] as const

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de votre profil...</p>
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
      `}</style>

      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-grid opacity-30"></div>

        {/* Navigation */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                {getUserInitials()}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-[#F9FAFB] tracking-tight font-display">
                  {user?.email?.split('@')[0] || 'Mon Compte'}
                </h1>
                <p className="text-gray-400 text-lg font-light">
                  Gérez votre profil et préférences
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 glass-effect-strong rounded-2xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                    activeTab === tab.id
                      ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25'
                      : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-slide-up">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Info */}
                <div className="glass-effect-strong rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-[#F9FAFB] font-display">Informations personnelles</h2>
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={loading}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isEditing
                          ? 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-lg shadow-[#16A34A]/25'
                          : 'bg-[#6366F1] text-white hover:bg-[#5B21B6] shadow-lg shadow-[#6366F1]/25'
                      }`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isEditing ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Edit3 className="w-5 h-5" />
                      )}
                      <span>{isEditing ? 'Sauvegarder' : 'Modifier'}</span>
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      {/* User Avatar & Basic Info */}
                      <div className="text-center lg:text-left">
                        <div className="relative inline-block mb-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                            {getUserInitials()}
                          </div>
                          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#6366F1] text-white rounded-full flex items-center justify-center hover:bg-[#5B21B6] transition-colors shadow-lg">
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-[#F9FAFB] font-display">
                            {user?.email?.split('@')[0] || 'Utilisateur'}
                          </div>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#6366F1]/20 text-[#6366F1] text-sm font-semibold">
                            Plan {profile?.plan || 'Gratuit'}
                          </div>
                          <div className="text-gray-400">Membre depuis {getMemberSince()}</div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#F9FAFB] border-b border-gray-800/40 pb-2">Contact</h3>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 p-4 glass-effect rounded-2xl">
                            <Mail className="w-5 h-5 text-[#6366F1]" />
                            <div className="flex-1">
                              <div className="text-[#F9FAFB] font-medium">{user?.email}</div>
                              <div className="text-gray-400 text-sm">Email principal</div>
                            </div>
                            <div className="px-2 py-1 bg-[#16A34A]/20 text-[#16A34A] text-xs rounded-full font-semibold">
                              Vérifié
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 p-4 glass-effect rounded-2xl">
                            <Phone className="w-5 h-5 text-[#8B5CF6]" />
                            <div className="flex-1">
                              {isEditing ? (
                                <input
                                  type="tel"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                  placeholder="Numéro de téléphone"
                                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-gray-500 focus:border-[#6366F1] focus:outline-none transition-colors"
                                />
                              ) : (
                                <>
                                  <div className="text-[#F9FAFB] font-medium">
                                    {editForm.phone || 'Non renseigné'}
                                  </div>
                                  <div className="text-gray-400 text-sm">Téléphone</div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 p-4 glass-effect rounded-2xl">
                            <MapPin className="w-5 h-5 text-[#F59E0B]" />
                            <div className="flex-1">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                  placeholder="Votre localisation"
                                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] placeholder-gray-500 focus:border-[#6366F1] focus:outline-none transition-colors"
                                />
                              ) : (
                                <>
                                  <div className="text-[#F9FAFB] font-medium">
                                    {editForm.location || 'Non renseigné'}
                                  </div>
                                  <div className="text-gray-400 text-sm">Localisation</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => {
                              setIsEditing(false)
                              setEditForm({
                                email: user?.email || '',
                                phone: profile?.preferences?.phone || '',
                                location: profile?.preferences?.location || ''
                              })
                            }}
                            className="px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-colors font-semibold"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#F9FAFB] mb-6 border-b border-gray-800/40 pb-2">Statistiques du compte</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                          <div className="text-3xl font-bold text-[#6366F1] mb-2 font-display">
                            {userStats?.backtests_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Backtests créés</div>
                        </div>
                        <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                          <div className="text-3xl font-bold text-[#16A34A] mb-2 font-display">
                            {userStats?.exchanges_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Exchanges connectés</div>
                        </div>
                        <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                          <div className="text-3xl font-bold text-[#F59E0B] mb-2 font-display">
                            {userStats?.strategies_count || 0}
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Stratégies sauvées</div>
                        </div>
                        <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                          <div className="text-3xl font-bold text-[#8B5CF6] mb-2 font-display">
                            {userStats?.success_rate || 0}%
                          </div>
                          <div className="text-gray-400 text-sm font-medium">Taux de réussite</div>
                        </div>
                      </div>

                      <div className="mt-8 glass-effect rounded-2xl p-6">
                        <h4 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 text-[#16A34A] mr-2" />
                          Performance récente
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Ce mois</span>
                            <span className="text-[#16A34A] font-semibold">+12.4%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">3 derniers mois</span>
                            <span className="text-[#16A34A] font-semibold">+34.7%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Cette année</span>
                            <span className="text-[#16A34A] font-semibold">+89.2%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass-effect-strong rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8 font-display">Paramètres</h2>

                <div className="space-y-6">
                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Notifications par email</div>
                        <div className="text-gray-400 text-sm">Recevez des alertes sur vos backtests</div>
                      </div>
                      <button className="relative w-12 h-6 bg-[#6366F1] rounded-full transition-colors">
                        <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full transition-transform"></div>
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Mode sombre</div>
                        <div className="text-gray-400 text-sm">Interface en thème sombre</div>
                      </div>
                      <button className="relative w-12 h-6 bg-[#6366F1] rounded-full transition-colors">
                        <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full transition-transform"></div>
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Langue</div>
                        <div className="text-gray-400 text-sm">Langue de l'interface</div>
                      </div>
                      <select className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-[#F9FAFB] focus:border-[#6366F1] focus:outline-none">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Devise par défaut</div>
                        <div className="text-gray-400 text-sm">Devise d'affichage des prix</div>
                      </div>
                      <select className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-[#F9FAFB] focus:border-[#6366F1] focus:outline-none">
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
              <div className="glass-effect-strong rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8 font-display">Sécurité</h2>

                <div className="space-y-6">
                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#16A34A]/20 rounded-2xl flex items-center justify-center">
                          <Lock className="w-6 h-6 text-[#16A34A]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#F9FAFB]">Mot de passe</div>
                          <div className="text-gray-400 text-sm">Dernière modification il y a 2 jours</div>
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#5B21B6] transition-colors font-semibold">
                        Modifier
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-2xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-[#F59E0B]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#F9FAFB]">Authentification à deux facteurs</div>
                          <div className="text-gray-400 text-sm">Protection supplémentaire recommandée</div>
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-gray-800/50 text-gray-400 rounded-xl cursor-not-allowed font-semibold">
                        Bientôt disponible
                      </button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6">
                    <h3 className="font-semibold text-[#F9FAFB] mb-4">Sessions actives</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#6366F1]/20 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-[#6366F1]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#F9FAFB] flex items-center space-x-2">
                              <span>Session actuelle</span>
                              <span className="px-2 py-1 bg-[#16A34A]/20 text-[#16A34A] text-xs font-semibold rounded-full">
                                Actif
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              {getUserLocation()} • {new Date().toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="text-[#DC2626] hover:text-[#EF4444] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          Déconnecter
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-2xl p-6">
                    <h3 className="font-semibold text-[#F9FAFB] mb-4 flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Clés API
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">Gérez vos clés API pour les exchanges</p>
                    <button className="flex items-center space-x-2 px-6 py-3 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-colors font-semibold">
                      <Plus className="w-5 h-5" />
                      <span>Ajouter une clé API</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="glass-effect-strong rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8 font-display">Activité récente</h2>

                <div className="space-y-4">
                  {activityLog.length > 0 ? (
                    activityLog.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-6 glass-effect rounded-2xl hover:bg-gray-800/20 transition-colors"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`w-3 h-3 rounded-full mt-2 animate-pulse-slow ${
                          activity.type === 'backtest' ? 'bg-[#6366F1]' :
                          activity.type === 'security' ? 'bg-[#F59E0B]' :
                          activity.type === 'auth' ? 'bg-[#16A34A]' :
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
                      <p className="text-lg mb-2">Aucune activité récente</p>
                      <p className="text-sm">Vos actions apparaîtront ici</p>
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