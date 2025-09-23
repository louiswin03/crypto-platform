"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown } from 'lucide-react'

export default function Home() {
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
        
        .text-shadow {
          text-shadow: 0 2px 20px rgba(99, 102, 241, 0.15);
        }
        
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glow-effect {
          box-shadow: 0 0 50px rgba(99, 102, 241, 0.15);
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
              <div className="flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-2xl flex items-center justify-center shadow-2xl glow-effect">
                    <TrendingUp className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight">CryptoBacktest</span>
                    <div className="text-xs text-gray-500 font-medium tracking-[0.15em] uppercase">Plateforme française</div>
                  </div>
                </div>
              </div>

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
                <Link href="/account" className="group flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium relative">
                  <User className="w-4 h-4 group-hover:text-[#6366F1] transition-colors duration-300" />
                  <span className="relative">
                    Account
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </nav>

              {/* Auth */}
              <div className="flex items-center space-x-5">
                <button className="text-gray-400 hover:text-[#F9FAFB] transition-all duration-300 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800/40 relative group">
                  <span className="relative z-10">Connexion</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/0 via-gray-800/40 to-gray-800/0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                </button>
                <button className="relative bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-7 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#6366F1]/40 overflow-hidden group">
                  <span className="relative z-10">S'inscrire</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          {/* Hero Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#6366F1]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-[#A855F7]/8 to-transparent rounded-full blur-[100px]"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-6xl md:text-7xl xl:text-8xl font-black mb-8 leading-[1.1] tracking-tighter text-shadow">
                <span className="block text-[#F9FAFB] font-extrabold">Backtestez vos</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] mt-4 relative">
                  stratégies crypto
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#6366F1]/20 via-[#8B5CF6]/20 to-[#A855F7]/20 blur-3xl opacity-50"></div>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl xl:text-3xl text-gray-400 mb-16 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
                Plateforme française d'analyse et de backtesting crypto.<br />
                <span className="font-medium text-gray-300">Testez vos stratégies sur vos données historiques réelles.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <button className="group relative bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-[#6366F1]/50 overflow-hidden">
                  <span className="relative z-10 flex items-center space-x-3">
                    <span>Accéder à la plateforme</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#9333EA] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                </button>
                
                <button className="group relative border-2 border-gray-700 text-[#F9FAFB] px-12 py-5 rounded-2xl text-xl font-bold hover:border-gray-600 transition-all duration-500 hover:scale-105 glass-effect overflow-hidden">
                  <span className="relative z-10">En savoir plus</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-800/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/20 to-gray-900/40"></div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold text-[#F9FAFB] mb-8 tracking-tight">
                Outils d'analyse
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] mt-2">professionnels</span>
              </h2>
              <p className="text-gray-400 text-xl xl:text-2xl max-w-4xl mx-auto font-light leading-relaxed">
                Suite complète pour analyser, optimiser et gérer vos investissements crypto
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Cryptomonnaies */}
              <div className="group relative">
                <div className="relative glass-effect rounded-3xl p-8 h-full transition-all duration-500 hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#16A34A]/20 border border-gray-800/30 hover:border-[#16A34A]/30">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-500 shadow-xl">
                    <TrendingUp className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/50 to-[#22C55E]/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mb-4 tracking-tight">Cryptomonnaies</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Suivez les cours en temps réel, analysez les tendances du marché et identifiez les opportunités d'investissement.
                  </p>
                </div>
              </div>

              {/* Graphiques */}
              <div className="group relative">
                <div className="relative glass-effect rounded-3xl p-8 h-full transition-all duration-500 hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#6366F1]/20 border border-gray-800/30 hover:border-[#6366F1]/30">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-500 shadow-xl">
                    <BarChart3 className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#8B5CF6]/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mb-4 tracking-tight">Graphiques Avancés</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Charts professionnels avec indicateurs techniques, analyse candlestick et outils de dessin intégrés.
                  </p>
                </div>
              </div>

              {/* Backtest */}
              <div className="group relative">
                <div className="relative glass-effect rounded-3xl p-8 h-full transition-all duration-500 hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#8B5CF6]/20 border border-gray-800/30 hover:border-[#8B5CF6]/30">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-500 shadow-xl">
                    <Activity className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/50 to-[#A855F7]/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mb-4 tracking-tight">Backtest Intelligent</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Testez vos stratégies sur vos données historiques réelles. Analysez les performances passées pour optimiser l'avenir.
                  </p>
                </div>
              </div>

              {/* Portefeuille */}
              <div className="group relative">
                <div className="relative glass-effect rounded-3xl p-8 h-full transition-all duration-500 hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#F59E0B]/20 border border-gray-800/30 hover:border-[#F59E0B]/30">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-500 shadow-xl">
                    <Wallet className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/50 to-[#D97706]/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-[#F9FAFB] mb-4 tracking-tight">Gestion Portfolio</h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    Synchronisez et gérez vos portefeuilles multi-exchanges. Suivi des performances en temps réel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Section */}
        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-12 tracking-tight leading-tight">
                  Technologie de
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">pointe</span>
                </h2>
                
                <div className="space-y-8">
                  <div className="group flex items-start space-x-6">
                    <div className="relative w-8 h-8 bg-[#16A34A] rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-white" />
                      <div className="absolute inset-0 bg-[#16A34A]/50 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#F9FAFB] mb-3 tracking-tight">Synchronisation Multi-Exchange</h4>
                      <p className="text-gray-400 text-lg leading-relaxed font-light">Connectez vos comptes Binance, Coinbase, Kraken avec des clés API sécurisées en lecture seule.</p>
                    </div>
                  </div>
                  
                  <div className="group flex items-start space-x-6">
                    <div className="relative w-8 h-8 bg-[#6366F1] rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-white" />
                      <div className="absolute inset-0 bg-[#6366F1]/50 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#F9FAFB] mb-3 tracking-tight">Données Temps Réel</h4>
                      <p className="text-gray-400 text-lg leading-relaxed font-light">Flux de données haute fréquence pour une analyse précise et des backtests fiables.</p>
                    </div>
                  </div>
                  
                  <div className="group flex items-start space-x-6">
                    <div className="relative w-8 h-8 bg-[#8B5CF6] rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-5 h-5 text-white" />
                      <div className="absolute inset-0 bg-[#8B5CF6]/50 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#F9FAFB] mb-3 tracking-tight">Sécurité Maximale</h4>
                      <p className="text-gray-400 text-lg leading-relaxed font-light">Chiffrement AES-256, hébergement français, conformité RGPD. Vos données sont protégées.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/20 via-[#8B5CF6]/10 to-[#A855F7]/20 rounded-[3rem] blur-3xl"></div>
                <div className="relative glass-effect rounded-[3rem] p-12 border border-gray-700/50">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-black text-[#16A34A] mb-3 font-mono">99.9%</div>
                      <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black text-[#6366F1] mb-3 font-mono">&lt;100ms</div>
                      <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Latence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black text-[#8B5CF6] mb-3 font-mono">24/7</div>
                      <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Monitoring</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black text-[#F59E0B] mb-3 font-mono">AES-256</div>
                      <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Encryption</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-gray-800/40 glass-effect py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-12 md:mb-0">
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-2xl flex items-center justify-center shadow-2xl">
                  <TrendingUp className="w-7 h-7 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight">CryptoBacktest</span>
                  <div className="text-xs text-gray-500 font-medium tracking-[0.15em] uppercase">Plateforme française</div>
                </div>
              </div>
              <div className="text-gray-500 text-sm text-center md:text-right">
                <div className="mb-3 font-medium">© 2025 CryptoBacktest. Tous droits réservés.</div>
                <div className="space-x-8 font-medium">
                  <Link href="#" className="hover:text-[#F9FAFB] transition-colors duration-300">Conditions d'utilisation</Link>
                  <Link href="#" className="hover:text-[#F9FAFB] transition-colors duration-300">Politique de confidentialité</Link>
                  <Link href="#" className="hover:text-[#F9FAFB] transition-colors duration-300">Contact</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}