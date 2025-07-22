import { PullRequest, Review } from "@/types/store"
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'


export interface ReviewsSlice {
  reviews: Review[]
  currentReview: Review | null
  pullRequests: PullRequest[]
  currentPR: PullRequest | null
  isLoading: boolean
  isAnalyzing: boolean
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
  
  // Actions
  fetchReviews: (options?: { page?: number; limit?: number; repositoryId?: string; status?: string }) => Promise<void>
  fetchReview: (reviewId: string) => Promise<void>
  createReview: (data: { repositoryId: string; pullRequestNumber: number; pullRequestId: number }) => Promise<string | null>
  deleteReview: (reviewId: string) => Promise<boolean>
  fetchPullRequests: (owner: string, repo: string) => Promise<void>
  fetchPullRequest: (owner: string, repo: string, prNumber: number) => Promise<void>
  startAIAnalysis: (reviewId: string) => Promise<void>
  resetCurrentReview: () => void
}

export const createReviewsSlice = (set: any, get: any): ReviewsSlice => ({
  reviews: [],
  currentReview: null,
  pullRequests: [],
  currentPR: null,
  isLoading: false,
  isAnalyzing: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false
  },

  fetchReviews: async (options = {}) => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const searchParams = new URLSearchParams()
      Object.entries(options).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })

      const response = await fetch(`/api/reviews?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      
      const data = await response.json()
      
      set((state: any) => {
        state.reviews = data.reviews
        state.pagination = data.pagination
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch reviews error:', error)
    }
  },

  fetchReview: async (reviewId) => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch(`/api/reviews/${reviewId}`)
      if (!response.ok) throw new Error('Failed to fetch review')
      
      const review = await response.json()
      
      set((state: any) => {
        state.currentReview = review
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch review error:', error)
    }
  },

  createReview: async (data) => {
    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to create review')
      
      const result = await response.json()
      
      // Refresh reviews list
      await get().fetchReviews()
      
      return result.reviewId
    } catch (error) {
      console.error('Create review error:', error)
      return null
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete review')

      set((state: any) => {
        state.reviews = state.reviews.filter((r: Review) => r.id !== reviewId)
      })

      return true
    } catch (error) {
      console.error('Delete review error:', error)
      return false
    }
  },

  fetchPullRequests: async (owner, repo) => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch(`/api/github/pr/list?owner=${owner}&repo=${repo}`)
      if (!response.ok) throw new Error('Failed to fetch pull requests')
      
      const data = await response.json()
      
      set((state: any) => {
        state.pullRequests = data.pullRequests
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch PRs error:', error)
    }
  },

  fetchPullRequest: async (owner, repo, prNumber) => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch(`/api/github/pr/${prNumber}?owner=${owner}&repo=${repo}`)
      if (!response.ok) throw new Error('Failed to fetch pull request')
      
      const data = await response.json()
      
      set((state: any) => {
        state.currentPR = { ...data.pr, files: data.files }
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch PR error:', error)
    }
  },

  startAIAnalysis: async (reviewId) => {
    set((state: any) => {
      state.isAnalyzing = true
    })

    try {
      const response = await fetch(`/api/ai/analyze/${reviewId}`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to start analysis')
      
      // Poll for completion or use WebSocket for real-time updates
      const checkStatus = async () => {
        const statusResponse = await fetch(`/api/reviews/${reviewId}`)
        const review = await statusResponse.json()
        
        set((state: any) => {
          state.currentReview = review
        })

        if (review.status === 'COMPLETED' || review.status === 'FAILED') {
          set((state: any) => {
            state.isAnalyzing = false
          })
        } else {
          setTimeout(checkStatus, 2000)
        }
      }

      checkStatus()
    } catch (error) {
      set((state: any) => {
        state.isAnalyzing = false
      })
      console.error('AI analysis error:', error)
    }
  },

  resetCurrentReview: () => set((state: any) => {
    state.currentReview = null
    state.currentPR = null
  })
})