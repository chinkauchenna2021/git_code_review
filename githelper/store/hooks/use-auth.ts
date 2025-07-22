import { useAppStore } from '../slices'

export const useAuth = () => useAppStore((state: { user: any; session: any; isAuthenticated: any; isLoading: any; setUser: any; setSession: any; updateUser: any; logout: any }) => ({
  user: state.user,
  session: state.session,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  setUser: state.setUser,
  setSession: state.setSession,
  updateUser: state.updateUser,
  logout: state.logout
}))
