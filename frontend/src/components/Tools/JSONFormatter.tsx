import { useState, useRef } from 'react'
import { formatJSON } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

interface JSONStats {
  depth: number
  keys: number
  arrays: number
  objects: number
  nulls: number
  booleans: number
  numbers: number
  strings: number
}

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [sortKeys, setSortKeys] = useState(false)
  const [removeWhitespace, setRemoveWhitespace] = useState(false)
  const [escapeUnicode, setEscapeUnicode] = useState(false)
  const [stats, setStats] = useState<JSONStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate JSON statistics
  const calculateStats = (obj: any, depth = 0): JSONStats => {
    const stats: JSONStats = {
      depth,
      keys: 0,
      arrays: 0,
      objects: 0,
      nulls: 0,
      booleans: 0,
      numbers: 0,
      strings: 0
    }

    const traverse = (value: any, currentDepth: number) => {
      if (value === null) {
        stats.nulls++
      } else if (typeof value === 'boolean') {
        stats.booleans++
      } else if (typeof value === 'number') {
        stats.numbers++
      } else if (typeof value === 'string') {
        stats.strings++
      } else if (Array.isArray(value)) {
        stats.arrays++
        stats.depth = Math.max(stats.depth, currentDepth)
        value.forEach(item => traverse(item, currentDepth + 1))
      } else if (typeof value === 'object') {
        stats.objects++
        stats.keys += Object.keys(value).length
        stats.depth = Math.max(stats.depth, currentDepth)
        Object.values(value).forEach(val => traverse(val, currentDepth + 1))
      }
    }

    traverse(obj, 0)
    return stats
  }

  // Sort object keys recursively
  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys)
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((result: any, key) => {
          result[key] = sortObjectKeys(obj[key])
          return result
        }, {})
    }
    return obj
  }

  const handleFormat = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setProcessingTime(null)
    setStats(null)

    try {
      // Parse JSON locally first for additional processing
      let parsed = JSON.parse(input)

      // Apply sort keys if enabled
      if (sortKeys) {
        parsed = sortObjectKeys(parsed)
      }

      // Calculate statistics
      const jsonStats = calculateStats(parsed)
      setStats(jsonStats)

      // Prepare formatted output
      let formatted: string
      if (removeWhitespace) {
        formatted = JSON.stringify(parsed)
      } else {
        formatted = JSON.stringify(parsed, null, indent)
      }

      // Escape unicode if needed
      if (escapeUnicode) {
        formatted = formatted.replace(/[\u007F-\uFFFF]/g, (char) => {
          return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4)
        })
      }

      setOutput(formatted)

      // Still call API for processing time tracking
      const result = await formatJSON(input, indent)
      if (result.success) {
        setProcessingTime(result.metadata?.processing_time_ms || null)
      }
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError(`Invalid JSON: ${err.message}`)
      } else {
        setError(err.response?.data?.error || 'Failed to format JSON')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setInput(content)
    }
    reader.readAsText(file)
  }

  // Download formatted JSON
  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Load sample JSON
  const loadSample = () => {
    const sample = {
      name: "John Doe",
      age: 30,
      email: "john.doe@example.com",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001"
      },
      hobbies: ["reading", "coding", "gaming"],
      social: {
        twitter: "@johndoe",
        github: "johndoe"
      },
      isActive: true,
      balance: 1234.56,
      metadata: null
    }
    setInput(JSON.stringify(sample))
  }

  // Clear all
  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
    setStats(null)
    setSearchQuery('')
  }


  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample JSON"
          >
            📋 Sample
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-sm"
            title="Upload JSON file"
          >
            📁 Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={handleClear}
            className="btn btn-secondary text-sm"
            title="Clear all"
          >
            🗑️ Clear
          </button>
          {output && (
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
              title="Download formatted JSON"
            >
              💾 Download
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Indent:
          </label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            disabled={removeWhitespace}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Sort keys alphabetically
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeWhitespace}
            onChange={(e) => setRemoveWhitespace(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Remove whitespace (minify)
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={escapeUnicode}
            onChange={(e) => setEscapeUnicode(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Escape Unicode characters
          </span>
        </label>
      </div>

      {/* Input Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Input JSON
          </label>
          <span className="text-xs text-gray-500">
            {input.length} characters
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea font-mono"
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
          {loading ? 'Formatting...' : '✨ Format JSON'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📊 JSON Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Depth</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.depth}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Keys</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.keys}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Objects</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.objects}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Arrays</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.arrays}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Strings</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.strings}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Numbers</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.numbers}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Booleans</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.booleans}</div>
            </div>
            <div>
              <div className="text-blue-600 dark:text-blue-400 font-medium">Nulls</div>
              <div className="text-blue-900 dark:text-blue-100 font-semibold">{stats.nulls}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            ❌ Error
          </h3>
          <p className="text-red-800 dark:text-red-200 text-sm font-mono">{error}</p>
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
                <span className="text-xs text-gray-500" title="Processing time">
                  ⚡ {processingTime.toFixed(2)}ms
                </span>
              )}
              <span className="text-xs text-gray-500">
                {output.length} characters
              </span>
              <CopyButton text={output} />
            </div>
          </div>

          {/* Search */}
          <div className="mb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search in output..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900 font-mono text-sm"
            rows={16}
          />

          {/* Quick Info */}
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>Lines: {output.split('\n').length}</span>
            <span>Size: {(output.length / 1024).toFixed(2)} KB</span>
            {removeWhitespace && (
              <span className="text-green-600 dark:text-green-400">
                ✓ Minified
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
