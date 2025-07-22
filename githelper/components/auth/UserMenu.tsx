'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useClickOutside } from '@/hooks/use-click-outside'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  ChevronDown,
  Shield,
  Github,
  Bell,
  HelpCircle
} from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef as any, () => setIsOpen(false))

  if (!user) return null

  const menuItems = [
    {
      label: 'Profile',
      href: '/settings/profile',
      icon: User
    },
    {
      label: 'Billing',
      href: '/settings/billing',
      icon: CreditCard
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings
    },
    {
      label: 'Help & Support',
      href: '/help',
      icon: HelpCircle
    }
  ]

  // Add admin menu item for admin users
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
  if (adminEmails.includes(user.email as any)) {
    menuItems.push({
      label: 'Admin',
      href: '/admin',
      icon: Shield
    })
  }

  const handleSignOut = () => {
    setIsOpen(false)
    signOut()
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro': return 'default'
      case 'team': return 'success'
      case 'enterprise': return 'success'
      default: return 'secondary'
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-2 p-2 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar
          src={user.image || undefined}
          alt={user.name || user.email || 'User'}
          fallback={user.name?.[0] || user.email as unknown as string}
          size="sm"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
          <p className="text-xs text-gray-500">{user.subscription?.plan || 'Free'}</p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.image || undefined}
                alt={user.name || user.email || 'User'}
                fallback={user.name?.[0] || user.email as unknown as string}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.githubUsername && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Github className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{user.githubUsername}</p>
                  </div>
                )}
              </div>
              <Badge 
                variant={getPlanBadgeVariant(user.subscription?.plan || 'free')}
                size="sm"
              >
                {user.subscription?.plan || 'Free'}
              </Badge>
            </div>
            
            {/* Usage Info */}
            {user.subscription && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Reviews this month</span>
                  <span>{user.reviewsUsed || 0} / {user.subscription.plan === 'FREE' ? '50' : '∞'}</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ 
                      width: user.subscription.plan === 'FREE' 
                        ? `${Math.min(100, ((user.reviewsUsed || 0) / 50) * 100)}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-3 text-gray-400" />
                {item.label}
              </a>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                window.location.href = '/repositories'
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Github className="w-4 h-4 mr-3 text-gray-400" />
              Manage Repositories
            </button>
            
            {user.subscription?.plan === 'FREE' && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  window.location.href = '/pricing'
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                <CreditCard className="w-4 h-4 mr-3" />
                Upgrade Plan
              </button>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
