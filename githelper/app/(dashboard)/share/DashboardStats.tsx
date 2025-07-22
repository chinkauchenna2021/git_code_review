'use client'

import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth, useSubscription } from '@/lib/hooks/use-auth'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { 
  TrendingUp, 
  TrendingDown, 
  Code2, 
  FolderGit2, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    variant: 'success' | 'warning' | 'error' | 'default'
  }
}

export function StatCard({ title, value, description, trend, icon: Icon, badge }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {badge && (
                <Badge variant={badge.variant} size="sm">
                  {badge.text}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
    </Card>
  )
}

export function DashboardStats() {
  const { user, isLoading } = useAuth()
  const { usage, subscription } = useSubscription()

  if (isLoading || !user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <LoadingSpinner size="md" />
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Active Repositories',
      value: user.stats?.activeRepositories || 0,
      description: `${usage?.repositories.limit === -1 ? 'Unlimited' : usage?.repositories.limit} allowed`,
      icon: FolderGit2,
      badge: Number(usage?.repositories?.percentage) >= 80 ? {
        text: 'Near Limit',
        variant: 'warning' as const
      } : undefined
    },
    {
      title: 'Reviews This Month',
      value: user.reviewsUsed || 0,
      description: `${usage?.reviews.limit === -1 ? 'Unlimited' : usage?.reviews.limit} allowed`,
      icon: Code2,
      trend: { value: 12, isPositive: true },
      badge: Number(usage?.reviews?.percentage) >= 80 ? {
        text: 'Near Limit',
        variant: 'warning' as const
      } : undefined
    },
    {
      title: 'Total Reviews',
      value: user.stats?.totalReviews || 0,
      description: 'All time reviews completed',
      icon: CheckCircle,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Current Plan',
      value: subscription?.plan || 'Free',
      description: subscription?.status === 'ACTIVE' ? 'Active subscription' : 'Inactive',
      icon: Users,
      badge: {
        text: subscription?.status || 'Active',
        variant: subscription?.status === 'ACTIVE' ? 'success' : 'warning'
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
        //@ts-ignore
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Usage Progress Bars */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reviews Used</span>
                <span>{usage.reviews.used} / {usage.reviews.limit === -1 ? '∞' : usage.reviews.limit}</span>
              </div>
              <ProgressBar
                value={usage.reviews.percentage}
                variant={usage.reviews.percentage >= 100 ? 'error' : usage.reviews.percentage >= 80 ? 'warning' : 'default'}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                Resets monthly on your billing cycle
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Repositories</span>
                <span>{usage.repositories.used} / {usage.repositories.limit === -1 ? '∞' : usage.repositories.limit}</span>
              </div>
              <ProgressBar
                value={usage.repositories.percentage}
                variant={usage.repositories.percentage >= 100 ? 'error' : usage.repositories.percentage >= 80 ? 'warning' : 'default'}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                Enable AI reviews on repositories
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/repositories'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderGit2 className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium">Manage Repositories</p>
              <p className="text-sm text-gray-500">Enable or configure repositories</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/reviews'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Code2 className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium">View Reviews</p>
              <p className="text-sm text-gray-500">See all completed reviews</p>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/settings/integrations'}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div className="text-left">
              <p className="font-medium">Setup Integration</p>
              <p className="text-sm text-gray-500">Configure GitHub App</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  )
}
