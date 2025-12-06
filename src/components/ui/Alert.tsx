"use client"

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/themeClasses'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

const alertVariants = cva(
  'relative w-full rounded-2xl p-6 border-2 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-gray-800/50 border-gray-700/50 text-gray-300',
        info: 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]',
        success: 'bg-green-500/10 border-green-500/30 text-green-400',
        warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        danger: 'bg-red-500/10 border-red-500/30 text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: ReactNode
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    const icons = {
      default: <Info className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      danger: <AlertCircle className="w-5 h-5" />,
    }

    const defaultIcon = variant ? icons[variant] : icons.default

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start gap-4">
          {icon !== undefined ? icon : defaultIcon}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-2 font-bold text-lg tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

export const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm leading-relaxed opacity-90', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = 'AlertDescription'

export default Alert
