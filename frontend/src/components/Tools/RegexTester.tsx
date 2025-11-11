import { useState } from 'react'
import { regexTest } from '@/services/api'

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [text, setText] = useState('')
  const [flags, setFlags] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTest = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await regexTest(pattern, text, flags)
      if (response.success) {
        setResult(response)
      } else {
        setError(response.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to test regex')
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = (flag: string) => {
    setFlags(prev =>
      prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Regex Pattern
        </label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="input font-mono"
          placeholder="e.g., \d{3}-\d{3}-\d{4}"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Flags
        </label>
        <div className="flex gap-4">
          {['i', 'm', 's'].map(flag => (
            <label key={flag} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.includes(flag)}
                onChange={() => toggleFlag(flag)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {flag === 'i' && 'Ignore Case'}
                {flag === 'm' && 'Multiline'}
                {flag === 's' && 'Dot All'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test String
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea"
          rows={8}
          placeholder="Enter text to test against..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleTest}
          disabled={loading || !pattern}
          className="btn btn-primary px-8"
        >
          {loading ? 'Testing...' : 'Test Regex'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium">
              Found {result.match_count} match(es)
            </p>
          </div>

          {result.matches && result.matches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Matches:</h3>
              {result.matches.map((match: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Match {index + 1}:</span> {match.match}</p>
                    <p><span className="font-medium">Position:</span> {match.start} - {match.end}</p>
                    {match.groups && match.groups.length > 0 && (
                      <p><span className="font-medium">Groups:</span> {JSON.stringify(match.groups)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
