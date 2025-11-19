import { useState } from 'react'
import { backendApi } from '@/services/backendApi'

type Language = 'javascript' | 'css' | 'html'
type Mode = 'minify' | 'beautify'

interface MinifyOptions {
  keepImportantComments?: boolean
  removeComments?: boolean
  removeEmptySpace?: boolean
  reduceBooleanAttributes?: boolean
}

interface BeautifyOptions {
  indentSize?: number
  indentWithTabs?: boolean
  maxPreserveNewlines?: number
  preserveNewlines?: boolean
  keepArrayIndentation?: boolean
  breakChainedMethods?: boolean
  braceStyle?: 'collapse' | 'expand' | 'end-expand'
  spaceBeforeConditional?: boolean
  unescapeStrings?: boolean
  wrapLineLength?: number
  endWithNewline?: boolean
  commaFirst?: boolean
  operatorPosition?: 'before-newline' | 'after-newline' | 'preserve-newline'
  selectorSeparatorNewline?: boolean
  newlineBetweenRules?: boolean
  spaceAroundCombinator?: boolean
}

interface Statistics {
  original: {
    size: number
    lines: number
    size_formatted: string
  }
  minified?: {
    size: number
    lines: number
    size_formatted: string
  }
  beautified?: {
    size: number
    lines: number
    size_formatted: string
  }
  saved?: {
    bytes: number
    percentage: number
    size_formatted: string
  }
}

