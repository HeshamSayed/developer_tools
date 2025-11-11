import { useState } from 'react'
import { generateLoremIpsum } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function LoremIpsumGenerator() {
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [count, setCount] = useState(5)
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [startWithLorem, setStartWithLorem] = useState(true)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const result = await generateLoremIpsum(count, unit, startWithLorem)

      if (result.success) {
        setOutput(result.result)
      } else {
        setError(result.error || 'Failed to generate Lorem Ipsum')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate Lorem Ipsum')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'paragraphs' | 'sentences' | 'words')}
            className="input"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Count
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="input"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Start with "Lorem ipsum"
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : 'Generate Lorem Ipsum'}
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
              Generated Text
            </label>
            <CopyButton text={output} />
          </div>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm leading-relaxed">
              {output}
            </p>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Character count: {output.length} | Word count: {output.split(/\s+/).filter(w => w).length}
          </div>
        </div>
      )}
    </div>
  )
}
