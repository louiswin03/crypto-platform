"use client"

import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/themeClasses'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-gray-800/60 text-gray-300 border border-gray-700/50',
        primary: 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30',
        secondary: 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30',
        accent: 'bg-[#FFA366]/10 text-[#FFA366] border border-[#FFA366]/30',
        purple: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30',
        success: 'bg-green-500/10 text-green-400 border border-green-500/30',
        warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
        outline: 'border-2 border-current bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  glow?: boolean
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, glow, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          glow && 'shadow-lg shadow-current/20',
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
export { badgeVariants }
