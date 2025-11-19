import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { teamService } from '@/services/teamService'
import type { Team, TeamStats } from '@/types/team'
import Loading from '@/components/Common/Loading'
import TeamOverview from '@/components/Team/TeamOverview'
import MemberManagement from '@/components/Team/MemberManagement'
import TeamAnalytics from '@/components/Team/TeamAnalytics'
import TeamAPIKeys from '@/components/Team/TeamAPIKeys'
import AuditLog from '@/components/Team/AuditLog'

type TabType = 'overview' | 'members' | 'analytics' | 'api-keys' | 'audit-log'

export default function TeamDashboard() {
  const { teamId } = useParams<{ teamId: string }>()
  const [team, setTeam] = useState<Team | null>(null)
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    if (teamId) {
      loadTeamData()
    }
  }, [teamId])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const [teamData, statsData] = await Promise.all([
        teamService.getTeam(teamId!),
        teamService.getTeamStats(teamId!),
      ])
      setTeam(teamData)
      setStats(statsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="Loading team..." fullScreen />
  }

  if (error || !team || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Team not found'}</p>
          <Link to="/teams" className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Back to Teams
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'members', name: 'Members', icon: '👥', count: team.member_count },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'api-keys', name: 'API Keys', icon: '🔑' },
    { id: 'audit-log', name: 'Audit Log', icon: '📋' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link to="/teams" className="hover:text-primary-600 dark:hover:text-primary-400">
              Teams
            </Link>
            <span>→</span>
            <span>{team.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {team.name}
              </h1>
              {team.description && (
                <p className="text-gray-600 dark:text-gray-400">{team.description}</p>
              )}
            </div>
            <Link
              to={`/teams/${teamId}/settings`}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                  {'count' in tab && tab.count !== undefined && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <TeamOverview stats={stats} />}
            {activeTab === 'members' && <MemberManagement teamId={team.id} onMemberChange={loadTeamData} />}
            {activeTab === 'analytics' && <TeamAnalytics stats={stats} />}
            {activeTab === 'api-keys' && <TeamAPIKeys teamId={team.id} />}
            {activeTab === 'audit-log' && <AuditLog teamId={team.id} />}
          </div>
        </div>
      </div>
    </div>
  )
}
