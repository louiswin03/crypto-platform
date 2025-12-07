"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, Send, User, Phone, MapPin } from 'lucide-react'
import SmartNavigation from '@/components/SmartNavigation'
import Footer from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'

export default function ContactPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(false)

    try {
      // Configuration EmailJS
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      console.log('🔧 EmailJS Config:', {
        serviceId: serviceId ? '✅ Configuré' : '❌ Manquant',
        templateId: templateId ? '✅ Configuré' : '❌ Manquant',
        publicKey: publicKey ? '✅ Configuré' : '❌ Manquant'
      })

      // Vérifier que les clés sont configurées
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS not configured - check your .env.local file')
      }

      console.log('📧 Envoi de l\'email...')

      // Envoyer l'email via EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        publicKey
      )

      console.log('✅ Email envoyé avec succès!', response)

      setSubmitSuccess(true)

      // Reset form après 3 secondes
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' })
        setSubmitSuccess(false)
      }, 3000)
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', {
        message: error?.message || 'Unknown error',
        text: error?.text || 'No text',
        status: error?.status || 'No status',
        error: error
      })
      setSubmitError(true)
      setTimeout(() => setSubmitError(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
          <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 pb-20">
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
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-[#F9FAFB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  {language === 'fr' ? 'Contactez-nous' : 'Contact Us'}
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                {language === 'fr'
                  ? 'Une question ? Une suggestion ? Notre équipe est à votre écoute'
                  : 'A question? A suggestion? Our team is here to help'}
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">
                    {language === 'fr' ? 'Informations de contact' : 'Contact Information'}
                  </h2>

                  <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-[#6366F1]/20 rounded-xl">
                        <Mail className="w-6 h-6 text-[#6366F1]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F9FAFB] mb-1">Email</h3>
                        <a href="mailto:cryptium.contact@gmail.com" className="text-gray-400 hover:text-[#6366F1] transition-colors">
                          cryptium.contact@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Localisation */}
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-[#8B5CF6]/20 rounded-xl">
                        <MapPin className="w-6 h-6 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F9FAFB] mb-1">
                          {language === 'fr' ? 'Localisation' : 'Location'}
                        </h3>
                        <p className="text-gray-400">Paris, France</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info supplémentaire */}
                <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">
                    {language === 'fr' ? 'Temps de réponse' : 'Response Time'}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {language === 'fr'
                      ? 'Notre équipe s\'engage à répondre à toutes les demandes dans un délai de 24 à 48 heures ouvrées.'
                      : 'Our team is committed to responding to all requests within 24 to 48 business hours.'}
                  </p>
                </div>

                {/* FAQ */}
                <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                  <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">
                    {language === 'fr' ? 'Questions fréquentes' : 'FAQ'}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    {language === 'fr'
                      ? 'Avant de nous contacter, consultez notre centre d\'aide. Vous y trouverez peut-être rapidement la réponse à votre question.'
                      : 'Before contacting us, check our help center. You might find the answer to your question quickly.'}
                  </p>
                  <Link
                    href="/aide"
                    onClick={() => {
                      const legalPages = ['/mentions-legales', '/politique-confidentialite', '/conditions-utilisation', '/contact', '/aide']
                      const currentPath = '/contact'
                      const isCurrentPageLegal = legalPages.some(page => currentPath.includes(page))
                      if (!isCurrentPageLegal) {
                        sessionStorage.setItem('legalPagesOrigin', currentPath)
                      }
                    }}
                    className="text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-semibold"
                  >
                    {language === 'fr' ? 'Accéder au centre d\'aide →' : 'Access help center →'}
                  </Link>
                </div>
              </div>

              {/* Contact Form */}
              <div className="glass-effect-strong rounded-2xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-[#F9FAFB] mb-6">
                  {language === 'fr' ? 'Envoyez-nous un message' : 'Send us a message'}
                </h2>

                {submitSuccess ? (
                  <div className="p-6 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-xl text-center">
                    <div className="w-16 h-16 bg-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#2563EB] mb-2">
                      {language === 'fr' ? 'Message envoyé !' : 'Message sent!'}
                    </h3>
                    <p className="text-gray-300">
                      {language === 'fr'
                        ? 'Nous vous répondrons dans les plus brefs délais.'
                        : 'We will respond to you as soon as possible.'}
                    </p>
                  </div>
                ) : submitError ? (
                  <div className="p-6 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-xl text-center">
                    <h3 className="text-xl font-bold text-[#DC2626] mb-2">
                      {language === 'fr' ? 'Erreur d\'envoi' : 'Sending error'}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {language === 'fr'
                        ? 'Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.'
                        : 'An error occurred. Please try again or contact us directly by email.'}
                    </p>
                    <button
                      onClick={() => setSubmitError(false)}
                      className="text-[#6366F1] hover:text-[#8B5CF6] font-semibold"
                    >
                      {language === 'fr' ? 'Réessayer' : 'Try again'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom */}
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">
                        {language === 'fr' ? 'Nom complet' : 'Full name'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors"
                          placeholder={language === 'fr' ? 'Jean Dupont' : 'John Doe'}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors"
                          placeholder="exemple@email.com"
                        />
                      </div>
                    </div>

                    {/* Sujet */}
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">
                        {language === 'fr' ? 'Sujet' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors"
                        placeholder={language === 'fr' ? 'De quoi souhaitez-vous parler ?' : 'What would you like to discuss?'}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-gray-300 mb-2 font-medium">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:border-[#6366F1] transition-colors resize-none"
                        placeholder={language === 'fr' ? 'Décrivez votre demande en détail...' : 'Describe your request in detail...'}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{language === 'fr' ? 'Envoi en cours...' : 'Sending...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{language === 'fr' ? 'Envoyer le message' : 'Send message'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
