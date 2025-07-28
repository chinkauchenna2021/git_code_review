'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Crown, X, Zap, BarChart3, Users } from 'lucide-react'

export function UpgradePrompt() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Detailed insights and custom reports'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Multi-user access and team management'
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: '24/7 support with faster response times'
    }
  ]

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Unlock Premium Features
            </h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Free Plan
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-4">
            You're currently on the free plan. Upgrade to access advanced analytics, 
            team features, and priority support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <feature.icon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/pricing'}
            >
              View Plans
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}