// src/components/CreateWatchlistModal.tsx
"use client"

import { useState } from 'react'
import { X, Star, Hash, Palette, Sparkles } from 'lucide-react'

interface CreateWatchlistModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateWatchlist: (name: string, description?: string, color?: string, icon?: string) => Promise<string | null>
  loading?: boolean
}

const PRESET_COLORS = [
  { name: 'Bleu', value: '#2563EB' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Orange', value: '#FFA366' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#00FFD9' }
]

const PRESET_ICONS = [
  '⭐', '📊', '🚀', '💎', '🏆', '🎯', '📈', '💰',
  '🔥', '⚡', '🌟', '📋', '💼', '🎮', '🏦', '⛓️'
]

export default function CreateWatchlistModal({
  isOpen,
  onClose,
  onCreateWatchlist,
  loading = false
}: CreateWatchlistModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('#2563EB')
  const [selectedIcon, setSelectedIcon] = useState('⭐')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      const newListId = await onCreateWatchlist(
        name.trim(),
        description.trim() || undefined,
        selectedColor,
        selectedIcon
      )

      if (newListId) {
        // Réinitialiser le formulaire
        setName('')
        setDescription('')
        setSelectedColor('#2563EB')
        setSelectedIcon('⭐')
        onClose()
      }
    } catch (error) {

    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setName('')
    setDescription('')
    setSelectedColor('#2563EB')
    setSelectedIcon('⭐')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#0A0E1A] border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nouvelle Liste</h2>
              <p className="text-sm text-gray-400">Créez une liste de suivi personnalisée</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nom de la liste */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la liste *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Mes DeFi favoris"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none transition-all"
              disabled={isSubmitting}
              maxLength={50}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description de cette liste..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/20 focus:outline-none transition-all resize-none"
              disabled={isSubmitting}
              maxLength={200}
            />
          </div>

          {/* Couleur et Icône sur une ligne */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sélection de couleur */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Palette className="w-3 h-3 inline mr-1" />
                Couleur
              </label>
              <div className="grid grid-cols-4 gap-1">
                {PRESET_COLORS.slice(0, 4).map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      selectedColor === color.value
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    disabled={isSubmitting}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <Hash className="w-3 h-3 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {PRESET_COLORS.slice(4).map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      selectedColor === color.value
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    disabled={isSubmitting}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <Hash className="w-3 h-3 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection d'icône */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Star className="w-3 h-3 inline mr-1" />
                Icône
              </label>
              <div className="grid grid-cols-4 gap-1">
                {PRESET_ICONS.slice(0, 8).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-8 h-8 rounded-lg text-sm transition-all ${
                      selectedIcon === icon
                        ? 'bg-[#2563EB] scale-110'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                    }`}
                    disabled={isSubmitting}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {PRESET_ICONS.slice(8).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-8 h-8 rounded-lg text-sm transition-all ${
                      selectedIcon === icon
                        ? 'bg-[#2563EB] scale-110'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                    }`}
                    disabled={isSubmitting}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-600/30">
            <div className="text-xs text-gray-400 mb-2">Aperçu :</div>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedIcon}
              </div>
              <div>
                <div className="font-semibold text-white text-sm">
                  {name || 'Nom de la liste'}
                </div>
                <div className="text-xs text-gray-400">
                  {description || 'Description optionnelle'}
                </div>
              </div>
            </div>
          </div>
          </form>
        </div>

        {/* Footer avec actions - fixe en bas */}
        <div className="border-t border-gray-700/50 p-4 bg-[#0A0E1A]">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-800/50 text-gray-300 rounded-xl font-medium hover:bg-gray-700/50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              className="flex-1 px-4 py-3 bg-[#2563EB]/10 hover:bg-[#2563EB]/15 text-[#2563EB] border-2 border-[#2563EB]/30 hover:border-[#2563EB]/40 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Création...</span>
                </div>
              ) : (
                'Créer la liste'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}