'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { useAppStore } from '@/store/slices'
import { wsManager } from '@/store/websocket'
// import { ThemeProvider } from './theme.provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      // cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

interface AppProviderProps {
  children: React.ReactNode
  session?: any
}

export function AppProvider({ children, session }: AppProviderProps) {
  const { user, initializeApp, isAuthenticated } = useAppStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize the app
      initializeApp()
      
      // Connect WebSocket
      wsManager.connect(user.id)
    }

    // Cleanup on unmount
    return () => {
      wsManager.disconnect()
    }
  }, [isAuthenticated, user, initializeApp])

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {/* <ThemeProvider> */}
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        {/* </ThemeProvider> */}
      </QueryClientProvider>
    </SessionProvider>
  )
}
