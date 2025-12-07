'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, FileText, Clock, CheckCircle, AlertCircle, HelpCircle, Search } from 'lucide-react'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqCategories = [
    { id: 'all', label: 'Toutes' },
    { id: 'account', label: 'Compte' },
    { id: 'backtest', label: 'Backtest' },
    { id: 'portfolio', label: 'Portefeuille' },
    { id: 'technical', label: 'Technique' },
  ]

  const faqs = [
    {
      category: 'account',
      question: 'Comment créer un compte ?',
      answer: 'Cliquez sur "Se connecter" en haut à droite, puis sur "Créer un compte". Remplissez le formulaire avec votre email et un mot de passe sécurisé.'
    },
    {
      category: 'account',
      question: 'J\'ai oublié mon mot de passe',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Vous recevrez un email avec un lien pour réinitialiser votre mot de passe.'
    },
    {
      category: 'backtest',
      question: 'Comment lancer mon premier backtest ?',
      answer: 'Allez sur la page Backtest, sélectionnez une cryptomonnaie, définissez vos paramètres (stratégie, période, capital initial), puis cliquez sur "Lancer le backtest".'
    },
    {
      category: 'backtest',
      question: 'Quelle est la période maximale pour un backtest ?',
      answer: 'Vous pouvez effectuer des backtests sur une période allant jusqu\'à 5 ans en fonction des données disponibles pour chaque cryptomonnaie.'
    },
    {
      category: 'portfolio',
      question: 'Comment suivre mon portefeuille en temps réel ?',
      answer: 'Connectez vos comptes d\'échange (Binance, Coinbase, Kraken) via la page Portefeuille. Vos soldes seront synchronisés automatiquement.'
    },
    {
      category: 'portfolio',
      question: 'Mes clés API sont-elles sécurisées ?',
      answer: 'Oui, toutes les clés API sont chiffrées avec AES-256 avant stockage. Nous utilisons uniquement des permissions de lecture, jamais de trading.'
    },
    {
      category: 'technical',
      question: 'Quelles sont les sources de données utilisées ?',
      answer: 'Nous utilisons CoinGecko pour les données de prix en temps réel et les données historiques, garantissant fiabilité et précision.'
    },
    {
      category: 'technical',
      question: 'La plateforme est-elle accessible sur mobile ?',
      answer: 'Oui, CryptoBacktest est entièrement responsive et fonctionne sur tous les appareils (ordinateur, tablette, smartphone).'
    },
  ]

  const filteredFaqs = faqs.filter(faq =>
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB]">
      {/* Header */}
      <div className="border-b border-gray-800/40 glass-effect-strong sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#F9FAFB] transition-colors duration-300 group mb-6">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Retour à l'accueil</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-[#F9FAFB] mb-4">
            Support Technique
          </h1>
          <p className="text-gray-400 text-lg">
            Nous sommes là pour vous aider. Trouvez des réponses à vos questions ou contactez notre équipe.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Link href="/contact" className="glass-effect rounded-2xl p-8 hover:border-[#6366F1]/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#F9FAFB] mb-3">Contactez-nous</h3>
            <p className="text-gray-400 mb-4">
              Envoyez-nous un message et nous vous répondrons dans les 24h.
            </p>
            <div className="flex items-center text-[#6366F1] font-medium">
              <Clock className="w-4 h-4 mr-2" />
              <span>Réponse sous 24h</span>
            </div>
          </Link>

          <div className="glass-effect rounded-2xl p-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#15803D] rounded-xl flex items-center justify-center mb-6">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#F9FAFB] mb-3">Chat en direct</h3>
            <p className="text-gray-400 mb-4">
              Discutez avec notre équipe en temps réel pendant les heures d'ouverture.
            </p>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>Lun-Ven 9h-18h</span>
            </div>
          </div>

          <Link href="/aide" className="glass-effect rounded-2xl p-8 hover:border-[#6366F1]/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#F9FAFB] mb-3">Centre d'aide</h3>
            <p className="text-gray-400 mb-4">
              Consultez nos guides et tutoriels détaillés.
            </p>
            <div className="flex items-center text-[#F59E0B] font-medium">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Documentation complète</span>
            </div>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="glass-effect rounded-2xl p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <HelpCircle className="w-8 h-8 text-[#6366F1]" />
            <h2 className="text-3xl font-bold text-[#F9FAFB]">Questions Fréquentes</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#6366F1] transition-colors duration-300"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden hover:border-[#6366F1]/50 transition-all duration-300"
                >
                  <summary className="cursor-pointer p-6 flex items-center justify-between">
                    <span className="text-[#F9FAFB] font-medium text-lg pr-4">{faq.question}</span>
                    <AlertCircle className="w-5 h-5 text-[#6366F1] group-open:rotate-180 transition-transform duration-300 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-gray-700/50 pt-4">
                    {faq.answer}
                  </div>
                </details>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune question ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-12 glass-effect rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#F9FAFB] mb-2">État des services</h3>
              <p className="text-gray-400">Tous les systèmes fonctionnent normalement</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-[#2563EB] rounded-full animate-pulse"></div>
              <span className="text-[#2563EB] font-semibold text-lg">OPÉRATIONNEL</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">API</span>
                <CheckCircle className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="text-[#F9FAFB] font-semibold">100% uptime</div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Base de données</span>
                <CheckCircle className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="text-[#F9FAFB] font-semibold">100% uptime</div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Authentification</span>
                <CheckCircle className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="text-[#F9FAFB] font-semibold">100% uptime</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
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

        details summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </div>
  )
}
