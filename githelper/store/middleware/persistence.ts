import { StateCreator } from 'zustand'
import { PersistOptions, persist } from 'zustand/middleware'

interface PersistentState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  recentSearches: string[]
  userPreferences: Record<string, any>
}

export const createPersistenceMiddleware = <T extends PersistentState>(
  name: string,
  options?: Partial<PersistOptions<T>>
) => {
  return persist<T>(
    (set, get, api) => ({
      theme: 'system',
      sidebarOpen: true,
      recentSearches: [],
      userPreferences: {},
      ...options?.partialize?.(get() as T),
    } as T),
    {
      name,
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        recentSearches: state.recentSearches,
        userPreferences: state.userPreferences,
      }),
      ...options,
    }
  ) as any
}