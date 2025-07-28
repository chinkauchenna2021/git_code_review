'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { 
  GitBranch, 
  Star, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Code
} from 'lucide-react'

interface Repository {
  id: string
  name: string
  fullName: string
  description?: string
  language: string
  isActive: boolean
  isPrivate: boolean
  stars: number
  forks: number
  openIssues: number
  lastPush: string
  createdAt: string
  reviewCount: number
  averageScore: number
  criticalIssues: number
  status: 'active' | 'inactive' | 'error' | 'syncing'
  webhookStatus: 'connected' | 'disconnected' | 'error'
  owner: {
    name: string
    avatar: string
  }
}

interface RepositoryCardProps {
  repository: Repository
  selected?: boolean
  onSelect?: (selected: boolean) => void
  onEdit?: () => void
  onSync?: () => void
  onToggleActive?: (isActive: boolean) => void
  className?: string
}

export function RepositoryCard({
  repository,
  selected = false,
  onSelect,
  onEdit,
  onSync,
  onToggleActive,
  className
}: RepositoryCardProps) {
  const getStatusIcon = () => {
    switch (repository.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusVariant = () => {
    switch (repository.status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'error': return 'error'
      case 'syncing': return 'warning'
      default: return 'secondary'
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'Go': 'bg-blue-400',
      'Rust': 'bg-orange-600'
    }
    return colors[language] || 'bg-gray-500'
  }

  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-md ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          
          <img
            src={repository.owner.avatar || '/default-avatar.png'}
            alt={repository.owner.name}
            className="w-8 h-8 rounded-full"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {repository.name}
            </h3>
            <p className="text-sm text-gray-600">{repository.fullName}</p>
            {repository.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {repository.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge variant={getStatusVariant() as any} className="text-xs">
            {repository.status}
          </Badge>
        </div>
      </div>

      {/* Language and Stats */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-full ${getLanguageColor(repository.language)}`} />
          <span>{repository.language}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4" />
          <span>{repository.stars}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <GitBranch className="w-4 h-4" />
          <span>{repository.forks}</span>
        </div>
        
        {repository.isPrivate && (
          <Badge variant="secondary" className="text-xs">Private</Badge>
        )}
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{repository.reviewCount}</div>
          <div className="text-xs text-gray-600">Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{repository.averageScore.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Avg Score</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{repository.criticalIssues}</div>
          <div className="text-xs text-gray-600">Issues</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={repository.isActive}
              onCheckedChange={onToggleActive}
            />
            <span className="text-sm text-gray-600">
              {repository.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onSync}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Last push: {new Date(repository.lastPush).toLocaleDateString()}</span>
          <span>Webhook: {repository.webhookStatus}</span>
        </div>
      </div>
    </Card>
  )
}
