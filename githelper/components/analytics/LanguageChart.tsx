'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Code } from 'lucide-react'

interface LanguageChartProps {
  data: Array<{
    language: string
    count: number
    score: number
    issues: number
  }>
  className?: string
}

export function LanguageChart({ data, className }: LanguageChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Usage</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No language data available</p>
          </div>
        </div>
      </Card>
    )
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(...data.map(item => item.count))

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': '#F7DF1E',
      'TypeScript': '#3178C6',
      'Python': '#3776AB',
      'Java': '#ED8B00',
      'Go': '#00ADD8',
      'Rust': '#000000',
      'C++': '#00599C',
      'Ruby': '#CC342D',
      'PHP': '#777BB4',
      'Swift': '#FA7343'
    }
    return colors[language] || '#6B7280'
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Language Usage & Performance</h3>
      
      <div className="space-y-4">
        {data.slice(0, 8).map((item, index) => (
          <div key={item.language} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getLanguageColor(item.language) }}
                />
                <span className="font-medium text-gray-900">{item.language}</span>
                <span className="text-sm text-gray-500">
                  {item.count} review{item.count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {item.score.toFixed(1)}/10
                  </div>
                  <div className="text-gray-500">Score</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{item.issues}</div>
                  <div className="text-gray-500">Issues</div>
                </div>
              </div>
            </div>
            
            {/* Usage bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: getLanguageColor(item.language)
                }}
              />
            </div>
            
            {/* Percentage */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>{((item.count / totalCount) * 100).toFixed(1)}% of reviews</span>
              <span>#{index + 1} most used</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{data.length}</div>
          <div className="text-sm text-gray-500">Languages</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {(data.reduce((sum, item) => sum + item.score, 0) / data.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">Avg Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {data.reduce((sum, item) => sum + item.issues, 0)}
          </div>
          <div className="text-sm text-gray-500">Total Issues</div>
        </div>
      </div>
    </Card>
  )
}
