// app/(dashboard)/repositories/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RepositoryCard } from '@/components/repositories/RepositoryCard'
import { RepositoryModal } from '@/components/repositories/RepositoryModal'
import { BulkActions } from '@/components/repositories/BulkActions'
import { ImportRepositories } from '@/components/repositories/ImportRepositories'
import { RepositoryAnalytics } from '@/components/repositories/RepositoryAnalytics'
import { RepositorySettings } from '@/components/repositories/RepositorySettings'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  GitBranch, 
  Star, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  SortDesc
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

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'lastPush' | 'stars' | 'reviewCount' | 'averageScore'
type SortDirection = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'inactive' | 'error'
type FilterLanguage = 'all' | string

export default function RepositoriesPage() {
  const { user } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('lastPush')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterLanguage, setFilterLanguage] = useState<FilterLanguage>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/repositories')
      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRepositories()
    setRefreshing(false)
  }

  const handleSync = async (repoId: string) => {
    try {
      await fetch(`/api/repositories/${repoId}/sync`, { method: 'POST' })
      await fetchRepositories()
    } catch (error) {
      console.error('Failed to sync repository:', error)
    }
  }

  const handleToggleActive = async (repoId: string, isActive: boolean) => {
    try {
      await fetch(`/api/repositories/${repoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      await fetchRepositories()
    } catch (error) {
      console.error('Failed to update repository:', error)
    }
  }

  const handleBulkAction = async (action: string, repoIds: string[]) => {
    try {
      await fetch('/api/repositories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, repositoryIds: repoIds })
      })
      setSelectedRepos([])
      await fetchRepositories()
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
    }
  }

  // Filter and sort repositories
  const filteredRepositories = repositories
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || repo.status === filterStatus
      const matchesLanguage = filterLanguage === 'all' || repo.language === filterLanguage
      
      return matchesSearch && matchesStatus && matchesLanguage
    })
    .sort((a, b) => {
      let valueA: any = a[sortField]
      let valueB: any = b[sortField]
      
      if (sortField === 'lastPush') {
        valueA = new Date(valueA).getTime()
        valueB = new Date(valueB).getTime()
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

  const languages = [...new Set(repositories.map(repo => repo.language).filter(Boolean))]
  
  const stats = {
    total: repositories.length,
    active: repositories.filter(repo => repo.isActive).length,
    inactive: repositories.filter(repo => !repo.isActive).length,
    error: repositories.filter(repo => repo.status === 'error').length,
    totalReviews: repositories.reduce((sum, repo) => sum + repo.reviewCount, 0),
    averageScore: repositories.length > 0 
      ? repositories.reduce((sum, repo) => sum + repo.averageScore, 0) / repositories.length
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repositories</h1>
          <p className="mt-1 text-gray-600">
            Manage and monitor your connected repositories
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import Repos</span>
          </Button>
          
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Connect Repository</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <GitBranch className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Repositories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
            
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-')
                setSortField(field as SortField)
                setSortDirection(direction as SortDirection)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastPush-desc">Latest Activity</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="stars-desc">Most Stars</option>
              <option value="reviewCount-desc">Most Reviews</option>
              <option value="averageScore-desc">Highest Score</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
               title='btn-click'
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
              title='btn-click'
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedRepos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <BulkActions
              selectedCount={selectedRepos.length}
              onAction={(action: string) => handleBulkAction(action, selectedRepos)}
              onClear={() => setSelectedRepos([])}
            />
          </div>
        )}
      </Card>

      {/* Repository List/Grid */}
      <div className="space-y-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepositories.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                selected={selectedRepos.includes(repo.id)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedRepos(prev => [...prev, repo.id])
                  } else {
                    setSelectedRepos(prev => prev.filter(id => id !== repo.id))
                  }
                }}
                onEdit={() => {
                  setSelectedRepo(repo)
                  setShowModal(true)
                }}
                onSync={() => handleSync(repo.id)}
                onToggleActive={(isActive) => handleToggleActive(repo.id, isActive)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedRepos.length === filteredRepositories.length && filteredRepositories.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRepos(filteredRepositories.map(repo => repo.id))
                          } else {
                            setSelectedRepos([])
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repository
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reviews
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Push
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRepositories.map((repo) => (
                    <tr key={repo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRepos.includes(repo.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRepos(prev => [...prev, repo.id])
                            } else {
                              setSelectedRepos(prev => prev.filter(id => id !== repo.id))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={repo.owner.avatar}
                              alt={repo.owner.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {repo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {repo.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="default" className="text-xs">
                          {repo.language}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            repo.status === 'active' ? 'success' :
                            repo.status === 'error' ? 'error' :
                            repo.status === 'syncing' ? 'warning' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {repo.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {repo.reviewCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {repo.averageScore.toFixed(1)}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(repo.lastPush).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSync(repo.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRepo(repo)
                              setShowModal(true)
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredRepositories.length === 0 && (
              <div className="text-center py-12">
                <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No repositories found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try adjusting your search or filters.' : 'Get started by connecting your first repository.'}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Button onClick={() => setShowModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Repository
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Analytics Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <RepositoryAnalytics repositories={repositories} type="overview" />
        </TabsContent>
        
        <TabsContent value="performance">
          <RepositoryAnalytics repositories={repositories} type="performance" />
        </TabsContent>
        
        <TabsContent value="security">
          <RepositoryAnalytics repositories={repositories} type="security" />
        </TabsContent>
        
        <TabsContent value="activity">
          <RepositoryAnalytics repositories={repositories} type="activity" />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showModal && (
        <RepositoryModal
          repository={selectedRepo}
          open={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedRepo(null)
          }}
          onSave={async () => {
            await fetchRepositories()
            setShowModal(false)
            setSelectedRepo(null)
          }}
        />
      )}

      {showImport && (
        <ImportRepositories
          open={showImport}
          onClose={() => setShowImport(false)}
          onImport={async () => {
            await fetchRepositories()
            setShowImport(false)
          }}
        />
      )}
    </div>
  )
}