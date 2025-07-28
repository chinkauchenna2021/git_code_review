'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { GitPullRequest, MessageSquare, CheckCircle, Clock } from 'lucide-react'

interface TeamActivityItem {
  id: string
  user: {
    name: string
    avatar: string
  }
  action: 'review_submitted' | 'pr_opened' | 'comment_added' | 'issue_resolved'
  target: string
  repository: string
  timestamp: string
}

interface TeamActivityProps {
  teamId: string
  className?: string
}

export function TeamActivity({ teamId, className }: TeamActivityProps) {
  // Mock data - in real implementation, fetch from API
  const activities: TeamActivityItem[] = [
    {
      id: '1',
      user: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' },
      action: 'review_submitted',
      target: 'Fix authentication bug',
      repository: 'web-app',
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      user: { name: 'Marcus Rodriguez', avatar: '/avatars/marcus.jpg' },
      action: 'pr_opened',
      target: 'Add user dashboard',
      repository: 'frontend',
      timestamp: '15 minutes ago'
    },
    {
      id: '3',
      user: { name: 'Emily Watson', avatar: '/avatars/emily.jpg' },
      action: 'comment_added',
      target: 'Refactor API endpoints',
      repository: 'backend',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      user: { name: 'David Kim', avatar: '/avatars/david.jpg' },
      action: 'issue_resolved',
      target: 'Database migration issue',
      repository: 'infrastructure',
      timestamp: '2 hours ago'
    }
  ]

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'review_submitted':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pr_opened':
        return <GitPullRequest className="w-4 h-4 text-blue-500" />
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
      case 'issue_resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityText = (action: string) => {
    switch (action) {
      case 'review_submitted': return 'submitted a review for'
      case 'pr_opened': return 'opened a pull request for'
      case 'comment_added': return 'commented on'
      case 'issue_resolved': return 'resolved issue'
      default: return 'performed action on'
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
        <Badge variant="secondary">{activities.length} recent</Badge>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <Avatar
              src={activity.user.avatar}
              alt={activity.user.name}
              fallback={activity.user.name[0]}
              size="sm"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getActivityIcon(activity.action)}
                <span className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user.name}</span>
                  {' '}{getActivityText(activity.action)}{' '}
                  <span className="font-medium">{activity.target}</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{activity.repository}</span>
                <span>•</span>
                <span>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No recent team activity</p>
        </div>
      )}
    </Card>
  )
}