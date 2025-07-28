'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { BarChart3, TrendingUp, AlertTriangle, Clock } from 'lucide-react'

interface Repository {
  id: string
  name: string
  reviewCount: number
  averageScore: number
  criticalIssues: number
  status: string
  language: string
}

interface RepositoryAnalyticsProps {
  repositories: Repository[]
  type: 'overview' | 'performance' | 'security' | 'activity'
}

export function RepositoryAnalytics({ repositories, type }: RepositoryAnalyticsProps) {
  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Performer</p>
            <p className="text-lg font-semibold text-gray-900">
              {repositories.sort((a, b) => b.averageScore - a.averageScore)[0]?.name || 'N/A'}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Most Active</p>
            <p className="text-lg font-semibold text-gray-900">
              {repositories.sort((a, b) => b.reviewCount - a.reviewCount)[0]?.name || 'N/A'}
            </p>
          </div>
          <BarChart3 className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Needs Attention</p>
            <p className="text-lg font-semibold text-gray-900">
              {repositories.filter(r => r.criticalIssues > 0).length}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        </div>
      </Card>
    </div>
  )

  const renderPerformance = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      <div className="space-y-4">
        {repositories.map((repo) => (
          <div key={repo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{repo.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="default">{repo.language}</Badge>
                <span className="text-sm text-gray-500">{repo.reviewCount} reviews</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {repo.averageScore.toFixed(1)}/10
              </p>
              <Badge
                variant={repo.averageScore >= 8 ? 'success' : repo.averageScore >= 6 ? 'warning' : 'error'}
              >
                {repo.averageScore >= 8 ? 'Excellent' : repo.averageScore >= 6 ? 'Good' : 'Poor'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderSecurity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Issues</h3>
      <div className="space-y-4">
        {repositories.map((repo) => (
          <div key={repo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{repo.name}</p>
              <p className="text-sm text-gray-500">{repo.language}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {repo.criticalIssues}
              </p>
              <Badge
                variant={repo.criticalIssues === 0 ? 'success' : repo.criticalIssues < 5 ? 'warning' : 'error'}
              >
                {repo.criticalIssues === 0 ? 'Clean' : 'Issues Found'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  const renderActivity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {repositories.map((repo) => (
          <div key={repo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{repo.name}</p>
                <p className="text-sm text-gray-500">Last review 2 hours ago</p>
              </div>
            </div>
            <Badge
              variant={repo.status === 'active' ? 'success' : 'secondary'}
            >
              {repo.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )

  switch (type) {
    case 'overview':
      return renderOverview()
    case 'performance':
      return renderPerformance()
    case 'security':
      return renderSecurity()
    case 'activity':
      return renderActivity()
    default:
      return renderOverview()
  }
}