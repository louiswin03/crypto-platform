'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRedirectAfterLogin } from '@/hooks/useRedirectAfterLogin'
import { Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { saveCurrentLocationForRedirect } = useRedirectAfterLogin()

  useEffect(() => {
    // Si pas connecté et pas en cours de chargement, sauvegarder la destination
    if (!loading && !user) {
      // Sauvegarder l'URL de destination (seulement si c'est une page protégée)
      saveCurrentLocationForRedirect(pathname)
    }
  }, [user, loading, pathname, saveCurrentLocationForRedirect])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00FF88] mx-auto mb-4" />
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 pattern-dots opacity-30"></div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#00FF88]/10 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-[#A855F7]/8 to-transparent rounded-full blur-[100px]"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative w-full max-w-md">
            <div className="glass-effect rounded-3xl p-8 border border-gray-800/40 text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00FF88] via-[#8B5CF6] to-[#A855F7] rounded-2xl mb-6 shadow-2xl">
                <Lock className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/50 to-[#A855F7]/50 rounded-2xl blur-xl"></div>
              </div>
              
              <h1 className="text-2xl font-bold text-[#F9FAFB] mb-4 tracking-tight">
                Connexion requise
              </h1>
              
              <p className="text-gray-400 mb-8 font-light">
                Cette section nécessite un compte pour accéder aux fonctionnalités de backtest et de gestion de portefeuille.
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/auth/signin"
                  className="w-full bg-gradient-to-r from-[#00FF88] via-[#8B5CF6] to-[#A855F7] hover:from-[#8B5CF6] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-[#00FF88]/40 hover:scale-105 block text-center"
                >
                  Se connecter
                </Link>
                
                <Link
                  href="/auth/signup"
                  className="w-full border-2 border-gray-700 text-[#F9FAFB] font-semibold py-3 px-4 rounded-xl hover:border-[#00FF88] hover:bg-[#00FF88]/10 transition-all duration-300 block text-center"
                >
                  Créer un compte
                </Link>
                
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#00FF88] transition-colors text-sm block mt-6"
                >
                  ← Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Add styles */}
        <style jsx global>{`
          .glass-effect {
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .pattern-dots {
            background-image: radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
            background-size: 20px 20px;
          }
        `}</style>
      </div>
    )
  }

  return <>{children}</>
}