// hooks/useRedirectAfterLogin.ts
'use client'

import { useRouter } from 'next/navigation'

export const useRedirectAfterLogin = () => {
  const router = useRouter()

  const handleRedirectAfterLogin = () => {
    if (typeof window !== 'undefined') {
      // Récupérer l'URL de destination sauvegardée
      const redirectTo = localStorage.getItem('redirectAfterLogin')

      // Vérifier que ce n'est pas une page d'auth
      if (redirectTo && !redirectTo.includes('/auth/')) {
        // Nettoyer le localStorage
        localStorage.removeItem('redirectAfterLogin')
        // Rediriger vers la page d'origine avec window.location pour forcer le rechargement
        window.location.href = redirectTo
      } else {
        // Si pas de redirection valide, aller à l'accueil
        localStorage.removeItem('redirectAfterLogin')
        window.location.href = '/'
      }
    } else {
      // Fallback si pas de localStorage
      window.location.href = '/'
    }
  }

  const saveCurrentLocationForRedirect = (path: string) => {
    // Sauvegarder toutes les pages sauf les pages d'auth
    if (typeof window !== 'undefined' && !path.includes('/auth/')) {
      localStorage.setItem('redirectAfterLogin', path)
    }
  }

  const clearRedirectPath = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redirectAfterLogin')
    }
  }

  return {
    handleRedirectAfterLogin,
    saveCurrentLocationForRedirect,
    clearRedirectPath
  }
}