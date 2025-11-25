// src/components/Watchlists/index.tsx
"use client"

import React, { useState } from 'react'
import { Star, Plus, MoreHorizontal, Trash2, Edit3, Pin, Download, Upload, Search, TrendingUp, TrendingDown, Eye, EyeOff, Heart, Bookmark, Target, Layers, X, Check, AlertCircle } from 'lucide-react'
import { useWatchlistContext } from '@/contexts/WatchlistContext'

// Bouton d'ajout à une liste (à intégrer dans chaque ligne crypto)
export const AddToWatchlistButton = ({ crypto, className = "" }: { crypto: any, className?: string }) => {
  const { watchlists, addToWatchlist, removeFromWatchlist, getListsContainingCrypto } = useWatchlistContext()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const listsContainingCrypto = getListsContainingCrypto(crypto.id)
  const isInAnyList = listsContainingCrypto.length > 0

  const handleToggleInList = async (listId: string, isCurrentlyInList: boolean) => {
    setIsAdding(true)
    try {
      if (isCurrentlyInList) {
        removeFromWatchlist(listId, crypto.id)
      } else {
        addToWatchlist(listId, crypto)
      }
    } catch (error) {

    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`p-2 rounded-lg transition-all hover:scale-110 ${
          isInAnyList 
            ? 'text-[#FFA366] bg-[#FFA366]/10 hover:bg-[#FFA366]/20' 
            : 'text-gray-400 hover:text-[#FFA366] hover:bg-[#FFA366]/10'
        } ${className}`}
        disabled={isAdding}
      >
        {isInAnyList ? (
          <Star className="w-4 h-4 fill-current" />
        ) : (
          <Star className="w-4 h-4" />
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 glass-effect rounded-xl border border-gray-800/40 shadow-2xl z-50">
          <div className="p-4">
            <div className="text-sm font-semibold text-[#F9FAFB] mb-3">
              Ajouter à une liste
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {watchlists.map(list => {
                const isInThisList = listsContainingCrypto.some(l => l.id === list.id)
                return (
                  <div
                    key={list.id}
                    onClick={() => handleToggleInList(list.id, isInThisList)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{list.icon}</span>
                      <div>
                        <div className="font-medium text-[#F9FAFB] text-sm">{list.name}</div>
                        <div className="text-gray-400 text-xs">{list.items.length} cryptos</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isInThisList && (
                        <Check className="w-4 h-4 text-[#00FF88]" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full mt-3 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-[#F9FAFB] rounded-lg text-sm transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Sidebar des listes de suivi
export const WatchlistSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const {
    watchlists,
    activeWatchlist,
    setActiveWatchlist,
    pinnedWatchlists,
    unpinnedWatchlists,
    getTotalWatchedCryptos,
    getWatchlistStats,
    deleteWatchlist,
    togglePinWatchlist
  } = useWatchlistContext()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showManageMode, setShowManageMode] = useState(false)

  const filteredWatchlists = watchlists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCryptos = getTotalWatchedCryptos()

  const WatchlistItem = ({ list }: { list: Watchlist }) => {
    const stats = getWatchlistStats(list.id)
    const isActive = activeWatchlist === list.id

    return (
      <div
        onClick={() => setActiveWatchlist(list.id)}
        className={`group p-4 rounded-xl cursor-pointer transition-all border ${
          isActive 
            ? 'bg-gradient-to-r from-[#00FF88]/20 to-[#8B5CF6]/20 border-[#00FF88]/40 shadow-lg' 
            : 'hover:bg-gray-800/40 border-transparent hover:border-gray-700/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="text-2xl">{list.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[#F9FAFB] flex items-center space-x-2">
                <span className="truncate">{list.name}</span>
                {list.is_pinned && <Pin className="w-3 h-3 text-[#FFA366]" />}
              </div>
              <div className="text-gray-400 text-sm">
                {stats?.count || 0} crypto{(stats?.count || 0) > 1 ? 's' : ''}
                {stats && stats.avgChange !== 0 && (
                  <span className={`ml-2 ${stats.avgChange >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'}`}>
                    {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showManageMode && (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePinWatchlist(list.id)
                }}
                className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-[#FFA366] transition-all"
              >
                <Pin className={`w-3 h-3 ${list.is_pinned ? 'fill-current text-[#FFA366]' : ''}`} />
              </button>
              {/* Temporairement permettre la suppression de toutes les listes */}
              {true && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Supprimer la liste "${list.name}" ?`)) {
                      deleteWatchlist(list.id)
                    }
                  }}
                  className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-[#DC2626] transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {list.description && (
          <div className="text-gray-500 text-xs mt-2 truncate">
            {list.description}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-80 glass-effect border-r border-gray-800/40 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 lg:z-auto`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-800/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#F9FAFB]">Mes Listes</h2>
                <div className="text-gray-400 text-sm">{totalCryptos} crypto{totalCryptos > 1 ? 's' : ''} suivie{totalCryptos > 1 ? 's' : ''}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowManageMode(!showManageMode)}
                  className={`p-2 rounded-lg transition-all ${
                    showManageMode 
                      ? 'bg-[#00FF88]/20 text-[#00FF88]' 
                      : 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-2 rounded-lg bg-[#00FF88]/10 hover:bg-[#00FF88]/15 text-[#00FF88] border-2 border-[#00FF88]/30 hover:border-[#00FF88]/40 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 transition-all lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Rechercher une liste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-2 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#00FF88]/50 text-sm"
              />
            </div>
          </div>

          {/* Lists */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Pinned Lists */}
            {pinnedWatchlists.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                  <Pin className="w-3 h-3 mr-1" />
                  Épinglées
                </div>
                <div className="space-y-2">
                  {pinnedWatchlists
                    .filter(list => !searchTerm || list.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(list => <WatchlistItem key={list.id} list={list} />)
                  }
                </div>
              </div>
            )}

            {/* Other Lists */}
            {unpinnedWatchlists.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Toutes les listes
                </div>
                <div className="space-y-2">
                  {unpinnedWatchlists
                    .filter(list => !searchTerm || list.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(list => <WatchlistItem key={list.id} list={list} />)
                  }
                </div>
              </div>
            )}

            {/* No results */}
            {filteredWatchlists.length === 0 && searchTerm && (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <div className="font-medium mb-1">Aucune liste trouvée</div>
                <div className="text-sm">Essayez un autre terme de recherche</div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-800/40">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-[#F9FAFB] rounded-lg transition-all text-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-[#F9FAFB] rounded-lg transition-all text-sm">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateWatchlistModal 
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  )
}

// Modal de création de liste
const CreateWatchlistModal = ({ onClose }: { onClose: () => void }) => {
  const { createWatchlist } = useWatchlistContext()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#00FF88')
  const [icon, setIcon] = useState('📋')
  const [isCreating, setIsCreating] = useState(false)

  const colors = [
    '#00FF88', '#8B5CF6', '#EC4899', '#EF4444', 
    '#FFA366', '#10B981', '#06B6D4', '#84CC16'
  ]

  const icons = ['📋', '⭐', '🚀', '💎', '🎯', '🔥', '💰', '🎮', '🏦', '⛓️', '🌟', '💡']

  const handleCreate = async () => {
    if (!name.trim()) return
    
    setIsCreating(true)
    try {
      createWatchlist(name.trim(), description.trim(), color, icon)
      onClose()
    } catch (error) {

    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-effect rounded-2xl border border-gray-800/40 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#F9FAFB]">Nouvelle Liste</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la liste</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mes altcoins favoris"
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#00FF88]/50 focus:ring-2 focus:ring-[#00FF88]/20"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description (optionnelle)</label>
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description de cette liste"
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#00FF88]/50 focus:ring-2 focus:ring-[#00FF88]/20"
              maxLength={100}
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icône */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icône</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 text-xl rounded-lg transition-all hover:scale-110 ${
                    icon === i 
                      ? 'bg-[#00FF88]/20 border border-[#00FF88]/40' 
                      : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800/40">
            <div className="text-sm font-medium text-gray-400 mb-2">Aperçu</div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="font-semibold text-[#F9FAFB]">{name || 'Nom de la liste'}</div>
                <div className="text-gray-400 text-sm">{description || 'Description'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50 rounded-lg font-medium transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="flex-1 px-4 py-3 bg-[#00FF88]/10 hover:bg-[#00FF88]/15 text-[#00FF88] border-2 border-[#00FF88]/30 hover:border-[#00FF88]/40 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Vue détaillée d'une liste
export const WatchlistDetailView = ({ listId }: { listId: string }) => {
  const {
    watchlists,
    getWatchlistStats,
    removeFromWatchlist,
    deleteWatchlist,
    togglePinWatchlist,
    currentWatchlist
  } = useWatchlistContext()
  
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'rank' | 'addedAt'>('addedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const list = watchlists.find(l => l.id === listId)
  const stats = getWatchlistStats(listId)

  if (!list) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <div className="font-medium mb-2">Liste introuvable</div>
        <div className="text-sm">Cette liste n'existe pas ou a été supprimée</div>
      </div>
    )
  }

  if (list.items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-6xl mb-4">{list.icon}</div>
        <div className="font-medium mb-2 text-[#F9FAFB]">{list.name}</div>
        <div className="text-sm mb-4">Cette liste est vide</div>
        <div className="text-xs">Ajoutez des cryptomonnaies en cliquant sur ⭐ dans la liste principale</div>
      </div>
    )
  }

  const sortedItems = [...list.items].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch(sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        return sortOrder === 'desc' 
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue)
      case 'price':
        aValue = a.current_price
        bValue = b.current_price
        break
      case 'change':
        aValue = a.price_change_percentage_24h || 0
        bValue = b.price_change_percentage_24h || 0
        break
      case 'rank':
        aValue = a.market_cap_rank || Infinity
        bValue = b.market_cap_rank || Infinity
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
      case 'addedAt':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{list.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-[#F9FAFB]">{list.name}</h2>
            {list.description && (
              <div className="text-gray-400">{list.description}</div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {stats && (
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-mono text-[#F9FAFB] font-semibold">{stats.count}</div>
                <div className="text-gray-400">Cryptos</div>
              </div>
              <div className="text-center">
                <div className={`font-mono font-semibold ${
                  stats.avgChange >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                }`}>
                  {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(1)}%
                </div>
                <div className="text-gray-400">Moy. 24h</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[#00FF88] font-semibold">{stats.gainers}</div>
                <div className="text-gray-400">Gagnants</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-[#DC2626] font-semibold">{stats.losers}</div>
                <div className="text-gray-400">Perdants</div>
              </div>
            </div>
          )}

          {/* Actions sur la liste */}
          <div className="flex items-center space-x-2">
            {/* Bouton épingler/désépingler */}
            <button
              onClick={() => togglePinWatchlist(listId)}
              className={`p-2 rounded-lg transition-all ${
                list.is_pinned
                  ? 'bg-[#FFA366]/10 border border-[#FFA366]/20 text-[#FFA366] hover:bg-[#FFA366]/20'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#FFA366] hover:border-[#FFA366]/40'
              }`}
              title={list.is_pinned ? "Désépingler cette liste" : "Épingler cette liste"}
            >
              <Pin className={`w-4 h-4 ${list.is_pinned ? 'fill-current' : ''}`} />
            </button>

            {/* Bouton supprimer - temporairement pour toutes les listes */}
            {true && (
              <button
                onClick={() => {
                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer la liste "${list.name}" ?\n\nCette action est irréversible et supprimera également toutes les cryptomonnaies de cette liste.`)) {
                    deleteWatchlist(listId)
                    // Note: Le contexte se chargera de gérer la navigation
                  }
                }}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                title="Supprimer cette liste"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'addedAt' as const, label: 'Ajouté', icon: Plus },
          { key: 'rank' as const, label: 'Rang', icon: Target },
          { key: 'name' as const, label: 'Nom', icon: Layers },
          { key: 'price' as const, label: 'Prix', icon: Target },
          { key: 'change' as const, label: '24h', icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button 
            key={key}
            onClick={() => {
              if (sortBy === key) {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
              } else {
                setSortBy(key)
                setSortOrder('desc')
              }
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
              sortBy === key 
                ? 'bg-[#00FF88]/20 border border-[#00FF88]/40 text-[#00FF88]' 
                : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#F9FAFB] hover:border-gray-600/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {sortBy === key && (
              <span className="text-xs">
                {sortOrder === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="glass-effect rounded-2xl border border-gray-800/40 overflow-hidden">
        <div className="space-y-0">
          {sortedItems.map((item, index) => (
            <div 
              key={item.crypto_id} 
              className="flex items-center justify-between p-4 border-b border-gray-800/20 last:border-b-0 hover:bg-gray-800/20 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="text-gray-400 font-mono text-sm w-8">#{index + 1}</div>
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                )}
                <div>
                  <div className="font-semibold text-[#F9FAFB] group-hover:text-[#00FF88] transition-colors">
                    {item.name}
                  </div>
                  <div className="text-gray-400 text-sm font-mono uppercase">
                    {item.symbol} • #{item.market_cap_rank}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="font-mono font-semibold text-[#F9FAFB]">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: item.current_price < 1 ? 4 : 2,
                    }).format(item.current_price)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className={`font-mono font-semibold text-right min-w-[80px] ${
                  (item.price_change_percentage_24h || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#DC2626]'
                }`}>
                  {(item.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                  {(item.price_change_percentage_24h || 0).toFixed(1)}%
                </div>
                
                <button
                  onClick={() => removeFromWatchlist(listId, item.crypto_id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#DC2626] hover:bg-[#DC2626]/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}