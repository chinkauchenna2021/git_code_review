'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Plus, 
  GitBranch, 
  Settings, 
  Download, 
  Upload,
  RefreshCw,
  Zap
} from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      title: 'Connect Repository',
      description: 'Add a new repository to start reviewing',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => window.location.href = '/repositories'
    },
    {
      title: 'View Reviews',
      description: 'Check recent code review results',
      icon: GitBranch,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => window.location.href = '/reviews'
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => window.location.href = '/settings'
    },
    {
      title: 'Export Data',
      description: 'Download your review data',
      icon: Download,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {/* Handle export */}
    },
    {
      title: 'Sync Repositories',
      description: 'Refresh repository data',
      icon: RefreshCw,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => {/* Handle sync */}
    },
    {
      title: 'Upgrade Plan',
      description: 'Unlock more features',
      icon: Zap,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => window.location.href = '/pricing'
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white`}>
              <action.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{action.title}</p>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
