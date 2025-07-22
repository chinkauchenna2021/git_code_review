import { Repository } from "@/types/store"
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface RepositoriesSlice {
  repositories: Repository[]
  selectedRepository: Repository | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchRepositories: () => Promise<void>
  toggleRepository: (repoId: number, isActive: boolean) => Promise<boolean>
  selectRepository: (repository: Repository | null) => void
  syncGitHubRepos: () => Promise<void>
  getRepositoryStats: (repositoryId: string) => Promise<any>
}

export const createRepositoriesSlice = (set: any, get: any): RepositoriesSlice => ({
  repositories: [],
  selectedRepository: null,
  isLoading: false,
  error: null,

  fetchRepositories: async () => {
    set((state: any) => {
      state.isLoading = true
      state.error = null
    })

    try {
      const response = await fetch('/api/github/repos')
      if (!response.ok) throw new Error('Failed to fetch repositories')
      
      const data = await response.json()
      
      set((state: any) => {
        state.repositories = data.repositories
        state.isLoading = false
      })
    } catch (error: any) {
      set((state: any) => {
        state.error = error.message
        state.isLoading = false
      })
    }
  },

  toggleRepository: async (repoId, isActive) => {
    try {
      const response = await fetch(`/api/github/repos/${repoId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) throw new Error('Failed to toggle repository')

      set((state: any) => {
        const repo = state.repositories.find((r: Repository) => r.githubId === repoId)
        if (repo) repo.isActive = isActive
      })

      return true
    } catch (error) {
      console.error('Toggle repository error:', error)
      return false
    }
  },

  selectRepository: (repository) => set((state: any) => {
    state.selectedRepository = repository
  }),

  syncGitHubRepos: async () => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch('/api/github/sync', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to sync repositories')
      
      await get().fetchRepositories()
    } catch (error: any) {
      set((state: any) => {
        state.error = error.message
        state.isLoading = false
      })
    }
  },

  getRepositoryStats: async (repositoryId) => {
    const response = await fetch(`/api/repositories/${repositoryId}/stats`)
    if (!response.ok) throw new Error('Failed to fetch repository stats')
    return response.json()
  }
})
