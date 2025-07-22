'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/helpers'
import { useAuth, usePermissions } from '@/lib/hooks/use-auth'
import { Badge } from '@/components/ui/Badge'
import {
  BarChart3,
  Code2,
  FolderGit2,
  Home,
  Settings,
  Users,
  CreditCard,
  Zap,
  Shield,
  Menu,
  X,
  ChevronDown,
  GitBranch,
  Activity,
  Bell,
  BookOpen
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
  requiresPremium?: boolean
  requiredPlan?: 'PRO' | 'TEAM' | 'ENTERPRISE'
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Repositories',
    href: '/repositories',
    icon: FolderGit2,
    children: [
      { name: 'All Repositories', href: '/repositories', icon: FolderGit2 },
      { name: 'Active Reviews', href: '/repositories/active', icon: Activity },
      { name: 'Settings', href: '/repositories/settings', icon: Settings }
    ]
  },
  {
    name: 'Reviews',
    href: '/reviews',
    icon: Code2,
    children: [
      { name: 'All Reviews', href: '/reviews', icon: Code2 },
      { name: 'Pull Requests', href: '/reviews/pull-requests', icon: GitBranch },
      { name: 'History', href: '/reviews/history', icon: Activity }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    requiresPremium: true,
    requiredPlan: 'PRO'
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
    requiresPremium: true,
    requiredPlan: 'TEAM',
    children: [
      { name: 'Members', href: '/team/members', icon: Users },
      { name: 'Invitations', href: '/team/invitations', icon: Bell },
      { name: 'Permissions', href: '/team/permissions', icon: Shield }
    ]
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Profile', href: '/settings/profile', icon: Settings },
      { name: 'Integrations', href: '/settings/integrations', icon: Zap },
      { name: 'Notifications', href: '/settings/notifications', icon: Bell },
      { name: 'Billing', href: '/settings/billing', icon: CreditCard }
    ]
  }
]

export function DashboardNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { user } = useAuth()
  const { hasPermission } = usePermissions()

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isCurrentPage = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const canAccessItem = (item: NavItem) => {
    if (!item.requiresPremium) return true
    
    const userPlan = user?.subscription?.plan || 'FREE'
    const planHierarchy = ['FREE', 'PRO', 'TEAM', 'ENTERPRISE']
    const userPlanIndex = planHierarchy.indexOf(userPlan)
    const requiredPlanIndex = planHierarchy.indexOf(item.requiredPlan || 'PRO')
    
    return userPlanIndex >= requiredPlanIndex
  }

  const NavLink = ({ item, isChild = false }: { item: NavItem; isChild?: boolean }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.href)
    const isCurrent = isCurrentPage(item.href)
    const canAccess = canAccessItem(item)

    return (
      <div>
        <div
          className={cn(
            'group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer',
            isChild ? 'pl-8' : '',
            isCurrent 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
            !canAccess && 'opacity-50'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.href)
            } else if (canAccess) {
              window.location.href = item.href
            }
          }}
        >
          <item.icon
            className={cn(
              'mr-3 flex-shrink-0 h-5 w-5',
              isCurrent ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
            )}
          />
          <span className="flex-1">{item.name}</span>
          
          {item.badge && (
            <Badge variant="secondary" size="sm">
              {item.badge}
            </Badge>
          )}
          
          {!canAccess && item.requiresPremium && (
            <Badge variant="warning" size="sm">
              {item.requiredPlan}
            </Badge>
          )}
          
          {hasChildren && (
            <ChevronDown
              className={cn(
                'ml-2 h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavLink key={child.href} item={child} isChild />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
          title="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-3 space-y-1">
              {navigation.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
          
          {/* User subscription info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {user?.subscription?.plan || 'Free'} Plan
                </span>
                <Badge 
                  variant={user?.subscription?.status === 'ACTIVE' ? 'success' : 'warning'}
                  size="sm"
                >
                  {user?.subscription?.status || 'Active'}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                {user?.reviewsUsed || 0} reviews used this month
              </div>
              {user?.subscription?.plan === 'FREE' && (
                <button
                  onClick={() => window.location.href = '/pricing'}
                  className="mt-2 w-full text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
       title="Close menu"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  )
}