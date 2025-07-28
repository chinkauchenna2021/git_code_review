'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  actionable?: boolean
  onClick?: () => void
  invertTrend?: boolean
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  trend,
  description,
  actionable = false,
  onClick,
  invertTrend = false,
  className
}: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    indigo: 'text-indigo-600 bg-indigo-100'
  }

  const getTrendColor = () => {
    if (!change) return 'text-gray-500'
    const isPositive = change > 0
    if (invertTrend) {
      return isPositive ? 'text-red-600' : 'text-green-600'
    }
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = () => {
    if (!change) return <Minus className="w-4 h-4" />
    if (invertTrend) {
      return change > 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />
    }
    return change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  return (
    <Card
      className={cn(
        'p-6 transition-all duration-200',
        actionable && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={actionable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className={cn('p-2 rounded-lg', colorClasses[color])}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          
          {description && (
            <p className="text-sm text-gray-500 mb-2">{description}</p>
          )}
          
          {change !== undefined && (
            <div className={cn('flex items-center space-x-1', getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(change)}% vs last period
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
 