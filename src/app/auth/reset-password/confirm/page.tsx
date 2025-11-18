'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

function ResetPasswordConfirmContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

  const { signIn } = useAuth()

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: t('auth.reset_confirm.error.invalid_token') })
    }
  }, [token, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validation
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: t('auth.reset_confirm.error.password_required') })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: t('auth.reset_confirm.error.password_mismatch') })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: t('auth.reset_confirm.error.password_length') })
      setLoading(false)
      return
    }

    if (!token) {
      setMessage({ type: 'error', text: t('auth.reset_confirm.error.invalid_token') })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = t('auth.reset_confirm.error.unexpected')
        if (data.error?.includes('invalid') || data.error?.includes('expired')) {
          errorMessage = t('auth.reset_confirm.error.invalid_token')
        } else if (data.error) {
          errorMessage = data.error
        }

        setMessage({ type: 'error', text: errorMessage })
        setLoading(false)
        return
      }

      // Succès - connecter automatiquement l'utilisateur
      setMessage({ type: 'success', text: t('auth.reset_confirm.success') })

      // Connecter l'utilisateur avec son email et nouveau mot de passe
      if (data.email) {
        await signIn(data.email, password)
      }

      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.message || t('auth.reset_confirm.error.unexpected')
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
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#6366F1]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-[#A855F7]/8 to-transparent rounded-full blur-[100px]"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-md">
          {/* Back to signin */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#F9FAFB] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('auth.reset.back_to_signin')}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-2xl mb-6 shadow-2xl glow-effect">
              <Lock className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
            </div>
            <h1 className="text-4xl font-bold text-[#F9FAFB] mb-4 tracking-tight text-shadow">{t('auth.reset_confirm.title')}</h1>
            <p className="text-gray-400 text-lg font-light">{t('auth.reset_confirm.subtitle')}</p>
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
              {/* New Password */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  {t('auth.reset_confirm.new_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-lg"
                    placeholder="••••••••"
                    disabled={loading || !token}
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
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  {t('auth.reset_confirm.confirm_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all shadow-lg"
                    placeholder="••••••••"
                    disabled={loading || !token}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#5B21B6] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-[#6366F1]/40 hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('auth.reset_confirm.loading')}
                  </>
                ) : (
                  t('auth.reset_confirm.submit')
                )}
              </button>
            </form>
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

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    }>
      <ResetPasswordConfirmContent />
    </Suspense>
  )
}
