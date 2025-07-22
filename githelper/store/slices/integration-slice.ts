import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface IntegrationSlice {
  githubInstallations: Array<{
    id: number
    accountType: string
    accountLogin: string
    repositoryCount: number
    isActive: boolean
  }>
  webhookStatus: Record<string, {
    isActive: boolean
    lastTriggered: Date | null
    errorCount: number
  }>
  apiKeys: Array<{
    id: string
    name: string
    key: string
    lastUsed: Date | null
    permissions: string[]
  }>
  
  // Actions
  fetchGitHubInstallations: () => Promise<void>
  installGitHubApp: () => Promise<void>
  removeGitHubInstallation: (installationId: number) => Promise<boolean>
  createAPIKey: (name: string, permissions: string[]) => Promise<string | null>
  revokeAPIKey: (keyId: string) => Promise<boolean>
  testWebhook: (repositoryId: string) => Promise<boolean>
}

export const createIntegrationSlice = (set: any, get: any): IntegrationSlice => ({
  githubInstallations: [],
  webhookStatus: {},
  apiKeys: [],

  fetchGitHubInstallations: async () => {
    try {
      const response = await fetch('/api/github/installations')
      if (!response.ok) throw new Error('Failed to fetch installations')
      
      const data = await response.json()
      
      set((state: any) => {
        state.githubInstallations = data.installations
      })
    } catch (error) {
      console.error('Fetch GitHub installations error:', error)
    }
  },

  installGitHubApp: async () => {
    try {
      const response = await fetch('/api/github/install', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to start installation')
      
      const data = await response.json()
      window.location.href = data.installUrl
    } catch (error) {
      console.error('Install GitHub app error:', error)
    }
  },

  removeGitHubInstallation: async (installationId) => {
    try {
      const response = await fetch(`/api/github/installations/${installationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove installation')

      set((state: any) => {
        state.githubInstallations = state.githubInstallations.filter(
          (installation: any) => installation.id !== installationId
        )
      })

      return true
    } catch (error) {
      console.error('Remove GitHub installation error:', error)
      return false
    }
  },

  createAPIKey: async (name, permissions) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions })
      })

      if (!response.ok) throw new Error('Failed to create API key')
      
      const data = await response.json()
      
      set((state: any) => {
        state.apiKeys.push(data.key)
      })

      return data.key.key
    } catch (error) {
      console.error('Create API key error:', error)
      return null
    }
  },

  revokeAPIKey: async (keyId) => {
    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to revoke API key')

      set((state: any) => {
        state.apiKeys = state.apiKeys.filter((key: any) => key.id !== keyId)
      })

      return true
    } catch (error) {
      console.error('Revoke API key error:', error)
      return false
    }
  },

  testWebhook: async (repositoryId) => {
    try {
      const response = await fetch(`/api/webhooks/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId })
      })

      return response.ok
    } catch (error) {
      console.error('Test webhook error:', error)
      return false
    }
  }
})
