"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Trophy } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'

export default function Home() {
  const { saveCurrentLocationForRedirect } = useRedirectAfterLogin()
  const pathname = usePathname()

  const handleAuthClick = () => {
    // Sauvegarder la page actuelle
    saveCurrentLocationForRedirect(pathname)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@200;300;400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .font-mono {
          font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
        }

        .font-display {
          font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .text-shadow {
          text-shadow: 0 4px 40px rgba(99, 102, 241, 0.25);
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

        .glow-effect {
          box-shadow: 0 0 60px rgba(99, 102, 241, 0.2);
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

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 60px rgba(99, 102, 241, 0.2); }
          50% { box-shadow: 0 0 80px rgba(99, 102, 241, 0.35); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }

        .text-gradient-animate {
          background: linear-gradient(
            45deg,
            #6366F1,
            #8B5CF6,
            #A855F7,
            #EC4899,
            #6366F1
          );
          background-size: 200% 200%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-32 md:pt-40 pb-32 sm:pb-40 md:pb-48 overflow-hidden">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[900px] h-[900px] bg-gradient-to-br from-[#6366F1]/12 via-[#8B5CF6]/8 to-transparent rounded-full blur-[120px] float-animation"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-[#A855F7]/10 via-[#EC4899]/5 to-transparent rounded-full blur-[100px] float-animation" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-[#6366F1]/5 via-[#8B5CF6]/3 to-[#A855F7]/5 rounded-full blur-[150px] opacity-60"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              {/* Enhanced Main Title */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 sm:mb-8 md:mb-10 leading-[1.2] tracking-tighter text-shadow font-display py-2 sm:py-4">
                <span className="block text-[#F9FAFB] font-extrabold mb-1 sm:mb-2">Backtestez vos</span>
                <span className="block text-gradient-animate relative">
                  stratégies crypto
                  <div className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-[#6366F1]/15 via-[#8B5CF6]/15 to-[#A855F7]/15 blur-2xl sm:blur-3xl opacity-60 pulse-glow"></div>
                </span>
              </h1>

              {/* Enhanced Subtitle */}
              <div className="max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-300 mb-4 sm:mb-6 leading-relaxed font-light tracking-wide px-4 sm:px-0">
                  Plateforme française d'analyse et de backtesting crypto
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-400 font-medium px-4 sm:px-0">
                  Testez vos stratégies sur des données historiques réelles et optimisez vos investissements
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 mt-8 sm:mt-12 text-xs sm:text-sm font-semibold text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>100% Français</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Données temps réel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Sécurité maximale</span>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
                <Link
                  href="/auth/signup"
                  onClick={handleAuthClick}
                  className="group relative bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg lg:text-xl font-bold transition-all duration-500 hover:scale-105 lg:hover:scale-110 shadow-2xl hover:shadow-[#6366F1]/60 overflow-hidden shimmer-effect w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3 sm:space-x-4">
                    <span>Commencer gratuitement</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#9333EA] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] blur-2xl sm:blur-3xl opacity-30 group-hover:opacity-70 transition-opacity duration-500"></div>
                </Link>

                <Link
                  href="#features"
                  className="group relative border-2 border-gray-600 text-[#F9FAFB] px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg lg:text-xl font-bold hover:border-gray-500 transition-all duration-500 hover:scale-105 glass-effect overflow-hidden shimmer-effect w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3 sm:space-x-4">
                    <span className="hidden sm:block">Découvrir les fonctionnalités</span>
                    <span className="block sm:hidden">Découvrir</span>
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>

              {/* Stats Preview */}
              <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
                <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#16A34A] mb-1 sm:mb-2 font-mono">10K+</div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium">Backtests réalisés</div>
                </div>
                <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#6366F1] mb-1 sm:mb-2 font-mono">500+</div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium">Cryptos supportées</div>
                </div>
                <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#8B5CF6] mb-1 sm:mb-2 font-mono">99.9%</div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium">Uptime garanti</div>
                </div>
                <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#F59E0B] mb-1 sm:mb-2 font-mono">&lt;50ms</div>
                  <div className="text-gray-400 text-xs sm:text-sm font-medium">Latence API</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-32">
          <div className="absolute inset-0 pattern-grid opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/30 to-gray-900/60"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-32">
              <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect mb-8">
                <Star className="w-5 h-5 text-[#6366F1] mr-2" />
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Fonctionnalités Premium</span>
              </div>

              <h2 className="text-5xl md:text-6xl xl:text-7xl font-black text-[#F9FAFB] mb-8 tracking-tight font-display">
                Outils d'analyse
                <span className="block text-gradient-animate mt-2">professionnels</span>
              </h2>

              <p className="text-gray-300 text-xl xl:text-2xl max-w-5xl mx-auto font-light leading-relaxed mb-8">
                Suite complète pour analyser, optimiser et gérer vos investissements crypto avec une précision institutionnelle
              </p>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>API temps réel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Données historiques complètes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Algorithmes propriétaires</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-0">
              {/* Cryptomonnaies */}
              <Link href="/cryptos" className="group relative block">
                <div className="relative glass-effect-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-700 hover:scale-105 sm:hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#16A34A]/30 border border-gray-800/40 hover:border-[#16A34A]/50 cursor-pointer shimmer-effect overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/5 via-transparent to-[#22C55E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

                  {/* Icon */}
                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-700 shadow-xl group-hover:shadow-[#16A34A]/50 float-animation">
                    <TrendingUp className="w-10 h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/60 to-[#22C55E]/60 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-4 sm:mb-6 tracking-tight group-hover:text-[#16A34A] transition-colors duration-500 font-display">
                    Cryptomonnaies
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    Suivez les cours en temps réel, analysez les tendances du marché et identifiez les opportunités d'investissement.
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"></div>
                      <span>500+ cryptomonnaies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"></div>
                      <span>Données temps réel</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"></div>
                      <span>Listes personnalisées</span>
                    </li>
                  </ul>

                  {/* Arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-6 h-6 text-[#16A34A]" />
                  </div>
                </div>
              </Link>

              {/* Graphiques */}
              <Link href="/graphiques" className="group relative block">
                <div className="relative glass-effect-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-700 hover:scale-105 sm:hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#6366F1]/30 border border-gray-800/40 hover:border-[#6366F1]/50 cursor-pointer shimmer-effect overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 via-transparent to-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-700 shadow-xl group-hover:shadow-[#6366F1]/50 float-animation" style={{animationDelay: '1s'}}>
                    <BarChart3 className="w-10 h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/60 to-[#8B5CF6]/60 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-4 sm:mb-6 tracking-tight group-hover:text-[#6366F1] transition-colors duration-500 font-display">
                    Graphiques Avancés
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    Charts professionnels avec indicateurs techniques, analyse candlestick et outils de dessin intégrés.
                  </p>

                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></div>
                      <span>TradingView intégré</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></div>
                      <span>100+ indicateurs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></div>
                      <span>Outils de dessin</span>
                    </li>
                  </ul>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-6 h-6 text-[#6366F1]" />
                  </div>
                </div>
              </Link>

              {/* Backtest */}
              <Link href="/backtest" className="group relative block">
                <div className="relative glass-effect-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-700 hover:scale-105 sm:hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#8B5CF6]/30 border border-gray-800/40 hover:border-[#8B5CF6]/50 cursor-pointer shimmer-effect overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#A855F7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-700 shadow-xl group-hover:shadow-[#8B5CF6]/50 float-animation" style={{animationDelay: '2s'}}>
                    <Activity className="w-10 h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/60 to-[#A855F7]/60 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-4 sm:mb-6 tracking-tight group-hover:text-[#8B5CF6] transition-colors duration-500 font-display">
                    Backtest Intelligent
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    Testez vos stratégies sur vos données historiques réelles. Analysez les performances passées pour optimiser l'avenir.
                  </p>

                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></div>
                      <span>Données 5 ans</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></div>
                      <span>Stratégies avancées</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></div>
                      <span>Rapports détaillés</span>
                    </li>
                  </ul>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                </div>
              </Link>

              {/* Portefeuille */}
              <Link href="/portefeuille" className="group relative block">
                <div className="relative glass-effect-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-700 hover:scale-105 sm:hover:scale-110 group-hover:shadow-2xl group-hover:shadow-[#F59E0B]/30 border border-gray-800/40 hover:border-[#F59E0B]/50 cursor-pointer shimmer-effect overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/5 via-transparent to-[#D97706]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

                  <div className="relative w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 transition-all duration-700 shadow-xl group-hover:shadow-[#F59E0B]/50 float-animation" style={{animationDelay: '3s'}}>
                    <Wallet className="w-10 h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/60 to-[#D97706]/60 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#F9FAFB] mb-4 sm:mb-6 tracking-tight group-hover:text-[#F59E0B] transition-colors duration-500 font-display">
                    Gestion Portfolio
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    Synchronisez et gérez vos portefeuilles multi-exchanges. Suivi des performances en temps réel.
                  </p>

                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                      <span>Multi-exchanges</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                      <span>API sécurisées</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                      <span>Analytics avancés</span>
                    </li>
                  </ul>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Proof & Success Stories Section */}
        <section className="relative py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 via-transparent to-[#8B5CF6]/5"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            {/* Impressive Stats */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect mb-8">
                <Trophy className="w-5 h-5 text-[#F59E0B] mr-2" />
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Résultats Clients</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-[#F9FAFB] mb-16 tracking-tight font-display">
                Des résultats qui parlent d'eux-mêmes
              </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-16 sm:mb-20 md:mb-24 px-4 sm:px-0">
              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-all duration-500">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#16A34A] mb-2 sm:mb-3 md:mb-4 font-mono">+267%</div>
                <div className="text-gray-400 font-semibold text-xs sm:text-sm md:text-base">ROI Moyen</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Sur 12 mois</div>
              </div>

              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-all duration-500">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#6366F1] mb-2 sm:mb-3 md:mb-4 font-mono">5.2M€</div>
                <div className="text-gray-400 font-semibold text-xs sm:text-sm md:text-base">Volume Analysé</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Par mois</div>
              </div>

              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-all duration-500">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#8B5CF6] mb-2 sm:mb-3 md:mb-4 font-mono">847</div>
                <div className="text-gray-400 font-semibold text-xs sm:text-sm md:text-base">Stratégies Actives</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Testées quotidiennement</div>
              </div>

              <div className="glass-effect-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center hover:scale-105 transition-all duration-500">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#F59E0B] mb-2 sm:mb-3 md:mb-4 font-mono">96%</div>
                <div className="text-gray-400 font-semibold text-xs sm:text-sm md:text-base">Satisfaction</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Clients premium</div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
              <div className="glass-effect-strong rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#F9FAFB]">Marc D.</div>
                    <div className="text-gray-400 text-sm">Trader Indépendant</div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  "Grâce aux backtests, j'ai optimisé ma stratégie DCA et augmenté mes rendements de 180% en 8 mois."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-[#16A34A] font-semibold">+180% ROI</div>
                  <div className="flex text-[#F59E0B]">
                    {"★".repeat(5)}
                  </div>
                </div>
              </div>

              <div className="glass-effect-strong rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#F9FAFB]">Sophie L.</div>
                    <div className="text-gray-400 text-sm">Gestionnaire de Fonds</div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  "Interface pro, données fiables. Nos clients ont vu leurs portefeuilles croître de 240% cette année."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-[#16A34A] font-semibold">+240% Performance</div>
                  <div className="flex text-[#F59E0B]">
                    {"★".repeat(5)}
                  </div>
                </div>
              </div>

              <div className="glass-effect-strong rounded-3xl p-8 hover:scale-105 transition-all duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#F9FAFB]">Alex R.</div>
                    <div className="text-gray-400 text-sm">Investisseur Institutionnel</div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  "Plateforme française de référence. Sécurité, performance et support technique exceptionnel."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-[#16A34A] font-semibold">5M€ Géré</div>
                  <div className="flex text-[#F59E0B]">
                    {"★".repeat(5)}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-20 text-center">
              <p className="text-gray-500 mb-8">Ils nous font confiance</p>
              <div className="flex items-center justify-center space-x-12 opacity-60">
                <div className="glass-effect px-6 py-4 rounded-2xl">
                  <span className="font-semibold text-gray-400">🏦 Banque de France</span>
                </div>
                <div className="glass-effect px-6 py-4 rounded-2xl">
                  <span className="font-semibold text-gray-400">🛡️ ACPR Agréé</span>
                </div>
                <div className="glass-effect px-6 py-4 rounded-2xl">
                  <span className="font-semibold text-gray-400">🇫🇷 Made in France</span>
                </div>
                <div className="glass-effect px-6 py-4 rounded-2xl">
                  <span className="font-semibold text-gray-400">🔐 SOC2 Type II</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Section */}
        <section className="relative py-32">
          <div className="absolute inset-0 pattern-dots opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-gray-900/80"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect mb-8">
                  <Zap className="w-5 h-5 text-[#F59E0B] mr-2" />
                  <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Infrastructure</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-black text-[#F9FAFB] mb-12 tracking-tight leading-tight font-display">
                  Technologie de
                  <span className="block text-gradient-animate">pointe</span>
                </h2>

                <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                  Infrastructure haute performance conçue pour les traders professionnels et les institutions financières.
                </p>

                <div className="space-y-8">
                  <div className="group relative glass-effect-strong rounded-2xl p-6 hover:scale-105 transition-all duration-500">
                    <div className="flex items-start space-x-6">
                      <div className="relative w-12 h-12 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-2xl flex items-center justify-center flex-shrink-0 float-animation">
                        <Target className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/60 to-[#22C55E]/60 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#F9FAFB] mb-3 tracking-tight group-hover:text-[#16A34A] transition-colors duration-300">
                          Synchronisation Multi-Exchange
                        </h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-300">
                          Connectez vos comptes Binance, Coinbase, Kraken avec des clés API sécurisées en lecture seule.
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                          <span>15+ exchanges supportés</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative glass-effect-strong rounded-2xl p-6 hover:scale-105 transition-all duration-500">
                    <div className="flex items-start space-x-6">
                      <div className="relative w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center flex-shrink-0 float-animation" style={{animationDelay: '1s'}}>
                        <Activity className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/60 to-[#8B5CF6]/60 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#F9FAFB] mb-3 tracking-tight group-hover:text-[#6366F1] transition-colors duration-300">
                          Données Temps Réel
                        </h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-300">
                          Flux de données haute fréquence pour une analyse précise et des backtests fiables.
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#6366F1]" />
                          <span>Latence &lt; 50ms garantie</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative glass-effect-strong rounded-2xl p-6 hover:scale-105 transition-all duration-500">
                    <div className="flex items-start space-x-6">
                      <div className="relative w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] rounded-2xl flex items-center justify-center flex-shrink-0 float-animation" style={{animationDelay: '2s'}}>
                        <Shield className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/60 to-[#A855F7]/60 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#F9FAFB] mb-3 tracking-tight group-hover:text-[#8B5CF6] transition-colors duration-300">
                          Sécurité Maximale
                        </h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-300">
                          Chiffrement AES-256, hébergement français, conformité RGPD. Vos données sont protégées.
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                          <span>Certifié ISO 27001</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/15 via-[#8B5CF6]/10 to-[#A855F7]/15 rounded-[3rem] blur-3xl pulse-glow"></div>
                <div className="relative glass-effect-strong rounded-[3rem] p-12 border border-gray-700/60 hover:scale-105 transition-all duration-700 shimmer-effect">

                  {/* Performance Dashboard */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-[#F9FAFB] mb-6 text-center font-display">Performance en Temps Réel</h3>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#16A34A] mb-2 font-mono">99.9%</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Uptime</div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-[#16A34A] to-[#22C55E] h-2 rounded-full" style={{width: '99.9%'}}></div>
                        </div>
                      </div>

                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#6366F1] mb-2 font-mono">&lt;50ms</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Latence</div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#8B5CF6] mb-2 font-mono">24/7</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Monitoring</div>
                        <div className="flex justify-center mt-2">
                          <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                          <div className="text-xs text-[#16A34A] ml-2">LIVE</div>
                        </div>
                      </div>

                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#F59E0B] mb-2 font-mono">256</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">AES Encryption</div>
                        <div className="flex justify-center mt-2">
                          <Shield className="w-4 h-4 text-[#F59E0B]" />
                          <div className="text-xs text-[#F59E0B] ml-2">Sécurisé</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="border-t border-gray-700/50 pt-6">
                    <div className="text-center text-gray-500 text-xs uppercase tracking-wider mb-4">Stack Technologique</div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">TS</span>
                        </div>
                        <span className="text-gray-400">TypeScript</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">AWS</span>
                        </div>
                        <span className="text-gray-400">Cloud</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">🚀</span>
                        </div>
                        <span className="text-gray-400">Redis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative border-t border-gray-800/40 glass-effect-strong">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
            {/* Main Footer Content */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-2xl flex items-center justify-center shadow-2xl float-animation">
                    <TrendingUp className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight font-display">CryptoBacktest</span>
                    <div className="text-xs text-[#6366F1] font-medium tracking-[0.15em] uppercase">Plateforme française</div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                  La référence française pour le backtesting et l'analyse de stratégies crypto. Conçu par des traders, pour des traders.
                </p>

                {/* Social Links */}
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:bg-[#6366F1]/20 hover:text-[#6366F1] transition-all duration-300">
                    <Users className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:bg-[#6366F1]/20 hover:text-[#6366F1] transition-all duration-300">
                    <Star className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:bg-[#6366F1]/20 hover:text-[#6366F1] transition-all duration-300">
                    <Activity className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Platform */}
              <div>
                <h4 className="text-[#F9FAFB] font-semibold mb-6 text-lg">Plateforme</h4>
                <ul className="space-y-4">
                  <li><Link href="/cryptos" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><TrendingUp className="w-4 h-4" /><span>Cryptomonnaies</span></Link></li>
                  <li><Link href="/graphiques" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><BarChart3 className="w-4 h-4" /><span>Graphiques</span></Link></li>
                  <li><Link href="/backtest" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><Activity className="w-4 h-4" /><span>Backtest</span></Link></li>
                  <li><Link href="/portefeuille" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><Wallet className="w-4 h-4" /><span>Portfolio</span></Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><PieChart className="w-4 h-4" /><span>Tableau de bord</span></Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-[#F9FAFB] font-semibold mb-6 text-lg">Support</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Centre d'aide</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Documentation API</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Tutoriels vidéo</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Communauté Discord</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Support technique</Link></li>
                </ul>
              </div>

              {/* Legal & Company */}
              <div>
                <h4 className="text-[#F9FAFB] font-semibold mb-6 text-lg">Entreprise</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">À propos</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Notre équipe</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Carrières</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Presse</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Blog</Link></li>
                </ul>
              </div>
            </div>

            {/* Compliance & Stats */}
            <div className="border-t border-gray-800/40 pt-12 mb-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass-effect rounded-2xl p-6 text-center">
                  <Shield className="w-8 h-8 text-[#16A34A] mx-auto mb-3" />
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">RGPD</div>
                  <div className="text-xs text-gray-400">Conforme</div>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-[#6366F1] mx-auto mb-3" />
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">ISO 27001</div>
                  <div className="text-xs text-gray-400">Certifié</div>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <span className="text-2xl mb-3 block">🇫🇷</span>
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">Français</div>
                  <div className="text-xs text-gray-400">100%</div>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <div className="w-2 h-2 bg-[#16A34A] rounded-full mx-auto mb-3 animate-pulse"></div>
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">Status</div>
                  <div className="text-xs text-[#16A34A] font-semibold">OPERATIONAL</div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800/40 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-500 text-sm">
                  © 2025 CryptoBacktest SAS. Tous droits réservés. • Siège social: Paris, France • RCS: 123 456 789
                </div>
                <div className="flex space-x-6 text-sm">
                  <Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Conditions d'utilisation</Link>
                  <Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Politique de confidentialité</Link>
                  <Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Mentions légales</Link>
                  <Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">Contact</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}