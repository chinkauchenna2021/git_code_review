import { AnalyticsData } from "@/types/store"
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'


export interface AnalyticsSlice {
  data: AnalyticsData | null
  isLoading: boolean
  timeframe: '24h' | '7d' | '30d' | '90d'
  
  // Actions
  fetchAnalytics: (timeframe?: string) => Promise<void>
  setTimeframe: (timeframe: '24h' | '7d' | '30d' | '90d') => void
  exportAnalytics: (format: 'json' | 'csv') => Promise<void>
}

export const createAnalyticsSlice = (set: any, get: any): AnalyticsSlice => ({
  data: null,
  isLoading: false,
  timeframe: '7d',

  fetchAnalytics: async (timeframe) => {
    const tf = timeframe || get().timeframe
    
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch(`/api/analytics?timeframe=${tf}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      
      set((state: any) => {
        state.data = data
        state.timeframe = tf
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch analytics error:', error)
    }
  },

  setTimeframe: (timeframe) => {
    set((state: any) => {
      state.timeframe = timeframe
    })
    get().fetchAnalytics(timeframe)
  },

  exportAnalytics: async (format) => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`)
      if (!response.ok) throw new Error('Failed to export analytics')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${get().timeframe}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export analytics error:', error)
    }
  }
})
