'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Zap, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

interface PerformanceMetricsProps {
  data: {
    metrics: {
      averageReviewTime: number
      successRate: number
      errorRate: number
      throughput: number
    }
    bottlenecks: Array<{ stage: string; avgTime: number; percentage: number }>
    optimization: Array<{ suggestion: string; impact: string; effort: string }>
  }
  className?: string
}

export function PerformanceMetrics({ data, className }: PerformanceMetricsProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'success'
      case 'medium': return 'warning'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'error'
      default: return 'secondary'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Avg Review Time</h4>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(data.metrics.averageReviewTime)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Per review</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Success Rate</h4>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.metrics.successRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">Completed reviews</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Error Rate</h4>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.metrics.errorRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">Failed reviews</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-600">Throughput</h4>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.metrics.throughput}
          </div>
          <div className="text-sm text-gray-500 mt-1">Reviews/hour</div>
        </Card>
      </div>

      {/* Performance Bottlenecks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Bottlenecks</h3>
        <div className="space-y-4">
          {data.bottlenecks.map((bottleneck, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{bottleneck.stage}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(bottleneck.avgTime)} ({bottleneck.percentage}%)
                </div>
              </div>
              <ProgressBar
                value={bottleneck.percentage}
                variant={bottleneck.percentage > 50 ? 'warning' : 'default'}
                className="h-2"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Performance Insight</h4>
              <p className="text-sm text-blue-700 mt-1">
                {data.bottlenecks[0]?.stage || 'Code analysis'} is taking the most time. 
                Consider optimizing this stage for better performance.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Optimization Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Optimization Suggestions</h3>
        <div className="space-y-4">
          {data.optimization.map((opt, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex-1">{opt.suggestion}</h4>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant={getImpactColor(opt.impact) as any} className="text-xs">
                    {opt.impact} impact
                  </Badge>
                  <Badge variant={getEffortColor(opt.effort) as any} className="text-xs">
                    {opt.effort} effort
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span>Priority:</span>
                  <span className={
                    opt.impact === 'high' && opt.effort === 'low' ? 'text-green-600 font-medium' :
                    opt.impact === 'high' && opt.effort === 'medium' ? 'text-yellow-600 font-medium' :
                    'text-gray-600'
                  }>
                    {opt.impact === 'high' && opt.effort === 'low' ? 'High' :
                     opt.impact === 'high' && opt.effort === 'medium' ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Resource Usage</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <ProgressBar value={45} variant="default" className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>62%</span>
                </div>
                <ProgressBar value={62} variant="warning" className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage Usage</span>
                  <span>28%</span>
                </div>
                <ProgressBar value={28} variant="success" className="h-2" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Service Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">AI Service</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Database</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Queue Service</span>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Degraded</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">API Gateway</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Healthy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
         