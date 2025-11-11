import { useState, useRef } from 'react'
import { formatCSS, minifyCSS } from '@/services/api'
import CodeBlock from '@/components/Common/CodeBlock'
import { saveAs } from 'file-saver'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function CSSFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'format' | 'minify'>('format')
  const [indentSize, setIndentSize] = useState(2)
  const [savings, setSavings] = useState<{ original: number; minified: number; percent: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProcess = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setSavings(null)

    try {
      const result = mode === 'format'
        ? await formatCSS(input, indentSize)
        : await minifyCSS(input)

      if (result.success) {
        setOutput(result.result)
        if (mode === 'minify' && result.original_size) {
          setSavings({
            original: result.original_size,
            minified: result.minified_size,
            percent: result.savings_percent
          })
        }
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${mode} CSS`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setInput(text)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/css;charset=utf-8' })
    const filename = mode === 'format' ? 'formatted.css' : 'minified.css'
    saveAs(blob, filename)
  }

  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      callback: () => {
        if (input && !loading) {
          handleProcess()
        }
      }
    }
  ])

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setMode('format')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mode === 'format'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Format
        </button>
        <button
          onClick={() => setMode('minify')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mode === 'minify'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Minify
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          CSS Input
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-sm"
          >
            📁 Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".css,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="textarea"
        rows={12}
        placeholder=".container { width: 100%; padding: 20px; }"
      />

      {mode === 'format' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Indent Size
          </label>
          <input
            type="number"
            min="0"
            max="8"
            value={indentSize}
            onChange={(e) => setIndentSize(parseInt(e.target.value) || 2)}
            className="input w-24"
          />
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleProcess}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Processing...' : `${mode === 'format' ? 'Format' : 'Minify'} CSS (Ctrl+Enter)`}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {savings && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Savings</h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <p>Original Size: {savings.original} bytes</p>
            <p>Minified Size: {savings.minified} bytes</p>
            <p className="font-semibold">Saved: {savings.percent}%</p>
          </div>
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === 'format' ? 'Formatted' : 'Minified'} CSS
            </label>
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
            >
              ⬇️ Download
            </button>
          </div>
          <CodeBlock code={output} language="css" title="Result" />
        </div>
      )}
    </div>
  )
}
