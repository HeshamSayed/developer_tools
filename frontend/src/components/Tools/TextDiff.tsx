import { useState } from 'react'
import { textDiff } from '@/services/api'

export default function TextDiff() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCompare = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await textDiff(text1, text2)
      if (response.success) {
        setResult(response)
      } else {
        setError(response.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to compare texts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text 1
          </label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="textarea"
            rows={12}
            placeholder="Enter first text..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text 2
          </label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="textarea"
            rows={12}
            placeholder="Enter second text..."
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="btn btn-primary px-8"
        >
          {loading ? 'Comparing...' : 'Compare Texts'}
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
            <p className="text-sm">
              <span className="font-medium">Similarity:</span> {result.similarity}%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diff Output
            </label>
            <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
              {result.diff}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
