import { useState, useEffect } from 'react'
import { teamService } from '@/services/teamService'
import type { TeamMember, TeamInvitation, TeamRole } from '@/types/team'
import { getRoleBadgeColor, getRoleIcon } from '@/types/team'

interface MemberManagementProps {
  teamId: string
  onMemberChange?: () => void
}

export default function MemberManagement({ teamId, onMemberChange }: MemberManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('developer')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [teamId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [membersData, invitationsData] = await Promise.all([
        teamService.getTeamMembers(teamId),
        teamService.getTeamInvitations(teamId),
      ])
      setMembers(membersData)
      setInvitations(invitationsData.filter(inv => inv.status === 'pending'))
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to load members' })
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setMessage(null)

    try {
      await teamService.inviteMember(teamId, { email: inviteEmail, role: inviteRole })
      setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` })
      setInviteEmail('')
      setShowInviteForm(false)
      await loadData()
      onMemberChange?.()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to send invitation' })
    } finally {
      setInviting(false)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: TeamRole) => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole)
      setMessage({ type: 'success', text: 'Member role updated' })
      await loadData()
      onMemberChange?.()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update role' })
    }
  }

  const handleRemoveMember = async (memberId: string, username: string) => {
    if (!confirm(`Remove ${username} from the team?`)) return

    try {
      await teamService.removeMember(teamId, memberId)
      setMessage({ type: 'success', text: `${username} removed from team` })
      await loadData()
      onMemberChange?.()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to remove member' })
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await teamService.cancelInvitation(teamId, invitationId)
      setMessage({ type: 'success', text: 'Invitation cancelled' })
      await loadData()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to cancel invitation' })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Invite Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Members ({members.length})
        </h3>
        {!showInviteForm && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Invite Team Member</h4>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="admin">Admin - Full management access</option>
                <option value="developer">Developer - Can use tools and manage API keys</option>
                <option value="viewer">Viewer - Read-only access</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={inviting}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false)
                  setInviteEmail('')
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Pending Invitations ({invitations.length})
          </h4>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{invitation.email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invited by {invitation.invited_by_username} •{' '}
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(invitation.role)}`}>
                    {getRoleIcon(invitation.role)} {invitation.role}
                  </span>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-lg">
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{member.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(member.id, e.target.value as TeamRole)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 focus:outline-none ${getRoleBadgeColor(member.role)}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)} Owner
                  </span>
                )}

                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.username)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
