"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, Users, Ban, Scale, Info } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

export default function ConditionsUtilisationPage() {
  const { language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    // Rien à faire, l'origine est déjà sauvegardée par le Footer avant de cliquer
  }, [])

  const handleBack = () => {
    const origin = sessionStorage.getItem('legalPagesOrigin')

    sessionStorage.removeItem('legalPagesOrigin')

    if (origin) {
      router.push(origin)
    } else {
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

      <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] relative overflow-hidden">
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
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  {language === 'fr' ? 'Conditions Générales d\'Utilisation' : 'Terms of Service'}
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                {language === 'fr'
                  ? 'Règles et conditions d\'utilisation de la plateforme'
                  : 'Rules and conditions for using the platform'}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8">

              {/* Acceptation des conditions */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '1. Acceptation des conditions' : '1. Acceptance of Terms'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'En accédant et en utilisant Crypto Trading Platform (ci-après "la Plateforme"), vous acceptez d\'être lié par les présentes Conditions Générales d\'Utilisation (CGU). Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.'
                      : 'By accessing and using Crypto Trading Platform (hereinafter "the Platform"), you agree to be bound by these Terms of Service. If you do not accept these terms, please do not use the Platform.'}
                  </p>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prendront effet dès leur publication sur la Plateforme. Votre utilisation continue de la Plateforme après de telles modifications constituera votre acceptation des nouvelles conditions.'
                      : 'We reserve the right to modify these Terms at any time. Changes will take effect upon posting on the Platform. Your continued use of the Platform after such changes will constitute your acceptance of the new terms.'}
                  </p>
                  <div className="p-4 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-xl">
                    <p className="text-[#6366F1] text-sm leading-relaxed">
                      <strong>📅 {language === 'fr' ? 'Date d\'entrée en vigueur :' : 'Effective Date:'}</strong> {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Description du service */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#8B5CF6]/20 rounded-xl">
                    <Info className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '2. Description du service' : '2. Service Description'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Crypto Trading Platform est une plateforme d\'analyse et de backtesting de stratégies de trading de cryptomonnaies. Nous fournissons :'
                      : 'Crypto Trading Platform is a platform for analyzing and backtesting cryptocurrency trading strategies. We provide:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Des outils de backtesting de stratégies de trading' : 'Backtesting tools for trading strategies'}</li>
                    <li>{language === 'fr' ? 'L\'analyse de données de marché en temps réel' : 'Real-time market data analysis'}</li>
                    <li>{language === 'fr' ? 'La gestion de portefeuilles virtuels' : 'Virtual portfolio management'}</li>
                    <li>{language === 'fr' ? 'Des graphiques et indicateurs techniques avancés' : 'Advanced charts and technical indicators'}</li>
                    <li>{language === 'fr' ? 'Des listes de suivi personnalisées (watchlists)' : 'Custom watchlists'}</li>
                  </ul>
                  <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl">
                    <p className="text-[#DC2626] text-sm leading-relaxed">
                      <strong>⚠️ {language === 'fr' ? 'Important :' : 'Important:'}</strong> {language === 'fr'
                        ? 'La Plateforme est un OUTIL D\'ANALYSE uniquement. Nous ne sommes PAS un courtier, une plateforme d\'échange, ou un conseiller financier. Nous ne gérons PAS vos fonds et ne réalisons PAS de transactions pour votre compte.'
                        : 'The Platform is an ANALYSIS TOOL only. We are NOT a broker, exchange platform, or financial advisor. We do NOT manage your funds and do NOT execute transactions on your behalf.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Conditions d'inscription */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#00FF88]/20 rounded-xl">
                    <Users className="w-6 h-6 text-[#00FF88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '3. Conditions d\'inscription et compte utilisateur' : '3. Registration Conditions and User Account'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <h3 className="font-semibold text-[#F9FAFB] text-lg">
                    {language === 'fr' ? '3.1 Éligibilité' : '3.1 Eligibility'}
                  </h3>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Pour utiliser la Plateforme, vous devez :'
                      : 'To use the Platform, you must:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Avoir au moins 18 ans' : 'Be at least 18 years old'}</li>
                    <li>{language === 'fr' ? 'Avoir la capacité juridique de conclure un contrat contraignant' : 'Have legal capacity to enter into a binding contract'}</li>
                    <li>{language === 'fr' ? 'Ne pas être interdit d\'utiliser la Plateforme selon les lois applicables' : 'Not be prohibited from using the Platform under applicable laws'}</li>
                  </ul>

                  <h3 className="font-semibold text-[#F9FAFB] text-lg mt-6">
                    {language === 'fr' ? '3.2 Création de compte' : '3.2 Account Creation'}
                  </h3>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Lors de la création de votre compte, vous vous engagez à :'
                      : 'When creating your account, you agree to:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Fournir des informations exactes, complètes et à jour' : 'Provide accurate, complete and up-to-date information'}</li>
                    <li>{language === 'fr' ? 'Maintenir la sécurité de votre mot de passe' : 'Maintain the security of your password'}</li>
                    <li>{language === 'fr' ? 'Nous informer immédiatement de tout accès non autorisé à votre compte' : 'Immediately notify us of any unauthorized access to your account'}</li>
                    <li>{language === 'fr' ? 'Être responsable de toutes les activités effectuées via votre compte' : 'Be responsible for all activities performed through your account'}</li>
                  </ul>

                  <h3 className="font-semibold text-[#F9FAFB] text-lg mt-6">
                    {language === 'fr' ? '3.3 Suspension ou résiliation de compte' : '3.3 Account Suspension or Termination'}
                  </h3>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Nous nous réservons le droit de suspendre ou de résilier votre compte à tout moment, sans préavis, si nous estimons que vous avez enfreint ces CGU ou si votre compte est utilisé de manière frauduleuse ou illégale.'
                      : 'We reserve the right to suspend or terminate your account at any time, without notice, if we believe you have violated these Terms or if your account is being used fraudulently or illegally.'}
                  </p>
                </div>
              </section>

              {/* Utilisation acceptable */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#FFA366]/20 rounded-xl">
                    <Shield className="w-6 h-6 text-[#FFA366]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '4. Utilisation acceptable' : '4. Acceptable Use'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'En utilisant la Plateforme, vous acceptez de NE PAS :'
                      : 'By using the Platform, you agree NOT to:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Utiliser la Plateforme à des fins illégales ou non autorisées' : 'Use the Platform for illegal or unauthorized purposes'}</li>
                    <li>{language === 'fr' ? 'Tenter d\'accéder de manière non autorisée à nos systèmes ou aux comptes d\'autres utilisateurs' : 'Attempt to gain unauthorized access to our systems or other users\' accounts'}</li>
                    <li>{language === 'fr' ? 'Utiliser des robots, scrapers ou tout autre moyen automatisé pour accéder à la Plateforme sans notre autorisation' : 'Use bots, scrapers or any other automated means to access the Platform without our permission'}</li>
                    <li>{language === 'fr' ? 'Interférer avec le bon fonctionnement de la Plateforme' : 'Interfere with the proper functioning of the Platform'}</li>
                    <li>{language === 'fr' ? 'Télécharger ou transmettre des virus ou tout code malveillant' : 'Upload or transmit viruses or any malicious code'}</li>
                    <li>{language === 'fr' ? 'Harceler, abuser ou nuire à d\'autres utilisateurs' : 'Harass, abuse or harm other users'}</li>
                    <li>{language === 'fr' ? 'Collecter des informations sur d\'autres utilisateurs sans leur consentement' : 'Collect information about other users without their consent'}</li>
                    <li>{language === 'fr' ? 'Usurper l\'identité d\'une autre personne ou entité' : 'Impersonate another person or entity'}</li>
                    <li>{language === 'fr' ? 'Vendre, revendre ou exploiter commercialement la Plateforme sans autorisation' : 'Sell, resell or commercially exploit the Platform without authorization'}</li>
                  </ul>
                </div>
              </section>

              {/* Avertissements financiers */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#DC2626]/20 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '5. Avertissements financiers et risques' : '5. Financial Warnings and Risks'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <div className="p-6 bg-[#DC2626]/10 border-2 border-[#DC2626]/30 rounded-xl">
                    <p className="text-[#DC2626] font-semibold mb-4 text-lg">
                      ⚠️ {language === 'fr' ? 'AVERTISSEMENT SUR LES RISQUES' : 'RISK WARNING'}
                    </p>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>{language === 'fr'
                          ? 'Les cryptomonnaies sont des actifs extrêmement volatils. Vous pouvez perdre tout votre capital investi.'
                          : 'Cryptocurrencies are extremely volatile assets. You can lose all your invested capital.'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>{language === 'fr'
                          ? 'Les performances passées ne préjugent pas des performances futures. Les résultats de backtesting ne garantissent pas les résultats réels.'
                          : 'Past performance does not predict future performance. Backtesting results do not guarantee real results.'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>{language === 'fr'
                          ? 'N\'investissez que ce que vous pouvez vous permettre de perdre.'
                          : 'Only invest what you can afford to lose.'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>{language === 'fr'
                          ? 'Nous ne fournissons PAS de conseils en investissement. Consultez un conseiller financier qualifié avant de prendre des décisions d\'investissement.'
                          : 'We do NOT provide investment advice. Consult a qualified financial advisor before making investment decisions.'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>{language === 'fr'
                          ? 'Les données de marché peuvent contenir des erreurs ou des retards. Ne vous fiez pas uniquement à ces données.'
                          : 'Market data may contain errors or delays. Do not rely solely on this data.'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Limitation de responsabilité */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#8B5CF6]/20 rounded-xl">
                    <Scale className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '6. Limitation de responsabilité' : '6. Limitation of Liability'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Dans toute la mesure permise par la loi :'
                      : 'To the fullest extent permitted by law:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr'
                      ? 'La Plateforme est fournie "EN L\'ÉTAT" et "SELON DISPONIBILITÉ", sans garantie d\'aucune sorte'
                      : 'The Platform is provided "AS IS" and "AS AVAILABLE", without warranty of any kind'}</li>
                    <li>{language === 'fr'
                      ? 'Nous ne garantissons pas que la Plateforme sera exempte d\'erreurs, ininterrompue ou sécurisée'
                      : 'We do not guarantee that the Platform will be error-free, uninterrupted or secure'}</li>
                    <li>{language === 'fr'
                      ? 'Nous ne sommes pas responsables des pertes financières résultant de l\'utilisation de la Plateforme'
                      : 'We are not responsible for financial losses resulting from the use of the Platform'}</li>
                    <li>{language === 'fr'
                      ? 'Nous ne sommes pas responsables des erreurs dans les données de marché fournies par des tiers'
                      : 'We are not responsible for errors in market data provided by third parties'}</li>
                    <li>{language === 'fr'
                      ? 'Nous ne sommes pas responsables des actions que vous entreprenez sur la base des informations de la Plateforme'
                      : 'We are not responsible for actions you take based on Platform information'}</li>
                  </ul>
                  <p className="leading-relaxed mt-4 font-semibold text-[#F9FAFB]">
                    {language === 'fr'
                      ? 'Notre responsabilité totale envers vous ne dépassera en aucun cas le montant que vous nous avez payé au cours des 12 derniers mois (le cas échéant).'
                      : 'Our total liability to you will in no case exceed the amount you have paid us in the last 12 months (if any).'}
                  </p>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#00FF88]/20 rounded-xl">
                    <FileText className="w-6 h-6 text-[#00FF88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '7. Propriété intellectuelle' : '7. Intellectual Property'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Tout le contenu de la Plateforme, incluant mais sans s\'y limiter : le code source, les designs, les graphiques, les logos, les textes, les bases de données, et les fonctionnalités, est la propriété exclusive de Crypto Trading Platform ou de ses concédants de licence.'
                      : 'All Platform content, including but not limited to: source code, designs, graphics, logos, texts, databases, and features, is the exclusive property of Crypto Trading Platform or its licensors.'}
                  </p>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Vous recevez une licence limitée, non exclusive, non transférable et révocable pour utiliser la Plateforme à des fins personnelles et non commerciales. Toute autre utilisation est strictement interdite sans notre autorisation écrite préalable.'
                      : 'You receive a limited, non-exclusive, non-transferable and revocable license to use the Platform for personal and non-commercial purposes. Any other use is strictly prohibited without our prior written permission.'}
                  </p>
                </div>
              </section>

              {/* Résiliation */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#DC2626]/20 rounded-xl">
                    <Ban className="w-6 h-6 text-[#DC2626]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '8. Résiliation' : '8. Termination'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Vous pouvez résilier votre compte à tout moment en nous contactant ou via les paramètres de votre compte. Nous pouvons résilier ou suspendre votre accès immédiatement, sans préavis, pour toute violation de ces CGU.'
                      : 'You may terminate your account at any time by contacting us or through your account settings. We may terminate or suspend your access immediately, without notice, for any violation of these Terms.'}
                  </p>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Après la résiliation, vous perdrez l\'accès à votre compte et à toutes les données associées. Les dispositions qui, par leur nature, doivent survivre à la résiliation (notamment les limitations de responsabilité) resteront en vigueur.'
                      : 'After termination, you will lose access to your account and all associated data. Provisions that by their nature should survive termination (including liability limitations) will remain in effect.'}
                  </p>
                </div>
              </section>

              {/* Loi applicable */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <Scale className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '9. Loi applicable et juridiction' : '9. Governing Law and Jurisdiction'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Les présentes CGU sont régies par le droit français. Tout litige relatif à l\'interprétation ou à l\'exécution des présentes sera soumis à la compétence exclusive des tribunaux français, sauf dispositions légales impératives contraires.'
                      : 'These Terms are governed by French law. Any dispute relating to the interpretation or execution of these Terms will be subject to the exclusive jurisdiction of French courts, except for mandatory legal provisions to the contrary.'}
                  </p>
                </div>
              </section>

              {/* Modifications */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#FFA366]/20 rounded-xl">
                    <Info className="w-6 h-6 text-[#FFA366]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '10. Modifications des CGU' : '10. Changes to Terms'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications entreront en vigueur dès leur publication sur la Plateforme. Nous vous informerons des modifications importantes par email ou via une notification sur la Plateforme.'
                      : 'We reserve the right to modify these Terms at any time. Changes will take effect upon posting on the Platform. We will notify you of significant changes by email or via a notification on the Platform.'}
                  </p>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Il est de votre responsabilité de consulter régulièrement ces CGU. Votre utilisation continue de la Plateforme après les modifications constitue votre acceptation des nouvelles conditions.'
                      : 'It is your responsibility to regularly review these Terms. Your continued use of the Platform after changes constitutes your acceptance of the new terms.'}
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#00FF88]/20 rounded-xl">
                    <Users className="w-6 h-6 text-[#00FF88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? '11. Contact' : '11. Contact'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Pour toute question concernant ces Conditions Générales d\'Utilisation :'
                      : 'For any questions regarding these Terms of Service:'}
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#6366F1]/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a href="mailto:legal@cryptoplatform.com" className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium">
                        legal@cryptoplatform.com
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
