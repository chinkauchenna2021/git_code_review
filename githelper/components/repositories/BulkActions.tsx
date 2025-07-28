'use client'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Play, Pause, RefreshCw, Download } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onAction: (action: string) => void
  onClear: () => void
}

export function BulkActions({ selectedCount, onAction, onClear }: BulkActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="px-3 py-1">
          {selectedCount} selected
        </Badge>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear selection
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('activate')}
          className="flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Activate</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('deactivate')}
          className="flex items-center space-x-2"
        >
          <Pause className="h-4 w-4" />
          <span>Deactivate</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('sync')}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('export')}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('delete')}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </div>
    </div>
  )
}
