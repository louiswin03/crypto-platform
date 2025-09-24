"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Play, Pause, RotateCcw, Calendar, Clock, Percent, MousePointer, Move, Save, Copy, ChevronDown, ChevronRight, Bell, CreditCard, LogOut, Camera, Mail, Phone, MapPin, Globe, Smartphone } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import SmartNavigation from '@/components/SmartNavigation'

export default function AccountPage() {
  const userProfile = {
    name: 'Alexandre Martin',
    email: 'alexandre.martin@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    memberSince: 'Janvier 2023',
    plan: 'Pro',
    avatar: 'AM'
  }

  const subscriptionPlans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      current: false,
      features: ['1 exchange connecté', '10 backtests/mois', 'Stratégies de base', 'Support communautaire']
    },
    {
      name: 'Pro',
      price: '19€',
      period: '/mois',
      current: true,
      popular: true,
      features: ['Exchanges illimités', 'Backtests illimités', 'Toutes les stratégies', 'Alertes en temps réel', 'Support prioritaire', 'Export PDF']
    },
    {
      name: 'Business',
      price: '49€',
      period: '/mois',
      current: false,
      features: ['Tout Pro +', 'Accès API', 'Données étendues', 'Support téléphonique', 'Rapports personnalisés', 'Intégrations avancées']
    }
  ]

  const activityLog = [
    { id: 1, action: 'Backtest créé', details: 'DCA Bitcoin Strategy', timestamp: '2025-01-20 14:32', type: 'backtest' },
    { id: 2, action: 'Exchange connecté', details: 'Binance API ajoutée', timestamp: '2025-01-20 12:15', type: 'security' },
    { id: 3, action: 'Connexion', details: 'Depuis Paris, France', timestamp: '2025-01-20 09:23', type: 'auth' },
    { id: 4, action: 'Stratégie sauvegardée', details: 'RSI Swing Trading', timestamp: '2025-01-19 16:48', type: 'backtest' },
    { id: 5, action: 'Abonnement mis à jour', details: 'Passage au plan Pro', timestamp: '2025-01-19 10:22', type: 'billing' },
  ]

  const connectedDevices = [
    { name: 'MacBook Pro', location: 'Paris, France', lastActive: 'Maintenant', current: true },
    { name: 'iPhone 15', location: 'Paris, France', lastActive: '2 heures', current: false },
    { name: 'Chrome Windows', location: 'Lyon, France', lastActive: '3 jours', current: false },
  ]

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
                  <a href="#notifications" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </a>
                  <a href="#billing" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all">
                    <CreditCard className="w-4 h-4" />
                    <span>Facturation</span>
                  </a>
                  <a href="#activity" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all">
                    <Clock className="w-4 h-4" />
                    <span>Activité</span>
                  </a>
                  <button className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/40 text-[#DC2626] hover:text-[#EF4444] transition-all w-full">
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
                  <button className="flex items-center space-x-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#5B21B6] transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                        {userProfile.avatar}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#F9FAFB]">{userProfile.name}</div>
                        <div className="text-gray-400">Plan {userProfile.plan}</div>
                        <div className="text-gray-500 text-sm">Membre depuis {userProfile.memberSince}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-[#F9FAFB]">{userProfile.email}</div>
                          <div className="text-gray-400 text-sm">Email principal</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-[#F9FAFB]">{userProfile.phone}</div>
                          <div className="text-gray-400 text-sm">Téléphone</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-[#F9FAFB]">{userProfile.location}</div>
                          <div className="text-gray-400 text-sm">Localisation</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#F9FAFB] mb-4">Statistiques du compte</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#6366F1] mb-1">47</div>
                        <div className="text-gray-400 text-sm">Backtests créés</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#16A34A] mb-1">3</div>
                        <div className="text-gray-400 text-sm">Exchanges connectés</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#F59E0B] mb-1">12</div>
                        <div className="text-gray-400 text-sm">Stratégies sauvées</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-[#8B5CF6] mb-1">89%</div>
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
                        <div className="text-gray-400 text-sm">Dernière modification il y a 3 mois</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <Shield className="w-5 h-5 text-[#DC2626]" />
                      <div>
                        <div className="font-semibold text-[#F9FAFB]">Authentification à deux facteurs</div>
                        <div className="text-gray-400 text-sm">Non configurée - Recommandée</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-colors">
                      Activer
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-4">Appareils connectés</h3>
                    <div className="space-y-3">
                      {connectedDevices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-[#F9FAFB] flex items-center space-x-2">
                                <span>{device.name}</span>
                                {device.current && (
                                  <span className="px-2 py-0.5 bg-[#16A34A]/20 text-[#16A34A] text-xs font-semibold rounded-full">
                                    Actuel
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-sm">{device.location} • {device.lastActive}</div>
                            </div>
                          </div>
                          {!device.current && (
                            <button className="text-[#DC2626] hover:text-[#EF4444] text-sm font-medium">
                              Déconnecter
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Billing Section */}
              <section id="billing" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Facturation & Abonnement</h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {subscriptionPlans.map((plan) => (
                    <div 
                      key={plan.name}
                      className={`relative rounded-2xl p-6 border ${
                        plan.current 
                          ? 'border-[#6366F1] bg-[#6366F1]/10' 
                          : 'border-gray-800/40 bg-gray-900/30'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="px-3 py-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-xs font-semibold rounded-full">
                            POPULAIRE
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-[#F9FAFB]">{plan.price}</span>
                          <span className="text-gray-400 ml-1">{plan.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button 
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          plan.current
                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:scale-105'
                        }`}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Plan actuel' : 'Choisir ce plan'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-800/40 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#F9FAFB]">Prochain paiement</div>
                      <div className="text-gray-400 text-sm">20 février 2025 • 19,00€</div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Gérer la facturation
                      </button>
                      <button className="px-4 py-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors">
                        Annuler l'abonnement
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity Log */}
              <section id="activity" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">Activité récente</h2>
                
                <div className="space-y-4">
                  {activityLog.map((activity) => (
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
                          <div className="text-gray-400 text-sm font-mono">{activity.timestamp}</div>
                        </div>
                        <div className="text-gray-400 text-sm">{activity.details}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <button className="text-[#6366F1] hover:text-[#8B5CF6] font-medium transition-colors">
                    Voir toute l'activité
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}