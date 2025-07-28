'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Star, GitPullRequest, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface Review {
  id: string
  title: string
  author: {
    name: string
    avatar: string
  }
  repository: string
  status: 'pending' | 'completed' | 'failed'
  score?: number
  issuesFound: number
  createdAt: string
  completedAt?: string
}

interface RecentReviewsProps {
  reviews: Review[]
  onViewAll: () => void
  className?: string
}

export function RecentReviews({ reviews, onViewAll, className }: RecentReviewsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'secondary'
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {reviews.slice(0, 5).map((review) => (
          <div key={review.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Avatar
              src={review.author.avatar}
              alt={review.author.name}
              fallback={review.author.name[0]}
              size="sm"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <GitPullRequest className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 truncate">{review.title}</span>
                {getStatusIcon(review.status)}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span>{review.author.name}</span>
                <span>•</span>
                <span>{review.repository}</span>
                <span>•</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant={getStatusVariant(review.status) as any} className="text-xs">
                  {review.status}
                </Badge>
                
                {review.score && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">{review.score.toFixed(1)}/10</span>
                  </div>
                )}
                
                {review.issuesFound > 0 && (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-gray-600">{review.issuesFound} issues</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <GitPullRequest className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No recent reviews</p>
          <p className="text-sm">Reviews will appear here once you start analyzing pull requests</p>
        </div>
      )}
    </Card>
  )
}