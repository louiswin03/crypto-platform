"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Search, Filter, RefreshCcw, Maximize2, Settings, Download, Eye, EyeOff, Plus, ExternalLink, AlertTriangle, Lock, Key, Trash2, Play, Pause, RotateCcw, Calendar, Clock, Percent, MousePointer, Move, Save, Copy, ChevronDown, ChevronRight, Bell, CreditCard, LogOut, Camera, Mail, Phone, MapPin, Globe, Smartphone } from 'lucide-react'

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
    { name: 'iPhone 13', location: 'Paris, France', lastActive: 'Il y a 2h', current: false },
    { name: 'Chrome - Windows', location: 'Lyon, France', lastActive: 'Il y a 3 jours', current: false },
  ]

  const notificationSettings = [
    { id: 'email_alerts', name: 'Alertes de trading par email', enabled: true },
    { id: 'sms_alerts', name: 'Alertes SMS urgentes', enabled: false },
    { id: 'backtest_complete', name: 'Backtests terminés', enabled: true },
    { id: 'weekly_report', name: 'Rapport hebdomadaire', enabled: true },
    { id: 'security_alerts', name: 'Alertes de sécurité', enabled: true },
    { id: 'product_updates', name: 'Mises à jour produit', enabled: false },
  ]

  return (
    <>
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
        
        {/* Header */}
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
                <Link href="/backtest" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <Activity className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Backtest
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link href="/portefeuille" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <Wallet className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Portefeuille
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link href="/account" className="group flex items-center space-x-2 text-[#6366F1] font-semibold relative">
                  <User className="w-4 h-4" />
                  <span className="relative">
                    Account
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"></span>
                  </span>
                </Link>
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-5">
                <button className="p-2 rounded-xl hover:bg-gray-800/40 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#DC2626] rounded-full"></div>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center text-white font-bold">
                    {userProfile.avatar}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-[#F9FAFB]">{userProfile.name}</div>
                    <div className="text-xs text-gray-400">Plan {userProfile.plan}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">Informations du profil</h2>
                  <button className="flex items-center space-x-2 text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium">
                    <Settings className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Avatar */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                      {userProfile.avatar}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#8B5CF6]/50 rounded-3xl blur-xl"></div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all text-sm">
                      <Camera className="w-4 h-4" />
                      <span>Changer la photo</span>
                    </button>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Nom complet</label>
                        <input 
                          type="text" 
                          defaultValue={userProfile.name}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Email</label>
                        <input 
                          type="email" 
                          defaultValue={userProfile.email}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Téléphone</label>
                        <input 
                          type="tel" 
                          defaultValue={userProfile.phone}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Localisation</label>
                        <input 
                          type="text" 
                          defaultValue={userProfile.location}
                          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-[#F9FAFB] focus:outline-none focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-xl hover:bg-gray-700/50 hover:text-[#F9FAFB] transition-all font-medium">
                        Annuler
                      </button>
                      <button className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-xl font-semibold">
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8">Sécurité et confidentialité</h2>

                <div className="space-y-6">
                  {/* Password */}
                  <div className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[#F9FAFB] mb-2">Mot de passe</h3>
                        <p className="text-gray-400 text-sm">Dernière modification: il y a 2 mois</p>
                      </div>
                      <button className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B21B6] transition-all font-medium">
                        Modifier
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#16A34A]/20 rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-[#16A34A]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#F9FAFB] mb-1">Authentification à deux facteurs</h3>
                          <p className="text-gray-400 text-sm">Sécurité renforcée pour votre compte</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="px-3 py-1 bg-[#16A34A]/20 text-[#16A34A] rounded-full text-xs font-semibold">
                          Activé
                        </div>
                        <button className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-lg hover:text-[#F9FAFB] hover:border-gray-600/50 transition-all font-medium">
                          Configurer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connected Devices */}
                  <div className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/40">
                    <h3 className="font-semibold text-[#F9FAFB] mb-4">Appareils connectés</h3>
                    <div className="space-y-3">
                      {connectedDevices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-[#F9FAFB] flex items-center space-x-2">
                                <span>{device.name}</span>
                                {device.current && (
                                  <span className="px-2 py-0.5 bg-[#16A34A]/20 text-[#16A34A] rounded-full text-xs font-semibold">
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
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8">Abonnement et facturation</h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.name} className={`p-6 rounded-2xl border transition-all ${
                      plan.current 
                        ? 'border-[#6366F1] bg-[#6366F1]/10 shadow-xl shadow-[#6366F1]/20' 
                        : 'border-gray-800/40 hover:border-gray-700/60'
                    }`}>
                      <div className="text-center mb-6">
                        {plan.popular && (
                          <div className="inline-block px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] rounded-full text-xs font-semibold mb-3">
                            POPULAIRE
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">{plan.name}</h3>
                        <div className="flex items-end justify-center">
                          <span className="text-3xl font-black text-[#F9FAFB] font-mono">{plan.price}</span>
                          <span className="text-gray-400 font-medium">{plan.period}</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        plan.current
                          ? 'bg-gray-800/50 border border-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:scale-105 shadow-xl'
                      }`} disabled={plan.current}>
                        {plan.current ? 'Plan actuel' : 'Changer de plan'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Payment Method */}
                <div className="p-6 bg-gray-900/30 rounded-xl border border-gray-800/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#F9FAFB]">Méthode de paiement</h3>
                    <button className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium text-sm">
                      Modifier
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <div className="font-medium text-[#F9FAFB]">•••• •••• •••• 4242</div>
                      <div className="text-gray-400 text-sm">Expire 12/27</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity Log */}
              <section id="activity" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8">Journal d'activité</h2>
                
                <div className="space-y-3">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-900/30 rounded-xl border border-gray-800/40">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'backtest' ? 'bg-[#6366F1]/20 text-[#6366F1]' :
                        activity.type === 'security' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                        activity.type === 'auth' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                        'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                      }`}>
                        {activity.type === 'backtest' ? <Activity className="w-5 h-5" /> :
                         activity.type === 'security' ? <Shield className="w-5 h-5" /> :
                         activity.type === 'auth' ? <Lock className="w-5 h-5" /> :
                         <CreditCard className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#F9FAFB]">{activity.action}</div>
                        <div className="text-gray-400 text-sm">{activity.details}</div>
                      </div>
                      <div className="text-gray-400 text-sm font-mono">{activity.timestamp}</div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <button className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium">
                    Voir plus d'activités
                  </button>
                </div>
              </section>

              {/* Notifications */}
              <section id="notifications" className="glass-effect rounded-2xl p-8 border border-gray-800/40">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-8">Préférences de notification</h2>
                
                <div className="space-y-4">
                  {notificationSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-gray-800/40">
                      <div>
                        <div className="font-medium text-[#F9FAFB]">{setting.name}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={setting.enabled} />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366F1]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}