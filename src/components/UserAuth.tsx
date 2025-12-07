"use client"

import React, { useState } from 'react'
import { User, LogIn, UserPlus, LogOut, Settings } from 'lucide-react'
import { AuthService, User as UserType } from '@/services/authService'

interface UserAuthProps {
  currentUser: UserType | null
  onUserChange: (user: UserType | null) => void
}

export default function UserAuth({ currentUser, onUserChange }: UserAuthProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (username.trim() === '') {
      setError('Nom d\'utilisateur requis')
      return
    }

    const user = AuthService.loginUser(username.trim())
    if (user) {
      setShowAuthModal(false)
      setUsername('')
      setError('')
    } else {
      setError('Utilisateur non trouvé')
    }
  }

  const handleRegister = () => {
    if (username.trim() === '') {
      setError('Nom d\'utilisateur requis')
      return
    }

    try {
      const user = AuthService.createUser(username.trim(), email.trim() || undefined)
      setShowAuthModal(false)
      setUsername('')
      setEmail('')
      setError('')
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
  }

  const resetForm = () => {
    setUsername('')
    setEmail('')
    setError('')
  }

  return (
    <>
      {/* Bouton d'état utilisateur */}
      {currentUser ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
            <User className="w-4 h-4 text-green-400" />
            <span className="text-[#F9FAFB] font-medium">{currentUser.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 border border-red-600/50 text-red-400 px-3 py-2 rounded-lg font-medium transition-colors hover:bg-red-600/30"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 bg-blue-600/20 border border-blue-600/50 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-600/30"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
        </button>
      )}

      {/* Modal d'authentification */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[#F9FAFB] mb-4">
              {authMode === 'login' ? 'Se connecter' : 'Créer un compte'}
            </h3>

            {error && (
              <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Votre nom d'utilisateur"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    placeholder="votre@email.com"
                  />
                </div>
              )}

              {authMode === 'login' && (
                <p className="text-sm text-gray-400">
                  Les données sont stockées localement dans votre navigateur pour chaque compte.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAuthModal(false)
                  resetForm()
                }}
                className="flex-1 bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                disabled={username.trim() === ''}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authMode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4 inline mr-2" />
                    Se connecter
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 inline mr-2" />
                    Créer le compte
                  </>
                )}
              </button>
            </div>

            {/* Bouton pour basculer entre login/register */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  resetForm()
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {authMode === 'login'
                  ? "Pas encore de compte ? Créer un compte"
                  : "Déjà un compte ? Se connecter"
                }
              </button>
            </div>

            {/* Liste des utilisateurs existants pour faciliter les tests */}
            {authMode === 'login' && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 mb-2">Utilisateurs existants :</p>
                <div className="flex flex-wrap gap-1">
                  {AuthService.getAllUsers().map(user => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setUsername(user.username)
                        setError('')
                      }}
                      className="text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-2 py-1 rounded border border-gray-600/50 transition-colors"
                    >
                      {user.username}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}