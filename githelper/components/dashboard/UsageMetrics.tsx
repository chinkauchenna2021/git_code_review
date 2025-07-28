'use client'

import React from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@heroui/react'

interface Usage {
  reviews: { used: number; limit: number; percentage: number }
  repositories: { used: number; limit: number; percentage: number }
  apiCalls?: { used: number; limit: number; percentage: number }
}

interface UsageMetricsProps {
  usage: Usage
  plan: string
}

export function UsageMetrics({ usage, plan }: UsageMetricsProps) {
  const getUsageStatus = (percentage: number) => {
    if (percentage >= 100) return { variant: 'error', text: 'Limit reached' }
    if (percentage >= 80) return { variant: 'warning', text: 'Near limit' }
    return { variant: 'success', text: 'Good' }
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? '∞' : limit.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Reviews Usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Reviews</h4>
          <Badge variant={getUsageStatus(usage.reviews.percentage).variant as any}>
            {getUsageStatus(usage.reviews.percentage).text}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{usage.reviews.used.toLocaleString()} used</span>
            <span>{formatLimit(usage.reviews.limit)} limit</span>
          </div>
          <ProgressBar
            value={usage.reviews.percentage}
            variant={
              usage.reviews.percentage >= 100 ? 'error' :
              usage.reviews.percentage >= 80 ? 'warning' : 'default'
            }
          />
        </div>
      </div>

      {/* Repositories Usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Repositories</h4>
          <Badge variant={getUsageStatus(usage.repositories.percentage).variant as any}>
            {getUsageStatus(usage.repositories.percentage).text}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{usage.repositories.used} active</span>
            <span>{formatLimit(usage.repositories.limit)} limit</span>
          </div>
          <ProgressBar
            value={usage.repositories.percentage}
            variant={
              usage.repositories.percentage >= 100 ? 'error' :
              usage.repositories.percentage >= 80 ? 'warning' : 'default'
            }
          />
        </div>
      </div>

      {/* API Calls Usage (if available) */}
      {usage.apiCalls && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">API Calls</h4>
            <Badge variant={getUsageStatus(usage.apiCalls.percentage).variant as any}>
              {getUsageStatus(usage.apiCalls.percentage).text}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{usage.apiCalls.used.toLocaleString()} used</span>
              <span>{formatLimit(usage.apiCalls.limit)} limit</span>
            </div>
            <ProgressBar
              value={usage.apiCalls.percentage}
              variant={
                usage.apiCalls.percentage >= 100 ? 'error' :
                usage.apiCalls.percentage >= 80 ? 'warning' : 'default'
              }
            />
          </div>
        </div>
      )}

      {/* Plan upgrade prompt */}
      {plan === 'FREE' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Upgrade for more</p>
              <p className="text-xs text-blue-700">Get unlimited reviews and repositories</p>
            </div>
            <Button size="sm" onPress={() => window.location.href = '/pricing'}>
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}