'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface UsageData {
  reviews: { used: number; limit: number; percentage: number }
  repositories: { used: number; limit: number; percentage: number }
  apiCalls?: { used: number; limit: number; percentage: number }
}

interface UsageChartProps {
  data: UsageData
  detailed?: boolean
  className?: string
}

export function UsageChart({ data, detailed = false, className }: UsageChartProps) {
  const formatLimit = (limit: number) => {
    return limit === -1 ? '∞' : limit.toLocaleString()
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 100) return { variant: 'error', text: 'Limit reached', color: 'red' }
    if (percentage >= 80) return { variant: 'warning', text: 'Near limit', color: 'yellow' }
    return { variant: 'success', text: 'Good', color: 'green' }
  }

  const usageItems = [
    {
      label: 'Reviews',
      ...data.reviews,
      icon: '📊',
      description: 'AI-powered code reviews this month'
    },
    {
      label: 'Repositories',
      ...data.repositories,
      icon: '📁',
      description: 'Active repositories connected'
    }
  ]

  if (data.apiCalls) {
    usageItems.push({
      label: 'API Calls',
      ...data.apiCalls,
      icon: '🔌',
      description: 'API requests this month'
    })
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Overview</h3>
      
      <div className="space-y-6">
        {usageItems.map((item) => {
          const status = getUsageStatus(item.percentage)
          return (
            <div key={item.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    {detailed && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {item.used.toLocaleString()} / {formatLimit(item.limit)}
                  </div>
                  <div className={`text-xs text-${status.color}-600`}>
                    {status.text}
                  </div>
                </div>
              </div>
              
              <ProgressBar
                value={item.percentage}
                variant={status.variant as any}
                className="h-3"
              />
              
              {detailed && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.percentage.toFixed(1)}% used</span>
                  <div className="flex items-center space-x-1">
                    {item.percentage > 50 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>vs last month</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {detailed && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Usage Tips</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Monitor usage regularly to avoid hitting limits</li>
            <li>• Upgrade your plan for unlimited access</li>
            <li>• Archive unused repositories to free up space</li>
          </ul>
        </div>
      )}
    </Card>
  )
}