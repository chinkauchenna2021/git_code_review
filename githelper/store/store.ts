import { create  } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Import all slices
import { createAuthSlice, type AuthSlice } from './slices/auth-slice'
import { createRepositoriesSlice, type RepositoriesSlice } from './slices/repositories-slice'
import { createReviewsSlice, type ReviewsSlice } from './slices/review-slice'
import { createSubscriptionSlice, type SubscriptionSlice } from './slices/subscription-slice'
import { createUISlice, type UISlice } from './slices/ui-slice'
import { createNotificationsSlice, type NotificationsSlice } from './slices/notification-slice'
import { createTeamsSlice, type TeamsSlice } from './slices/team-slice'
import { createRealTimeSlice, type RealTimeSlice } from './slices/realtime-slice'
import { createIntegrationSlice, type IntegrationSlice } from './slices/integration-slice'
import { createAnalyticsSlice, type AnalyticsSlice } from './slices/analytics-slice'
// Main app state interface
export interface AppState extends 
  AuthSlice,
  RepositoriesSlice,
  ReviewsSlice,
  AnalyticsSlice,
  SubscriptionSlice,
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
            // Initialize all necessary data in parallel
            await Promise.allSettled([
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
          set(() => ({
            // Reset all state to initial values
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
            apiKeys: [],
            isConnected: false,
            connectionStatus: 'disconnected' as const,
            activeReviewUpdates: {},
            modals: {
              createReview: false,
              inviteTeamMember: false,
              confirmDelete: false
            }
          }))
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
