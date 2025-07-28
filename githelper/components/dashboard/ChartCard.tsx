'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ChartCardProps {
  title: string
  type: 'line' | 'bar' | 'area' | 'pie'
  data: number[]
  labels: string[]
  color?: string
  showComparison?: boolean
  target?: number
  className?: string
}

export function ChartCard({
  title,
  type,
  data,
  labels,
  color = 'blue',
  showComparison = false,
  target,
  className
}: ChartCardProps) {
  // Simple chart visualization (in production, use a proper chart library)
  const maxValue = Math.max(...data)
  const trend = data.length > 1 ? data[data.length - 1] - data[data.length - 2] : 0

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Simple chart representation */}
      <div className="space-y-4">
        <div className="h-32 flex items-end space-x-2">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full bg-${color}-500 rounded-t transition-all duration-300`}
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
              <span className="text-xs text-gray-500 mt-1 truncate">
                {labels[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Chart stats */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </div>
            {target && (
              <div className="text-sm text-gray-500">
                Target: {target}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Latest: {data[data.length - 1]}
          </div>
        </div>
      </div>
    </Card>
  )
}