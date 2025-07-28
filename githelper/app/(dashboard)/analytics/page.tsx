// app/(dashboard)/analytics/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth, usePermissions } from '@/lib/hooks/use-auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { MetricCard } from '@/components/analytics/MetricCard'
import { ChartCard } from '@/components/analytics/ChartCard'
import { TrendChart } from '@/components/analytics/TrendChart'
import { HeatmapChart } from '@/components/analytics/HeatmapChart'
import { LanguageChart } from '@/components/analytics/LanguageChart'
import { TeamPerformance } from '@/components/analytics/TeamPerformance'
import { SecurityMetrics } from '@/components/analytics/SecurityMetrics'
import { PerformanceMetrics } from '@/components/analytics/PerformanceMetrics'
import { CustomReports } from '@/components/analytics/CustomReports'
import { ExportAnalytics } from '@/components/analytics/ExportAnalytics'
import { UpgradeBanner } from '@/components/analytics/UpgradeBanner'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  Clock, 
  Code2, 
  Users, 
  GitBranch,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  FileText,
  Settings,
  Crown,
  Lock
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalReviews: number
    totalRepositories: number
    averageScore: number
    criticalIssues: number
    growthRate: number
    successRate: number
    averageProcessingTime: number
    costPerReview: number
  }
  trends: {
    reviewsOverTime: Array<{ date: string; count: number; score: number }>
    qualityTrend: Array<{ date: string; score: number; issues: number }>
    repositoryActivity: Array<{ repo: string; reviews: number; score: number }>
    issueTypes: Array<{ type: string; count: number; severity: string }>
  }
  languages: {
    usage: Array<{ language: string; count: number; score: number; issues: number }>
    performance: Array<{ language: string; avgTime: number; successRate: number }>
  }
  team: {
    members: Array<{
      id: string
      name: string
      avatar: string
      reviews: number
      avgScore: number
      contributions: number
      trend: 'up' | 'down' | 'stable'
    }>
    collaboration: Array<{ from: string; to: string; count: number }>
  }
  security: {
    vulnerabilities: Array<{ type: string; count: number; severity: string }>
    trends: Array<{ date: string; critical: number; high: number; medium: number; low: number }>
    topIssues: Array<{ issue: string; count: number; repos: string[] }>
  }
  performance: {
    metrics: {
      averageReviewTime: number
      successRate: number
      errorRate: number
      throughput: number
    }
    bottlenecks: Array<{ stage: string; avgTime: number; percentage: number }>
    optimization: Array<{ suggestion: string; impact: string; effort: string }>
  }
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom'
type MetricType = 'reviews' | 'quality' | 'security' | 'performance' | 'team'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { permissions, hasPermission , isLoading } = usePermissions()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('reviews')
  const [customDateRange, setCustomDateRange] = useState<{start: Date, end: Date} | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (permissions?.canAccessAnalytics) {
      fetchAnalyticsData()
    }
  }, [timeRange, customDateRange, permissions?.canAccessAnalytics])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange,
        ...(customDateRange && {
          startDate: customDateRange.start.toISOString(),
          endDate: customDateRange.end.toISOString()
        })
      })
      
      const response = await fetch(`/api/analytics?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    if (range !== 'custom') {
      setCustomDateRange(null)
    }
  }

  if (!permissions?.canAccessAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Lock className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Unavailable</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Advanced analytics are available with Pro, Team, or Enterprise plans. 
          Upgrade to unlock detailed insights about your code reviews.
        </p>
        <Button onClick={() => window.location.href = '/pricing'}>
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Now
        </Button>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Unable to load analytics data</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Comprehensive insights into your code review performance
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          
          {timeRange === 'custom' && (
            <DateRangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
            />
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          {permissions?.canAccessAnalytics && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(true)}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade Banner for limited plans */}
      {user?.subscription?.plan === 'PRO' && (
        <UpgradeBanner
          title="Unlock Advanced Analytics"
          description="Upgrade to Team or Enterprise for advanced team analytics, custom reports, and more detailed insights."
          onUpgrade={() => window.location.href = '/pricing'}
        />
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Reviews"
          value={data.overview.totalReviews}
          change={data.overview.growthRate}
          icon={FileText}
          color="blue"
          trend={data.overview.growthRate > 0 ? 'up' : 'down'}
        />
        
        <MetricCard
          title="Average Score"
          value={`${data.overview.averageScore.toFixed(1)}/10`}
          change={2.3}
          icon={Star}
          color="yellow"
          trend="up"
        />
        
        <MetricCard
          title="Success Rate"
          value={`${data.overview.successRate.toFixed(1)}%`}
          change={1.2}
          icon={CheckCircle}
          color="green"
          trend="up"
        />
        
        <MetricCard
          title="Critical Issues"
          value={data.overview.criticalIssues}
          change={-15}
          icon={AlertTriangle}
          color={data.overview.criticalIssues > 0 ? "red" : "green"}
          trend="down"
          invertTrend
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="team">Team Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              title="Review Trends"
              data={data.trends.reviewsOverTime}
              xField="date"
              yField="count"
              color="blue"
              showComparison
            />
            
            <TrendChart
              title="Quality Score Trends"
              data={data.trends.qualityTrend as any}
              xField="date"
              yField="score"
              color="green"
              target={8.0}
            />
          </div>
          
          {/* Repository Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Activity</h3>
            <div className="space-y-4">
              {data.trends.repositoryActivity.map((repo, index) => (
                <div key={repo.repo} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{repo.repo}</p>
                      <p className="text-sm text-gray-500">{repo.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{repo.score.toFixed(1)}/10</p>
                    <Badge variant={repo.score >= 8 ? 'success' : repo.score >= 6 ? 'warning' : 'error'} className="text-xs">
                      {repo.score >= 8 ? 'Excellent' : repo.score >= 6 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Language Usage */}
          <LanguageChart data={data.languages.usage} />
        </TabsContent>
        
        {/* Code Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Excellent (9-10)', count: 45, color: 'bg-green-500' },
                  { label: 'Good (7-8)', count: 32, color: 'bg-blue-500' },
                  { label: 'Fair (5-6)', count: 18, color: 'bg-yellow-500' },
                  { label: 'Poor (0-4)', count: 5, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900">{item.count}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Issues</h3>
              <div className="space-y-3">
                {data.trends.issueTypes.map((issue, index) => (
                  <div key={issue.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{issue.type}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{issue.count}</span>
                      <Badge 
                        variant={
                          issue.severity === 'critical' ? 'error' :
                          issue.severity === 'high' ? 'warning' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Quality Heatmap */}
          <HeatmapChart
            title="Code Quality Heatmap"
            data={data.trends.repositoryActivity}
            xField="repo"
            yField="score"
          />
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecurityMetrics data={data.security} />
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics data={data.performance} />
        </TabsContent>
        
        {/* Team Analytics Tab */}
        <TabsContent value="team" className="space-y-6">
          {user?.subscription?.plan === 'FREE' || user?.subscription?.plan === 'PRO' ? (
            <div className="text-center p-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Analytics Unavailable</h3>
              <p className="text-gray-600 mb-6">
                Team analytics are available with Team or Enterprise plans.
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Team Plan
              </Button>
            </div>
          ) : (
            <TeamPerformance data={data.team} />
          )}
        </TabsContent>
      </Tabs>

      {/* Custom Reports Section */}
      {permissions?.canAccessPremiumFeatures && (
        <CustomReports
          onGenerateReport={(config: any) => {
            // Handle custom report generation
            console.log('Generating custom report:', config)
          }}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportAnalytics
          data={data}
          timeRange={timeRange}
          open={showExport}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}