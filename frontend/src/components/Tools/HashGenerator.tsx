import { useState } from 'react'
import { generateHash } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState({
    md5: true,
    sha1: true,
    sha256: true,
    sha512: true,
  })

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setHashes({})

    const algorithms = Object.entries(selectedAlgorithms)
      .filter(([_, selected]) => selected)
      .map(([algo]) => algo)

    if (algorithms.length === 0) {
      setError('Please select at least one algorithm')
      setLoading(false)
      return
    }

    try {
      const result = await generateHash(input, algorithms)
      if (result.success) {
        setHashes(result.hashes)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate hashes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text to Hash
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea"
          rows={6}
          placeholder="Enter text to generate hashes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Hash Algorithms
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(selectedAlgorithms).map(([algo, selected]) => (
            <label key={algo} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) =>
                  setSelectedAlgorithms({ ...selectedAlgorithms, [algo]: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">{algo}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : 'Generate Hashes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-4">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                  {algo}
                </span>
                <CopyButton text={hash} />
              </div>
              <code className="block text-xs text-gray-800 dark:text-gray-200 font-mono break-all">
                {hash}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
