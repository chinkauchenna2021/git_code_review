'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/helpers'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
  trend?: 'up' | 'down' | 'neutral'
  actionable?: boolean
  onClick?: () => void
  invertTrend?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  trend,
  actionable = false,
  onClick,
  invertTrend = false
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

  const getTrendSymbol = () => {
    if (!change) return ''
    return change > 0 ? '+' : ''
  }

  return (
    <Card
      className={cn(
        'p-6 transition-all duration-200',
        actionable && 'cursor-pointer hover:shadow-lg hover:scale-105'
      )}
      onClick={actionable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center mt-1', getTrendColor())}>
              <span className="text-sm font-medium">
                {getTrendSymbol()}{change}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-full', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}