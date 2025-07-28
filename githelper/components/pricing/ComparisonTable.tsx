'use client'

import React from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PlanFeature {
  feature: string
  free: boolean | string
  pro: boolean | string
  team: boolean | string
  enterprise: boolean | string
}

const features: PlanFeature[] = [
  { feature: 'Monthly Reviews', free: '50', pro: '500', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Repositories', free: '1', pro: '10', team: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'GitHub Integration', free: true, pro: true, team: true, enterprise: true },
  { feature: 'Basic AI Analysis', free: true, pro: true, team: true, enterprise: true },
  { feature: 'Security Scanning', free: 'Basic', pro: 'Advanced', team: 'Advanced', enterprise: 'Enterprise' },
  { feature: 'Custom Rules', free: false, pro: true, team: true, enterprise: true },
  { feature: 'Team Analytics', free: false, pro: false, team: true, enterprise: true },
  { feature: 'Advanced Reports', free: false, pro: true, team: true, enterprise: true },
  { feature: 'API Access', free: false, pro: true, team: true, enterprise: true },
  { feature: 'Webhook Integration', free: false, pro: false, team: true, enterprise: true },
  { feature: 'SSO Integration', free: false, pro: false, team: false, enterprise: true },
  { feature: 'On-premise Deployment', free: false, pro: false, team: false, enterprise: true },
  { feature: 'Support Level', free: 'Community', pro: 'Email', team: 'Priority', enterprise: '24/7 Phone' }
]

interface ComparisonTableProps {
  plans: any[]
}

export function ComparisonTable({ plans }: ComparisonTableProps) {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      )
    }
    return <span className="text-sm text-gray-900">{value}</span>
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compare All Features
          </h2>
          <p className="text-gray-600">
            See exactly what's included in each plan
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                <th className="text-center p-6 font-semibold text-gray-900">Free</th>
                <th className="text-center p-6 font-semibold text-gray-900 bg-blue-50">
                  Pro
                  <div className="text-xs font-normal text-blue-600 mt-1">Most Popular</div>
                </th>
                <th className="text-center p-6 font-semibold text-gray-900">Team</th>
                <th className="text-center p-6 font-semibold text-gray-900">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-6 font-medium text-gray-900">{feature.feature}</td>
                  <td className="p-6 text-center">{renderFeatureValue(feature.free)}</td>
                  <td className="p-6 text-center bg-blue-50">{renderFeatureValue(feature.pro)}</td>
                  <td className="p-6 text-center">{renderFeatureValue(feature.team)}</td>
                  <td className="p-6 text-center">{renderFeatureValue(feature.enterprise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Row */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Button variant="outline" className="w-full">
                Start Free
              </Button>
            </div>
            <div className="text-center">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Pro Trial
              </Button>
            </div>
            <div className="text-center">
              <Button variant="outline" className="w-full">
                Start Team Trial
              </Button>
            </div>
            <div className="text-center">
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}