'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Users, TrendingUp, TrendingDown, Star, GitPullRequest } from 'lucide-react'

interface TeamPerformanceProps {
  data: {
    members: Array<{
      id: string
      name: string
      avatar: string
      reviews: number
      avgScore: number
      contributions: number
      trend: 'up' | 'down' | 'stable'
    }>
    collaboration: Array<{ from: string; to: string; count: number }>
  }
  className?: string
}

export function TeamPerformance({ data, className }: TeamPerformanceProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const topPerformer = data.members.reduce((prev, current) => 
    (prev.avgScore > current.avgScore) ? prev : current
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Team Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Team Performance
          </h3>
          <Badge variant="success" className="flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {data.members.length} Active Members
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data.members.reduce((sum, member) => sum + member.reviews, 0)}
            </div>
            <div className="text-sm text-blue-700">Total Reviews</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(data.members.reduce((sum, member) => sum + member.avgScore, 0) / data.members.length).toFixed(1)}
            </div>
            <div className="text-sm text-green-700">Team Avg Score</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {data.members.reduce((sum, member) => sum + member.contributions, 0)}
            </div>
            <div className="text-sm text-purple-700">Total Contributions</div>
          </div>
        </div>

        {/* Top Performer Highlight */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-900">Top Performer this Month</h4>
              <p className="text-sm text-yellow-700">
                {topPerformer.name} with an average score of {topPerformer.avgScore.toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Individual Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Individual Performance</h3>
        <div className="space-y-4">
          {data.members
            .sort((a, b) => b.avgScore - a.avgScore)
            .map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 w-6">
                      #{index + 1}
                    </span>
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      fallback={member.name[0]}
                      size="md"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">
                      {member.reviews} reviews • {member.contributions} contributions
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900">
                        {member.avgScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Average Score</div>
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${getTrendColor(member.trend)}`}>
                    {getTrendIcon(member.trend)}
                    <span className="text-sm font-medium capitalize">{member.trend}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Collaboration Network */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Collaboration Network</h3>
        <div className="space-y-4">
          {data.collaboration.slice(0, 5).map((collab, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <GitPullRequest className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {collab.from} → {collab.to}
                  </div>
                  <div className="text-sm text-gray-500">
                    {collab.count} collaborative review{collab.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{collab.count}</div>
              </div>
            </div>
          ))}
        </div>

        {data.collaboration.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No collaboration data available</p>
            <p className="text-sm">Enable team features to track collaboration</p>
          </div>
        )}
      </Card>
    </div>
  )
}
