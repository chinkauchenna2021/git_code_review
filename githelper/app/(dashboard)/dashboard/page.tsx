'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { RecentReviews } from '@/components/dashboard/RecentReviews'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { UsageMetrics } from '@/components/dashboard/UsageMetrics'
import { SecurityAlerts } from '@/components/dashboard/SecurityAlerts'
import { TeamActivity } from '@/components/dashboard/TeamActivity'
import { IntegrationStatus } from '@/components/dashboard/IntegrationStatus'
import { 
  GitBranch, 
  Code2, 
  Shield, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Activity,
  Zap,
  Target,
  Award,
  Calendar,
  ArrowRight
} from 'lucide-react'

interface DashboardData {
  stats: {
    totalReviews: number
    pendingReviews: number
    completedReviews: number
    averageScore: number
    criticalIssues: number
    repositoriesActive: number
    teamMembers: number
    growthRate: number
  }
  recentActivity: any[]
  usage: {
    reviews: { used: number; limit: number; percentage: number }
    repositories: { used: number; limit: number; percentage: number }
    api: { used: number; limit: number; percentage: number }
  }
  trends: {
    reviewsThisWeek: number[]
    scoresTrend: number[]
    issuesTrend: number[]
  }
  alerts: any[]
  integrations: any[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/dashboard/overview?timeRange=${timeRange}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Unable to load dashboard data</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const welcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {welcomeMessage()}, {user?.githubUsername?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="mt-1 text-gray-600">
            Here's what's happening with your code reviews today.
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <select
            title="Select time range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <Activity className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reviews"
          value={data.stats.totalReviews}
          change={data.stats.growthRate}
          icon={Code2}
          color="blue"
          trend="up"
        />
        
        <MetricCard
          title="Pending Reviews"
          value={data.stats.pendingReviews}
          icon={Clock}
          color="purple"
          actionable
          onClick={() => window.location.href = '/dashboard/reviews?status=pending'}
        />
        
        <MetricCard
          title="Average Score"
          value={`${data.stats.averageScore}/10`}
          change={0.3}
          icon={Star}
          color="green"
          trend="up"
        />
        
        <MetricCard
          title="Critical Issues"
          value={data.stats.criticalIssues}
          icon={AlertTriangle}
          color={data.stats.criticalIssues > 0 ? "red" : "green"}
          actionable={data.stats.criticalIssues > 0}
          onClick={() => window.location.href = '/dashboard/reviews?severity=critical'}
        />
      </div>

      {/* Usage and Limits */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage & Limits</h3>
          <Badge 
            variant={user?.subscription?.plan === 'FREE' ? 'secondary' : 'success'}
            className="text-xs"
          >
            {user?.subscription?.plan || 'FREE'} Plan
          </Badge>
        </div>
        
        <UsageMetrics usage={data.usage} plan={user?.subscription?.plan || 'FREE'} />
        
        {user?.subscription?.plan === 'FREE' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">Upgrade to unlock more</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Get unlimited reviews, advanced analytics, and team collaboration features.
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Review Trends"
          type="line"
          data={data.trends.reviewsThisWeek}
          labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          color="blue"
        />
        
        <ChartCard
          title="Code Quality Scores"
          type="area"
          data={data.trends.scoresTrend}
          labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
          color="green"
        />
      </div>

      {/* Security Alerts */}
      {data.alerts.length > 0 && (
        <SecurityAlerts alerts={data.alerts} />
      )}

      {/* Integration Status */}
      <IntegrationStatus integrations={data.integrations} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <div className="lg:col-span-2">
          <RecentReviews 
            reviews={data.recentActivity} 
            onViewAll={() => window.location.href = '/dashboard/reviews'}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Team Activity (if user has team plan) */}
      {(user?.subscription?.plan === 'TEAM' || user?.subscription?.plan === 'ENTERPRISE') && (
        <TeamActivity teamId={user.id} />
      )}

      {/* Achievement and Goals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Goals & Achievements
          </h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Reviews This Month</span>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{data.stats.totalReviews}</span>
                <span className="text-gray-500">/ 100</span>
              </div>
              <ProgressBar value={(data.stats.totalReviews / 100) * 100} className="h-2" />
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Quality Score</span>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{data.stats.averageScore}/10</span>
                <span className="text-gray-500">Target: 8.5</span>
              </div>
              <ProgressBar 
                value={(data.stats.averageScore / 10) * 100} 
                variant={data.stats.averageScore >= 8.5 ? 'success' : 'default'}
                className="h-2" 
              />
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Zero Critical Issues</span>
              <Shield className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{data.stats.criticalIssues === 0 ? '✅' : '❌'}</span>
                <span className="text-gray-500">0 Critical</span>
              </div>
              <ProgressBar 
                value={data.stats.criticalIssues === 0 ? 100 : 0} 
                variant={data.stats.criticalIssues === 0 ? 'success' : 'error'}
                className="h-2" 
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Upcoming Events / Calendar Integration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-500" />
            Upcoming Reviews
          </h3>
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4 ml-1" />
            View Calendar
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Weekly code review meeting</p>
                <p className="text-sm text-gray-500">Today at 3:00 PM</p>
              </div>
            </div>
            <Badge variant="default">Team</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Security audit review</p>
                <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
              </div>
            </div>
            <Badge variant="default">Security</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}