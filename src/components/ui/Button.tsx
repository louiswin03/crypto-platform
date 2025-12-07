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
    // Styles de base utilisant le design system
    const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    const transitionStyles = 'transition-all duration-[var(--transition-base)]'
    const radiusStyles = 'rounded-[var(--radius-lg)]'

    // Tailles utilisant le design system
    const sizeStyles = {
      sm: 'text-[var(--text-sm)]',
      md: 'text-[var(--text-base)]',
      lg: 'text-[var(--text-lg)]'
    }

    // Padding utilisant le design system
    const paddingStyles = {
      sm: 'px-[var(--space-4)] py-[var(--space-2)]',
      md: 'px-[var(--space-6)] py-[var(--space-3)]',
      lg: 'px-[var(--space-8)] py-[var(--space-4)]'
    }

    // Variantes utilisant les CSS variables du design system
    const variantStyles = {
      primary: isDarkMode
        ? 'bg-[rgba(var(--color-primary-rgb),0.1)] hover:bg-[rgba(var(--color-primary-rgb),0.15)] text-[var(--color-primary)] border-2 border-[rgba(var(--color-primary-rgb),0.3)] hover:border-[rgba(var(--color-primary-rgb),0.4)] shadow-sm hover:shadow-md focus:ring-[rgba(var(--color-primary-rgb),0.2)]'
        : 'bg-[rgba(var(--color-primary-rgb),0.05)] hover:bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)] border-2 border-[rgba(var(--color-primary-rgb),0.2)] hover:border-[rgba(var(--color-primary-rgb),0.3)] shadow-sm hover:shadow-md focus:ring-[rgba(var(--color-primary-rgb),0.2)]',

      secondary: isDarkMode
        ? 'bg-[var(--bg-secondary-dark)] hover:bg-[var(--bg-tertiary-dark)] text-[var(--text-secondary-dark)] hover:text-[var(--text-primary-dark)] border-2 border-[var(--border-color-dark)] hover:border-[var(--border-color-dark-hover)] shadow-sm'
        : 'bg-[var(--bg-secondary-light)] hover:bg-[var(--bg-tertiary-light)] text-[var(--text-secondary-light)] hover:text-[var(--text-primary-light)] border-2 border-[var(--border-color-light)] hover:border-[var(--border-color-light-hover)] shadow-sm hover:shadow-md',

      outline: isDarkMode
        ? 'bg-transparent hover:bg-[var(--bg-secondary-dark)] text-[var(--text-secondary-dark)] hover:text-[var(--text-primary-dark)] border-2 border-[var(--border-color-dark)] hover:border-[var(--border-color-dark-hover)]'
        : 'bg-transparent hover:bg-[var(--bg-tertiary-light)] text-[var(--text-secondary-light)] hover:text-[var(--text-primary-light)] border-2 border-[var(--border-color-light)] hover:border-[var(--border-color-light-hover)]',

      ghost: isDarkMode
        ? 'bg-transparent hover:bg-[var(--bg-secondary-dark)] text-[var(--text-secondary-dark)] hover:text-[var(--text-primary-dark)] border-0'
        : 'bg-transparent hover:bg-[var(--bg-tertiary-light)] text-[var(--text-secondary-light)] hover:text-[var(--text-primary-light)] border-0'
    }

    const combinedClassName = `${baseStyles} ${transitionStyles} ${radiusStyles} ${paddingStyles[size]} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`

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
