"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin'
import { ArrowRight, TrendingUp, PieChart, Activity, Wallet, User, BarChart3, Shield, Zap, Target, CheckCircle, Star, Users, DollarSign, TrendingDown, Trophy } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { themeClasses, cn } from '@/utils/themeClasses'

export default function Home() {
  const { saveCurrentLocationForRedirect } = useRedirectAfterLogin()
  const { isDarkMode } = useTheme()
  const { t } = useLanguage()
  const pathname = usePathname()

  const handleAuthClick = () => {
    // Sauvegarder la page actuelle
    saveCurrentLocationForRedirect(pathname)
  }

  const handleLegalLinkClick = () => {
    // Sauvegarder la page actuelle avant de naviguer vers une page légale/contact/aide
    const legalPages = ['/mentions-legales', '/politique-confidentialite', '/conditions-utilisation', '/contact', '/aide']
    const isCurrentPageLegal = legalPages.some(page => pathname.includes(page))

    if (!isCurrentPageLegal) {
      sessionStorage.setItem('legalPagesOrigin', pathname)
    }
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
      
      <div className={cn("min-h-screen relative overflow-hidden", themeClasses.background.primary(isDarkMode), themeClasses.text.primary(isDarkMode))}>
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Navigation intelligente */}
        <SmartNavigation />

        {/* Hero Section */}
        <section className="relative pt-0 sm:pt-0 md:pt-0 pb-32 sm:pb-40 md:pb-48 overflow-hidden">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[900px] h-[900px] bg-gradient-to-br from-[#6366F1]/12 via-[#8B5CF6]/8 to-transparent rounded-full blur-[120px] float-animation"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-[#A855F7]/10 via-[#EC4899]/5 to-transparent rounded-full blur-[100px] float-animation" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-[#6366F1]/5 via-[#8B5CF6]/3 to-[#A855F7]/5 rounded-full blur-[150px] opacity-60"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              {/* Enhanced Main Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 md:mb-10 leading-[1.2] tracking-tight text-shadow font-display pt-16 sm:pt-20 md:pt-24">
                <span className={cn("block font-extrabold mb-1 sm:mb-2", themeClasses.text.primary(isDarkMode))}>Votre plateforme</span>
                <span className="block text-gradient-animate relative">
                  d'analyse crypto premium
                  <div className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-[#6366F1]/15 via-[#8B5CF6]/15 to-[#A855F7]/15 blur-2xl sm:blur-3xl opacity-60 pulse-glow"></div>
                </span>
              </h1>

              {/* Logo centered */}
              <div className="flex justify-center my-8 sm:my-12">
                <Image
                  src="/logo2.png"
                  alt="Cryptium Logo"
                  width={400}
                  height={400}
                  className="object-contain opacity-90"
                  priority
                />
              </div>

              {/* Enhanced Subtitle */}
              <div className="max-w-5xl mx-auto mb-12 sm:mb-16 md:mb-20">
                <p className={cn("text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-4 sm:mb-6 leading-relaxed font-light tracking-wide px-4 sm:px-0", themeClasses.text.secondary(isDarkMode))}>
                  Analysez les marchés, backtestez vos stratégies et suivez votre portfolio crypto.
                </p>
                <p className={cn("text-base sm:text-lg md:text-xl font-medium px-4 sm:px-0", themeClasses.text.muted(isDarkMode))}>
                  Gratuit et no-code. La plateforme tout-en-un pour optimiser vos investissements cryptomonnaies.
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 mt-8 sm:mt-12 text-xs sm:text-sm font-semibold text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{t('home.hero.trust1')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>{t('home.hero.trust2')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>{t('home.hero.trust3')}</span>
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
                    <span>{t('home.hero.cta_start')}</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#9333EA] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] blur-2xl sm:blur-3xl opacity-30 group-hover:opacity-70 transition-opacity duration-500"></div>
                </Link>

                <Link
                  href="#features"
                  className={cn("group relative border-2 px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg lg:text-xl font-bold transition-all duration-500 hover:scale-105 glass-effect overflow-hidden shimmer-effect w-full sm:w-auto", themeClasses.border.primary(isDarkMode), themeClasses.text.primary(isDarkMode), "hover:border-gray-500")}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3 sm:space-x-4">
                    <span className="hidden sm:block">{t('home.hero.cta_discover')}</span>
                    <span className="block sm:hidden">{t('home.hero.cta_discover_mobile')}</span>
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>

              {/* Stats Preview - Style professionnel */}
              <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto px-4 sm:px-0">
                <div className="glass-effect rounded-2xl p-5 sm:p-6 text-center hover:scale-105 transition-all duration-300 border border-gray-800/40">
                  <div className="text-3xl sm:text-4xl font-bold text-[#16A34A] mb-2 font-mono">Beta</div>
                  <div className="text-gray-400 text-sm font-medium">{t('home.stats.backtests')}</div>
                </div>
                <div className="glass-effect rounded-2xl p-5 sm:p-6 text-center hover:scale-105 transition-all duration-300 border border-gray-800/40">
                  <div className="text-3xl sm:text-4xl font-bold text-[#6366F1] mb-2 font-mono">15K+</div>
                  <div className="text-gray-400 text-sm font-medium">{t('home.stats.cryptos')}</div>
                </div>
                <div className="glass-effect rounded-2xl p-5 sm:p-6 text-center hover:scale-105 transition-all duration-300 border border-gray-800/40">
                  <div className="text-3xl sm:text-4xl font-bold text-[#8B5CF6] mb-2 font-mono">24/7</div>
                  <div className="text-gray-400 text-sm font-medium">{t('home.stats.uptime')}</div>
                </div>
                <div className="glass-effect rounded-2xl p-5 sm:p-6 text-center hover:scale-105 transition-all duration-300 border border-gray-800/40">
                  <div className="text-3xl sm:text-4xl font-bold text-[#F59E0B] mb-2 font-mono">Fast</div>
                  <div className="text-gray-400 text-sm font-medium">{t('home.stats.latency')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-32">
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-32">
              <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect mb-8">
                <Star className="w-5 h-5 text-[#6366F1] mr-2" />
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('home.features.badge')}</span>
              </div>

              <h2 className="text-5xl md:text-6xl xl:text-7xl font-black text-[#F9FAFB] mb-8 tracking-tight font-display">
                {t('home.features.title1')}
                <span className="block text-gradient-animate mt-2">{t('home.features.title2')}</span>
              </h2>

              <p className="text-gray-300 text-xl xl:text-2xl max-w-5xl mx-auto font-light leading-relaxed mb-8">
                {t('home.features.subtitle')}
              </p>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('home.features.check1')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('home.features.check2')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{t('home.features.check3')}</span>
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
                    {t('home.features.crypto.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    {t('home.features.crypto.desc')}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"></div>
                      <span>{t('home.features.crypto.feat1')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"></div>
                      <span>{t('home.features.crypto.feat2')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"></div>
                      <span>{t('home.features.crypto.feat3')}</span>
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
                    {t('home.features.charts.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    {t('home.features.charts.desc')}
                  </p>

                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></div>
                      <span>{t('home.features.charts.feat1')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></div>
                      <span>{t('home.features.charts.feat2')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full"></div>
                      <span>{t('home.features.charts.feat3')}</span>
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
                    {t('home.features.backtest.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    {t('home.features.backtest.desc')}
                  </p>

                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></div>
                      <span>{t('home.features.backtest.feat1')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></div>
                      <span>{t('home.features.backtest.feat2')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></div>
                      <span>{t('home.features.backtest.feat3')}</span>
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
                    {t('home.features.portfolio.title')}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light mb-4 sm:mb-6 group-hover:text-gray-300 transition-colors duration-500">
                    {t('home.features.portfolio.desc')}
                  </p>

                  <ul className="space-y-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-500">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                      <span>{t('home.features.portfolio.feat1')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                      <span>{t('home.features.portfolio.feat2')}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full"></div>
                      <span>{t('home.features.portfolio.feat3')}</span>
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

        {/* Tech Section */}
        <section className="relative py-32">
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center px-6 py-3 rounded-full glass-effect mb-8">
                  <Zap className="w-5 h-5 text-[#F59E0B] mr-2" />
                  <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{t('home.tech.badge')}</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-black text-[#F9FAFB] mb-12 tracking-tight leading-tight font-display">
                  {t('home.tech.title1')}
                  <span className="block text-gradient-animate">{t('home.tech.title2')}</span>
                </h2>

                <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                  {t('home.tech.subtitle')}
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
                          {t('home.tech.sync.title')}
                        </h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-300">
                          {t('home.tech.sync.desc')}
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                          <span>{t('home.tech.sync.check')}</span>
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
                          {t('home.tech.realtime.title')}
                        </h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-300">
                          {t('home.tech.realtime.desc')}
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#6366F1]" />
                          <span>{t('home.tech.realtime.check')}</span>
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
                          {t('home.tech.security.title')}
                        </h4>
                        <p className="text-gray-400 text-lg leading-relaxed font-light group-hover:text-gray-300 transition-colors duration-300">
                          {t('home.tech.security.desc')}
                        </p>
                        <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                          <span>{t('home.tech.security.check')}</span>
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
                    <h3 className="text-xl font-bold text-[#F9FAFB] mb-6 text-center font-display">{t('home.tech.perf.title')}</h3>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#16A34A] mb-2 font-mono">24/7</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('home.tech.perf.uptime')}</div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-[#16A34A] to-[#22C55E] h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                      </div>

                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#6366F1] mb-2 font-mono">Fast</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('home.tech.perf.latency')}</div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#8B5CF6] mb-2 font-mono">24/7</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('home.tech.perf.monitoring')}</div>
                        <div className="flex justify-center mt-2">
                          <div className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></div>
                          <div className="text-xs text-[#16A34A] ml-2">{t('home.tech.perf.live')}</div>
                        </div>
                      </div>

                      <div className="text-center glass-effect rounded-2xl p-4">
                        <div className="text-3xl font-black text-[#F59E0B] mb-2 font-mono">256</div>
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('home.tech.perf.encryption')}</div>
                        <div className="flex justify-center mt-2">
                          <Shield className="w-4 h-4 text-[#F59E0B]" />
                          <div className="text-xs text-[#F59E0B] ml-2">{t('home.tech.perf.secure')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="border-t border-gray-700/50 pt-6">
                    <div className="text-center text-gray-500 text-xs uppercase tracking-wider mb-4">{t('home.tech.stack')}</div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">TS</span>
                        </div>
                        <span className="text-gray-400">{t('home.tech.stack.typescript')}</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">AWS</span>
                        </div>
                        <span className="text-gray-400">{t('home.tech.stack.cloud')}</span>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">🚀</span>
                        </div>
                        <span className="text-gray-400">{t('home.tech.stack.redis')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer Légal */}
        <section className="relative py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-900/20 border-2 border-yellow-600/50 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-600/30 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-yellow-200 font-bold text-lg mb-3">{t('warning.title')}</h3>
                  <p className="text-yellow-200/90 text-sm sm:text-base leading-relaxed">
                    {t('warning.past_performance')} <strong>{t('warning.significant_risks')}</strong>. {t('warning.risk_capital')} <strong>{t('warning.not_advice')}</strong>.
                  </p>
                  <div className="mt-4 pt-4 border-t border-yellow-600/30">
                    <p className="text-yellow-200/70 text-xs">
                      {t('warning.platform_use')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111827]/20"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
            {/* Main Footer Content */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-4 mb-6">
                  <Image
                    src="/logo2.png"
                    alt="Cryptium Logo"
                    width={94}
                    height={94}
                    className="object-contain opacity-75"
                  />
                  <div>
                    <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight font-display">Cryptium</span>
                    <div className="text-xs text-gray-400 font-medium">Votre plateforme d'analyse crypto premium</div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                  {t('home.footer.brand_desc')}
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
                <h4 className="text-[#F9FAFB] font-semibold mb-6 text-lg">{t('home.footer.platform')}</h4>
                <ul className="space-y-4">
                  <li><Link href="/cryptos" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><TrendingUp className="w-4 h-4" /><span>{t('nav.cryptos')}</span></Link></li>
                  <li><Link href="/graphiques" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><BarChart3 className="w-4 h-4" /><span>{t('nav.charts')}</span></Link></li>
                  <li><Link href="/backtest" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><Activity className="w-4 h-4" /><span>{t('nav.backtest')}</span></Link></li>
                  <li><Link href="/portefeuille" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 flex items-center space-x-2"><Wallet className="w-4 h-4" /><span>{t('nav.portfolio')}</span></Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-[#F9FAFB] font-semibold mb-6 text-lg">{t('home.footer.support')}</h4>
                <ul className="space-y-4">
                  <li><Link href="/aide" onClick={handleLegalLinkClick} className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.help')}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.api_docs')}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.tutorials')}</Link></li>
                  <li><Link href="/support" onClick={handleLegalLinkClick} className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.tech_support')}</Link></li>
                </ul>
              </div>

              {/* Legal & Company */}
              <div>
                <h4 className="text-[#F9FAFB] font-semibold mb-6 text-lg">{t('home.footer.company')}</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.about')}</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.team')}</Link></li>
                </ul>
              </div>
            </div>

            {/* Compliance & Stats */}
            <div className="border-t border-gray-800/40 pt-12 mb-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass-effect rounded-2xl p-6 text-center">
                  <Shield className="w-8 h-8 text-[#16A34A] mx-auto mb-3" />
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">{t('home.footer.rgpd')}</div>
                  <div className="text-xs text-gray-400">{t('home.footer.compliant')}</div>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-[#6366F1] mx-auto mb-3" />
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">{t('home.footer.iso')}</div>
                  <div className="text-xs text-gray-400">{t('home.footer.certified')}</div>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <span className="text-2xl mb-3 block">🇫🇷</span>
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">{t('home.footer.french')}</div>
                  <div className="text-xs text-gray-400">100%</div>
                </div>

                <div className="glass-effect rounded-2xl p-6 text-center">
                  <div className="w-2 h-2 bg-[#16A34A] rounded-full mx-auto mb-3 animate-pulse"></div>
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">{t('home.footer.status')}</div>
                  <div className="text-xs text-[#16A34A] font-semibold">{t('home.footer.operational')}</div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800/40 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-500 text-sm">
                  © 2025 {t('home.footer.copyright')}
                </div>
                <div className="flex space-x-6 text-sm">
                  <Link href="/conditions-utilisation" onClick={handleLegalLinkClick} className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.terms')}</Link>
                  <Link href="/politique-confidentialite" onClick={handleLegalLinkClick} className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.privacy')}</Link>
                  <Link href="/mentions-legales" onClick={handleLegalLinkClick} className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.legal')}</Link>
                  <Link href="/contact" onClick={handleLegalLinkClick} className="text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300">{t('home.footer.contact')}</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}