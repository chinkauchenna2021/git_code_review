import { useAppStore } from '../slices'

export const useSubscription = () => useAppStore((state: { subscription: any; usage: { reviewsUsed: number; reviewsLimit: number }; isLoading: any; fetchSubscription: any; createCheckoutSession: any; cancelSubscription: any; updateBilling: any }) => ({
  subscription: state.subscription,
  usage: state.usage,
  isLoading: state.isLoading,
  fetchSubscription: state.fetchSubscription,
  createCheckoutSession: state.createCheckoutSession,
  cancelSubscription: state.cancelSubscription,
  updateBilling: state.updateBilling,
  isAtLimit: state.usage.reviewsUsed >= state.usage.reviewsLimit,
  progressPercentage: (state.usage.reviewsUsed / state.usage.reviewsLimit) * 100
}))