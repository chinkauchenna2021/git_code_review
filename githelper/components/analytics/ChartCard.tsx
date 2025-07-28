'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TrendingUp, TrendingDown, MoreHorizontal, Download } from 'lucide-react'

interface ChartCardProps {
  title: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'doughnut'
  data: number[]
  labels: string[]
  color?: string
  showComparison?: boolean
  target?: number
  className?: string
  height?: number
  showExport?: boolean
  onExport?: () => void
}

export function ChartCard({
  title,
  type,
  data,
  labels,
  color = 'blue',
  showComparison = false,
  target,
  className,
  height = 200,
  showExport = false,
  onExport
}: ChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className={`h-${height} flex items-center justify-center text-gray-500`}>
          <div className="text-center">
            <div className="text-sm">No data available</div>
          </div>
        </div>
      </Card>
    )
  }

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const trend = data.length > 1 ? data[data.length - 1] - data[data.length - 2] : 0
  const trendPercentage = data.length > 1 && data[data.length - 2] !== 0 
    ? ((data[data.length - 1] - data[data.length - 2]) / data[data.length - 2]) * 100 
    : 0

  const getColorClasses = (baseColor: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500', 
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500'
    }
    return colors[baseColor as keyof typeof colors] || colors.blue
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {showExport && (
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Simple chart visualization */}
      <div className="space-y-4">
        <div className={`h-${height} flex items-end space-x-2 p-4 bg-gray-50 rounded-lg`}>
          {type === 'bar' && data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${getColorClasses(color)} rounded-t transition-all duration-500 hover:opacity-80`}
                style={{ 
                  height: `${maxValue > 0 ? (value / maxValue) * 160 : 0}px`,
                  minHeight: value > 0 ? '4px' : '0px'
                }}
                title={`${labels[index]}: ${value}`}
              />
              <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                {labels[index]}
              </span>
            </div>
          ))}
          
          {type === 'line' && (
            <div className="w-full h-40 relative">
              <svg className="w-full h-full" viewBox="0 0 400 160">
                <polyline
                  points={data.map((value, index) => 
                    `${(index / (data.length - 1)) * 380 + 10},${160 - (value / maxValue) * 140}`
                  ).join(' ')}
                  fill="none"
                  stroke={color === 'blue' ? '#3B82F6' : '#10B981'}
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                {data.map((value, index) => (
                  <circle
                    key={index}
                    cx={(index / (data.length - 1)) * 380 + 10}
                    cy={160 - (value / maxValue) * 140}
                    r="4"
                    fill={color === 'blue' ? '#3B82F6' : '#10B981'}
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                ))}
              </svg>
              <div className="flex justify-between mt-2">
                {labels.map((label, index) => (
                  <span key={index} className="text-xs text-gray-500 truncate">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart statistics */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span className={`text-sm font-medium ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend > 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">change</span>
            </div>
            
            {target && (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">Target:</span>
                <span className="text-sm font-medium">{target}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>High: {maxValue}</span>
            <span>Low: {minValue}</span>
            <span>Latest: {data[data.length - 1]}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}