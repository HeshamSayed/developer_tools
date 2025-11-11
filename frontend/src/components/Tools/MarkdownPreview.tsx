import { useState, useRef } from 'react'
import { previewMarkdown } from '@/services/api'
import { saveAs } from 'file-saver'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function MarkdownPreview() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePreview = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const result = await previewMarkdown(input)
      if (result.success) {
        setOutput(result.result)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to preview markdown')
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

  const handleDownloadMarkdown = () => {
    const blob = new Blob([input], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, 'document.md')
  }

  const handleDownloadHTML = () => {
    const blob = new Blob([output], { type: 'text/html;charset=utf-8' })
    saveAs(blob, 'document.html')
  }

  // Keyboard shortcuts: Ctrl+Enter to preview
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      callback: () => {
        if (input && !loading) {
          handlePreview()
        }
      }
    }
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Markdown Editor
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary text-sm"
              >
                📁 Upload
              </button>
              <button
                onClick={handleDownloadMarkdown}
                disabled={!input}
                className="btn btn-secondary text-sm"
              >
                ⬇️ Download MD
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea"
            rows={20}
            placeholder="# Heading&#10;&#10;Write your **markdown** here..."
          />

          <div className="flex justify-center">
            <button
              onClick={handlePreview}
              disabled={loading || !input}
              className="btn btn-primary px-8"
            >
              {loading ? 'Rendering...' : 'Preview (Ctrl+Enter)'}
            </button>
          </div>
        </div>

        {/* Preview Side */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              HTML Preview
            </h3>
            {output && (
              <button
                onClick={handleDownloadHTML}
                className="btn btn-secondary text-sm"
              >
                ⬇️ Download HTML
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {output ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[500px] bg-white dark:bg-gray-800">
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[500px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {input ? 'Click "Preview" to see the rendered HTML' : 'Start writing markdown to see the preview'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
