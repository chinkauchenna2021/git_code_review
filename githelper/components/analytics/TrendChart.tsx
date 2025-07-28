'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface IDate { date: string | number; count: number; score?: number | undefined; }

interface TrendChartProps {
  title: string
  data: Array<{ date: string; count: number; score?: number }>
  xField: string
  yField: string
  color?: string
  showComparison?: boolean
  target?: number
  className?: string
}

export function TrendChart({
  title,
  data,
  xField,
  yField,
  color = 'blue',
  showComparison = false,
  target,
  className
}: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No trend data available</p>
          </div>
        </div>
      </Card>
    )
  }

  const values = data.map(d => d[yField as keyof typeof d] as number)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const latestValue = values[values.length - 1]
  const previousValue = values[values.length - 2]
  const trend = previousValue ? ((latestValue - previousValue) / previousValue) * 100 : 0

  const getColorClass = (color: string) => {
    const colors = {
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      yellow: '#F59E0B',
      purple: '#8B5CF6'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {trend !== 0 && (
            <>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Trend visualization */}
      <div className="h-64 relative">
        <div className="absolute inset-0 bg-gray-50 rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Target line */}
            {target && (
              <line
                x1="0"
                y1={100 - ((target - minValue) / (maxValue - minValue)) * 100}
                x2="100"
                y2={100 - ((target - minValue) / (maxValue - minValue)) * 100}
                stroke="#F59E0B"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            )}
            
            {/* Trend line */}
            <polyline
              points={values.map((value, index) => 
                `${(index / (values.length - 1)) * 100},${100 - ((value - minValue) / (maxValue - minValue)) * 100}`
              ).join(' ')}
              fill="none"
              stroke={getColorClass(color)}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Area fill */}
            <polygon
              points={[
                '0,100',
                ...values.map((value, index) => 
                  `${(index / (values.length - 1)) * 100},${100 - ((value - minValue) / (maxValue - minValue)) * 100}`
                ),
                '100,100'
              ].join(' ')}
              fill={getColorClass(color)}
              fillOpacity="0.1"
            />
            
            {/* Data points */}
            {values.map((value, index) => (
              <circle
                key={index}
                cx={(index / (values.length - 1)) * 100}
                cy={100 - ((value - minValue) / (maxValue - minValue)) * 100}
                r="1.5"
                fill={getColorClass(color)}
                className="hover:r-3 transition-all"
              />
            ))}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-4">
          {data.slice(0, 5).map((item, index) => (
            <span key={index} className="text-xs text-gray-500">
              {new Date(item[xField]  as any ).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{latestValue}</div>
          <div className="text-sm text-gray-500">Current</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{maxValue}</div>
          <div className="text-sm text-gray-500">Peak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">Average</div>
        </div>
      </div>
    </Card>
  )
}