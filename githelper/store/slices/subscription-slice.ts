import { Subscription } from "@/types/store"
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface SubscriptionSlice {
  subscription: Subscription | null
  usage: {
    reviewsUsed: number
    reviewsLimit: number
    repositoriesActive: number
    repositoriesLimit: number
  }
  isLoading: boolean
  
  // Actions
  fetchSubscription: () => Promise<void>
  createCheckoutSession: (priceId: string, plan: string) => Promise<void>
  cancelSubscription: () => Promise<boolean>
  updateBilling: () => Promise<void>
}

export const createSubscriptionSlice = (set: any, get: any): SubscriptionSlice => ({
  subscription: null,
  usage: {
    reviewsUsed: 0,
    reviewsLimit: 50,
    repositoriesActive: 0,
    repositoriesLimit: 1
  },
  isLoading: false,

  fetchSubscription: async () => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch('/api/subscription')
      if (!response.ok) throw new Error('Failed to fetch subscription')
      
      const data = await response.json()
      
      set((state: any) => {
        state.subscription = data.subscription
        state.usage = data.usage
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch subscription error:', error)
    }
  },

  createCheckoutSession: async (priceId, plan) => {
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
      console.error('Create checkout error:', error)
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to cancel subscription')

      await get().fetchSubscription()
      return true
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return false
    }
  },

  updateBilling: async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to create portal session')
      
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      console.error('Update billing error:', error)
    }
  }
})
