'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Shield, CheckCircle, ExternalLink } from 'lucide-react'

interface SecurityAlert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  repository: string
  file?: string
  line?: number
  createdAt: string
  status: 'open' | 'resolved' | 'investigating'
}

interface SecurityAlertsProps {
  alerts: SecurityAlert[]
  className?: string
}

export function SecurityAlerts({ alerts, className }: SecurityAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium':
        return <Shield className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  const criticalCount = alerts.filter(alert => alert.severity === 'critical').length
  const highCount = alerts.filter(alert => alert.severity === 'high').length

  if (alerts.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
          <Badge variant="success">All Clear</Badge>
        </div>
        <div className="text-center py-8">
          <Shield className="w-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No security alerts detected</p>
          <p className="text-sm text-gray-500 mt-2">Your repositories are secure</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
        <div className="flex items-center space-x-2">
          {criticalCount > 0 && (
            <Badge variant="error">{criticalCount} Critical</Badge>
          )}
          {highCount > 0 && (
            <Badge variant="warning">{highCount} High</Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alerts.slice(0, 5).map((alert) => (
          <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(alert.severity)}
                <span className="font-medium text-gray-900">{alert.title}</span>
                <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                  {alert.severity}
                </Badge>
              </div>
              <Badge 
                variant={alert.status === 'resolved' ? 'success' : 'secondary'}
                className="text-xs"
              >
                {alert.status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{alert.repository}</span>
                {alert.file && <span>{alert.file}:{alert.line}</span>}
                <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
              </div>
              <Button size="sm" variant="outline">
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 5 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All {alerts.length} Alerts
          </Button>
        </div>
      )}
    </Card>
  )
}
