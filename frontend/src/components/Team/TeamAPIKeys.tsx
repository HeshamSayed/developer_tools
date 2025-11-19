import { useState, useEffect } from 'react'
import { teamService } from '@/services/teamService'
import type { TeamAPIKey } from '@/types/team'

interface TeamAPIKeysProps {
  teamId: string
}

export default function TeamAPIKeys({ teamId }: TeamAPIKeysProps) {
  const [apiKeys, setApiKeys] = useState<TeamAPIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadKeys()
  }, [teamId])

  const loadKeys = async () => {
    try {
      setLoading(true)
      const keys = await teamService.getTeamAPIKeys(teamId)
      setApiKeys(keys)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load API keys' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setMessage(null)

    try {
      const result = await teamService.createTeamAPIKey(teamId, keyName)
      setNewKey(result.key)
      setKeyName('')
      setShowForm(false)
      await loadKeys()
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to create API key' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (keyId: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return

    try {
      await teamService.deleteTeamAPIKey(teamId, keyId)
      setMessage({ type: 'success', text: 'API key deleted' })
      await loadKeys()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete API key' })
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setMessage({ type: 'success', text: 'Key copied to clipboard' })
    setTimeout(() => setMessage(null), 2000)
  }

  if (loading) {
    return <div className="text-center py-8">Loading API keys...</div>
  }

  return (
    <div className="space-y-6">
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

      {newKey && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
            API Key Created! Copy it now - you won't see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-sm font-mono">
              {newKey}
            </code>
            <button
              onClick={() => copyKey(newKey)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
            >
              Copy
            </button>
            <button
              onClick={() => setNewKey(null)}
              className="text-green-600 dark:text-green-400"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team API Keys ({apiKeys.length})
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
          >
            Create API Key
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="API Key Name (e.g., Production Server)"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {apiKeys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{key.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded font-mono text-xs">
                  {key.key_prefix}...
                </code>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Created by {key.created_by_username} •{' '}
                {key.total_requests.toLocaleString()} requests
              </p>
            </div>
            <button
              onClick={() => handleDelete(key.id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {apiKeys.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No API keys yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  )
}
