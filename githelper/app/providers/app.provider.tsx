'use client'

import { useEffect } from 'react'
import { SessionProvider , getSession} from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import {HeroUIProvider} from "@heroui/react";

import { useAppStore } from '@/store/slices'
import { wsManager } from '@/store/websocket'
import { Session } from 'next-auth'
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
}

export function AppProvider({ children}: AppProviderProps) {
  // const { user, initializeApp, isAuthenticated } = useAppStore()
  const session = getSession()
  return (
    <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
        {/* <ThemeProvider> */}
        <SessionProvider session={session as any}>
          {children}
        </SessionProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        {/* </ThemeProvider> */}
        </HeroUIProvider>
      </QueryClientProvider>
  )
}
