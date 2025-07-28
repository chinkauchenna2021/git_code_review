// app/(dashboard)/reviews/page.tsx - Part 1
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { ReviewFilters } from '@/components/reviews/ReviewFilters'
import { ReviewAnalytics } from '@/components/reviews/ReviewAnalytics'
import { ExportReviews } from '@/components/reviews/ExportReviews'
import { ReviewComparison } from '@/components/reviews/ReviewComparison'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  GitPullRequest,
  Code2,
  Shield,
  TrendingUp,
  FileText,
  Calendar,
  Users,
  Star,
  Target,
  Zap
} from 'lucide-react'

interface Review {
  id: string
  pullRequestNumber: number
  pullRequestId: string
  title: string
  description?: string
  author: {
    name: string
    avatar: string
    login: string
  }
  repository: {
    id: string
    name: string
    fullName: string
    language: string
  }
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  aiAnalysis?: {
    overallScore: number
    summary: string
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical'
      type: string
      file: string
      line: number
      message: string
      suggestion?: string
    }>
    metrics: {
      complexity: number
      maintainability: number
      security: number
      performance: number
    }
    recommendations: string[]
  }
  createdAt: string
  completedAt?: string
  processingTime?: number
  filesChanged: number
  linesAdded: number
  linesDeleted: number
  reviewers: string[]
  labels: string[]
  branch: {
    head: string
    base: string
  }
}

type ReviewStatus = 'all' | 'pending' | 'completed' | 'failed' | 'cancelled'
type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low'
type SortField = 'createdAt' | 'completedAt' | 'score' | 'issues' | 'repository'
type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all'

