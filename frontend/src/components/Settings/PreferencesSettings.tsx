import { useState, useEffect } from 'react'

interface Preferences {
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
  usageAlerts: boolean
  weeklyReport: boolean
  defaultView: 'grid' | 'list'
  language: string
}

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'system',
    emailNotifications: true,
    usageAlerts: true,
    weeklyReport: false,
    defaultView: 'grid',
    language: 'en',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse preferences')
      }
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences))

      // Apply theme immediately
      if (preferences.theme === 'dark') {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else if (preferences.theme === 'light') {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      setMessage('Preferences saved successfully!')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {message && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">{message}</p>
        </div>
      )}

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updatePreference('theme', theme)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                preferences.theme === theme
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {theme === 'light' && (
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
                {theme === 'dark' && (
                  <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
                {theme === 'system' && (
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {theme}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Notifications
        </h3>

        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">General Notifications</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates and announcements</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.emailNotifications}
            onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Usage Alerts</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when approaching quota limits</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.usageAlerts}
            onChange={(e) => updatePreference('usageAlerts', e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Weekly Report</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly usage summary</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.weeklyReport}
            onChange={(e) => updatePreference('weeklyReport', e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
        </label>
      </div>

      {/* Default View */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Default Tools View
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updatePreference('defaultView', 'grid')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              preferences.defaultView === 'grid'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">Grid</span>
            </div>
          </button>
          <button
            onClick={() => updatePreference('defaultView', 'list')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              preferences.defaultView === 'list'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">List</span>
            </div>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
