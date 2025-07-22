import { useAppStore } from "../slices";

export const useRealTime = () => useAppStore((state: { isConnected: any; connectionStatus: any; activeReviewUpdates: any; connect: any; disconnect: any; subscribeToReview: any; unsubscribeFromReview: any; }) => ({
  isConnected: state.isConnected,
  connectionStatus: state.connectionStatus,
  activeReviewUpdates: state.activeReviewUpdates,
  connect: state.connect,
  disconnect: state.disconnect,
  subscribeToReview: state.subscribeToReview,
  unsubscribeFromReview: state.unsubscribeFromReview
}))