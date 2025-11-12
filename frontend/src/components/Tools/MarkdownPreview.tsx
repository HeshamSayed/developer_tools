import { useState, useRef } from 'react'

export default function MarkdownPreview() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [renderMode, setRenderMode] = useState<'html' | 'source'>('html')

  // Simple markdown to HTML converter (client-side)
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>')

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>')

    // Strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>')

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')

    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (_match, _lang, code) => {
      return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"><code class="text-sm">${code.trim()}</code></pre>`
    })

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline" target="_blank" rel="noopener noreferrer">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1 my-4">$1</ul>')

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">$1</blockquote>')

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-4 border-gray-300 dark:border-gray-600" />')
    html = html.replace(/^\*\*\*$/gim, '<hr class="my-4 border-gray-300 dark:border-gray-600" />')

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4">')
    html = html.replace(/\n/g, '<br />')

    // Wrap in paragraphs
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre')) {
      html = '<p class="mb-4">' + html + '</p>'
    }

    return html
  }

  const handlePreview = () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const html = convertMarkdownToHTML(input)
      setOutput(html)
    } catch (err: any) {
      setError('Failed to preview markdown: ' + err.message)
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
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadHTML = () => {
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #666; margin: 16px 0; font-style: italic; }
        ul, ol { padding-left: 24px; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
${output}
</body>
</html>`
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    setInput(`# Markdown Preview

## Features

This is a **powerful** markdown editor with *live preview*.

### Supported Elements

- **Bold** and *italic* text
- \`inline code\` and code blocks
- [Links](https://example.com)
- Lists and blockquotes

> This is a blockquote with some **bold** text.

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### More Features

1. Numbered lists
2. Strike through ~~text~~
3. Horizontal rules

---

**Try it out!** Edit this markdown to see the preview.`)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample markdown"
          >
            📋 Sample
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-sm"
            title="Upload markdown file"
          >
            📁 Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
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
          {input && (
            <button
              onClick={handleDownloadMarkdown}
              className="btn btn-secondary text-sm"
              title="Download as Markdown"
            >
              💾 Download MD
            </button>
          )}
          {output && (
            <button
              onClick={handleDownloadHTML}
              className="btn btn-secondary text-sm"
              title="Download as HTML"
            >
              💾 Download HTML
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              📝 Markdown Editor
            </h3>
            <span className="text-xs text-gray-500">
              {input.length} characters
            </span>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea font-mono text-sm"
            rows={24}
            placeholder="# Start writing your markdown here..."
          />

          <div className="flex justify-center">
            <button
              onClick={handlePreview}
              disabled={loading || !input}
              className="btn btn-primary px-8"
            >
              {loading ? 'Rendering...' : '✨ Preview Markdown'}
            </button>
          </div>
        </div>

        {/* Preview Side */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🌐 HTML Preview
            </h3>
            {output && (
              <div className="flex gap-2">
                <button
                  onClick={() => setRenderMode('html')}
                  className={`px-3 py-1 text-xs rounded ${
                    renderMode === 'html'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setRenderMode('source')}
                  className={`px-3 py-1 text-xs rounded ${
                    renderMode === 'source'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  HTML Source
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                ❌ Error
              </h3>
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {output ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[600px] bg-white dark:bg-gray-900 overflow-auto">
              {renderMode === 'html' ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
              ) : (
                <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {output}
                </pre>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 min-h-[600px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  {input ? '👆 Click "Preview Markdown" to see the rendered HTML' : '👈 Start writing markdown to see the preview'}
                </p>
                <p className="text-xs text-gray-400">
                  Supports headers, bold, italic, links, code blocks, lists, and more!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Markdown Cheatsheet */}
      <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
          📖 Markdown Cheatsheet
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Headers</p>
            <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded"># H1<br />## H2<br />### H3</code>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Emphasis</p>
            <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded">**bold**<br />*italic*<br />~~strikethrough~~</code>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Lists</p>
            <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded">- Item 1<br />- Item 2<br />1. First<br />2. Second</code>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Links & Images</p>
            <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded">[text](url)<br />![alt](image.jpg)</code>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Code</p>
            <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded">`inline code`<br />```<br />code block<br />```</code>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Blockquote</p>
            <code className="block text-xs bg-white dark:bg-gray-900 p-2 rounded">{'>'} Quote text</code>
          </div>
        </div>
      </details>
    </div>
  )
}