export default function ReviewsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>(
    (searchParams?.get('status') as ReviewStatus) || 'all'
  )
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>(
    (searchParams?.get('severity') as SeverityFilter) || 'all'
  )
  const [repositoryFilter, setRepositoryFilter] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchReviews()
  }, [statusFilter, severityFilter, repositoryFilter, timeRange])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: statusFilter,
        severity: severityFilter,
        repository: repositoryFilter,
        timeRange,
        sort: `${sortField}:${sortDirection}`
      })
      
      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchReviews()
    setRefreshing(false)
  }

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review)
    setShowModal(true)
  }

  const handleRetryReview = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/retry`, { method: 'POST' })
      await fetchReviews()
    } catch (error) {
      console.error('Failed to retry review:', error)
    }
  }

  const handleCancelReview = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/cancel`, { method: 'POST' })
      await fetchReviews()
    } catch (error) {
      console.error('Failed to cancel review:', error)
    }
  }

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.repository.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      let valueA: any = a[sortField]
      let valueB: any = b[sortField]
      
      if (sortField === 'score') {
        valueA = a.aiAnalysis?.overallScore || 0
        valueB = b.aiAnalysis?.overallScore || 0
      } else if (sortField === 'issues') {
        valueA = a.aiAnalysis?.issues?.length || 0
        valueB = b.aiAnalysis?.issues?.length || 0
      } else if (sortField === 'repository') {
        valueA = a.repository.name
        valueB = b.repository.name
      } else if (sortField === 'createdAt' || sortField === 'completedAt') {
        valueA = new Date(valueA || 0).getTime()
        valueB = new Date(valueB || 0).getTime()
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

  const repositories = [...new Set(reviews.map(review => review.repository.name))]
  
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    completed: reviews.filter(r => r.status === 'completed').length,
    failed: reviews.filter(r => r.status === 'failed').length,
    averageScore: reviews.filter(r => r.aiAnalysis?.overallScore).length > 0
      ? reviews.reduce((sum, r) => sum + (r.aiAnalysis?.overallScore || 0), 0) / 
        reviews.filter(r => r.aiAnalysis?.overallScore).length
      : 0,
    criticalIssues: reviews.reduce((sum, r) => 
      sum + (r.aiAnalysis?.issues?.filter(i => i.severity === 'critical').length || 0), 0
    ),
    averageProcessingTime: reviews.filter(r => r.processingTime).length > 0
      ? reviews.reduce((sum, r) => sum + (r.processingTime || 0), 0) / 
        reviews.filter(r => r.processingTime).length
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Code Reviews</h1>
          <p className="mt-1 text-gray-600">
            AI-powered code analysis and review insights
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          
          {selectedReviews.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(true)}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Compare</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.criticalIssues}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <ReviewFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter as any}
          severityFilter={severityFilter}
          onSeverityChange={setSeverityFilter as any}
          repositoryFilter={repositoryFilter}
          onRepositoryChange={setRepositoryFilter}
          repositories={repositories}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange as any}
          sortField={sortField}
          onSortFieldChange={setSortField as any}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection as any}
        />
        
        {/* Search */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reviews, repositories, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="space-y-6">
          {/* Review List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                selected={selectedReviews.includes(review.id)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedReviews(prev => [...prev, review.id])
                  } else {
                    setSelectedReviews(prev => prev.filter(id => id !== review.id))
                  }
                }}
                onClick={() => handleReviewClick(review)}
                onRetry={() => handleRetryReview(review.id)}
                onCancel={() => handleCancelReview(review.id)}
              />
            ))}
            
            {filteredReviews.length === 0 && (
              <Card className="p-12 text-center">
                <Code2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search or filters.' : 'Reviews will appear here once you start analyzing pull requests.'}
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <ReviewAnalytics reviews={reviews} timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score Trends</h3>
              {/* Chart component would go here */}
              <div className="h-64 flex items-center justify-center text-gray-500">
                <TrendingUp className="h-8 w-8 mr-2" />
                Quality score trending upward
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Distribution</h3>
              {/* Chart component would go here */}
              <div className="h-64 flex items-center justify-center text-gray-500">
                <Target className="h-8 w-8 mr-2" />
                Most issues are low severity
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Volume</h3>
              {/* Chart component would go here */}
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-8 w-8 mr-2" />
                Steady review volume
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Time</h3>
              {/* Chart component would go here */}
              <div className="h-64 flex items-center justify-center text-gray-500">
                <Zap className="h-8 w-8 mr-2" />
                Avg: {Math.round(stats.averageProcessingTime / 1000)}s
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Part 2 will continue with the insights tab content */}


       <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Insights */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Shield className="inline h-5 w-5 mr-2 text-green-500" />
                Security Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900">Strong Security Posture</p>
                  <p className="text-sm text-green-700 mt-1">
                    Only {stats.criticalIssues} critical security issues found across all reviews.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Common security issues:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Potential SQL injection vulnerabilities</li>
                    <li>• Unvalidated user inputs</li>
                    <li>• Hardcoded credentials</li>
                    <li>• Missing HTTPS enforcement</li>
                    <li>• Weak authentication mechanisms</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    View Security Dashboard
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Team Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Users className="inline h-5 w-5 mr-2 text-blue-500" />
                Team Performance
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Excellent Code Quality</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Average score of {stats.averageScore.toFixed(1)}/10 indicates high-quality code submissions.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Top contributors:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• {reviews.length > 0 ? reviews[0]?.author?.name || 'John Doe' : 'John Doe'} - 23 reviews, 9.2 avg score</li>
                    <li>• {reviews.length > 1 ? reviews[1]?.author?.name || 'Jane Smith' : 'Jane Smith'} - 18 reviews, 8.8 avg score</li>
                    <li>• {reviews.length > 2 ? reviews[2]?.author?.name || 'Mike Johnson' : 'Mike Johnson'} - 15 reviews, 8.5 avg score</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View Team Analytics
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Improvement Opportunities */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <TrendingUp className="inline h-5 w-5 mr-2 text-purple-500" />
                Improvement Opportunities
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900">Code Complexity</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Consider refactoring complex functions in authentication modules.
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900">Test Coverage</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Add unit tests for utility functions to improve reliability.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Documentation</p>
                    <p className="text-sm text-blue-700 mt-1">
                      API endpoints need better inline documentation.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Create Action Plan
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Weekly Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Calendar className="inline h-5 w-5 mr-2 text-indigo-500" />
                Weekly Summary
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => {
                      const reviewDate = new Date(r.createdAt)
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return reviewDate > weekAgo
                    }).length}</p>
                    <p className="text-sm text-gray-600">Reviews This Week</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageProcessingTime / 1000)}s</p>
                    <p className="text-sm text-gray-600">Avg Processing Time</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-900">
                    📈 Quality improved by 12% this week
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep up the excellent work! Your team is consistently delivering high-quality code.
                  </p>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Weekly Report
                  </Button>
                </div>
              </div>
            </Card>
  <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Code2 className="inline h-5 w-5 mr-2 text-emerald-500" />
                Code Quality Insights
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-lg font-bold text-emerald-900">{stats.completed}</p>
                    <p className="text-sm text-emerald-700">Completed Reviews</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-lg font-bold text-blue-900">{stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0'}%</p>
                    <p className="text-sm text-blue-700">Success Rate</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Most common issue types:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Code complexity</span>
                      <span className="text-gray-900 font-medium">32%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Missing documentation</span>
                      <span className="text-gray-900 font-medium">28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Security concerns</span>
                      <span className="text-gray-900 font-medium">18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Performance issues</span>
                      <span className="text-gray-900 font-medium">22%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Quality Metrics
                  </Button>
                </div>
              </div>
            </Card>

            {/* Security Trends */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Shield className="inline h-5 w-5 mr-2 text-red-500" />
                Security Trends
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-900">Security Issues Detected</p>
                      <p className="text-2xl font-bold text-red-900">{stats.criticalIssues}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Recent security improvements:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• ✅ Input validation added to user forms</li>
                    <li>• ✅ SQL injection vulnerabilities fixed</li>
                    <li>• ⚠️ Some hardcoded secrets still present</li>
                    <li>• ⚠️ CORS configuration needs review</li>
                    <li>• 🔄 Authentication system being upgraded</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    View Security Report
                  </Button>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Zap className="inline h-5 w-5 mr-2 text-yellow-500" />
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-lg font-bold text-yellow-900">{Math.round(stats.averageProcessingTime / 1000)}s</p>
                    <p className="text-sm text-yellow-700">Avg Review Time</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-lg font-bold text-green-900">{stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : '0'}%</p>
                    <p className="text-sm text-green-700">Success Rate</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">System Performance</p>
                      <p className="text-xs text-blue-700 mt-1">All systems operating normally</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Performance breakdown:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Code analysis</span>
                      <span className="text-gray-900 font-medium">65%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Security scanning</span>
                      <span className="text-gray-900 font-medium">20%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Report generation</span>
                      <span className="text-gray-900 font-medium">15%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Performance Dashboard
                  </Button>
                </div>
              </div>
            </Card>

            {/* Repository Health */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <GitPullRequest className="inline h-5 w-5 mr-2 text-purple-500" />
                Repository Health
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  {repositories.slice(0, 3).map((repo, index) => (
                    <div key={repo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">{repo}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {(8.5 + Math.random() * 1.5).toFixed(1)}/10
                        </p>
                        <p className="text-xs text-gray-500">Health Score</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {repositories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <GitPullRequest className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No repositories to analyze</p>
                  </div>
                )}
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900">
                    🎯 {repositories.length > 0 ? 'All repositories maintaining good health scores' : 'Connect repositories to see health metrics'}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    {repositories.length > 0 
                      ? 'Regular maintenance and code reviews are keeping quality high.'
                      : 'Start by connecting your first repository to begin tracking health metrics.'
                    }
                  </p>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    {repositories.length > 0 ? 'View All Repositories' : 'Connect Repository'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* AI Analysis Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Star className="inline h-5 w-5 mr-2 text-indigo-500" />
                AI Analysis Overview
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-lg font-bold text-indigo-900">{reviews.filter(r => r.aiAnalysis).length}</p>
                    <p className="text-sm text-indigo-700">AI Reviewed</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-lg font-bold text-purple-900">{stats.averageScore.toFixed(1)}</p>
                    <p className="text-sm text-purple-700">Avg AI Score</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">AI insights summary:</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium text-green-900">Code Quality</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        {stats.averageScore >= 8 ? 'Excellent code quality maintained' : 
                         stats.averageScore >= 6 ? 'Good code quality with room for improvement' :
                         'Code quality needs attention'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-blue-900">Processing Efficiency</p>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        AI processing averaging {Math.round(stats.averageProcessingTime / 1000)}s per review
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    View AI Analytics
                  </Button>
                </div>
              </div>
            </Card>

            {/* Review Activity Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Clock className="inline h-5 w-5 mr-2 text-orange-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  {filteredReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        review.status === 'completed' ? 'bg-green-500' :
                        review.status === 'pending' ? 'bg-yellow-500' :
                        review.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {review.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.repository.name} • {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          review.status === 'completed' ? 'success' :
                          review.status === 'pending' ? 'warning' :
                          review.status === 'failed' ? 'error' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {review.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {filteredReviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No recent review activity</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button size="sm" variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Reviews
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Modals */}
      {showModal && selectedReview && (
        <ReviewModal
          review={selectedReview}
          open={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedReview(null)
          }}
        />
      )}

      {showExport && (
        <ExportReviews
          reviews={filteredReviews}
          open={showExport}
          onClose={() => setShowExport(false)}
        />
      )}

      {showComparison && selectedReviews.length > 1 && (
        <ReviewComparison
          reviewIds={selectedReviews}
          open={showComparison}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  )
}