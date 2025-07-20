import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface AnalyticsData {
  summary: {
    totalReviews: number
    activeRepositories: number
    averageReviewsPerDay: number
  }
  recentReviews: Array<{
    id: string
    repositoryName: string
    pullRequestNumber: number
    status: string
    createdAt: string
  }>
  chartData: Array<{
    date: string
    count: number
  }>
}

export function useAnalytics(timeframe: '7d' | '30d' = '7d') {
  const { session } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session, timeframe])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  }
}
