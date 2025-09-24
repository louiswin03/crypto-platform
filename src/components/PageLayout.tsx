// components/PageLayout.tsx
'use client'

import SmartNavigation from './SmartNavigation'
import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 ${className}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <SmartNavigation />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}