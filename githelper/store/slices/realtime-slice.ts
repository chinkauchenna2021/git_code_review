import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface RealTimeSlice {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  activeReviewUpdates: Record<string, {
    status: string
    progress: number
    currentStep: string
    estimatedCompletion: number
  }>
  liveNotifications: Array<{
    id: string
    type: 'review_completed' | 'critical_issue' | 'team_update' | 'system_alert'
    data: any
    timestamp: Date
    read: boolean
  }>
  
  // Actions
  connect: () => void
  disconnect: () => void
  subscribeToReview: (reviewId: string) => void
  unsubscribeFromReview: (reviewId: string) => void
  markNotificationRead: (id: string) => void
  clearAllNotifications: () => void
}

export const createRealTimeSlice = (set: any, get: any): RealTimeSlice => ({
  isConnected: false,
  connectionStatus: 'disconnected',
  activeReviewUpdates: {},
  liveNotifications: [],

  connect: () => {
    // WebSocket connection logic would go here
    set((state: any) => {
      state.connectionStatus = 'connecting'
    })

    // Simulate connection for demo
    setTimeout(() => {
      set((state: any) => {
        state.isConnected = true
        state.connectionStatus = 'connected'
      })
    }, 1000)
  },

  disconnect: () => {
    set((state: any) => {
      state.isConnected = false
      state.connectionStatus = 'disconnected'
      state.activeReviewUpdates = {}
    })
  },

  subscribeToReview: (reviewId) => {
    // Subscribe to real-time review updates
    set((state: any) => {
      state.activeReviewUpdates[reviewId] = {
        status: 'analyzing',
        progress: 0,
        currentStep: 'Initializing analysis...',
        estimatedCompletion: Date.now() + 30000
      }
    })
  },

  unsubscribeFromReview: (reviewId) => {
    set((state: any) => {
      delete state.activeReviewUpdates[reviewId]
    })
  },

  markNotificationRead: (id) => set((state: any) => {
    const notification = state.liveNotifications.find((n: any) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }),

  clearAllNotifications: () => set((state: any) => {
    state.liveNotifications = []
  })
})