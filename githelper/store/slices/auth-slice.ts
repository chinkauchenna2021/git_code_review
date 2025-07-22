
import { User } from '@/types/store'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// =============================================================================
// AUTH SLICE
// =============================================================================
export interface AuthSlice {
  user: User | null
  session: any | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: any) => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
  logout: () => void
}

export const createAuthSlice = (set: any, get: any): AuthSlice => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set((state: any) => {
    state.user = user
    state.isAuthenticated = !!user
  }),

  setSession: (session) => set((state: any) => {
    state.session = session
  }),

  updateUser: async (updates) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update user')

      const { user } = await response.json()
      
      set((state: any) => {
        state.user = { ...state.user, ...user }
      })

      return true
    } catch (error) {
      console.error('Update user error:', error)
      return false
    }
  },

  logout: () => set((state: any) => {
    state.user = null
    state.session = null
    state.isAuthenticated = false
  })
})
