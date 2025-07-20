import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string
}

interface Usage {
  reviewsUsed: number
  reviewsLimit: number
  repositoriesActive: number
}

export function useSubscription() {
  const { session } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchSubscription = async () => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/subscription')
      if (!response.ok) throw new Error('Failed to fetch subscription')
      
      const data = await response.json()
      setSubscription(data.subscription)
      setUsage(data.usage)
    } catch (error) {
      console.error('Subscription fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string, plan: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan })
      })

      if (!response.ok) throw new Error('Failed to create checkout session')
      
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  useEffect(() => {
    if (session) {
      fetchSubscription()
    }
  }, [session])

  return {
    subscription,
    usage,
    loading,
    refetch: fetchSubscription,
    createCheckoutSession,
    isAtLimit: usage ? usage.reviewsUsed >= usage.reviewsLimit : false,
    progressPercentage: usage ? (usage.reviewsUsed / usage.reviewsLimit) * 100 : 0
  }
}