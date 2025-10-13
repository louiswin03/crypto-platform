'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { TrendingUp, Users, Star, Activity, BarChart3, Wallet, PieChart, Shield, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const handleLegalLinkClick = () => {
    // Sauvegarder la page actuelle avant de naviguer vers une page légale/contact/aide
    const legalPages = ['/mentions-legales', '/politique-confidentialite', '/conditions-utilisation', '/contact', '/aide']
    const isCurrentPageLegal = legalPages.some(page => pathname.includes(page))

    if (!isCurrentPageLegal) {
      sessionStorage.setItem('legalPagesOrigin', pathname)
    }
  }

  return (
    <footer className="relative border-t border-gray-800/40 glass-effect-strong">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src="/logo.png"
                alt="Cryptium Logo"
                width={48}
                height={48}
                className="object-contain opacity-75"
              />
              <div>
                <span className="text-2xl font-bold text-[#F9FAFB] tracking-tight font-display">Cryptium</span>
                <div className="text-xs text-[#6366F1] font-medium tracking-[0.15em] uppercase">{t('nav.platform')}</div>
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
              {t('home.footer.copyright')}
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

      <style jsx global>{`
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
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

        .font-display {
          font-family: 'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </footer>
  )
}