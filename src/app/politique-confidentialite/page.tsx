"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Database, Server, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

export default function PolitiqueConfidentialitePage() {
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00FF88] to-[#22C55E] rounded-3xl mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-[#F9FAFB] via-[#00FF88] to-[#22C55E] bg-clip-text text-transparent">
                  {language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                {language === 'fr'
                  ? 'Comment nous protégeons et utilisons vos données personnelles'
                  : 'How we protect and use your personal data'}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8">

              {/* Introduction */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <Shield className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Introduction' : 'Introduction'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Chez Cryptium, la protection de vos données personnelles est importante. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles.'
                      : 'At Cryptium, protecting your personal data is important. This privacy policy explains how we collect, use, store and protect your personal information.'}
                  </p>
                  <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl">
                    <p className="text-[#00FF88] text-sm leading-relaxed">
                      <strong>✓ {language === 'fr' ? 'Engagement :' : 'Commitment:'}</strong> {language === 'fr'
                        ? 'Vos données vous appartiennent. Vous avez un contrôle total sur leur utilisation et pouvez les supprimer à tout moment.'
                        : 'Your data belongs to you. You have full control over its use and can delete it at any time.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Données collectées */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#8B5CF6]/20 rounded-xl">
                    <Database className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Données collectées' : 'Data Collected'}
                  </h2>
                </div>
                <div className="space-y-6 text-gray-300">
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-3 text-lg">
                      {language === 'fr' ? '1. Données de compte' : '1. Account Data'}
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>{language === 'fr' ? 'Adresse email (obligatoire pour l\'authentification)' : 'Email address (required for authentication)'}</li>
                      <li>{language === 'fr' ? 'Mot de passe (chiffré avec bcrypt - nous ne stockons jamais les mots de passe en clair)' : 'Password (encrypted with bcrypt - we never store passwords in plain text)'}</li>
                      <li>{language === 'fr' ? 'Nom d\'affichage (optionnel)' : 'Display name (optional)'}</li>
                      <li>{language === 'fr' ? 'Date de création du compte' : 'Account creation date'}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-3 text-lg">
                      {language === 'fr' ? '2. Données d\'utilisation' : '2. Usage Data'}
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>{language === 'fr' ? 'Listes de suivi personnalisées (watchlists)' : 'Custom watchlists'}</li>
                      <li>{language === 'fr' ? 'Stratégies de trading sauvegardées' : 'Saved trading strategies'}</li>
                      <li>{language === 'fr' ? 'Préférences utilisateur (langue, thème)' : 'User preferences (language, theme)'}</li>
                      <li>{language === 'fr' ? 'Données de portfolio (stockées dans votre navigateur uniquement)' : 'Portfolio data (stored in your browser only)'}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-3 text-lg">
                      {language === 'fr' ? '3. Données techniques' : '3. Technical Data'}
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>{language === 'fr' ? 'Adresse IP (pour la sécurité et la prévention de la fraude)' : 'IP address (for security and fraud prevention)'}</li>
                      <li>{language === 'fr' ? 'Type de navigateur et système d\'exploitation' : 'Browser type and operating system'}</li>
                      <li>{language === 'fr' ? 'Date et heure d\'accès' : 'Access date and time'}</li>
                      <li>{language === 'fr' ? 'Pages visitées sur la plateforme' : 'Pages visited on the platform'}</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl">
                    <p className="text-[#DC2626] text-sm leading-relaxed">
                      <strong>⚠️ {language === 'fr' ? 'Important :' : 'Important:'}</strong> {language === 'fr'
                        ? 'Nous ne collectons JAMAIS vos clés privées, mots de passe d\'exchanges, ou toute information permettant d\'accéder à vos fonds crypto.'
                        : 'We NEVER collect your private keys, exchange passwords, or any information allowing access to your crypto funds.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Utilisation des données */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#FFA366]/20 rounded-xl">
                    <Eye className="w-6 h-6 text-[#FFA366]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Utilisation des données' : 'Data Usage'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed font-semibold text-[#F9FAFB]">
                    {language === 'fr' ? 'Nous utilisons vos données uniquement pour :' : 'We use your data only to:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Vous authentifier et sécuriser votre compte' : 'Authenticate you and secure your account'}</li>
                    <li>{language === 'fr' ? 'Fournir les fonctionnalités de la plateforme (backtesting, analyse, portfolio)' : 'Provide platform features (backtesting, analysis, portfolio)'}</li>
                    <li>{language === 'fr' ? 'Sauvegarder vos préférences et paramètres personnalisés' : 'Save your preferences and custom settings'}</li>
                    <li>{language === 'fr' ? 'Améliorer nos services et corriger les bugs' : 'Improve our services and fix bugs'}</li>
                    <li>{language === 'fr' ? 'Vous contacter en cas de problème de sécurité ou mise à jour importante' : 'Contact you in case of security issue or important update'}</li>
                    <li>{language === 'fr' ? 'Respecter nos obligations légales' : 'Comply with our legal obligations'}</li>
                  </ul>
                  <div className="p-4 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-xl mt-4">
                    <p className="text-[#6366F1] text-sm leading-relaxed">
                      <strong>✓ {language === 'fr' ? 'Garantie :' : 'Guarantee:'}</strong> {language === 'fr'
                        ? 'Nous n\'utilisons JAMAIS vos données à des fins publicitaires. Nous ne vendons ni ne louons vos informations à des tiers.'
                        : 'We NEVER use your data for advertising purposes. We do not sell or rent your information to third parties.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Stockage et sécurité */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#00FF88]/20 rounded-xl">
                    <Server className="w-6 h-6 text-[#00FF88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Stockage et sécurité' : 'Storage and Security'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-3">
                      {language === 'fr' ? 'Localisation des données' : 'Data Location'}
                    </h3>
                    <p className="leading-relaxed">
                      {language === 'fr'
                        ? 'Vos données sont hébergées sur des serveurs sécurisés Vercel (États-Unis) et Supabase (infrastructure PostgreSQL). Ces hébergeurs sont conformes RGPD et offrent les plus hauts standards de sécurité.'
                        : 'Your data is hosted on secure Vercel (United States) and Supabase (PostgreSQL infrastructure) servers. These hosts are GDPR compliant and offer the highest security standards.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-3">
                      {language === 'fr' ? 'Mesures de sécurité' : 'Security Measures'}
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>{language === 'fr' ? 'Chiffrement SSL/TLS pour toutes les communications' : 'SSL/TLS encryption for all communications'}</li>
                      <li>{language === 'fr' ? 'Mots de passe hachés avec bcrypt (algorithme de hachage sécurisé)' : 'Passwords hashed with bcrypt (secure hashing algorithm)'}</li>
                      <li>{language === 'fr' ? 'Authentification par tokens JWT sécurisés' : 'Authentication via secure JWT tokens'}</li>
                      <li>{language === 'fr' ? 'Protection contre les attaques CSRF et XSS' : 'Protection against CSRF and XSS attacks'}</li>
                      <li>{language === 'fr' ? 'Sauvegardes régulières' : 'Regular backups'}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#F9FAFB] mb-3">
                      {language === 'fr' ? 'Durée de conservation' : 'Retention Period'}
                    </h3>
                    <p className="leading-relaxed">
                      {language === 'fr'
                        ? 'Nous conservons vos données tant que votre compte est actif. Si vous supprimez votre compte, toutes vos données personnelles sont effacées définitivement sous 30 jours, sauf obligation légale de conservation.'
                        : 'We retain your data as long as your account is active. If you delete your account, all your personal data is permanently deleted within 30 days, except for legal retention obligations.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Vos droits RGPD */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <UserCheck className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Vos droits' : 'Your Rights'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Vous disposez des droits suivants concernant vos données personnelles :'
                      : 'You have the following rights regarding your personal data:'}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                        <h4 className="font-semibold text-[#F9FAFB]">
                          {language === 'fr' ? 'Droit d\'accès' : 'Right of Access'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'fr'
                          ? 'Obtenir une copie de toutes vos données personnelles'
                          : 'Obtain a copy of all your personal data'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                        <h4 className="font-semibold text-[#F9FAFB]">
                          {language === 'fr' ? 'Droit de rectification' : 'Right to Rectification'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'fr'
                          ? 'Corriger vos données inexactes ou incomplètes'
                          : 'Correct your inaccurate or incomplete data'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                        <h4 className="font-semibold text-[#F9FAFB]">
                          {language === 'fr' ? 'Droit à l\'effacement' : 'Right to Erasure'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'fr'
                          ? 'Demander la suppression de vos données (droit à l\'oubli)'
                          : 'Request deletion of your data (right to be forgotten)'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                        <h4 className="font-semibold text-[#F9FAFB]">
                          {language === 'fr' ? 'Droit à la portabilité' : 'Right to Portability'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'fr'
                          ? 'Récupérer vos données dans un format exploitable'
                          : 'Retrieve your data in a usable format'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                        <h4 className="font-semibold text-[#F9FAFB]">
                          {language === 'fr' ? 'Droit d\'opposition' : 'Right to Object'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'fr'
                          ? 'S\'opposer au traitement de vos données'
                          : 'Object to the processing of your data'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] rounded-xl border border-gray-700/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-[#00FF88]" />
                        <h4 className="font-semibold text-[#F9FAFB]">
                          {language === 'fr' ? 'Droit de limitation' : 'Right to Restriction'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-400">
                        {language === 'fr'
                          ? 'Limiter le traitement de vos données'
                          : 'Restrict the processing of your data'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-xl mt-4">
                    <p className="text-[#6366F1] text-sm leading-relaxed">
                      <strong>{language === 'fr' ? 'Comment exercer vos droits :' : 'How to exercise your rights:'}</strong> {language === 'fr'
                        ? 'Contactez-nous à cryptium.contact@gmail.com. Nous répondons sous 30 jours maximum.'
                        : 'Contact us at cryptium.contact@gmail.com. We respond within 30 days maximum.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#DC2626]/20 rounded-xl">
                    <FileText className="w-6 h-6 text-[#DC2626]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Cookies et stockage local' : 'Cookies and Local Storage'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Nous utilisons uniquement des cookies essentiels au fonctionnement de la plateforme :'
                      : 'We only use cookies essential to the platform\'s operation:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{language === 'fr' ? 'Cookie de session (authentification)' : 'Session cookie (authentication)'}</li>
                    <li>{language === 'fr' ? 'Préférences utilisateur (langue, thème) stockées en localStorage' : 'User preferences (language, theme) stored in localStorage'}</li>
                    <li>{language === 'fr' ? 'Données de portfolio stockées localement dans votre navigateur' : 'Portfolio data stored locally in your browser'}</li>
                  </ul>
                  <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-xl">
                    <p className="text-[#00FF88] text-sm leading-relaxed">
                      <strong>✓ {language === 'fr' ? 'Transparence :' : 'Transparency:'}</strong> {language === 'fr'
                        ? 'Aucun cookie publicitaire, de tracking ou d\'analyse tierce. Votre navigation reste privée.'
                        : 'No advertising, tracking or third-party analytics cookies. Your browsing remains private.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Modifications */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#FFA366]/20 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-[#FFA366]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Modifications de cette politique' : 'Changes to This Policy'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Nous pouvons mettre à jour cette politique de confidentialité pour refléter les changements dans nos pratiques ou pour des raisons légales. En cas de modification majeure, nous vous informerons par email (si vous avez un compte) et afficherons un avis sur la plateforme.'
                      : 'We may update this privacy policy to reflect changes in our practices or for legal reasons. In case of major changes, we will notify you by email (if you have an account) and display a notice on the platform.'}
                  </p>
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Nous vous encourageons à consulter régulièrement cette page pour rester informé.'
                      : 'We encourage you to regularly review this page to stay informed.'}
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-[#6366F1]/20 rounded-xl">
                    <UserCheck className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#F9FAFB]">
                    {language === 'fr' ? 'Nous contacter' : 'Contact Us'}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    {language === 'fr'
                      ? 'Pour toute question concernant cette politique de confidentialité ou l\'exercice de vos droits :'
                      : 'For any questions regarding this privacy policy or exercising your rights:'}
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#6366F1]/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{language === 'fr' ? 'Email' : 'Email'}</p>
                      <a href="mailto:cryptium.contact@gmail.com" className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium">
                        cryptium.contact@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="p-4 bg-[#FFA366]/10 border border-[#FFA366]/30 rounded-xl mt-6">
                    <p className="text-[#FFA366] text-sm leading-relaxed">
                      <strong>⚖️ {language === 'fr' ? 'Réclamation :' : 'Complaint:'}</strong> {language === 'fr'
                        ? 'Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL (Commission Nationale de l\'Informatique et des Libertés) - www.cnil.fr'
                        : 'If you believe your rights are not being respected, you can file a complaint with CNIL (French Data Protection Authority) - www.cnil.fr'}
                    </p>
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
