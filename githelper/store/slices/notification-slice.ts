import { NotificationPreferences } from "@/types/store"
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface NotificationsSlice {
  preferences: NotificationPreferences
  isLoading: boolean
  
  // Actions
  fetchPreferences: () => Promise<void>
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<boolean>
  testNotification: (type: 'email' | 'slack' | 'discord') => Promise<boolean>
}

export const createNotificationsSlice = (set: any, get: any): NotificationsSlice => ({
  preferences: {
    email: {
      reviewCompleted: true,
      criticalIssues: true,
      weeklyReports: true,
      teamUpdates: true
    },
    slack: {
      enabled: false,
      webhookUrl: null,
      channelId: null
    },
    discord: {
      enabled: false,
      webhookUrl: null
    }
  },
  isLoading: false,

  fetchPreferences: async () => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) throw new Error('Failed to fetch preferences')
      
      const data = await response.json()
      
      set((state: any) => {
        state.preferences = data
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch preferences error:', error)
    }
  },

  updatePreferences: async (updates) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      set((state: any) => {
        state.preferences = { ...state.preferences, ...updates }
      })

      return true
    } catch (error) {
      console.error('Update preferences error:', error)
      return false
    }
  },

  testNotification: async (type) => {
    try {
      const response = await fetch(`/api/notifications/test/${type}`, {
        method: 'POST'
      })

      return response.ok
    } catch (error) {
      console.error('Test notification error:', error)
      return false
    }
  }
})
