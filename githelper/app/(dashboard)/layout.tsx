// app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Toast } from '@/components/ui/Toast'
import { OnboardingModal } from '@/components/dashboard/OnboardingModal'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { CommandPalette } from '@/components/dashboard/CommandPalette'
import { NotificationCenter } from '@/components/dashboard/NotificationCenter'
import { usageTracking } from '@/lib/analytics/usage-tracking'
import { Bell, Command, Search, Settings, HelpCircle } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [realtimeData, setRealtimeData] = useState(null)

  // Track page views for analytics
  useEffect(() => {
    if (user) {
      usageTracking.trackPageView(pathname, user.id)
    }
  }, [pathname, user])

  // Check if user needs onboarding
  useEffect(() => {
    if (user) {
      setShowOnboarding(true)
    }
  }, [user])

  // Set up real-time updates
  useEffect(() => {
    if (user) {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/dashboard`)
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setRealtimeData(data)
      }

      return () => ws.close()
    }
  }, [user])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setShowCommandPalette(true)
            break
          case 'n':
            e.preventDefault()
            setShowNotifications(true)
            break
          case '/':
            e.preventDefault()
            // Focus search
            document.querySelector<HTMLInputElement>('[data-search-input]')?.focus()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/dashboard': 'Overview',
      '/dashboard/repositories': 'Repositories',
      '/dashboard/reviews': 'Code Reviews',
      '/dashboard/analytics': 'Analytics',
      '/dashboard/team': 'Team Management',
      '/dashboard/settings': 'Settings',
      '/dashboard/billing': 'Billing & Usage'
    }
    return titles[pathname] || 'Dashboard'
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + segments.slice(0, index + 1).join('/'),
      current: index === segments.length - 1
    }))
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null // Auth middleware will redirect
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <DashboardNav 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={() => setShowCommandPalette(true)}
          onNotificationsClick={() => setShowNotifications(true)}
        />

        {/* Breadcrumbs */}
        <div className="px-6 py-2 border-b border-gray-200 bg-white">
          <Breadcrumbs items={getBreadcrumbs()} />
        </div>

        {/* Upgrade prompt for free users */}
        {user.subscription?.plan === 'FREE' && pathname.includes('analytics') && (
          <UpgradePrompt />
        )}

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>

          {/* Activity feed sidebar (on larger screens) */}
          <aside className="hidden xl:flex xl:w-80 xl:flex-col border-l border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
            </div>
            <ActivityFeed userId={user.id} className="flex-1 overflow-y-auto p-4" />
          </aside>
        </div>
      </div>

      {/* Modals */}
      {showOnboarding && (
        <OnboardingModal
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            setShowOnboarding(false)
            // Update user onboarding status
          }}
        />
      )}

      {showCommandPalette && (
        <CommandPalette
          open={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
          userId={user.id}
        />
      )}

      {/* Toast notifications */}
      <Toast id={''} message={' '} onDismiss={function (id: string): void {
        throw new Error('Function not implemented.')
      } } />
    </div>
  )
}