import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { teamService } from '@/services/teamService'
import type { Team, TeamStats } from '@/types/team'
import Loading from '@/components/Common/Loading'
import ProfessionalCard from '@/components/Common/ProfessionalCard'
import ProfessionalButton from '@/components/Common/ProfessionalButton'
import ProfessionalSection from '@/components/Common/ProfessionalSection'
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
        <ProfessionalCard padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Team not found'}
          </h3>
          <ProfessionalButton to="/teams" className="mt-4">
            ← Back to Teams
          </ProfessionalButton>
        </ProfessionalCard>
      </div>
    )
  }

  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'members',
      name: 'Members',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      count: team.member_count
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      id: 'api-keys',
      name: 'API Keys',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    },
    {
      id: 'audit-log',
      name: 'Audit Log',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ProfessionalSection background="transparent" padding="lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 mb-6">
          <ProfessionalButton to="/teams" variant="ghost" size="sm">
            Teams
          </ProfessionalButton>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 dark:text-white">{team.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <ProfessionalCard gradient padding="lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {team.name}
                  </h1>
                  {team.description && (
                    <p className="text-lg text-gray-700 dark:text-gray-300">{team.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                      {team.subscription_tier}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold border-2 border-gray-200 dark:border-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <ProfessionalButton
                to={`/teams/${teamId}/settings`}
                variant="secondary"
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Settings
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        </div>

        {/* Tabs */}
        <ProfessionalCard padding="sm" className="mb-8">
          <div className="border-b-2 border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-0.5 overflow-x-auto gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-6 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-gradient-to-b from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                  {'count' in tab && tab.count !== undefined && (
                    <span className={`ml-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
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
        </ProfessionalCard>
      </ProfessionalSection>
    </div>
  )
}
