import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamService } from '@/services/teamService'
import type { Team } from '@/types/team'
import Loading from '@/components/Common/Loading'
import ProfessionalCard from '@/components/Common/ProfessionalCard'
import ProfessionalButton from '@/components/Common/ProfessionalButton'
import ProfessionalSection from '@/components/Common/ProfessionalSection'

export default function TeamsList() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      setLoading(true)
      const data = await teamService.getMyTeams()
      setTeams(data)
    } catch (err) {
      console.error('Failed to load teams', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      await teamService.createTeam({ name: teamName, description: teamDescription })
      setTeamName('')
      setTeamDescription('')
      setShowCreateForm(false)
      await loadTeams()
    } catch (err) {
      alert('Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <Loading size="lg" text="Loading teams..." fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ProfessionalSection background="transparent" padding="lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                My Teams
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage your teams and collaborate with members
              </p>
            </div>

            {/* Create Team Button */}
            {!showCreateForm && (
              <ProfessionalButton
                onClick={() => setShowCreateForm(true)}
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Create Team
              </ProfessionalButton>
            )}
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8">
            <ProfessionalCard gradient padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Team
                </h3>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Engineering Team"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    Description (Optional)
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Collaborative workspace for faster development"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <ProfessionalButton
                    type="submit"
                    disabled={creating}
                    loading={creating}
                    size="lg"
                  >
                    {creating ? 'Creating...' : 'Create Team'}
                  </ProfessionalButton>
                  <ProfessionalButton
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    size="lg"
                  >
                    Cancel
                  </ProfessionalButton>
                </div>
              </form>
            </ProfessionalCard>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <ProfessionalCard padding="lg" className="text-center">
            <div className="py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No teams yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first team to start collaborating with others
              </p>
              <ProfessionalButton
                onClick={() => setShowCreateForm(true)}
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Create Your First Team
              </ProfessionalButton>
            </div>
          </ProfessionalCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="block"
              >
                <ProfessionalCard hover padding="lg" className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-wide">
                      {team.subscription_tier}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {team.name}
                  </h3>

                  {team.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <span>{team.member_count} member{team.member_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </ProfessionalCard>
              </Link>
            ))}
          </div>
        )}
      </ProfessionalSection>
    </div>
  )
}
