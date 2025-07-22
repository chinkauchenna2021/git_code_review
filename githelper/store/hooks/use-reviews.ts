import { useAppStore } from '../slices'

export const useReviews = () => useAppStore((state: { reviews: any; currentReview: any; pullRequests: any; currentPR: any; isLoading: any; isAnalyzing: any; pagination: any; fetchReviews: any; fetchReview: any; createReview: any; deleteReview: any; fetchPullRequests: any; fetchPullRequest: any; startAIAnalysis: any; resetCurrentReview: any }) => ({
  reviews: state.reviews,
  currentReview: state.currentReview,
  pullRequests: state.pullRequests,
  currentPR: state.currentPR,
  isLoading: state.isLoading,
  isAnalyzing: state.isAnalyzing,
  pagination: state.pagination,
  fetchReviews: state.fetchReviews,
  fetchReview: state.fetchReview,
  createReview: state.createReview,
  deleteReview: state.deleteReview,
  fetchPullRequests: state.fetchPullRequests,
  fetchPullRequest: state.fetchPullRequest,
  startAIAnalysis: state.startAIAnalysis,
  resetCurrentReview: state.resetCurrentReview
}))