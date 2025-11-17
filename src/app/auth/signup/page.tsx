'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin'
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SignUpPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const { signUp } = useAuth()
  const router = useRouter()
  const { handleRedirectAfterLogin } = useRedirectAfterLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validation
    if (!email || !password || !confirmPassword) {
      setMessage({ type: 'error', text: t('auth.signup.error.fill_fields') })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: t('auth.signup.error.password_mismatch') })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: t('auth.signup.error.password_length') })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password)

      if (error) {
        // Gérer différents types d'erreurs Supabase
        let errorMessage = t('auth.signin.error.unexpected')
        const errorMsg = typeof error === 'string' ? error : (error?.message || '')

        // Vérifier si l'email existe déjà
        if (errorMsg.includes('already') ||
            errorMsg.includes('exists') ||
            errorMsg.includes('registered') ||
            errorMsg.includes('déjà')) {
          errorMessage = t('auth.signup.error.email_exists')
        } else if (errorMsg.includes('email') || errorMsg.includes('Email')) {
          errorMessage = errorMsg
        } else if (errorMsg) {
          errorMessage = errorMsg
        }

        setMessage({ type: 'error', text: errorMessage })
        setLoading(false)
        return
      }

      if (data?.user) {
        setMessage({
          type: 'success',
          text: t('auth.signup.success')
        })
        // Attendre un peu puis utiliser la redirection intelligente
        setTimeout(() => {
          handleRedirectAfterLogin()
        }, 2000)
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || t('auth.signin.error.unexpected')
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pattern-dots opacity-30"></div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#00FF88]/10 via-[#00D9FF]/6 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-[#FFA366]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px]"></div>
      </div>
      
      <div className="flex items-center justify-center min-h-screen p-4">

        <div className="relative w-full max-w-md">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#F9FAFB] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.back_home')}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00FF88] via-[#8B5CF6] to-[#A855F7] rounded-2xl mb-6 shadow-2xl glow-effect">
              <User className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
            </div>
            <h1 className="text-4xl font-bold text-[#F9FAFB] mb-4 tracking-tight text-shadow">{t('auth.signup.title')}</h1>
            <p className="text-gray-400 text-lg font-light">{t('auth.signup.subtitle')}</p>
          </div>

          {/* Form Card */}
          <div className="glass-effect rounded-3xl p-8 border border-gray-800/40 glow-effect">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
              'bg-green-500/20 border border-green-500/30 text-green-300'
            }`}>
              {message.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t('auth.signin.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF88] focus:ring-2 focus:ring-[#00FF88]/20 transition-all shadow-lg"
                  placeholder={t('auth.signin.email_placeholder')}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t('auth.signin.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF88] focus:ring-2 focus:ring-[#00FF88]/20 transition-all shadow-lg"
                  placeholder={t('auth.signin.password_placeholder')}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t('auth.signup.password_hint')}</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {t('auth.signup.confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF88] focus:ring-2 focus:ring-[#00FF88]/20 transition-all shadow-lg"
                  placeholder={t('auth.signin.password_placeholder')}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Terms acceptance */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-[#00FF88] border-gray-600 rounded focus:ring-[#00FF88] bg-gray-700"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                {t('auth.signup.terms1')}{' '}
                <Link href="#" className="text-[#00FF88] hover:text-[#8B5CF6] transition-colors">
                  {t('auth.signup.terms2')}
                </Link>{' '}
                {t('auth.signup.terms3')}{' '}
                <Link href="#" className="text-[#00FF88] hover:text-[#8B5CF6] transition-colors">
                  {t('auth.signup.terms4')}
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00FF88] via-[#8B5CF6] to-[#A855F7] hover:from-[#8B5CF6] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-[#00FF88]/40 hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.signup.loading')}
                </>
              ) : (
                t('auth.signup.submit')
              )}
            </button>
          </form>

          {/* Switch to signin */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t('auth.signup.have_account')}
              {' '}
              <Link
                href="/auth/signin"
                className="text-[#00FF88] hover:text-[#8B5CF6] font-semibold ml-1 transition-colors"
              >
                {t('auth.signup.signin')}
              </Link>
            </p>
          </div>
        </div>

          {/* Features preview */}
          <div className="mt-8">
            <div className="glass-effect rounded-2xl border border-gray-800/30 p-6">
              <h4 className="text-[#F9FAFB] font-bold mb-4 tracking-tight">{t('auth.signup.features.title')}</h4>
              <ul className="text-gray-400 space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00FF88] flex-shrink-0" />
                  <span className="font-medium">{t('auth.signup.features.sync')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00FF88] flex-shrink-0" />
                  <span className="font-medium">{t('auth.signup.features.backtest')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00FF88] flex-shrink-0" />
                  <span className="font-medium">{t('auth.signup.features.analysis')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add styles */}
      <style jsx global>{`
        .text-shadow {
          text-shadow: 0 2px 20px rgba(99, 102, 241, 0.15);
        }
        
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glow-effect {
          box-shadow: 0 0 50px rgba(99, 102, 241, 0.15);
        }
        
        .pattern-dots {
          background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  )
}