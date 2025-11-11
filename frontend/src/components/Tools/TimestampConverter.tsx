import { useState } from 'react'
import { convertTimestamp } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function TimestampConverter() {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'timestamp' | 'datetime'>('timestamp')
  const [timezone, setTimezone] = useState('UTC')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await convertTimestamp(input, inputType, timezone)
      if (response.success) {
        setResult(response.result)
      } else {
        setError(response.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to convert timestamp')
    } finally {
      setLoading(false)
    }
  }

  const popularTimezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="timestamp"
              checked={inputType === 'timestamp'}
              onChange={() => setInputType('timestamp')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Timestamp</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="datetime"
              checked={inputType === 'datetime'}
              onChange={() => setInputType('datetime')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Date/Time</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {inputType === 'timestamp' ? 'Timestamp (seconds or milliseconds)' : 'Date/Time String'}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
          placeholder={
            inputType === 'timestamp'
              ? '1234567890 or 1234567890000'
              : '2024-01-15 10:30:00'
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="input"
        >
          {popularTimezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Results</h3>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unix Timestamp (seconds)
              </span>
              <CopyButton text={result.timestamp?.toString() || ''} />
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {result.timestamp}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unix Timestamp (milliseconds)
              </span>
              <CopyButton text={result.timestamp_ms?.toString() || ''} />
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {result.timestamp_ms}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ISO 8601
              </span>
              <CopyButton text={result.iso_8601 || ''} />
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {result.iso_8601}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">UTC</span>
              <CopyButton text={result.utc || ''} />
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {result.utc}
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Local ({timezone})
              </span>
              <CopyButton text={result.local || ''} />
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {result.local}
            </code>
          </div>

          {result.formats && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-3">
                Other Formats
              </span>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-500">Full: </span>
                  <code className="text-gray-800 dark:text-gray-200">{result.formats.full}</code>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-500">Date: </span>
                  <code className="text-gray-800 dark:text-gray-200">{result.formats.date}</code>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-500">Time: </span>
                  <code className="text-gray-800 dark:text-gray-200">{result.formats.time}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
