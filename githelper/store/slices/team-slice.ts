import { Team } from "@/types/store"
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface TeamsSlice {
  teams: Team[]
  currentTeam: Team | null
  isLoading: boolean
  
  // Actions
  fetchTeams: () => Promise<void>
  createTeam: (data: { name: string; description?: string }) => Promise<string | null>
  updateTeam: (teamId: string, updates: { name?: string; description?: string }) => Promise<boolean>
  deleteTeam: (teamId: string) => Promise<boolean>
  inviteMember: (teamId: string, email: string, role: 'ADMIN' | 'MEMBER') => Promise<boolean>
  removeMember: (teamId: string, userId: string) => Promise<boolean>
  updateMemberRole: (teamId: string, userId: string, role: 'ADMIN' | 'MEMBER') => Promise<boolean>
  setCurrentTeam: (team: Team | null) => void
}

export const createTeamsSlice = (set: any, get: any): TeamsSlice => ({
  teams: [],
  currentTeam: null,
  isLoading: false,

  fetchTeams: async () => {
    set((state: any) => {
      state.isLoading = true
    })

    try {
      const response = await fetch('/api/team')
      if (!response.ok) throw new Error('Failed to fetch teams')
      
      const data = await response.json()
      
      set((state: any) => {
        state.teams = [...data.ownedTeams, ...data.memberTeams]
        state.isLoading = false
      })
    } catch (error) {
      set((state: any) => {
        state.isLoading = false
      })
      console.error('Fetch teams error:', error)
    }
  },

  createTeam: async (data) => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to create team')
      
      const result = await response.json()
      
      set((state: any) => {
        state.teams.push(result.team)
      })

      return result.team.id
    } catch (error) {
      console.error('Create team error:', error)
      return null
    }
  },

  updateTeam: async (teamId, updates) => {
    try {
      const response = await fetch(`/api/team/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update team')

      set((state: any) => {
        const team = state.teams.find((t: Team) => t.id === teamId)
        if (team) {
          Object.assign(team, updates)
        }
      })

      return true
    } catch (error) {
      console.error('Update team error:', error)
      return false
    }
  },

  deleteTeam: async (teamId) => {
    try {
      const response = await fetch(`/api/team/${teamId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete team')

      set((state: any) => {
        state.teams = state.teams.filter((t: Team) => t.id !== teamId)
        if (state.currentTeam?.id === teamId) {
          state.currentTeam = null
        }
      })

      return true
    } catch (error) {
      console.error('Delete team error:', error)
      return false
    }
  },

  inviteMember: async (teamId, email, role) => {
    try {
      const response = await fetch(`/api/team/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })

      if (!response.ok) throw new Error('Failed to invite member')

      // Refresh team data
      await get().fetchTeams()
      
      return true
    } catch (error) {
      console.error('Invite member error:', error)
      return false
    }
  },

  removeMember: async (teamId, userId) => {
    try {
      const response = await fetch(`/api/team/${teamId}/members/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove member')

      set((state: any) => {
        const team = state.teams.find((t: Team) => t.id === teamId)
        if (team) {
          team.members = team.members.filter((m: { userId: string }) => m.userId !== userId)
        }
      })

      return true
    } catch (error) {
      console.error('Remove member error:', error)
      return false
    }
  },

  updateMemberRole: async (teamId, userId, role) => {
    try {
      const response = await fetch(`/api/team/${teamId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (!response.ok) throw new Error('Failed to update member role')

      set((state: any) => {
        const team = state.teams.find((t: Team) => t.id === teamId)
        if (team) {
          const member = team.members.find((m: { userId: string }) => m.userId === userId)
          if (member) {
            member.role = role
          }
        }
      })

      return true
    } catch (error) {
      console.error('Update member role error:', error)
      return false
    }
  },

  setCurrentTeam: (team) => set((state: any) => {
    state.currentTeam = team
  })
})