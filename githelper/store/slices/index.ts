
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Import all slices
import { createAuthSlice, type AuthSlice } from './auth-slice'
import { createRepositoriesSlice, type RepositoriesSlice } from './repositories-slice'
import { createReviewsSlice, type ReviewsSlice } from './review-slice'
import { createSubscriptionSlice, type SubscriptionSlice } from './subscription-slice'
import { createUISlice, type UISlice } from './ui-slice'
import { createNotificationsSlice, type NotificationsSlice } from './notification-slice'
import { createTeamsSlice, type TeamsSlice } from './team-slice'
import { createRealTimeSlice, type RealTimeSlice } from './realtime-slice'
import { createIntegrationSlice, type IntegrationSlice } from './integration-slice'
import { createAnalyticsSlice, type AnalyticsSlice } from './analytics-slice'

export interface AppState extends 
  AuthSlice,
  RepositoriesSlice,
  ReviewsSlice,
  AnalyticsSlice,
  SubscriptionSlice,
  IntegrationSlice,
  NotificationsSlice,
  TeamsSlice,
  UISlice,
  RealTimeSlice,
  IntegrationSlice {
  
  // Global actions
  initializeApp: () => Promise<void>
  resetStore: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Combine all slices
        ...createAuthSlice(set, get),
        ...createRepositoriesSlice(set, get),
        ...createReviewsSlice(set, get),
        ...createAnalyticsSlice(set, get),
        ...createSubscriptionSlice(set, get),
        ...createNotificationsSlice(set, get),
        ...createTeamsSlice(set, get),
        ...createUISlice(set, get),
        ...createRealTimeSlice(set, get),
        ...createIntegrationSlice(set, get),

        // Global actions
        initializeApp: async () => {
          const state = get() as AppState
          
          if (state.isAuthenticated) {
            // Initialize all necessary data
            await Promise.all([
              state.fetchRepositories(),
              state.fetchSubscription(),
              state.fetchTeams(),
              state.fetchPreferences(),
              state.fetchGitHubInstallations()
            ])

            // Connect to real-time updates
            state.connect()

            // Load theme from localStorage
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
            if (savedTheme) {
              state.setTheme(savedTheme)
            }
          }
        },

        resetStore: () => {
          set((state: any) => {
            // Reset all state to initial values
            return {
              ...state,
              user: null,
              session: null,
              isAuthenticated: false,
              repositories: [],
              reviews: [],
              currentReview: null,
              subscription: null,
              teams: [],
              currentTeam: null,
              data: null,
              notifications: [],
              liveNotifications: [],
              githubInstallations: [],
              apiKeys: []
            }
          })
        }
      }))
    ),
    {
      name: 'devteams-copilot-store',
      partialize: (state: { theme: any; sidebarOpen: any }) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
)

export { createRepositoriesSlice }

function subscribeWithSelector(arg0: any): any {
  throw new Error('Function not implemented.')
}

