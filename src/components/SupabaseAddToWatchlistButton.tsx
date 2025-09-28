// src/components/SupabaseAddToWatchlistButton.tsx
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Star, Check, Plus, X, Loader2, Crown, TrendingUp } from 'lucide-react'
import { useWatchlistContext } from '@/contexts/WatchlistContext'

interface AddToWatchlistButtonProps {
  crypto: {
    id: string
    symbol: string
    name: string
    image?: string
    current_price?: number
    price_change_percentage_24h?: number
    market_cap_rank?: number
  }
  className?: string
}

export default function SupabaseAddToWatchlistButton({ crypto, className = "" }: AddToWatchlistButtonProps) {
  const {
    watchlists,
    addToWatchlist,
    removeFromWatchlist,
    getListsContainingCrypto,
    loading,
    error
  } = useWatchlistContext()

  const [showDropdown, setShowDropdown] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Calculer la position du bouton pour positionner la modal
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonPosition({
        top: rect.bottom + window.scrollY + 8,
        right: rect.right + window.scrollX
      })
    }
  }, [showDropdown])

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('keydown', handleEscape)
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showDropdown])

  const listsContainingCrypto = getListsContainingCrypto(crypto.id)
  const isInAnyList = listsContainingCrypto.length > 0

  const handleToggleInList = async (listId: string, isCurrentlyInList: boolean) => {
    if (isProcessing) return

    setIsProcessing(true)
    setActionError(null)
    setSuccessMessage(null)

    try {
      let success = false
      const list = watchlists.find(l => l.id === listId)

      if (isCurrentlyInList) {
        success = await removeFromWatchlist(listId, crypto.id)
        if (success) {
          setSuccessMessage(`Supprimé de "${list?.name}"`)
        }
      } else {
        success = await addToWatchlist(listId, crypto)
        if (success) {
          setSuccessMessage(`Ajouté à "${list?.name}"`)
        }
      }

      if (!success) {
        setActionError(isCurrentlyInList ? 'Erreur lors de la suppression' : 'Erreur lors de l\'ajout')
      }
    } catch (err) {
      console.error('Erreur lors de l\'action sur la watchlist:', err)
      setActionError('Une erreur est survenue')
    } finally {
      setIsProcessing(false)
    }
  }

  const closeModal = () => {
    setShowDropdown(false)
    setActionError(null)
    setSuccessMessage(null)
  }

  if (loading) {
    return (
      <div className={`p-2.5 rounded-lg ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`group/star p-2.5 rounded-lg transition-all duration-300 transform hover:scale-110 relative overflow-hidden ${
          isInAnyList
            ? 'text-[#F59E0B] bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 border border-[#F59E0B]/30 shadow-lg shadow-[#F59E0B]/20'
            : 'text-gray-400 hover:text-[#F59E0B] bg-gray-800/50 hover:bg-gradient-to-r hover:from-[#F59E0B]/10 hover:to-[#D97706]/10 border border-gray-600/50 hover:border-[#F59E0B]/40'
        } ${className}`}
        disabled={isProcessing}
        title={isInAnyList ? `Dans ${listsContainingCrypto.length} liste(s)` : 'Ajouter à une liste de suivi'}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isInAnyList ? (
          <Star className="w-4 h-4 fill-current animate-pulse" />
        ) : (
          <Star className="w-4 h-4 group-hover/star:fill-current transition-all duration-300" />
        )}

        {/* Notification badge */}
        {isInAnyList && listsContainingCrypto.length > 1 && (
          <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-10">
            {listsContainingCrypto.length}
          </div>
        )}

        {/* Hover shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/star:translate-x-[100%] transition-transform duration-700 ease-out"></div>
      </button>

      {/* Modal avec Portal */}
      {showDropdown && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div
            className="absolute w-96 bg-[#111827] border border-gray-600/50 rounded-2xl shadow-2xl animate-slide-in"
            style={{
              top: Math.min(buttonPosition.top, window.innerHeight - 500),
              left: Math.max(10, buttonPosition.right - 384), // 384px = w-96
              maxHeight: 'calc(100vh - 40px)',
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#F59E0B]/20 rounded-xl">
                    <Star className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#F9FAFB]">
                      Listes de Suivi
                    </div>
                    <div className="text-xs text-gray-400">
                      Organisez vos cryptos favorites
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              {(actionError || error) && (
                <div className="mb-4 p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl animate-shake">
                  <div className="text-red-400 text-sm font-medium flex items-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>{actionError || error}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl animate-bounce-in">
                  <div className="text-green-400 text-sm font-medium flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Crypto info premium */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30">
                <div className="relative">
                  {crypto.image && (
                    <>
                      <img src={crypto.image} alt={crypto.name} className="w-12 h-12 rounded-full border-2 border-gray-600/50" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-transparent"></div>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="font-bold text-white text-lg">{crypto.name}</div>
                    {crypto.market_cap_rank && crypto.market_cap_rank <= 10 && (
                      <Crown className="w-4 h-4 text-[#F59E0B]" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400 text-sm font-mono">{crypto.symbol.toUpperCase()}</div>
                    {crypto.current_price && (
                      <div className="text-gray-300 text-sm font-mono">
                        ${crypto.current_price.toLocaleString()}
                      </div>
                    )}
                    {crypto.price_change_percentage_24h && (
                      <div className={`flex items-center space-x-1 text-xs font-semibold ${
                        crypto.price_change_percentage_24h >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${crypto.price_change_percentage_24h < 0 ? 'rotate-180' : ''}`} />
                        <span>{crypto.price_change_percentage_24h.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Listes disponibles */}
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-gray-800/20 scrollbar-thumb-gray-600/50">
                {watchlists.map(list => {
                  const isInThisList = listsContainingCrypto.some(l => l.id === list.id)

                  return (
                    <button
                      key={list.id}
                      onClick={() => !isProcessing && handleToggleInList(list.id, isInThisList)}
                      disabled={isProcessing}
                      className={`w-full group flex items-center justify-between p-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                        isProcessing
                          ? 'opacity-50 cursor-not-allowed'
                          : isInThisList
                          ? 'bg-gradient-to-r from-[#16A34A]/10 to-[#15803D]/10 border border-[#16A34A]/30 hover:scale-105'
                          : 'bg-gray-800/30 border border-gray-600/30 hover:bg-gray-700/40 hover:scale-105 hover:border-gray-500/50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                          style={{ backgroundColor: list.color || '#6366F1' }}
                        >
                          {list.icon || '📋'}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-[#F9FAFB] mb-1 flex items-center space-x-2">
                            <span>{list.name}</span>
                            {list.is_pinned && <Crown className="w-3 h-3 text-[#F59E0B]" />}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {list.items?.length || 0} crypto{(list.items?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isProcessing ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : isInThisList ? (
                          <div className="flex items-center space-x-2 bg-[#16A34A]/20 px-3 py-1 rounded-full">
                            <Check className="w-4 h-4 text-[#16A34A]" />
                            <span className="text-[#16A34A] text-sm font-bold">Ajoutée</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 bg-gray-600/20 group-hover:bg-[#6366F1]/20 px-3 py-1 rounded-full transition-colors">
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#6366F1]" />
                            <span className="text-gray-400 group-hover:text-[#6366F1] text-sm font-bold">Ajouter</span>
                          </div>
                        )}
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                    </button>
                  )
                })}
              </div>

              {watchlists.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="text-lg font-bold text-[#F9FAFB] mb-2">Aucune liste disponible</div>
                  <div className="text-gray-400 text-sm mb-4">Créez votre première liste de suivi pour organiser vos cryptos</div>
                  <div className="text-xs text-gray-500">💡 Utilisez l'onglet "Listes de suivi" pour créer une nouvelle liste</div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-track-gray-800\\/20 {
          scrollbar-color: rgba(107, 114, 128, 0.5) rgba(31, 41, 55, 0.2);
        }

        .scrollbar-thumb-gray-600\\/50::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thumb-gray-600\\/50::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.2);
          border-radius: 3px;
        }

        .scrollbar-thumb-gray-600\\/50::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }

        .scrollbar-thumb-gray-600\\/50::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </>
  )
}