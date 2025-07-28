'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User,
  FileText
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'review_completed' | 'repository_added' | 'issue_found' | 'team_joined'
  title: string
  description: string
  timestamp: string
  repository?: string
  user?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface ActivityFeedProps {
  userId: string
  className?: string
}

export function ActivityFeed({ userId, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [userId])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/activity?userId=${userId}`)
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'review_completed':
        return CheckCircle
      case 'repository_added':
        return GitBranch
      case 'issue_found':
        return AlertTriangle
      case 'team_joined':
        return User
      default:
        return FileText
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'review_completed':
        return 'text-green-500'
      case 'repository_added':
        return 'text-blue-500'
      case 'issue_found':
        return 'text-orange-500'
      case 'team_joined':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const getSeverityBadge = (severity?: ActivityItem['severity']) => {
    if (!severity) return null
    
    const variants = {
      low: 'secondary',
      medium: 'warning',
      high: 'warning',
      critical: 'error'
    } as const

    return (
      <Badge variant={variants[severity]} className="text-xs">
        {severity}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className={`flex justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activities.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No recent activity</p>
        </div>
      ) : (
        activities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          return (
            <Card key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${getActivityColor(activity.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {getSeverityBadge(activity.severity)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {activity.repository && (
                        <span>{activity.repository}</span>
                      )}
                      {activity.user && (
                        <span>by {activity.user}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}