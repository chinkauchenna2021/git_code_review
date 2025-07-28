'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { BarChart3, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

interface ReviewAnalyticsProps {
  reviews: any[]
  timeRange: string
}

export function ReviewAnalytics({ reviews, timeRange }: ReviewAnalyticsProps) {
  const completedReviews = reviews.filter(r => r.status === 'completed')
  const averageScore = completedReviews.length > 0 
    ? completedReviews.reduce((sum, r) => sum + (r.aiAnalysis?.overallScore || 0), 0) / completedReviews.length
    : 0

  const issuesByType = reviews.reduce((acc, review) => {
    if (review.aiAnalysis?.issues) {
      review.aiAnalysis.issues.forEach((issue: any) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1
      })
    }
    return acc
  }, {} as Record<string, number>)

  const languageStats = reviews.reduce((acc, review) => {
    const lang = review.repository.language
    if (!acc[lang]) {
      acc[lang] = { count: 0, totalScore: 0, avgScore: 0 }
    }
    acc[lang].count++
    if (review.aiAnalysis?.overallScore) {
      acc[lang].totalScore += review.aiAnalysis.overallScore
      acc[lang].avgScore = acc[lang].totalScore / acc[lang].count
    }
    return acc
  }, {} as Record<string, any>)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-xl font-bold">{averageScore.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold">{completedReviews.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-xl font-bold">
                {reviews.reduce((sum, r) => sum + (r.aiAnalysis?.issues?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Types */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Issues by Type</h3>
          <div className="space-y-3">
            {Object.entries(issuesByType).slice(0, 5).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ 
                        width: `${Math.min((count / Math.max(...Object.values(issuesByType))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Language Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Language Performance</h3>
          <div className="space-y-3">
            {Object.entries(languageStats).slice(0, 5).map(([lang, stats]) => (
              <div key={lang} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{lang}</span>
                  <span className="text-xs text-gray-500 ml-2">({stats?.count} reviews)</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {stats.avgScore.toFixed(1)}/10
                  </div>
                  <div className="w-16 h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-1 bg-green-500 rounded-full"
                      style={{ width: `${(stats.avgScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Review Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
            <p>Trend analysis for {timeRange}</p>
            <p className="text-sm">Chart visualization would be implemented here</p>
          </div>
        </div>
      </Card>
    </div>
  )
}