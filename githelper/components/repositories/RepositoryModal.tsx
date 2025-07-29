'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { 
  GitBranch, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Info,
  Webhook,
  Shield,
  Clock
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

interface RepositoryModalProps {
  repository?: Repository | null
  open: boolean
  onClose: () => void
  onSave: () => void
}

interface FormData {
  name: string
  fullName: string
  description: string
  isActive: boolean
  reviewSettings: {
    autoReview: boolean
    requireApproval: boolean
    minScore: number
    blockOnCritical: boolean
    reviewOnPush: boolean
    excludePatterns: string[]
  }
  webhookSettings: {
    enabled: boolean
    events: string[]
  }
  notifications: {
    email: boolean
    slack: boolean
    discord: boolean
  }
}

export function RepositoryModal({ repository, open, onClose, onSave }: RepositoryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    fullName: '',
    description: '',
    isActive: true,
    reviewSettings: {
      autoReview: true,
      requireApproval: false,
      minScore: 7,
      blockOnCritical: true,
      reviewOnPush: true,
      excludePatterns: ['*.md', '*.txt', 'docs/*']
    },
    webhookSettings: {
      enabled: true,
      events: ['push', 'pull_request']
    },
    notifications: {
      email: true,
      slack: false,
      discord: false
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'reviews' | 'webhooks' | 'notifications'>('general')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [testingWebhook, setTestingWebhook] = useState(false)

  const isEditMode = !!repository

  useEffect(() => {
    if (repository) {
      setFormData({
        name: repository.name,
        fullName: repository.fullName,
        description: repository.description || '',
        isActive: repository.isActive,
        reviewSettings: {
          autoReview: true,
          requireApproval: false,
          minScore: 7,
          blockOnCritical: true,
          reviewOnPush: true,
          excludePatterns: ['*.md', '*.txt', 'docs/*']
        },
        webhookSettings: {
          enabled: repository.webhookStatus === 'connected',
          events: ['push', 'pull_request']
        },
        notifications: {
          email: true,
          slack: false,
          discord: false
        }
      })
      fetchWebhookUrl(repository.id)
    } else {
      // Reset form for new repository
      setFormData({
        name: '',
        fullName: '',
        description: '',
        isActive: true,
        reviewSettings: {
          autoReview: true,
          requireApproval: false,
          minScore: 7,
          blockOnCritical: true,
          reviewOnPush: true,
          excludePatterns: ['*.md', '*.txt', 'docs/*']
        },
        webhookSettings: {
          enabled: true,
          events: ['push', 'pull_request']
        },
        notifications: {
          email: true,
          slack: false,
          discord: false
        }
      })
      setWebhookUrl('')
    }
    setActiveTab('general')
  }, [repository, open])

  const fetchWebhookUrl = async (repoId: string) => {
    try {
      const response = await fetch(`/api/repositories/${repoId}/webhook`)
      const data = await response.json()
      setWebhookUrl(data.webhookUrl || '')
    } catch (error) {
      console.error('Failed to fetch webhook URL:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = isEditMode ? 'PATCH' : 'POST'
      const url = isEditMode ? `/api/repositories/${repository!.id}` : '/api/repositories'
      
      const payload = {
        ...formData,
        ...(isEditMode ? {} : { githubUrl: `https://github.com/${formData.fullName}` })
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} repository`)
      }

      onSave()
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} repository:`, error)
      // TODO: Show error toast
    } finally {
      setSaving(false)
    }
  }

  const testWebhook = async () => {
    if (!repository) return
    
    setTestingWebhook(true)
    try {
      const response = await fetch(`/api/repositories/${repository.id}/webhook/test`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // TODO: Show success toast
        console.log('Webhook test successful')
      } else {
        throw new Error('Webhook test failed')
      }
    } catch (error) {
      console.error('Webhook test failed:', error)
      // TODO: Show error toast
    } finally {
      setTestingWebhook(false)
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    // TODO: Show success toast
  }

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Repository Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repository Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="my-awesome-repo"
            disabled={isEditMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="username/my-awesome-repo"
            disabled={isEditMode}
          />
          {!isEditMode && (
            <p className="text-xs text-gray-500 mt-1">
              Format: owner/repository-name
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="A brief description of your repository"
          />
        </div>
      </div>

      {/* Repository Status */}
      {isEditMode && repository && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Repository Status</h4>
            <Badge 
              variant={
                repository.status === 'active' ? 'success' :
                repository.status === 'error' ? 'error' :
                repository.status === 'syncing' ? 'warning' : 'secondary'
              }
            >
              {repository.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Language</p>
              <p className="font-medium">{repository.language}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Push</p>
              <p className="font-medium">{new Date(repository.lastPush).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Stars</p>
              <p className="font-medium">{repository.stars}</p>
            </div>
            <div>
              <p className="text-gray-500">Reviews</p>
              <p className="font-medium">{repository.reviewCount}</p>
            </div>
          </div>

          {repository.fullName && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={`https://github.com/${repository.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on GitHub
              </a>
            </div>
          )}
        </Card>
      )}

      {/* Enable Reviews */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Enable AI Code Reviews</p>
          <p className="text-sm text-gray-500">
            Automatically review pull requests and commits
          </p>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, isActive: checked }))
          }
        />
      </div>
    </div>
  )

  const renderReviewsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Auto Review</p>
            <p className="text-sm text-gray-500">Automatically start reviews on new PRs</p>
          </div>
          <Switch
            checked={formData.reviewSettings.autoReview}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                reviewSettings: { ...prev.reviewSettings, autoReview: checked }
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Review on Push</p>
            <p className="text-sm text-gray-500">Review code on every push to main branch</p>
          </div>
          <Switch
            checked={formData.reviewSettings.reviewOnPush}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                reviewSettings: { ...prev.reviewSettings, reviewOnPush: checked }
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Require Approval</p>
            <p className="text-sm text-gray-500">Block merges until review is approved</p>
          </div>
          <Switch
            checked={formData.reviewSettings.requireApproval}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                reviewSettings: { ...prev.reviewSettings, requireApproval: checked }
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Block on Critical Issues</p>
            <p className="text-sm text-gray-500">Prevent merge when critical issues found</p>
          </div>
          <Switch
            checked={formData.reviewSettings.blockOnCritical}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                reviewSettings: { ...prev.reviewSettings, blockOnCritical: checked }
              }))
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Score Threshold
        </label>
        <Input
          type="number"
          min="1"
          max="10"
          value={formData.reviewSettings.minScore}
          onChange={(e) => 
            setFormData(prev => ({ 
              ...prev, 
              reviewSettings: { ...prev.reviewSettings, minScore: parseInt(e.target.value) }
            }))
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Reviews below this score will be flagged (1-10 scale)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exclude Patterns
        </label>
        <div className="space-y-2">
          {formData.reviewSettings.excludePatterns.map((pattern, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={pattern}
                onChange={(e) => {
                  const newPatterns = [...formData.reviewSettings.excludePatterns]
                  newPatterns[index] = e.target.value
                  setFormData(prev => ({ 
                    ...prev, 
                    reviewSettings: { ...prev.reviewSettings, excludePatterns: newPatterns }
                  }))
                }}
                placeholder="*.md, docs/*, test/*"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPatterns = formData.reviewSettings.excludePatterns.filter((_, i) => i !== index)
                  setFormData(prev => ({ 
                    ...prev, 
                    reviewSettings: { ...prev.reviewSettings, excludePatterns: newPatterns }
                  }))
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                reviewSettings: { 
                  ...prev.reviewSettings, 
                  excludePatterns: [...prev.reviewSettings.excludePatterns, '']
                }
              }))
            }}
          >
            Add Pattern
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Files matching these patterns will be excluded from reviews
        </p>
      </div>
    </div>
  )

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Enable Webhooks</p>
          <p className="text-sm text-gray-500">
            Receive real-time notifications from GitHub
          </p>
        </div>
        <Switch
          checked={formData.webhookSettings.enabled}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ 
              ...prev, 
              webhookSettings: { ...prev.webhookSettings, enabled: checked }
            }))
          }
        />
      </div>

      {formData.webhookSettings.enabled && (
        <>
          {webhookUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add this URL to your GitHub repository webhook settings
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Events
            </label>
            <div className="space-y-2">
              {[
                { key: 'push', label: 'Push Events', description: 'Triggered when code is pushed' },
                { key: 'pull_request', label: 'Pull Request Events', description: 'Triggered on PR creation/updates' },
                { key: 'issues', label: 'Issue Events', description: 'Triggered on issue creation/updates' }
              ].map((event) => (
                <div key={event.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{event.label}</p>
                    <p className="text-sm text-gray-500">{event.description}</p>
                  </div>
                  <Switch
                    checked={formData.webhookSettings.events.includes(event.key)}
                    onCheckedChange={(checked) => {
                      const newEvents = checked
                        ? [...formData.webhookSettings.events, event.key]
                        : formData.webhookSettings.events.filter(e => e !== event.key)
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        webhookSettings: { ...prev.webhookSettings, events: newEvents }
                      }))
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {isEditMode && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Test Webhook</p>
                <Badge variant={repository?.webhookStatus === 'connected' ? 'success' : 'error'}>
                  {repository?.webhookStatus || 'unknown'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Send a test payload to verify webhook connectivity
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={testWebhook}
                disabled={testingWebhook}
              >
                {testingWebhook ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Testing...
                  </>
                ) : (
                  'Test Webhook'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive review results via email</p>
          </div>
          <Switch
            checked={formData.notifications.email}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, email: checked }
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Slack Notifications</p>
            <p className="text-sm text-gray-500">Send notifications to Slack channel</p>
          </div>
          <Switch
            checked={formData.notifications.slack}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, slack: checked }
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Discord Notifications</p>
            <p className="text-sm text-gray-500">Send notifications to Discord server</p>
          </div>
          <Switch
            checked={formData.notifications.discord}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ 
                ...prev, 
                notifications: { ...prev.notifications, discord: checked }
              }))
            }
          />
        </div>
      </div>
    </div>
  )

  const tabs = [
    { key: 'general' as const, label: 'General', icon: Settings },
    { key: 'reviews' as const, label: 'Reviews', icon: CheckCircle },
    { key: 'webhooks' as const, label: 'Webhooks', icon: Webhook },
    { key: 'notifications' as const, label: 'Notifications', icon: Info }
  ]

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEditMode ? `Edit ${repository?.name}` : 'Connect Repository'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'webhooks' && renderWebhooksTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.name || !formData.fullName}
          >
            {saving && <LoadingSpinner size="sm" className="mr-2" />}
            {isEditMode ? 'Update Repository' : 'Connect Repository'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}