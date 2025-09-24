"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Play, Pause, RotateCcw, Calendar, Clock, Percent, MousePointer, Move, Save, Copy, ChevronDown, ChevronRight, Bell, CreditCard, LogOut, Camera, Mail, Phone, MapPin, Globe, Smartphone, Loader2 } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function AccountPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
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
      
      // Charger les statistiques (simulées pour l'instant car pas encore d'autres tables)
      const stats: UserStats = {
        backtests_count: 0, // TODO: compter depuis la table backtests quand elle existera
        exchanges_count: 0, // TODO: compter depuis la table exchanges quand elle existera  
        strategies_count: 0, // TODO: compter depuis la table strategies quand elle existera
        success_rate: 0
      }
      setUserStats(stats)

      // Charger l'activité récente (simulée pour l'instant)
      const activities: ActivityItem[] = [
        {
          id: '1',
          action: 'Connexion',
          details: `Depuis ${getUserLocation()}`,
          timestamp: new Date().toISOString(),
          type: 'auth'
        },
        {
          id: '2', 
          action: 'Profil créé',
          details: 'Inscription sur la plateforme',
          timestamp: profile.member_since,
          type: 'auth'
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
    // Vous pourriez utiliser une API de géolocalisation ici
    return 'France'
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return

    try {
      setLoading(true)

      // Mettre à jour les préférences utilisateur
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

      // Recharger les données
      await loadUserData()
      setIsEditing(false)

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      // TODO: Afficher un toast d'erreur
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
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

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#6366F1] mx-auto mb-4" />
            <p className="text-gray-400">Chargement de votre profil...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
        }
        
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4 tracking-tight">
              Mon compte
            </h1>
            <p className="text-gray-400 text-xl font-light max-w-2xl">
              Gérez votre profil, sécurité et préférences
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="glass-effect rounded-2xl p-6 border border-gray-800/40 sticky top-28">
                <nav className="space-y-2">
                  <a href="#profile" className="flex items-center space-x-3 p-3 rounded-xl bg-[#6366F1]/20 border border-[#6366F1]/40 text-[#6366F1] font-semibold">
                    <User className="w-4 h-4" />
                    <span>Profil</span>
                  </a>
                  <a href="#security" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all">
                    <Shield className="w-4 h-4" />
                    <span>Sécurité</span>
                  </a>
                  <a href="#activity" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all">
                    <Clock className="w-4 h-4" />
                    <span>Activité</span>
                  </a>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-[#DC2626] hover:text-[#EF4444] transition-all w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Section */}
              <section id="profile" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">Informations du profil</h2>
                  <button 
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#5B21B6] transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isEditing ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    <span>{isEditing ? 'Sauvegarder' : 'Modifier'}</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                        {getUserInitials()}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#F9FAFB]">
                          {user?.email?.split('@')[0] || 'Utilisateur'}
                        </div>
                        <div className="text-gray-400">Plan {profile?.plan || 'Gratuit'}</div>
                        <div className="text-gray-500 text-sm">Membre depuis {getMemberSince()}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-[#F9FAFB]">{user?.email}</div>
                          <div className="text-gray-400 text-sm">Email principal</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              placeholder="Numéro de téléphone"
                              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-[#F9FAFB] placeholder-gray-500 focus:border-[#6366F1] focus:outline-none"
                            />
                          ) : (
                            <>
                              <div className="text-[#F9FAFB]">
                                {editForm.phone || 'Non renseigné'}
                              </div>
                              <div className="text-gray-400 text-sm">Téléphone</div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.location}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              placeholder="Votre localisation"
                              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-[#F9FAFB] placeholder-gray-500 focus:border-[#6366F1] focus:outline-none"
                            />
                          ) : (
                            <>
                              <div className="text-[#F9FAFB]">
                                {editForm.location || 'Non renseigné'}
                              </div>
                              <div className="text-gray-400 text-sm">Localisation</div>
                            </>
                          )}
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
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#F9FAFB] mb-4">Statistiques du compte</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#6366F1] mb-1">
                          {userStats?.backtests_count || 0}
                        </div>
                        <div className="text-gray-400 text-sm">Backtests créés</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#16A34A] mb-1">
                          {userStats?.exchanges_count || 0}
                        </div>
                        <div className="text-gray-400 text-sm">Exchanges connectés</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#F59E0B] mb-1">
                          {userStats?.strategies_count || 0}
                        </div>
                        <div className="text-gray-400 text-sm">Stratégies sauvées</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#8B5CF6] mb-1">
                          {userStats?.success_rate || 0}%
                        </div>
                        <div className="text-gray-400 text-sm">Taux de réussite</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Sécurité</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <Lock className="w-5 h-5 text-[#16A34A]" />
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Mot de passe</div>
                        <div className="text-gray-400 text-sm">Géré par l'authentification sécurisée</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        // TODO: Implémenter le changement de mot de passe via Supabase
                        console.log('Changement de mot de passe à implémenter')
                      }}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <Shield className="w-5 h-5 text-[#DC2626]" />
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Authentification à deux facteurs</div>
                        <div className="text-gray-400 text-sm">Fonctionnalité à venir</div>
                      </div>
                    </div>
                    <button 
                      className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                      disabled
                    >
                      Bientôt disponible
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-4">Session actuelle</h3>
                    <div className="p-4 bg-gray-900/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Smartphone className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-[#F9FAFB] flex items-center space-x-2">
                              <span>Session actuelle</span>
                              <span className="px-2 py-0.5 bg-[#16A34A]/20 text-[#16A34A] text-xs font-semibold rounded-full">
                                Actif
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              Connecté depuis {getUserLocation()}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={handleSignOut}
                          className="text-[#DC2626] hover:text-[#EF4444] text-sm font-medium"
                        >
                          Déconnecter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity Log */}
              <section id="activity" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Activité récente</h2>
                
                <div className="space-y-4">
                  {activityLog.length > 0 ? (
                    activityLog.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-xl">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'backtest' ? 'bg-[#6366F1]' :
                          activity.type === 'security' ? 'bg-[#F59E0B]' :
                          activity.type === 'auth' ? 'bg-[#16A34A]' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-[#F9FAFB]">{activity.action}</div>
                            <div className="text-gray-400 text-sm font-mono">
                              {formatDate(activity.timestamp)}
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm">{activity.details}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}