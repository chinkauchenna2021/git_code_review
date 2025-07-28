'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Star,
  FileText,
  RefreshCw,
  X
} from 'lucide-react'

interface ReviewCardProps {
  review: {
    id: string
    title: string
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
    author: { name: string; avatar: string }
    repository: { name: string; language: string }
    aiAnalysis?: { overallScore: number; issues: any[] }
    createdAt: string
    processingTime?: number
  }
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onClick?: () => void
  onRetry?: () => void
  onCancel?: () => void
}

export function ReviewCard({ 
  review, 
  selected = false, 
  onSelect, 
  onClick, 
  onRetry, 
  onCancel 
}: ReviewCardProps) {
  const getStatusIcon = () => {
    switch (review.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusVariant = () => {
    switch (review.status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      case 'cancelled': return 'secondary'
      default: return 'secondary'
    }
  }

  const criticalIssues = review.aiAnalysis?.issues?.filter(i => i.severity === 'critical').length || 0

  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-md ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Selection checkbox */}
        {onSelect && (
          <input
           title="Select review"
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}

        {/* Author avatar */}
        <img
          src={review.author.avatar || '/default-avatar.png'}
          alt={review.author.name}
          className="w-10 h-10 rounded-full"
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onClick}
              className="text-left hover:text-blue-600 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {review.title}
              </h3>
            </button>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <Badge variant={getStatusVariant() as any}>
                {review.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <GitPullRequest className="w-4 h-4 mr-1" />
              {review.repository.name}
            </span>
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {review.repository.language}
            </span>
            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>

          {/* AI Analysis Results */}
          {review.aiAnalysis && (
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {review.aiAnalysis.overallScore.toFixed(1)}/10
                </span>
              </div>
              {criticalIssues > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    {criticalIssues} critical issue{criticalIssues > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                {review.aiAnalysis.issues.length} total issue{review.aiAnalysis.issues.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Processing time */}
          {review.processingTime && (
            <div className="text-xs text-gray-500 mb-3">
              Processed in {Math.round(review.processingTime / 1000)}s
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {review.status === 'failed' && onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
            {review.status === 'pending' && onCancel && (
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button size="sm" onClick={onClick}>
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
