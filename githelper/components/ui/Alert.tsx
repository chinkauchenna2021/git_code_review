import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/helpers'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function Alert({ 
  children, 
  className, 
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  ...props 
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-400'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-400'
    }
  }

  const { container, icon: Icon, iconColor } = variants[variant]

  return (
    <div 
      className={cn(
        'border rounded-md p-4',
        container,
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'hover:bg-black hover:bg-opacity-10',
                  variant === 'info' && 'text-blue-500 focus:ring-blue-600',
                  variant === 'success' && 'text-green-500 focus:ring-green-600',
                  variant === 'warning' && 'text-yellow-500 focus:ring-yellow-600',
                  variant === 'error' && 'text-red-500 focus:ring-red-600'
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}