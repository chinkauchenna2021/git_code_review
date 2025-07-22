import { useAppStore } from "../slices";

export const useNotifications = () => useAppStore((state) => ({
  preferences: state.preferences,
  liveNotifications: state.liveNotifications,
  isLoading: state.isLoading,
  fetchPreferences: state.fetchPreferences,
  updatePreferences: state.updatePreferences,
  testNotification: state.testNotification,
  markNotificationRead: state.markNotificationRead,
  clearAllNotifications: state.clearAllNotifications,
  unreadCount: state.liveNotifications.filter(n => !n.read).length
}))