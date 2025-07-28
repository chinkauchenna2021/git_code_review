'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, AlertTriangle, Github } from 'lucide-react'

interface ImportRepositoriesProps {
  open: boolean
  onClose: () => void
  onImport: () => void
}

export function ImportRepositories({ open, onClose, onImport }: ImportRepositoriesProps) {
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [repositories, setRepositories] = useState<any[]>([])
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRepositories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/github/repositories')
      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      await fetch('/api/repositories/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryIds: selectedRepos })
      })
      onImport()
    } catch (error) {
      console.error('Failed to import repositories:', error)
    } finally {
      setImporting(false)
    }
  }

  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal isOpen={open} onClose={onClose} title="Import Repositories" size="lg">
      <div className="space-y-6">
        {/* Search */}
        <div>
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Load Repos Button */}
        {repositories.length === 0 && (
          <div className="text-center py-8">
            <Github className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Load your GitHub repositories</p>
            <Button onClick={fetchRepositories} disabled={loading}>
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              Load Repositories
            </Button>
          </div>
        )}

        {/* Repository List */}
        {filteredRepos.length > 0 && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredRepos.map((repo) => (
              <Card key={repo.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
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
                    <div>
                      <p className="font-medium text-gray-900">{repo.name}</p>
                      <p className="text-sm text-gray-500">{repo.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{repo.language}</Badge>
                    {repo.private && <Badge variant="secondary">Private</Badge>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedRepos.length} repositories selected
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={selectedRepos.length === 0 || importing}
            >
              {importing && <LoadingSpinner size="sm" className="mr-2" />}
              Import Selected
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}