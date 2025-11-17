"use client"

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  isDarkMode?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    isDarkMode = true,
    disabled,
    children,
    ...props
  }, ref) => {
    // Styles de base
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    // Tailles
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-3.5 text-base'
    }

    // Variantes
    const variantStyles = {
      primary: isDarkMode
        ? 'bg-[#00FF88]/10 hover:bg-[#00FF88]/15 text-[#00FF88] border-2 border-[#00FF88]/30 hover:border-[#00FF88]/40 shadow-sm hover:shadow-md hover:shadow-[#00FF88]/5 focus:ring-[#00FF88]/20'
        : 'bg-[#00FF88]/5 hover:bg-[#00FF88]/10 text-[#00875E] border-2 border-[#00FF88]/20 hover:border-[#00FF88]/30 shadow-sm hover:shadow-md focus:ring-[#00FF88]/20',

      secondary: isDarkMode
        ? 'bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 hover:text-white border-2 border-gray-700/50 hover:border-gray-600/50 shadow-sm focus:ring-gray-500/20'
        : 'bg-white/60 hover:bg-white/80 text-gray-700 hover:text-gray-900 border-2 border-gray-200/60 hover:border-gray-300/60 shadow-sm hover:shadow-md focus:ring-gray-400/20',

      outline: isDarkMode
        ? 'bg-transparent hover:bg-gray-800/30 text-gray-400 hover:text-gray-200 border-2 border-gray-700/50 hover:border-gray-600/50 focus:ring-gray-500/20'
        : 'bg-transparent hover:bg-gray-100/50 text-gray-600 hover:text-gray-900 border-2 border-gray-300/50 hover:border-gray-400/50 focus:ring-gray-400/20',

      ghost: isDarkMode
        ? 'bg-transparent hover:bg-gray-800/30 text-gray-400 hover:text-gray-200 border-0 focus:ring-gray-500/20'
        : 'bg-transparent hover:bg-gray-100/50 text-gray-600 hover:text-gray-900 border-0 focus:ring-gray-400/20'
    }

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
