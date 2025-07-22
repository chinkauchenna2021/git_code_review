import { HTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils/helpers'
import { User } from 'lucide-react'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({ 
  src, 
  alt = '',
  fallback,
  size = 'md',
  className,
  ...props 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  }

  const shouldShowImage = src && !imageError
  const shouldShowFallback = fallback && !shouldShowImage
  const shouldShowIcon = !shouldShowImage && !shouldShowFallback

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-500 overflow-hidden',
        sizes[size],
        className
      )}
      {...props}
    >
      {shouldShowImage && (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      
      {shouldShowFallback && (
        <span className="font-medium text-white uppercase">
          {fallback}
        </span>
      )}
      
      {shouldShowIcon && (
        <User className="h-1/2 w-1/2 text-white" />
      )}
    </div>
  )
}
