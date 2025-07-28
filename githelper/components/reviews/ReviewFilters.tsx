'use client'

import React from 'react'
import { Filter } from 'lucide-react'

interface ReviewFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  severityFilter: string
  onSeverityChange: (severity: string) => void
  repositoryFilter: string
  onRepositoryChange: (repo: string) => void
  repositories: string[]
  timeRange: string
  onTimeRangeChange: (range: string) => void
  sortField: string
  onSortFieldChange: (field: string) => void
  sortDirection: string
  onSortDirectionChange: (direction: string) => void
}

export function ReviewFilters({
  statusFilter,
  onStatusChange,
  severityFilter,
  onSeverityChange,
  repositoryFilter,
  onRepositoryChange,
  repositories,
  timeRange,
  onTimeRangeChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange
}: ReviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select
        value={severityFilter}
        onChange={(e) => onSeverityChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Severity</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={repositoryFilter}
        onChange={(e) => onRepositoryChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Repositories</option>
        {repositories.map(repo => (
          <option key={repo} value={repo}>{repo}</option>
        ))}
      </select>

      <select
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="all">All time</option>
      </select>

      <select
        value={`${sortField}-${sortDirection}`}
        onChange={(e) => {
          const [field, direction] = e.target.value.split('-')
          onSortFieldChange(field)
          onSortDirectionChange(direction)
        }}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="createdAt-desc">Newest first</option>
        <option value="createdAt-asc">Oldest first</option>
        <option value="score-desc">Highest score</option>
        <option value="score-asc">Lowest score</option>
        <option value="issues-desc">Most issues</option>
        <option value="issues-asc">Fewest issues</option>
        <option value="repository-asc">Repository A-Z</option>
        <option value="repository-desc">Repository Z-A</option>
      </select>
    </div>
  )
}
