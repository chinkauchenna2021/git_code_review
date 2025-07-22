import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
export interface UISlice {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>
  modals: {
    createReview: boolean
    inviteTeamMember: boolean
    confirmDelete: boolean
  }
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<UISlice['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  openModal: (modal: keyof UISlice['modals']) => void
  closeModal: (modal: keyof UISlice['modals']) => void
}

export const createUISlice = (set: any, get: any): UISlice => ({
  theme: 'system',
  sidebarOpen: true,
  notifications: [],
  modals: {
    createReview: false,
    inviteTeamMember: false,
    confirmDelete: false
  },

  setTheme: (theme) => {
    set((state: any) => {
      state.theme = theme
    })
    localStorage.setItem('theme', theme)
  },

  toggleSidebar: () => set((state: any) => {
    state.sidebarOpen = !state.sidebarOpen
  }),

  addNotification: (notification) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    set((state: any) => {
      state.notifications.push({ ...notification, id })
    })

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration || 5000)
    }
  },

  removeNotification: (id) => set((state: any) => {
    state.notifications = state.notifications.filter((n: any) => n.id !== id)
  }),

  openModal: (modal) => set((state: any) => {
    state.modals[modal] = true
  }),

  closeModal: (modal) => set((state: any) => {
    state.modals[modal] = false
  })
})
