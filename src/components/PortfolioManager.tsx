'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DatabaseAuthService } from '@/services/databaseAuthService'
import { Plus, Edit3, Trash2, Check, X, Folder, FolderOpen, Star, ChevronDown } from 'lucide-react'

interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  is_default: boolean
  total_value_usd: number | null
  created_at: string
  sources?: {
    manual: boolean
    binance: boolean
    coinbase: boolean
    kraken: boolean
  }
}

interface PortfolioManagerProps {
  onPortfolioSelect: (portfolio: Portfolio) => void
  selectedPortfolioId: string | null
}

export default function PortfolioManager({ onPortfolioSelect, selectedPortfolioId }: PortfolioManagerProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false,
    sources: {
      manual: true,
      binance: false,
      coinbase: false,
      kraken: false
    }
  })
  const [mounted, setMounted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const loadPortfolios = async () => {
    setLoading(true)
    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) return

      const response = await fetch('/api/portfolios', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolios(data.portfolios || [])

        // Sélectionner le portfolio par défaut si aucun n'est sélectionné
        if (!selectedPortfolioId && data.portfolios.length > 0) {
          const defaultPortfolio = data.portfolios.find((p: Portfolio) => p.is_default) || data.portfolios[0]
          onPortfolioSelect(defaultPortfolio)
        }
      }
    } catch (error) {
      console.error('Erreur chargement portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadPortfolios()
  }, [])

  const handleCreate = async () => {
    if (!formData.name.trim()) return

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) return

      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setPortfolios([...portfolios, data.portfolio])
        setShowCreateModal(false)
        setFormData({
          name: '',
          description: '',
          is_default: false,
          sources: { manual: true, binance: false, coinbase: false, kraken: false }
        })
        onPortfolioSelect(data.portfolio)
      }
    } catch (error) {
      console.error('Erreur création portfolio:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editingPortfolio || !formData.name.trim()) return

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) return

      console.log('Envoi des données:', formData)

      const response = await fetch(`/api/portfolios/${editingPortfolio.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Réponse API:', data)

        // Mettre à jour la liste des portfolios
        setPortfolios(portfolios.map(p => p.id === data.portfolio.id ? data.portfolio : p))

        // Si c'est le portfolio sélectionné, mettre à jour la sélection
        if (editingPortfolio.id === selectedPortfolioId) {
          onPortfolioSelect(data.portfolio)
        }

        setEditingPortfolio(null)
        setFormData({
          name: '',
          description: '',
          is_default: false,
          sources: { manual: true, binance: false, coinbase: false, kraken: false }
        })

        // Recharger la liste complète pour être sûr
        await loadPortfolios()
      } else {
        const error = await response.json()
        console.error('Erreur API:', error)
      }
    } catch (error) {
      console.error('Erreur modification portfolio:', error)
    }
  }

  const handleDelete = async (portfolioId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce portfolio ? Toutes les positions associées seront supprimées.')) {
      return
    }

    try {
      const authData = DatabaseAuthService.getCurrentUserFromStorage()
      if (!authData) return

      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const remaining = portfolios.filter(p => p.id !== portfolioId)
        setPortfolios(remaining)

        // Sélectionner un autre portfolio si le portfolio supprimé était sélectionné
        if (selectedPortfolioId === portfolioId && remaining.length > 0) {
          onPortfolioSelect(remaining[0])
        }
      }
    } catch (error) {
      console.error('Erreur suppression portfolio:', error)
    }
  }

  const openEditModal = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setFormData({
      name: portfolio.name,
      description: portfolio.description || '',
      is_default: portfolio.is_default,
      sources: portfolio.sources || { manual: true, binance: false, coinbase: false, kraken: false }
    })
  }

  // Bloquer le scroll quand un modal est ouvert
  useEffect(() => {
    if (showCreateModal || editingPortfolio) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showCreateModal, editingPortfolio])

  if (loading) {
    return (
      <div className="glass-effect-strong rounded-2xl p-6 border border-gray-800/40">
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-700/30 rounded-xl"></div>
          <div className="h-12 bg-gray-700/30 rounded-xl"></div>
        </div>
      </div>
    )
  }

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId)

  return (
    <div className="relative">
      {/* Dropdown compacte */}
      <div className="glass-effect-strong rounded-2xl p-4 border border-gray-800/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1">
            <Folder className="w-5 h-5 text-[#6366F1] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Portfolio actif</p>
              {selectedPortfolio && (
                <div
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-white font-semibold truncate">{selectedPortfolio.name}</span>
                  {selectedPortfolio.is_default && (
                    <Star className="w-3 h-3 text-[#F59E0B] fill-current flex-shrink-0" />
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 group-hover:text-white ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-3 py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg text-sm"
              title="Nouveau portfolio"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste déroulante des portfolios */}
      {isDropdownOpen && (
        <>
          {/* Overlay pour fermer au clic */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />

          <div className="absolute top-full left-0 right-0 mt-2 glass-effect-strong rounded-xl border border-gray-800/40 shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className={`rounded-lg p-3 hover:bg-gray-700/30 transition-all cursor-pointer ${
                    selectedPortfolioId === portfolio.id
                      ? 'bg-[#6366F1]/10 border border-[#6366F1]/30'
                      : ''
                  }`}
                  onClick={() => {
                    onPortfolioSelect(portfolio)
                    setIsDropdownOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedPortfolioId === portfolio.id ? 'bg-[#6366F1]' : 'bg-gray-800'
                      }`}>
                        {selectedPortfolioId === portfolio.id ? (
                          <FolderOpen className="w-4 h-4 text-white" />
                        ) : (
                          <Folder className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium truncate">{portfolio.name}</span>
                          {portfolio.is_default && (
                            <Star className="w-3 h-3 text-[#F59E0B] fill-current flex-shrink-0" />
                          )}
                        </div>
                        {portfolio.description && (
                          <p className="text-gray-400 text-xs truncate">{portfolio.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(portfolio)
                          setIsDropdownOpen(false)
                        }}
                        className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-[#6366F1]/20 transition-all"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-[#6366F1]" />
                      </button>
                      {portfolios.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(portfolio.id)
                          }}
                          className="p-1.5 rounded-lg bg-gray-800/50 hover:bg-red-500/20 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal Créer/Modifier */}
      {mounted && (showCreateModal || editingPortfolio) && createPortal(
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          style={{ zIndex: 9999 }}
          onClick={() => {
            setShowCreateModal(false)
            setEditingPortfolio(null)
            setFormData({
              name: '',
              description: '',
              is_default: false,
              sources: { manual: true, binance: false, coinbase: false, kraken: false }
            })
          }}
        >
          <div
            className="glass-effect-strong rounded-2xl p-6 border border-gray-800/40 max-w-md w-full animate-scaleIn shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {editingPortfolio ? 'Modifier le portfolio' : 'Nouveau portfolio'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nom du portfolio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mon Portfolio"
                  className="w-full px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de mon portfolio..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1] resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-[#6366F1] focus:ring-[#6366F1]"
                />
                <label htmlFor="is_default" className="text-sm text-gray-300">
                  Définir comme portfolio par défaut
                </label>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Sources à inclure dans ce portfolio
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <input
                      type="checkbox"
                      id="source_manual"
                      checked={formData.sources.manual}
                      onChange={(e) => setFormData({
                        ...formData,
                        sources: { ...formData.sources, manual: e.target.checked }
                      })}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <label htmlFor="source_manual" className="text-sm text-gray-300 flex items-center space-x-2 flex-1 cursor-pointer">
                      <Folder className="w-4 h-4 text-gray-400" />
                      <span>Transactions Manuelles</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <input
                      type="checkbox"
                      id="source_binance"
                      checked={formData.sources.binance}
                      onChange={(e) => setFormData({
                        ...formData,
                        sources: { ...formData.sources, binance: e.target.checked }
                      })}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <label htmlFor="source_binance" className="text-sm text-gray-300 flex items-center space-x-2 flex-1 cursor-pointer">
                      <span className="text-[#F3BA2F]">⬡</span>
                      <span>Binance</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <input
                      type="checkbox"
                      id="source_coinbase"
                      checked={formData.sources.coinbase}
                      onChange={(e) => setFormData({
                        ...formData,
                        sources: { ...formData.sources, coinbase: e.target.checked }
                      })}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-[#6366F1] focus:ring-[#6366F1]"
                    />
                    <label htmlFor="source_coinbase" className="text-sm text-gray-300 flex items-center space-x-2 flex-1 cursor-pointer">
                      <span className="text-[#0052FF]">◆</span>
                      <span>Coinbase</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <input
                      type="checkbox"
                      id="source_kraken"
                      checked={formData.sources.kraken}
                      onChange={(e) => setFormData({
                        ...formData,
                        sources: { ...formData.sources, kraken: e.target.checked }
                      })}
                      className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-[#5741D9]"
                    />
                    <label htmlFor="source_kraken" className="text-sm text-gray-300 flex items-center space-x-2 flex-1 cursor-pointer">
                      <span className="text-[#5741D9]">◉</span>
                      <span>Kraken</span>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ce portfolio affichera les holdings de toutes les sources sélectionnées
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingPortfolio(null)
                  setFormData({
                    name: '',
                    description: '',
                    is_default: false,
                    sources: { manual: true, binance: false, coinbase: false, kraken: false }
                  })
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-800/50 text-gray-300 font-semibold hover:bg-gray-700/50 transition-all flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </button>
              <button
                onClick={editingPortfolio ? handleUpdate : handleCreate}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>{editingPortfolio ? 'Modifier' : 'Créer'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
