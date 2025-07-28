'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Star, AlertTriangle, FileText, TrendingUp, TrendingDown } from 'lucide-react'

interface ReviewComparisonProps {
  reviewIds: string[]
  open: boolean
  onClose: () => void
}

export function ReviewComparison({ reviewIds, open, onClose }: ReviewComparisonProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && reviewIds.length > 0) {
      fetchReviews()
    }
  }, [open, reviewIds])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in real implementation, fetch actual review data
      const mockReviews = reviewIds.map((id, index) => ({
        id,
        title: `Review ${index + 1}`,
        author: { name: `Author ${index + 1}` },
        repository: { name: `repo-${index + 1}`, language: 'TypeScript' },
        aiAnalysis: {
          overallScore: 7.5 + Math.random() * 2,
          issues: Array(Math.floor(Math.random() * 10)).fill(null).map((_, i) => ({
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            type: 'Code Quality',
            message: `Issue ${i + 1}`
          }))
        },
        createdAt: new Date().toISOString(),
        filesChanged: Math.floor(Math.random() * 20) + 1,
        linesAdded: Math.floor(Math.random() * 500) + 50,
        linesDeleted: Math.floor(Math.random() * 200) + 10
      }))
      
      setReviews(mockReviews)
    } catch (error) {
      console.error('Failed to fetch reviews for comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Modal isOpen={open} onClose={onClose} title="Review Comparison" size="xl">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    )
  }

  const getComparisonMetric = (values: number[]) => {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const best = Math.max(...values)
    const worst = Math.min(...values)
    return { avg, best, worst }
  }

  const scores = reviews.map(r => r.aiAnalysis?.overallScore || 0)
  const issuesCounts = reviews.map(r => r.aiAnalysis?.issues?.length || 0)
  const filesCounts = reviews.map(r => r.filesChanged)

  return (
    <Modal isOpen={open} onClose={onClose} title="Review Comparison" size="xl">
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {getComparisonMetric(scores).avg.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
            <div className="text-xs text-gray-500 mt-1">
              Range: {getComparisonMetric(scores).worst.toFixed(1)} - {getComparisonMetric(scores).best.toFixed(1)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(getComparisonMetric(issuesCounts).avg)}
            </div>
            <div className="text-sm text-gray-600">Average Issues</div>
            <div className="text-xs text-gray-500 mt-1">
              Range: {getComparisonMetric(issuesCounts).worst} - {getComparisonMetric(issuesCounts).best}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(getComparisonMetric(filesCounts).avg)}
            </div>
            <div className="text-sm text-gray-600">Average Files</div>
            <div className="text-xs text-gray-500 mt-1">
              Range: {getComparisonMetric(filesCounts).worst} - {getComparisonMetric(filesCounts).best}
            </div>
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Review</th>
                <th className="text-center p-3 font-semibold">Score</th>
                <th className="text-center p-3 font-semibold">Issues</th>
                <th className="text-center p-3 font-semibold">Files</th>
                <th className="text-center p-3 font-semibold">Changes</th>
                <th className="text-center p-3 font-semibold">Critical Issues</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => {
                const criticalIssues = review.aiAnalysis?.issues?.filter(
                  (i: any) => i.severity === 'critical'
                ).length || 0
                
                return (
                  <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{review.title}</div>
                        <div className="text-sm text-gray-500">
                          {review.repository.name} • {review.author.name}
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">
                          {review.aiAnalysis?.overallScore?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <Badge variant="secondary">
                        {review.aiAnalysis?.issues?.length || 0}
                      </Badge>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>{review.filesChanged}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="text-sm">
                        <div className="flex items-center justify-center space-x-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{review.linesAdded}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1 text-red-600">
                          <TrendingDown className="w-3 h-3" />
                          <span>-{review.linesDeleted}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      {criticalIssues > 0 ? (
                        <div className="flex items-center justify-center space-x-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{criticalIssues}</span>
                        </div>
                      ) : (
                        <span className="text-green-600">None</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Comparison Insights</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Best performing review scored {getComparisonMetric(scores).best.toFixed(1)}/10</li>
            <li>• {issuesCounts.filter(count => count === 0).length} review(s) have no issues</li>
            <li>• Average complexity: {Math.round(getComparisonMetric(filesCounts).avg)} files changed</li>
            <li>• Consider patterns from higher-scoring reviews for improvement</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}