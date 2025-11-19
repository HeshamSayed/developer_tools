import axios from 'axios'
import type { Team, TeamMember, TeamInvitation, TeamStats, TeamAuditLog, TeamAPIKey, TeamRole } from '@/types/team'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8003/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

class TeamService {
  // Teams
  async getMyTeams(): Promise<Team[]> {
    const response = await api.get('/teams/')
    return response.data
  }

  async getTeam(teamId: string): Promise<Team> {
    const response = await api.get(`/teams/${teamId}/`)
    return response.data
  }

  async createTeam(data: { name: string; description?: string }): Promise<Team> {
    const response = await api.post('/teams/', data)
    return response.data
  }

  async updateTeam(teamId: string, data: Partial<Team>): Promise<Team> {
    const response = await api.patch(`/teams/${teamId}/`, data)
    return response.data
  }

  async deleteTeam(teamId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/`)
  }

  // Members
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const response = await api.get(`/teams/${teamId}/members/`)
    return response.data
  }

  async updateMemberRole(teamId: string, memberId: string, role: TeamRole): Promise<TeamMember> {
    const response = await api.patch(`/teams/${teamId}/members/${memberId}/`, { role })
    return response.data
  }

  async removeMember(teamId: string, memberId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${memberId}/`)
  }

  // Invitations
  async inviteMember(teamId: string, data: { email: string; role: TeamRole }): Promise<TeamInvitation> {
    const response = await api.post(`/teams/${teamId}/invitations/`, data)
    return response.data
  }

  async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    const response = await api.get(`/teams/${teamId}/invitations/`)
    return response.data
  }

  async getMyInvitations(): Promise<TeamInvitation[]> {
    const response = await api.get('/teams/invitations/me/')
    return response.data
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    await api.post(`/teams/invitations/${invitationId}/accept/`)
  }

  async declineInvitation(invitationId: string): Promise<void> {
    await api.post(`/teams/invitations/${invitationId}/decline/`)
  }

  async cancelInvitation(teamId: string, invitationId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/invitations/${invitationId}/`)
  }

  // Statistics
  async getTeamStats(teamId: string): Promise<TeamStats> {
    const response = await api.get(`/teams/${teamId}/stats/`)
    return response.data
  }

  // Audit Log
  async getAuditLog(teamId: string, params?: { limit?: number; offset?: number }): Promise<TeamAuditLog[]> {
    const response = await api.get(`/teams/${teamId}/audit-log/`, { params })
    return response.data
  }

  // API Keys
  async getTeamAPIKeys(teamId: string): Promise<TeamAPIKey[]> {
    const response = await api.get(`/teams/${teamId}/api-keys/`)
    return response.data
  }

  async createTeamAPIKey(teamId: string, name: string): Promise<TeamAPIKey & { key: string }> {
    const response = await api.post(`/teams/${teamId}/api-keys/`, { name })
    return response.data
  }

  async deleteTeamAPIKey(teamId: string, keyId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/api-keys/${keyId}/`)
  }
}

export const teamService = new TeamService()
export default teamService