export default function CodeMinifier() {
  const [mode, setMode] = useState<Mode>('minify')
  const [language, setLanguage] = useState<Language>('javascript')
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [showOptions, setShowOptions] = useState(false)

  // Minify Options
  const [minifyOptions, setMinifyOptions] = useState<MinifyOptions>({
    keepImportantComments: false,
    removeComments: true,
    removeEmptySpace: true,
    reduceBooleanAttributes: true,
  })

  // Beautify Options
  const [beautifyOptions, setBeautifyOptions] = useState<BeautifyOptions>({
    indentSize: 2,
    indentWithTabs: false,
    maxPreserveNewlines: 2,
    preserveNewlines: true,
    keepArrayIndentation: false,
    breakChainedMethods: false,
    braceStyle: 'collapse',
    spaceBeforeConditional: true,
    unescapeStrings: false,
    wrapLineLength: 0,
    endWithNewline: true,
    commaFirst: false,
    operatorPosition: 'before-newline',
    selectorSeparatorNewline: true,
    newlineBetweenRules: true,
    spaceAroundCombinator: false,
  })

  const handleProcess = async () => {
    if (!inputCode.trim()) {
      setError('Please enter code to process')
      return
    }

    setLoading(true)
    setError('')
    setOutputCode('')
    setStatistics(null)

    try {
      const endpoint = mode === 'minify' ? '/api/tools/code/minify' : '/api/tools/code/beautify'
      const options = mode === 'minify' ? minifyOptions : beautifyOptions

      const result = await backendApi.post(endpoint, {
        code: inputCode,
        language,
        options,
      })

      if (mode === 'minify') {
        setOutputCode(result.minified)
      } else {
        setOutputCode(result.beautified)
      }

      setStatistics(result.statistics)
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} code`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInputCode('')
    setOutputCode('')
    setError('')
    setStatistics(null)
  }

  const handleSwap = () => {
    setInputCode(outputCode)
    setOutputCode('')
    setStatistics(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCode = (code: string) => {
    const extensions = { javascript: 'js', css: 'css', html: 'html' }
    const filename = `${mode}d-code.${extensions[language]}`
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    const samples = {
      javascript: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}`,
      css: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>This is a sample HTML document.</p>
  </div>
</body>
</html>`,
    }
    setInputCode(samples[language])
  }

  return (
    <div className="space-y-6">
      {/* Mode and Language Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('minify')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'minify'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Minify
            </button>
            <button
              onClick={() => setMode('beautify')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'beautify'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Beautify
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>
        </div>
      </div>

      {/* Options Toggle */}
      <div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showOptions ? '▼' : '▶'} {mode === 'minify' ? 'Minification' : 'Beautification'} Options
        </button>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          {mode === 'minify' ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Minification Options</h3>

              {language === 'css' && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={minifyOptions.keepImportantComments}
                    onChange={(e) =>
                      setMinifyOptions({ ...minifyOptions, keepImportantComments: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Keep important comments (/*! */)
                  </span>
                </label>
              )}

              {language === 'html' && (
                <>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={minifyOptions.removeComments}
                      onChange={(e) => setMinifyOptions({ ...minifyOptions, removeComments: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Remove comments</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={minifyOptions.removeEmptySpace}
                      onChange={(e) => setMinifyOptions({ ...minifyOptions, removeEmptySpace: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Remove empty space</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={minifyOptions.reduceBooleanAttributes}
                      onChange={(e) =>
                        setMinifyOptions({ ...minifyOptions, reduceBooleanAttributes: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Reduce boolean attributes (checked="checked" → checked)
                    </span>
                  </label>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">General Options</h3>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Indent Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={beautifyOptions.indentSize}
                    onChange={(e) =>
                      setBeautifyOptions({ ...beautifyOptions, indentSize: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={beautifyOptions.indentWithTabs}
                    onChange={(e) => setBeautifyOptions({ ...beautifyOptions, indentWithTabs: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Use tabs instead of spaces</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={beautifyOptions.endWithNewline}
                    onChange={(e) => setBeautifyOptions({ ...beautifyOptions, endWithNewline: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">End with newline</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={beautifyOptions.preserveNewlines}
                    onChange={(e) => setBeautifyOptions({ ...beautifyOptions, preserveNewlines: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Preserve newlines</span>
                </label>
              </div>

              {language === 'javascript' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">JavaScript Options</h3>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Brace Style
                    </label>
                    <select
                      value={beautifyOptions.braceStyle}
                      onChange={(e) =>
                        setBeautifyOptions({
                          ...beautifyOptions,
                          braceStyle: e.target.value as 'collapse' | 'expand' | 'end-expand',
                        })
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    >
                      <option value="collapse">Collapse</option>
                      <option value="expand">Expand</option>
                      <option value="end-expand">End-Expand</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={beautifyOptions.spaceBeforeConditional}
                      onChange={(e) =>
                        setBeautifyOptions({ ...beautifyOptions, spaceBeforeConditional: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Space before conditional</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={beautifyOptions.breakChainedMethods}
                      onChange={(e) =>
                        setBeautifyOptions({ ...beautifyOptions, breakChainedMethods: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Break chained methods</span>
                  </label>
                </div>
              )}

              {language === 'css' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CSS Options</h3>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={beautifyOptions.selectorSeparatorNewline}
                      onChange={(e) =>
                        setBeautifyOptions({ ...beautifyOptions, selectorSeparatorNewline: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Selector separator newline</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={beautifyOptions.newlineBetweenRules}
                      onChange={(e) =>
                        setBeautifyOptions({ ...beautifyOptions, newlineBetweenRules: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Newline between rules</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={beautifyOptions.spaceAroundCombinator}
                      onChange={(e) =>
                        setBeautifyOptions({ ...beautifyOptions, spaceAroundCombinator: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Space around combinator</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleProcess}
          disabled={loading || !inputCode.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Processing...' : mode === 'minify' ? 'Minify Code' : 'Beautify Code'}
        </button>

        <button
          onClick={loadSample}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Load Sample
        </button>

        <button
          onClick={handleClear}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Clear
        </button>

        {outputCode && (
          <button
            onClick={handleSwap}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            ↻ Use Output as Input
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Original Size</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {statistics.original.size_formatted}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{statistics.original.lines} lines</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mode === 'minify' ? 'Minified' : 'Beautified'} Size
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {mode === 'minify' ? statistics.minified?.size_formatted : statistics.beautified?.size_formatted}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {mode === 'minify' ? statistics.minified?.lines : statistics.beautified?.lines} lines
              </div>
            </div>

            {mode === 'minify' && statistics.saved && (
              <>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Saved</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {statistics.saved.size_formatted}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{statistics.saved.percentage}%</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compression</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.saved.percentage.toFixed(1)}%
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Code Editor - Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">Input Code</label>
            <button
              onClick={() => copyToClipboard(inputCode)}
              disabled={!inputCode}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              Copy
            </button>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder={`Paste your ${language.toUpperCase()} code here...`}
            rows={20}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-y"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {mode === 'minify' ? 'Minified' : 'Beautified'} Code
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(outputCode)}
                disabled={!outputCode}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                Copy
              </button>
              <button
                onClick={() => downloadCode(outputCode)}
                disabled={!outputCode}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            value={outputCode}
            readOnly
            placeholder="Output will appear here..."
            rows={20}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-y"
          />
        </div>
      </div>
    </div>
  )
}
