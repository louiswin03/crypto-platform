"use client"

import { HTMLAttributes } from 'react'
import { cn } from '@/utils/themeClasses'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gray-800/50',
        className
      )}
      {...props}
    />
  )
}

export default Skeleton
