'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { 
  Code2, 
  GitPullRequest, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'review_completed' | 'review_failed' | 'repository_added'
  title: string
  description: string
  timestamp: Date
  status?: 'success' | 'failed' | 'pending'
  repository?: string
  pullRequest?: number
  score?: number
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setActivities([
        {
          id: '1',
          type: 'review_completed',
          title: 'PR Review Completed',
          description: 'AI review completed for "Fix authentication bug"',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          status: 'success',
          repository: 'devteams/copilot',
          pullRequest: 42,
          score: 8.5
        },
        {
          id: '2',
          type: 'repository_added',
          title: 'Repository Added',
          description: 'Added devteams/frontend to active repositories',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          status: 'success',
          repository: 'devteams/frontend'
        },
        {
          id: '3',
          type: 'review_failed',
          title: 'Review Failed',
          description: 'AI review failed for "Update dependencies"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          status: 'failed',
          repository: 'devteams/backend',
          pullRequest: 38
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const getActivityIcon = (type: ActivityItem['type'], status?: string) => {
    const iconClass = "h-5 w-5"
    
    switch (type) {
      case 'review_completed':
        return status === 'success' ? 
          <CheckCircle className={`${iconClass} text-green-600`} /> :
          <XCircle className={`${iconClass} text-red-600`} />
      case 'review_failed':
        return <XCircle className={`${iconClass} text-red-600`} />
      case 'repository_added':
        return <Code2 className={`${iconClass} text-blue-600`} />
      default:
        return <Clock className={`${iconClass} text-gray-600`} />
    }
  }

  const getStatusBadge = (status?: string, score?: number) => {
    if (score) {
      return (
        <Badge variant={score >= 8 ? 'success' : score >= 6 ? 'warning' : 'error'} size="sm">
          {score}/10
        </Badge>
      )
    }

    switch (status) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button
          onClick={() => window.location.href = '/reviews'}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">
            Activity will appear here once you start using AI reviews
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activity.status, activity.score)}
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{activity.description}</p>
                
                {activity.repository && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.repository}</span>
                    {activity.pullRequest && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <button
                          onClick={() => window.open(`https://github.com/${activity.repository}/pull/${activity.pullRequest}`, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                        >
                          <GitPullRequest className="h-3 w-3" />
                          <span>#{activity.pullRequest}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}