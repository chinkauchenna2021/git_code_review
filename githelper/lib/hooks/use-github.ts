import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface Repository {
  id: number
  name: string
  fullName: string
  private: boolean
  language: string
  isActive?: boolean
}

export function useGitHub() {
  const { session } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepositories = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/github/repos')
      if (!response.ok) throw new Error('Failed to fetch repositories')
      
      const data = await response.json()
      setRepositories(data.repositories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const toggleRepository = async (repoId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/github/repos/${repoId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) throw new Error('Failed to toggle repository')

      // Update local state
      setRepositories(repos => 
        repos.map(repo => 
          repo.id === repoId ? { ...repo, isActive } : repo
        )
      )
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    if (session) {
      fetchRepositories()
    }
  }, [session])

  return {
    repositories,
    loading,
    error,
    refetch: fetchRepositories,
    toggleRepository
  }
}