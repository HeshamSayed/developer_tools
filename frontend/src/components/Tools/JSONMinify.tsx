import { useState } from 'react'
import { minifyJSON } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function JSONMinify() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState<any>(null)

  const handleMinify = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setMetadata(null)

    try {
      const result = await minifyJSON(input)
      if (result.success) {
        setOutput(result.result)
        setMetadata(result.metadata)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to minify JSON')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea"
          rows={12}
          placeholder={'{\n  "name": "John",\n  "age": 30\n}'}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleMinify}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Minifying...' : 'Minify JSON'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Minified JSON
            </label>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900"
            rows={8}
          />
          {metadata && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Size reduction: {metadata.reduction}% (from {metadata.original_size} to {metadata.minified_size} bytes)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
