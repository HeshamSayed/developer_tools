import { useState } from 'react'
import { formatJSON } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)

  const handleFormat = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setProcessingTime(null)

    try {
      const result = await formatJSON(input, indent)
      if (result.success) {
        setOutput(result.result)
        setProcessingTime(result.metadata?.processing_time_ms || null)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to format JSON')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Input JSON
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Indent:
            </label>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea"
          rows={12}
          placeholder='{"name":"John","age":30,"city":"New York"}'
        />
      </div>

      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={handleFormat}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Formatting...' : 'Format JSON'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Formatted JSON
            </label>
            <div className="flex items-center gap-2">
              {processingTime !== null && (
                <span className="text-xs text-gray-500">
                  {processingTime.toFixed(2)}ms
                </span>
              )}
              <CopyButton text={output} />
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900"
            rows={12}
          />
        </div>
      )}
    </div>
  )
}
