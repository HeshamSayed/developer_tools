import { useState } from 'react'
import { utilityTools } from '@/services/backendApi'

export default function JSONDiffViewer() {
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [error, setError] = useState('')
  const [diff, setDiff] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    setError('')
    setDiff([])

    if (!input1.trim() || !input2.trim()) {
      setError('Please enter both JSON objects to compare')
      return
    }

    try {
      setLoading(true)
      const response = await utilityTools.jsonDiff({ json1: input1, json2: input2 })
      if (response.success) {
        setDiff(response.differences)
      } else {
        setError('Comparison failed')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInput1('')
    setInput2('')
    setDiff([])
    setError('')
  }

  const loadSample = () => {
    setInput1(`{
  "name": "John",
  "age": 30,
  "city": "New York",
  "skills": ["JavaScript", "Python"]
}`)
    setInput2(`{
  "name": "John",
  "age": 31,
  "country": "USA",
  "skills": ["JavaScript", "Python", "Go"]
}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">JSON 1 (Original)</label>
          <textarea value={input1} onChange={(e) => setInput1(e.target.value)} className="textarea font-mono" rows={10} placeholder="Enter first JSON..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">JSON 2 (Modified)</label>
          <textarea value={input2} onChange={(e) => setInput2(e.target.value)} className="textarea font-mono" rows={10} placeholder="Enter second JSON..." />
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleCompare} disabled={!input1.trim() || !input2.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Comparing...' : 'Compare JSON'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {diff.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Differences ({diff.length})</h3>
          <div className="space-y-2">
            {diff.map((d, i) => (
              <div key={i} className={`p-3 rounded border-l-4 ${
                d.type === 'added' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                d.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              }`}>
                <div className="font-mono text-sm">
                  <span className="font-bold">{d.path}</span>
                  {d.type === 'added' && <span className="text-green-600 dark:text-green-400 ml-2">+ Added: {JSON.stringify(d.value)}</span>}
                  {d.type === 'removed' && <span className="text-red-600 dark:text-red-400 ml-2">- Removed: {JSON.stringify(d.value)}</span>}
                  {d.type === 'modified' && (
                    <div className="mt-1 ml-2">
                      <div className="text-red-600 dark:text-red-400">- {JSON.stringify(d.old)}</div>
                      <div className="text-green-600 dark:text-green-400">+ {JSON.stringify(d.new)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {diff.length === 0 && input1 && input2 && !error && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
          <p className="text-green-800 dark:text-green-200">No differences found - JSON objects are identical!</p>
        </div>
      )}
    </div>
  )
}
