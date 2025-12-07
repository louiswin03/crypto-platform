"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft, HelpCircle, BookOpen, TrendingUp, Wallet, Activity, Search, MessageCircle, Settings, Shield } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AidePage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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

  const faqItems = [
    {
      category: language === 'fr' ? 'Démarrage' : 'Getting Started',
      icon: BookOpen,
      color: '#6366F1',
      questions: [
        {
          q: language === 'fr' ? 'Comment créer un compte ?' : 'How to create an account?',
          a: language === 'fr'
            ? 'Cliquez sur "S\'inscrire" en haut à droite, entrez votre email et créez un mot de passe sécurisé.'
            : 'Click on "Sign Up" at the top right, enter your email and create a secure password.'
        },
        {
          q: language === 'fr' ? 'Comment ajouter mes premières cryptos ?' : 'How to add my first cryptos?',
          a: language === 'fr'
            ? 'Allez dans "Portefeuille", cliquez sur "Ajouter", recherchez la crypto et entrez la quantité et le prix d\'achat.'
            : 'Go to "Portfolio", click "Add", search for the crypto and enter the quantity and purchase price.'
        },
        {
          q: language === 'fr' ? 'Est-ce que mes données sont sécurisées ?' : 'Is my data secure?',
          a: language === 'fr'
            ? 'Oui, vos données sont chiffrées avec SSL/TLS et vos mots de passe sont hashés avec bcrypt. Vos données de portfolio sont stockées localement dans votre navigateur.'
            : 'Yes, your data is encrypted with SSL/TLS and your passwords are hashed with bcrypt. Your portfolio data is stored locally in your browser.'
        },
        {
          q: language === 'fr' ? 'Comment changer la langue de l\'interface ?' : 'How to change the interface language?',
          a: language === 'fr'
            ? 'Cliquez sur l\'icône de langue dans la barre de navigation en haut. Vous pouvez basculer entre français et anglais.'
            : 'Click on the language icon in the top navigation bar. You can switch between French and English.'
        }
      ]
    },
    {
      category: language === 'fr' ? 'Backtesting' : 'Backtesting',
      icon: Activity,
      color: '#8B5CF6',
      questions: [
        {
          q: language === 'fr' ? 'Qu\'est-ce que le backtesting ?' : 'What is backtesting?',
          a: language === 'fr'
            ? 'Le backtesting permet de tester une stratégie de trading sur des données historiques pour évaluer sa performance.'
            : 'Backtesting allows you to test a trading strategy on historical data to evaluate its performance.'
        },
        {
          q: language === 'fr' ? 'Comment créer une stratégie ?' : 'How to create a strategy?',
          a: language === 'fr'
            ? 'Allez dans "Backtest", sélectionnez les indicateurs techniques (RSI, MACD, etc.) et configurez vos conditions d\'entrée/sortie.'
            : 'Go to "Backtest", select technical indicators (RSI, MACD, etc.) and configure your entry/exit conditions.'
        },
        {
          q: language === 'fr' ? 'Quels indicateurs sont disponibles ?' : 'What indicators are available?',
          a: language === 'fr'
            ? 'RSI, MACD, Moyennes Mobiles (SMA/EMA), Bandes de Bollinger, Stochastique, et plus encore.'
            : 'RSI, MACD, Moving Averages (SMA/EMA), Bollinger Bands, Stochastic, and more.'
        }
      ]
    },
    {
      category: language === 'fr' ? 'Portefeuille' : 'Portfolio',
      icon: Wallet,
      color: '#F59E0B',
      questions: [
        {
          q: language === 'fr' ? 'Comment suivre mes gains/pertes ?' : 'How to track my gains/losses?',
          a: language === 'fr'
            ? 'Votre portefeuille calcule automatiquement votre P&L en temps réel basé sur les prix actuels du marché.'
            : 'Your portfolio automatically calculates your P&L in real-time based on current market prices.'
        },
        {
          q: language === 'fr' ? 'Puis-je ajouter plusieurs transactions ?' : 'Can I add multiple transactions?',
          a: language === 'fr'
            ? 'Oui, vous pouvez ajouter autant de transactions que vous voulez pour chaque crypto, avec des prix différents.'
            : 'Yes, you can add as many transactions as you want for each crypto, with different prices.'
        },
        {
          q: language === 'fr' ? 'Comment gérer mes watchlists ?' : 'How to manage my watchlists?',
          a: language === 'fr'
            ? 'Allez dans "Cryptomonnaies", créez une liste de suivi et ajoutez-y vos cryptos favorites pour un suivi personnalisé.'
            : 'Go to "Cryptocurrencies", create a watchlist and add your favorite cryptos for personalized tracking.'
        }
      ]
    },
    {
      category: language === 'fr' ? 'Graphiques' : 'Charts',
      icon: TrendingUp,
      color: '#2563EB',
      questions: [
        {
          q: language === 'fr' ? 'Comment lire les graphiques ?' : 'How to read the charts?',
          a: language === 'fr'
            ? 'Les graphiques en chandeliers montrent l\'ouverture, la fermeture, le plus haut et le plus bas pour chaque période.'
            : 'Candlestick charts show the open, close, high and low for each period.'
        },
        {
          q: language === 'fr' ? 'Puis-je personnaliser les graphiques ?' : 'Can I customize the charts?',
          a: language === 'fr'
            ? 'Oui, vous pouvez changer les intervalles de temps, ajouter des indicateurs, et zoomer sur des périodes spécifiques.'
            : 'Yes, you can change time intervals, add indicators, and zoom in on specific periods.'
        },
        {
          q: language === 'fr' ? 'D\'où viennent les données de prix ?' : 'Where does the price data come from?',
          a: language === 'fr'
            ? 'Les données proviennent de CoinGecko et des exchanges majeurs (Binance, Coinbase, Kraken) pour garantir précision et fiabilité.'
            : 'Data comes from CoinGecko and major exchanges (Binance, Coinbase, Kraken) to ensure accuracy and reliability.'
        }
      ]
    },
    {
      category: language === 'fr' ? 'Compte & Paramètres' : 'Account & Settings',
      icon: Settings,
      color: '#DC2626',
      questions: [
        {
          q: language === 'fr' ? 'Comment réinitialiser mon mot de passe ?' : 'How to reset my password?',
          a: language === 'fr'
            ? 'Sur la page de connexion, cliquez sur "Mot de passe oublié", entrez votre email et suivez les instructions reçues par email.'
            : 'On the login page, click "Forgot password", enter your email and follow the instructions received by email.'
        },
        {
          q: language === 'fr' ? 'Comment supprimer mon compte ?' : 'How to delete my account?',
          a: language === 'fr'
            ? 'Contactez-nous via la page Contact pour demander la suppression de votre compte. Vos données seront effacées sous 30 jours.'
            : 'Contact us via the Contact page to request deletion of your account. Your data will be deleted within 30 days.'
        },
        {
          q: language === 'fr' ? 'Puis-je exporter mes données ?' : 'Can I export my data?',
          a: language === 'fr'
            ? 'Oui, vous pouvez exporter vos transactions de portfolio et vos stratégies de backtesting au format CSV.'
            : 'Yes, you can export your portfolio transactions and backtesting strategies in CSV format.'
        }
      ]
    },
    {
      category: language === 'fr' ? 'Sécurité' : 'Security',
      icon: Shield,
      color: '#22C55E',
      questions: [
        {
          q: language === 'fr' ? 'Avez-vous accès à mes cryptomonnaies ?' : 'Do you have access to my cryptocurrencies?',
          a: language === 'fr'
            ? 'Non, Cryptium est uniquement un outil d\'analyse. Nous n\'avons jamais accès à vos fonds, clés privées ou comptes d\'exchange.'
            : 'No, Cryptium is only an analysis tool. We never have access to your funds, private keys or exchange accounts.'
        },
        {
          q: language === 'fr' ? 'Où sont stockées mes données de portfolio ?' : 'Where is my portfolio data stored?',
          a: language === 'fr'
            ? 'Vos données de portfolio sont stockées localement dans votre navigateur (localStorage). Seules vos préférences et watchlists sont synchronisées sur nos serveurs.'
            : 'Your portfolio data is stored locally in your browser (localStorage). Only your preferences and watchlists are synced to our servers.'
        },
        {
          q: language === 'fr' ? 'Utilisez-vous des cookies ?' : 'Do you use cookies?',
          a: language === 'fr'
            ? 'Nous utilisons uniquement des cookies essentiels pour l\'authentification et vos préférences. Aucun cookie publicitaire ou de tracking.'
            : 'We only use essential cookies for authentication and your preferences. No advertising or tracking cookies.'
        }
      ]
    }
  ]

  const filteredFAQ = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(item =>
      searchQuery === '' ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
          <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-12 pb-20">
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
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  {language === 'fr' ? 'Centre d\'aide' : 'Help Center'}
                </span>
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                {language === 'fr'
                  ? 'Trouvez rapidement des réponses à vos questions'
                  : 'Quickly find answers to your questions'}
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'fr' ? 'Rechercher dans l\'aide...' : 'Search help...'}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-8">
              {filteredFAQ.length === 0 ? (
                <div className="glass-effect-strong rounded-2xl p-12 border border-gray-700/50 text-center">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {language === 'fr'
                      ? 'Aucun résultat trouvé. Essayez avec d\'autres mots-clés.'
                      : 'No results found. Try different keywords.'}
                  </p>
                </div>
              ) : (
                filteredFAQ.map((category, catIndex) => (
                  <div key={catIndex} className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 rounded-xl" style={{ backgroundColor: `${category.color}20` }}>
                        <category.icon className="w-6 h-6" style={{ color: category.color }} />
                      </div>
                      <h2 className="text-2xl font-bold text-[#F9FAFB]">{category.category}</h2>
                    </div>

                    <div className="space-y-6">
                      {category.questions.map((item, qIndex) => (
                        <div key={qIndex} className="border-l-2 pl-6 py-2" style={{ borderColor: category.color }}>
                          <h3 className="font-semibold text-[#F9FAFB] mb-2 text-lg">
                            {item.q}
                          </h3>
                          <p className="text-gray-400 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Contact Support */}
            <div className="mt-16 glass-effect-strong rounded-2xl p-8 border border-gray-700/50 text-center">
              <MessageCircle className="w-12 h-12 text-[#6366F1] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#F9FAFB] mb-2">
                {language === 'fr' ? 'Vous ne trouvez pas votre réponse ?' : 'Can\'t find your answer?'}
              </h3>
              <p className="text-gray-400 mb-6">
                {language === 'fr'
                  ? 'Notre équipe de support est là pour vous aider'
                  : 'Our support team is here to help'}
              </p>
              <Link
                href="/contact"
                onClick={() => {
                  const legalPages = ['/mentions-legales', '/politique-confidentialite', '/conditions-utilisation', '/contact', '/aide']
                  const currentPath = '/aide'
                  const isCurrentPageLegal = legalPages.some(page => currentPath.includes(page))
                  if (!isCurrentPageLegal) {
                    sessionStorage.setItem('legalPagesOrigin', currentPath)
                  }
                }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{language === 'fr' ? 'Contacter le support' : 'Contact support'}</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
