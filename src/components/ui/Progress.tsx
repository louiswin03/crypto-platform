"use client"

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/utils/themeClasses'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = 'default', showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const variants = {
      default: 'from-gray-600 to-gray-500',
      primary: 'from-[#2563EB] to-[#00D9FF]',
      success: 'from-green-500 to-green-400',
      warning: 'from-yellow-500 to-yellow-400',
      danger: 'from-red-500 to-red-400',
    }

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full bg-gradient-to-r transition-all duration-500 ease-out',
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export default Progress
