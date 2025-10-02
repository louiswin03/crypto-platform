// Utilitaires pour les classes de thème

export const themeClasses = {
  // Backgrounds principaux
  background: {
    primary: (isDark: boolean) => isDark ? 'bg-[#111827]' : 'bg-[#F8FAFC]',
    secondary: (isDark: boolean) => isDark ? 'bg-[#1F2937]' : 'bg-white',
    card: (isDark: boolean) => isDark ? 'glass-effect-strong' : 'bg-white/95 backdrop-blur-40 border border-gray-200 shadow-xl',
    cardLight: (isDark: boolean) => isDark ? 'glass-effect' : 'bg-white/90 backdrop-blur-24 border border-gray-200 shadow-lg',
  },

  // Textes
  text: {
    primary: (isDark: boolean) => isDark ? 'text-[#F9FAFB]' : 'text-[#1E293B]',
    secondary: (isDark: boolean) => isDark ? 'text-gray-400' : 'text-gray-600',
    muted: (isDark: boolean) => isDark ? 'text-gray-500' : 'text-gray-500',
    accent: (isDark: boolean) => isDark ? 'text-[#6366F1]' : 'text-[#6366F1]', // Accent reste pareil
  },

  // Bordures
  border: {
    primary: (isDark: boolean) => isDark ? 'border-gray-800/40' : 'border-gray-200/60',
    secondary: (isDark: boolean) => isDark ? 'border-gray-700/50' : 'border-gray-300/50',
  },

  // Boutons et interactions
  button: {
    primary: 'bg-[#6366F1] text-white hover:bg-[#5B21B6] shadow-lg shadow-[#6366F1]/25',
    secondary: (isDark: boolean) => isDark
      ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    ghost: (isDark: boolean) => isDark
      ? 'text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-800/40'
      : 'text-gray-600 hover:text-[#1E293B] hover:bg-gray-100/60',
  },

  // Inputs
  input: (isDark: boolean) => isDark
    ? 'bg-gray-800/50 border-gray-700/50 text-[#F9FAFB] placeholder-gray-500 focus:border-[#6366F1]'
    : 'bg-white/80 border-gray-300/60 text-[#1E293B] placeholder-gray-400 focus:border-[#6366F1]',

  // Navigation
  nav: {
    bg: (isDark: boolean) => isDark
      ? 'border-b border-gray-800/40 glass-effect'
      : 'border-b border-gray-200/60 bg-white/90 backdrop-blur-24',
    link: (isDark: boolean, isActive: boolean) => {
      const base = 'transition-colors duration-300'
      if (isActive) return `${base} text-[#6366F1]`
      return isDark
        ? `${base} text-gray-400 hover:text-[#F9FAFB]`
        : `${base} text-gray-600 hover:text-[#1E293B]`
    }
  }
}

// Helper pour combiner les classes
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}