'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { cn } from '@/lib/utils/helpers'
import { 
  BarChart3, 
  Code2, 
  FolderGit2, 
  Home, 
  Settings, 
  Users, 
  CreditCard,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'

interface DashboardNavProps {
  open?: boolean
  onClose?: () => void
}

export function DashboardNav({ open = true, onClose }: DashboardNavProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Repositories', href: '/repositories', icon: FolderGit2 },
    { name: 'Reviews', href: '/reviews', icon: Code2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, premium: true },
    { name: 'Team', href: '/team', icon: Users, premium: true },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard }
  ]

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">DevTeams</h1>
            <button
              title="btn"
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const canAccess = !item.premium || user?.subscription?.plan !== 'FREE'
              
              return (
                <Link
                  key={item.name}
                  href={canAccess ? item.href : '/pricing'}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
                    !canAccess && 'opacity-50'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.premium && !canAccess && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Pro
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <img
                src={'/default-avatar.png'}
                alt={user?.githubUsername || 'User'}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.githubUsername || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.subscription?.plan || 'Free'} Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}