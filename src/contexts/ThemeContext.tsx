"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark') // Par défaut sombre

  // Charger le thème depuis localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  // Sauvegarder dans localStorage quand le thème change
  useEffect(() => {
    localStorage.setItem('theme', theme)

    // Appliquer la classe au document pour Tailwind
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }

    // Appliquer les styles CSS custom directement
    const root = document.documentElement
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#111827')
      root.style.setProperty('--bg-secondary', '#1F2937')
      root.style.setProperty('--text-primary', '#F9FAFB')
      root.style.setProperty('--text-secondary', '#9CA3AF')
      root.style.setProperty('--border-primary', 'rgba(31, 41, 55, 0.4)')
      root.style.setProperty('--glass-bg', 'rgba(17, 24, 39, 0.95)')
      root.style.setProperty('--background', '#111827')
      root.style.setProperty('--foreground', '#F9FAFB')
    } else {
      root.style.setProperty('--bg-primary', '#F8FAFC')
      root.style.setProperty('--bg-secondary', '#FFFFFF')
      root.style.setProperty('--text-primary', '#1E293B')
      root.style.setProperty('--text-secondary', '#64748B')
      root.style.setProperty('--border-primary', 'rgba(203, 213, 225, 0.6)')
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--background', '#F8FAFC')
      root.style.setProperty('--foreground', '#1E293B')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value: ThemeContextType = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#111827] text-[#F9FAFB]'
          : 'bg-[#F8FAFC] text-[#1E293B]'
      }`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}