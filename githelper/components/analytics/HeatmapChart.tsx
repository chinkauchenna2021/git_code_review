'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Activity } from 'lucide-react'

interface HeatmapChartProps {
  title: string
  data: Array<{ repo: string; score: number }>
  xField: string
  yField: string
  className?: string
}

export function HeatmapChart({ title, data, xField, yField, className }: HeatmapChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No heatmap data available</p>
          </div>
        </div>
      </Card>
    )
  }

  const maxScore = Math.max(...data.map(d => d[yField as keyof typeof d] as number))
  const minScore = Math.min(...data.map(d => d[yField as keyof typeof d] as number))

  const getHeatColor = (score: number) => {
    const intensity = (score - minScore) / (maxScore - minScore)
    if (intensity > 0.8) return 'bg-green-500'
    if (intensity > 0.6) return 'bg-yellow-500'
    if (intensity > 0.4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getHeatOpacity = (score: number) => {
    const intensity = (score - minScore) / (maxScore - minScore)
    return Math.max(0.2, intensity)
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-24 text-sm font-medium text-gray-700 truncate">
              {item[xField as keyof typeof item] as string}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <div
                className={`h-6 rounded ${getHeatColor(item[yField as keyof typeof item] as number)}`}
                style={{ 
                  width: `${((item[yField as keyof typeof item] as number) / maxScore) * 100}%`,
                  opacity: getHeatOpacity(item[yField as keyof typeof item] as number)
                }}
              />
              <span className="text-sm font-medium text-gray-900 min-w-0">
                {(item[yField as keyof typeof item] as number).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Low</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-red-500 opacity-20 rounded"></div>
            <div className="w-4 h-4 bg-orange-500 opacity-40 rounded"></div>
            <div className="w-4 h-4 bg-yellow-500 opacity-60 rounded"></div>
            <div className="w-4 h-4 bg-green-500 opacity-80 rounded"></div>
          </div>
          <span className="text-gray-500">High</span>
        </div>
        <div className="text-gray-500">
          Range: {minScore.toFixed(1)} - {maxScore.toFixed(1)}
        </div>
      </div>
    </Card>
  )
}
