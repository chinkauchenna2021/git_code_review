'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { UserMenu } from '@/components/auth/UserMenu'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  DevTeams Copilot
                </h1>
              </div>
              {title && (
                <>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center space-x-2">
                      <span className="text-gray-400">/</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {title}
                      </span>
                    </div>
                  </div>
                  {subtitle && (
                    <div className="hidden lg:block ml-2">
                      <span className="text-sm text-gray-500">
                        {subtitle}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Center - Search (on larger screens) */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="pl-10 pr-3 py-2 w-full"
                placeholder="Search repositories, reviews..."
                type="search"
              />
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {action && (
              <div className="hidden md:block">
                {action}
              </div>
            )}
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
