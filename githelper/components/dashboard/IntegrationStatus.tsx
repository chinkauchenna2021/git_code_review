'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, AlertTriangle, Settings, Github, MessageSquare } from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'git' | 'communication' | 'ci_cd' | 'monitoring'
  status: 'connected' | 'disconnected' | 'error' | 'warning'
  icon: React.ComponentType<{ className?: string }>
  description: string
  lastSync?: string
  errorMessage?: string
}

interface IntegrationStatusProps {
  integrations: Integration[]
  className?: string
}

export function IntegrationStatus({ integrations, className }: IntegrationStatusProps) {
  // Mock data if no integrations provided
  const defaultIntegrations: Integration[] = [
    {
      id: 'github',
      name: 'GitHub',
      type: 'git',
      status: 'connected',
      icon: Github,
      description: 'Repository integration for code reviews',
      lastSync: '2 minutes ago'
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'communication',
      status: 'connected',
      icon: MessageSquare,
      description: 'Team notifications and alerts',
      lastSync: '5 minutes ago'
    }
  ]

  const displayIntegrations = integrations.length > 0 ? integrations : defaultIntegrations

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-400" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'success'
      case 'disconnected': return 'secondary'
      case 'error': return 'error'
      case 'warning': return 'warning'
      default: return 'secondary'
    }
  }

  const connectedCount = displayIntegrations.filter(i => i.status === 'connected').length

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="success">{connectedCount} connected</Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Manage
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {displayIntegrations.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <integration.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{integration.name}</span>
                  {getStatusIcon(integration.status)}
                </div>
                <p className="text-sm text-gray-600">{integration.description}</p>
                {integration.lastSync && integration.status === 'connected' && (
                  <p className="text-xs text-gray-500">Last sync: {integration.lastSync}</p>
                )}
                {integration.errorMessage && (
                  <p className="text-xs text-red-600">{integration.errorMessage}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(integration.status) as any} className="text-xs">
                {integration.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {displayIntegrations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No integrations configured</p>
          <Button className="mt-4" size="sm">
            Add Integration
          </Button>
        </div>
      )}
    </Card>
  )
}
