"use client"

import React, { useState, useEffect } from 'react'
import { AuthService } from '@/services/authService'

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  const updateDebugInfo = () => {
    const currentUser = AuthService.getCurrentUser()
    const allUsers = AuthService.getAllUsers()
    const isLoggedIn = AuthService.isLoggedIn()

    // Vérifier localStorage directement
    const rawCurrentUser = localStorage.getItem('crypto_platform_current_user')
    const rawUsers = localStorage.getItem('crypto_platform_users')

    setDebugInfo({
      currentUser,
      allUsers,
      isLoggedIn,
      rawCurrentUser: rawCurrentUser ? JSON.parse(rawCurrentUser) : null,
      rawUsers: rawUsers ? JSON.parse(rawUsers) : [],
      localStorageKeys: Object.keys(localStorage).filter(key => key.startsWith('crypto_platform'))
    })
  }

  useEffect(() => {
    updateDebugInfo()

    const handleUserChange = () => {
      updateDebugInfo()
    }

    window.addEventListener('user-auth-changed', handleUserChange)

    return () => {
      window.removeEventListener('user-auth-changed', handleUserChange)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 border border-gray-700 rounded-lg p-4 max-w-md text-xs z-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-yellow-400">🐛 Auth Debug</h4>
        <button
          onClick={updateDebugInfo}
          className="text-blue-400 hover:text-blue-300"
        >
          🔄
        </button>
      </div>

      <div className="space-y-2 text-gray-300">
        <div>
          <strong>isLoggedIn:</strong>
          <span className={debugInfo.isLoggedIn ? 'text-green-400' : 'text-red-400'}>
            {String(debugInfo.isLoggedIn)}
          </span>
        </div>

        <div>
          <strong>currentUser:</strong>
          <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
            {debugInfo.currentUser ? debugInfo.currentUser.username : 'null'}
          </pre>
        </div>

        <div>
          <strong>Raw localStorage:</strong>
          <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
            {debugInfo.rawCurrentUser ? debugInfo.rawCurrentUser.username : 'null'}
          </pre>
        </div>

        <div>
          <strong>Tous les utilisateurs:</strong>
          <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
            {debugInfo.allUsers?.length || 0} utilisateurs
          </pre>
        </div>

        <div>
          <strong>Clés localStorage:</strong>
          <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
            {debugInfo.localStorageKeys?.join('\n')}
          </pre>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
        <button
          onClick={() => {
          }}
          className="text-purple-400 hover:text-purple-300 text-xs block"
        >
          📋 Log complet en console
        </button>

        <button
          onClick={() => {
            try {
              const testUser = AuthService.createUser('testuser', 'test@example.com')
              updateDebugInfo()
            } catch (error) {
            }
          }}
          className="text-green-400 hover:text-green-300 text-xs block"
        >
          🆕 Créer utilisateur test
        </button>

        <button
          onClick={() => {
            localStorage.clear()
            updateDebugInfo()
          }}
          className="text-red-400 hover:text-red-300 text-xs block"
        >
          🗑️ Vider localStorage
        </button>
      </div>
    </div>
  )
}