"use client"

import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/utils/themeClasses'

export interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const Tooltip = ({ children, content, side = 'top', className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()

      const positions = {
        top: { x: rect.left + rect.width / 2, y: rect.top - 8 },
        bottom: { x: rect.left + rect.width / 2, y: rect.bottom + 8 },
        left: { x: rect.left - 8, y: rect.top + rect.height / 2 },
        right: { x: rect.right + 8, y: rect.top + rect.height / 2 },
      }

      setPosition(positions[side])
    }
  }, [isVisible, side])

  const sideClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2 translate-y-0',
    left: '-translate-x-full -translate-y-1/2',
    right: 'translate-x-0 -translate-y-1/2',
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={cn(
            'fixed z-50 px-3 py-2 text-sm text-white rounded-lg',
            'glass-effect-strong border border-[#2563EB]/30',
            'animate-in fade-in-0 zoom-in-95',
            sideClasses[side],
            className
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip
