'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Shield, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react'

interface SecurityMetricsProps {
  data: {
    vulnerabilities: Array<{ type: string; count: number; severity: string }>
    trends: Array<{ date: string; critical: number; high: number; medium: number; low: number }>
    topIssues: Array<{ issue: string; count: number; repos: string[] }>
  }
  className?: string
}

export function SecurityMetrics({ data, className }: SecurityMetricsProps) {
  const totalVulnerabilities = data.vulnerabilities.reduce((sum, v) => sum + v.count, 0)
  const criticalCount = data.vulnerabilities
    .filter(v => v.severity === 'critical')
    .reduce((sum, v) => sum + v.count, 0)
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'low': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Security Overview
          </h3>
          {criticalCount === 0 && (
            <Badge variant="success" className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {data.vulnerabilities.filter(v => v.severity === 'critical').reduce((sum, v) => sum + v.count, 0)}
            </div>
            <div className="text-sm text-red-700">Critical</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {data.vulnerabilities.filter(v => v.severity === 'high').reduce((sum, v) => sum + v.count, 0)}
            </div>
            <div className="text-sm text-orange-700">High</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {data.vulnerabilities.filter(v => v.severity === 'medium').reduce((sum, v) => sum + v.count, 0)}
            </div>
            <div className="text-sm text-yellow-700">Medium</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data.vulnerabilities.filter(v => v.severity === 'low').reduce((sum, v) => sum + v.count, 0)}
            </div>
            <div className="text-sm text-blue-700">Low</div>
          </div>
        </div>

        {/* Vulnerability Types */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Vulnerability Types</h4>
          {data.vulnerabilities.slice(0, 5).map((vuln, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(vuln.severity)}
                <div>
                  <div className="font-medium text-gray-900">{vuln.type}</div>
                  <div className="text-sm text-gray-500">{vuln.count} instances</div>
                </div>
              </div>
              <Badge variant={getSeverityColor(vuln.severity) as any}>
                {vuln.severity}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          <div className="h-full flex items-end space-x-2">
            {data.trends.slice(0, 7).map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full space-y-1">
                  {trend.critical > 0 && (
                    <div
                      className="w-full bg-red-500 rounded-sm"
                      style={{ height: `${trend.critical * 4}px` }}
                      title={`Critical: ${trend.critical}`}
                    />
                  )}
                  {trend.high > 0 && (
                    <div
                      className="w-full bg-orange-500 rounded-sm"
                      style={{ height: `${trend.high * 3}px` }}
                      title={`High: ${trend.high}`}
                    />
                  )}
                  {trend.medium > 0 && (
                    <div
                      className="w-full bg-yellow-500 rounded-sm"
                      style={{ height: `${trend.medium * 2}px` }}
                      title={`Medium: ${trend.medium}`}
                    />
                  )}
                  {trend.low > 0 && (
                    <div
                      className="w-full bg-blue-500 rounded-sm"
                      style={{ height: `${trend.low}px` }}
                      title={`Low: ${trend.low}`}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {data.trends.length > 1 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center">
            <TrendingDown className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700">
              Security issues decreased by{' '}
              {Math.round(((data.trends[0].critical + data.trends[0].high) - 
                (data.trends[data.trends.length - 1].critical + data.trends[data.trends.length - 1].high)) / 
                (data.trends[0].critical + data.trends[0].high) * 100)}% this period
            </span>
          </div>
        )}
      </Card>

      {/* Top Security Issues */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Issues</h3>
        <div className="space-y-4">
          {data.topIssues.slice(0, 5).map((issue, index) => (
            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">{issue.issue}</div>
                <div className="text-sm text-gray-600 mb-2">
                  Found in {issue.count} review{issue.count !== 1 ? 's' : ''}
                </div>
                <div className="flex flex-wrap gap-1">
                  {issue.repos.slice(0, 3).map((repo, repoIndex) => (
                    <Badge key={repoIndex} variant="secondary" className="text-xs">
                      {repo}
                    </Badge>
                  ))}
                  {issue.repos.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{issue.repos.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{issue.count}</div>
                <div className="text-xs text-gray-500">instances</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
