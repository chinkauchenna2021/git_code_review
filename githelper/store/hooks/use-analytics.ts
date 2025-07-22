import { useAppStore } from "../slices";

export const useAnalytics = () => useAppStore((state: { data: any; isLoading: any; timeframe: any; fetchAnalytics: any; setTimeframe: any; exportAnalytics: any; }) => ({
  data: state.data,
  isLoading: state.isLoading,
  timeframe: state.timeframe,
  fetchAnalytics: state.fetchAnalytics,
  setTimeframe: state.setTimeframe,
  exportAnalytics: state.exportAnalytics
}))
