'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Settings, Webhook, AlertTriangle } from 'lucide-react'

interface RepositorySettingsProps {
  repositoryId: string
}

export function RepositorySettings({ repositoryId }: RepositorySettingsProps) {
  const [settings, setSettings] = useState({
    autoReview: true,
    webhooksEnabled: true,
    notifications: true,
    minScore: 7,
    reviewRules: {
      requireApproval: false,
      blockOnCritical: true,
      autoMerge: false
    }
  })

  const handleSave = async () => {
    try {
      await fetch(`/api/repositories/${repositoryId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Review Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Auto Review</p>
              <p className="text-sm text-gray-500">Automatically review new pull requests</p>
            </div>
            <Switch
              checked={settings.autoReview}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, autoReview: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Webhooks</p>
              <p className="text-sm text-gray-500">Enable GitHub webhook integration</p>
            </div>
            <Switch
              checked={settings.webhooksEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, webhooksEnabled: checked }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Score Threshold
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={settings.minScore}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, minScore: parseInt(e.target.value) }))
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Review Rules
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Require Approval</p>
              <p className="text-sm text-gray-500">Block merge until review is approved</p>
            </div>
            <Switch
              checked={settings.reviewRules.requireApproval}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  reviewRules: { ...prev.reviewRules, requireApproval: checked }
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Block on Critical Issues</p>
              <p className="text-sm text-gray-500">Prevent merge when critical issues are found</p>
            </div>
            <Switch
              checked={settings.reviewRules.blockOnCritical}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  reviewRules: { ...prev.reviewRules, blockOnCritical: checked }
                }))
              }
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}