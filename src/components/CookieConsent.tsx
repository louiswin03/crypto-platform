"use client"

import { useState, useEffect } from 'react'
import { X, Cookie, Settings } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  hasConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  getConsent,
  saveConsent,
  type CookiePreferences
} from '@/lib/cookieConsent'

export default function CookieConsent() {
  const { language } = useLanguage()
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now()
  })

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const hasGivenConsent = hasConsent()

    if (!hasGivenConsent) {
      // Attendre 1 seconde avant d'afficher le banner
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Charger les préférences existantes
      const existingConsent = getConsent()
      if (existingConsent) {
        setPreferences(existingConsent)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies()
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleRejectOptional = () => {
    rejectOptionalCookies()
    setShowBanner(false)
    setShowSettings(false)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return // Ne peut pas désactiver les cookies nécessaires

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!showBanner) return null

  const content = {
    fr: {
      title: 'Nous utilisons des cookies',
      description: 'Nous utilisons des cookies essentiels pour le fonctionnement du site et optionnels pour améliorer votre expérience.',
      acceptAll: 'Tout accepter',
      rejectOptional: 'Refuser les optionnels',
      customize: 'Personnaliser',
      savePreferences: 'Enregistrer mes choix',
      necessary: 'Cookies nécessaires',
      necessaryDesc: 'Requis pour le fonctionnement du site (authentification JWT, sécurité CSRF)',
      functional: 'Cookies fonctionnels',
      functionalDesc: 'Préférences d\'affichage uniquement (langue, thème, mode de vue)',
      analytics: 'Cookies analytiques',
      analyticsDesc: 'Nous aider à comprendre comment vous utilisez le site (non utilisé actuellement)',
      marketing: 'Cookies marketing',
      marketingDesc: 'Publicités personnalisées (non utilisé)',
      learnMore: 'En savoir plus',
      privacyPolicy: 'Politique de confidentialité'
    },
    en: {
      title: 'We use cookies',
      description: 'We use essential cookies for site functionality and optional cookies to improve your experience.',
      acceptAll: 'Accept all',
      rejectOptional: 'Reject optional',
      customize: 'Customize',
      savePreferences: 'Save my choices',
      necessary: 'Necessary cookies',
      necessaryDesc: 'Required for site functionality (JWT authentication, CSRF security)',
      functional: 'Functional cookies',
      functionalDesc: 'Display preferences only (language, theme, view mode)',
      analytics: 'Analytics cookies',
      analyticsDesc: 'Help us understand how you use the site (not currently used)',
      marketing: 'Marketing cookies',
      marketingDesc: 'Personalized advertising (not used)',
      learnMore: 'Learn more',
      privacyPolicy: 'Privacy Policy'
    }
  }

  const t = content[language]

  return (
    <>
      {/* Backdrop flou */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />

      {/* Banner principal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
        <div className="max-w-6xl mx-auto glass-effect-strong rounded-2xl border border-gray-700/50 shadow-2xl">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#2563EB]/20 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                  <Cookie className="w-6 h-6 text-[#2563EB]" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">{t.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{t.description}</p>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 hover:border-[#2563EB]/40 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {t.acceptAll}
                  </button>
                  <button
                    onClick={handleRejectOptional}
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all hover:scale-105 hover:shadow-lg"
                  >
                    {t.rejectOptional}
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="px-6 py-2.5 bg-transparent border border-gray-600 hover:border-[#2563EB] hover:bg-[#2563EB]/10 text-gray-300 hover:text-white rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    {t.customize}
                  </button>
                </div>

                <a
                  href="/politique-confidentialite"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-[#2563EB] hover:text-[#8B5CF6] transition-all hover:gap-2"
                >
                  <span>{t.privacyPolicy}</span>
                  <span className="transition-transform">→</span>
                </a>
              </div>
            </div>

            {/* Paramètres détaillés */}
            {showSettings && (
              <div className="mt-6 pt-6 border-t border-gray-700/50 space-y-4">
                {/* Cookies nécessaires */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#F9FAFB]">{t.necessary}</h4>
                      <span className="px-2 py-0.5 bg-[#2563EB]/20 text-[#2563EB] text-xs rounded-md font-medium">
                        {language === 'fr' ? 'Requis' : 'Required'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{t.necessaryDesc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-6 bg-[#2563EB] rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-75">
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Cookies fonctionnels */}
                <div className="flex items-start justify-between gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#F9FAFB] mb-1">{t.functional}</h4>
                    <p className="text-sm text-gray-400">{t.functionalDesc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => togglePreference('functional')}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-all hover:scale-110 ${
                        preferences.functional ? 'bg-[#2563EB] hover:bg-[#5558E3] justify-end' : 'bg-gray-600 hover:bg-gray-500 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                    </button>
                  </div>
                </div>

                {/* Bouton sauvegarder */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2.5 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 hover:border-[#2563EB]/40 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {t.savePreferences}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
