import { useState } from 'react'
import { utilityTools } from '@/services/backendApi'

export default function StringLengthCalculator() {
  const [input, setInput] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    setError('')
    setStats(null)

    if (!input.trim()) {
      setError('Please enter text to analyze')
      return
    }

    try {
      setLoading(true)
      const response = await utilityTools.stringLength({ input })
      if (response.success) {
        setStats(response.result)
      } else {
        setError('Calculation failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setInput(`Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco.`)
    setStats(null)
    setError('')
  }

  const handleClear = () => {
    setInput('')
    setStats(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Text</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="textarea font-mono" rows={12} placeholder="Enter or paste your text here..." />
      </div>

      <div className="flex justify-center">
        <button onClick={handleCalculate} disabled={!input.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Calculating...' : 'Calculate Stats'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.chars.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Characters</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">{stats.charsNoSpaces.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Characters (no spaces)</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.words.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Words</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.sentences.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sentences</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.lines.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lines</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.paragraphs.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Paragraphs</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.bytes.toLocaleString()}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bytes</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{(stats.bytes / 1024).toFixed(2)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">KB</div>
        </div>
        </div>
      )}
    </div>
  )
}
