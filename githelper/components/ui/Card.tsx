import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/helpers'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    outlined: 'bg-white border-2 border-gray-200 rounded-lg',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-lg'
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div 
      className={cn(
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
