import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/helpers'

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
}

export function LoadingSpinner({ 
  className, 
  size = 'md',
  color = 'primary',
  ...props 
}: LoadingSpinnerProps) {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colors = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <svg 
        className={cn(
          'animate-spin',
          sizes[size],
          colors[color]
        )}
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </svg>
    </div>
  )
}
