import { useAppStore } from '../slices'

export const useUI = () => useAppStore((state: { theme: any; sidebarOpen: any; notifications: any; modals: any; setTheme: any; toggleSidebar: any; addNotification: any; removeNotification: any; openModal: any; closeModal: any }) => ({
  theme: state.theme,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications,
  modals: state.modals,
  setTheme: state.setTheme,
  toggleSidebar: state.toggleSidebar,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  openModal: state.openModal,
  closeModal: state.closeModal
}))
