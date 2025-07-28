'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Check, Zap, Users, Crown } from 'lucide-react'

interface PlanComparisonProps {
  currentPlan: string
  onSelectPlan: (planId: string) => void
  loading?: boolean
  className?: string
}

export function PlanComparison({ currentPlan, onSelectPlan, loading = false, className }: PlanComparisonProps) {
  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      icon: Zap,
      color: 'blue',
      features: [
        '500 reviews/month',
        '10 repositories',
        'Advanced AI analysis',
        'Custom rules',
        'Email support'
      ]
    },
    {
      id: 'team',
      name: 'Team',
      price: 99,
      icon: Users,
      color: 'purple',
      popular: true,
      features: [
        'Unlimited reviews',
        'Unlimited repositories',
        'Team collaboration',
        'Advanced analytics',
        'Priority support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      icon: Crown,
      color: 'yellow',
      features: [
        'Everything in Team',
        'SSO integration',
        'On-premise deployment',
        'Custom integrations',
        '24/7 phone support'
      ]
    }
  ]

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-500'
      case 'purple': return 'text-purple-500'
      case 'yellow': return 'text-yellow-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
        <p className="text-gray-600">Upgrade to unlock more features and higher limits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 border-2 rounded-lg transition-all ${
              plan.popular 
                ? 'border-purple-500 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            } ${currentPlan.toUpperCase() === plan.name.toUpperCase() ? 'bg-gray-50' : 'bg-white'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-purple-500">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="text-center mb-6">
              <plan.icon className={`w-8 h-8 mx-auto mb-3 ${getIconColor(plan.color)}`} />
              <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
              <div className="text-3xl font-bold text-gray-900">
                ${plan.price}
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => onSelectPlan(plan.id)}
              disabled={loading || currentPlan.toUpperCase() === plan.name.toUpperCase()}
              className={`w-full ${
                plan.popular 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : ''
              }`}
              variant={currentPlan.toUpperCase() === plan.name.toUpperCase() ? 'outline' : 'default'}
            >
              {loading ? 'Processing...' : 
               currentPlan.toUpperCase() === plan.name.toUpperCase() ? 'Current Plan' : 
               `Upgrade to ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>All plans include a 14-day free trial. Cancel anytime.</p>
      </div>
    </div>
  )
}