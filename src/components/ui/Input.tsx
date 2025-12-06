"use client"

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/utils/themeClasses'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border-2 bg-gray-800/50 px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-gray-500 transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-[#00FF88]/50 focus:border-[#00FF88]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50',
            !error && 'border-gray-700/50',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
