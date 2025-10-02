"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Building2, Mail, Scale, FileText, Lock, Eye } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

export default function MentionsLegalesPage() {
  const { language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    // Rien à faire, l'origine est déjà sauvegardée par le Footer avant de cliquer
  }, [])

  const handleBack = () => {
    // Récupérer la page d'origine sauvegardée
    const origin = sessionStorage.getItem('legalPagesOrigin')

    sessionStorage.removeItem('legalPagesOrigin')

    if (origin) {
      // Retourner à l'origine sauvegardée
      router.push(origin)
    } else {
      // Par défaut, retour à l'accueil
      router.push('/')
    }
  }

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
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .glass-effect-strong {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .text-shadow {
          text-shadow: 0 2px 20px rgba(99, 102, 241, 0.3);
        }

        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="min-h-screen bg-[#111827] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>

        <SmartNavigation />

        <main className="relative">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-12 pb-20">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#6366F1] transition-colors mb-8 group cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>{language === 'fr' ? 'Retour' : 'Back'}</span>
            </button>

            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-3xl mb-6">
                <Scale className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  {language === 'fr' ? 'Mentions Légales' : 'Legal Notice'}
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                {language === 'fr'
                  ? 'Informations légales et conditions d\'utilisation de la plateforme'
                  : 'Legal information and platform terms of use'}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8">

              {/* Éditeur du site */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <Building2 className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Éditeur du site' : 'Site Publisher'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <p className="font-semibold text-[#F9FAFB] mb-1">
                      {language === 'fr' ? 'Nom de la société :' : 'Company name:'}
                    </p>
                    <p>Crypto Trading Platform</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#F9FAFB] mb-1">
                      {language === 'fr' ? 'Forme juridique :' : 'Legal form:'}
                    </p>
                    <p>{language === 'fr' ? 'Auto-entrepreneur / Entreprise individuelle' : 'Self-employed / Sole proprietorship'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#F9FAFB] mb-1">
                      {language === 'fr' ? 'Siège social :' : 'Registered office:'}
                    </p>
                    <p>France</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#6366F1]" />
                    <p>contact@cryptoplatform.com</p>
                  </div>
                </div>
              </section>

              {/* Hébergement */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#8B5CF6]/20 rounded-xl">
                    <Shield className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Hébergement' : 'Hosting'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <p className="font-semibold text-[#F9FAFB] mb-1">
                      {language === 'fr' ? 'Hébergeur :' : 'Host:'}
                    </p>
                    <p>Vercel Inc.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#F9FAFB] mb-1">
                      {language === 'fr' ? 'Adresse :' : 'Address:'}
                    </p>
                    <p>340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#F9FAFB] mb-1">Site web :</p>
                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors">
                      https://vercel.com
                    </a>
                  </div>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#F59E0B]/20 rounded-xl">
                    <FileText className="w-6 h-6 text-[#F59E0B]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Propriété intellectuelle' : 'Intellectual Property'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'L\'ensemble du contenu présent sur ce site (textes, images, graphismes, logos, icônes, sons, logiciels) est la propriété exclusive de Crypto Trading Platform, à l\'exception des marques, logos ou contenus appartenant à d\'autres sociétés partenaires ou auteurs.'
                      : 'All content on this site (texts, images, graphics, logos, icons, sounds, software) is the exclusive property of Crypto Trading Platform, except for trademarks, logos or content belonging to other partner companies or authors.'}
                  </p>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Toute reproduction, distribution, modification, adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l\'accord exprès par écrit de Crypto Trading Platform.'
                      : 'Any reproduction, distribution, modification, adaptation, retransmission or publication of these elements is strictly prohibited without the express written consent of Crypto Trading Platform.'}
                  </p>
                </div>
              </section>

              {/* Données personnelles */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#16A34A]/20 rounded-xl">
                    <Lock className="w-6 h-6 text-[#16A34A]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Protection des données personnelles (RGPD)' : 'Personal Data Protection (GDPR)'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Conformément à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d\'un droit d\'accès, de rectification, de suppression et d\'opposition aux données personnelles vous concernant.'
                      : 'In accordance with the French Data Protection Act of January 6, 1978 and the General Data Protection Regulation (GDPR), you have the right to access, rectify, delete and object to personal data concerning you.'}
                  </p>
                  <p className="leading-relaxed font-semibold text-[#F9FAFB]">
                    {language === 'fr' ? 'Données collectées :' : 'Data collected:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Adresse email (authentification)' : 'Email address (authentication)'}</li>
                    <li>{language === 'fr' ? 'Mot de passe chiffré' : 'Encrypted password'}</li>
                    <li>{language === 'fr' ? 'Données de portfolio (stockées localement)' : 'Portfolio data (stored locally)'}</li>
                    <li>{language === 'fr' ? 'Listes de suivi personnalisées' : 'Custom watchlists'}</li>
                  </ul>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Pour exercer ces droits, vous pouvez nous contacter à l\'adresse : contact@cryptoplatform.com'
                      : 'To exercise these rights, you can contact us at: contact@cryptoplatform.com'}
                  </p>
                  <div className="p-4 bg-[#16A34A]/10 border border-[#16A34A]/30 rounded-xl">
                    <p className="text-[#16A34A] text-sm leading-relaxed">
                      <strong>{language === 'fr' ? '🔒 Engagement :' : '🔒 Commitment:'}</strong> {language === 'fr'
                        ? 'Vos données ne sont jamais vendues à des tiers. Elles sont utilisées uniquement pour le fonctionnement de la plateforme.'
                        : 'Your data is never sold to third parties. It is used only for platform operations.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#DC2626]/20 rounded-xl">
                    <Eye className="w-6 h-6 text-[#DC2626]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Cookies et technologies similaires' : 'Cookies and Similar Technologies'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Ce site utilise des cookies essentiels pour assurer son bon fonctionnement. Ces cookies permettent notamment :'
                      : 'This site uses essential cookies to ensure proper functioning. These cookies allow:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'La gestion de votre session utilisateur' : 'Management of your user session'}</li>
                    <li>{language === 'fr' ? 'La sauvegarde de vos préférences (langue, thème)' : 'Saving your preferences (language, theme)'}</li>
                    <li>{language === 'fr' ? 'Le bon fonctionnement des fonctionnalités de la plateforme' : 'Proper functioning of platform features'}</li>
                  </ul>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Aucun cookie de tracking ou publicitaire n\'est utilisé sur cette plateforme.'
                      : 'No tracking or advertising cookies are used on this platform.'}
                  </p>
                </div>
              </section>

              {/* Responsabilité */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#8B5CF6]/20 rounded-xl">
                    <Shield className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Limitation de responsabilité' : 'Limitation of Liability'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Les informations fournies sur cette plateforme sont à titre indicatif uniquement. Crypto Trading Platform ne saurait être tenu responsable :'
                      : 'The information provided on this platform is for informational purposes only. Crypto Trading Platform cannot be held responsible for:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Des pertes financières liées aux décisions d\'investissement' : 'Financial losses related to investment decisions'}</li>
                    <li>{language === 'fr' ? 'De l\'exactitude des données de marché en temps réel' : 'The accuracy of real-time market data'}</li>
                    <li>{language === 'fr' ? 'Des interruptions de service temporaires' : 'Temporary service interruptions'}</li>
                    <li>{language === 'fr' ? 'De l\'utilisation des résultats de backtest pour des investissements réels' : 'Use of backtest results for real investments'}</li>
                  </ul>
                  <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl">
                    <p className="text-[#DC2626] text-sm leading-relaxed">
                      <strong>⚠️ {language === 'fr' ? 'Avertissement :' : 'Warning:'}</strong> {language === 'fr'
                        ? 'Les cryptomonnaies sont des actifs volatils. N\'investissez que ce que vous pouvez vous permettre de perdre. Cette plateforme est un outil d\'analyse et non un conseil en investissement.'
                        : 'Cryptocurrencies are volatile assets. Only invest what you can afford to lose. This platform is an analysis tool and not investment advice.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <Mail className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Contact' : 'Contact'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Pour toute question concernant ces mentions légales ou l\'utilisation de la plateforme :'
                      : 'For any questions regarding these legal notices or the use of the platform:'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-[#6366F1]" />
                      <a href="mailto:contact@cryptoplatform.com" className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors">
                        contact@cryptoplatform.com
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* Date de mise à jour */}
              <div className="text-center text-gray-500 text-sm pt-8">
                <p>
                  {language === 'fr' ? 'Dernière mise à jour :' : 'Last updated:'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
