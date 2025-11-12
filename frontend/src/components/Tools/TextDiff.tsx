import { useState, useMemo } from 'react'

interface DiffSegment {
  type: 'equal' | 'delete' | 'insert'
  text: string
}

interface DiffLine {
  type: 'equal' | 'delete' | 'insert' | 'modified'
  oldLineNumber?: number
  newLineNumber?: number
  content: string
  segments?: DiffSegment[]
}

export default function TextDiff() {
  const [originalText, setOriginalText] = useState<string>('')
  const [modifiedText, setModifiedText] = useState<string>('')
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(true)

  // Simple LCS-based diff algorithm
  const computeDiff = (text1: string, text2: string): DiffLine[] => {
    let lines1 = text1.split('\n')
    let lines2 = text2.split('\n')

    if (ignoreWhitespace) {
      lines1 = lines1.map(l => l.trim())
      lines2 = lines2.map(l => l.trim())
    }

    if (!caseSensitive) {
      lines1 = lines1.map(l => l.toLowerCase())
      lines2 = lines2.map(l => l.toLowerCase())
    }

    const result: DiffLine[] = []
    const lcs = getLCS(lines1, lines2)

    let i = 0, j = 0, lcsIndex = 0
    let oldLineNum = 1
    let newLineNum = 1

    while (i < lines1.length || j < lines2.length) {
      if (lcsIndex < lcs.length && i < lines1.length && j < lines2.length &&
          lines1[i] === lcs[lcsIndex] && lines2[j] === lcs[lcsIndex]) {
        // Lines are equal
        result.push({
          type: 'equal',
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
          content: text1.split('\n')[i]
        })
        i++
        j++
        lcsIndex++
      } else if (i < lines1.length && (lcsIndex >= lcs.length || lines1[i] !== lcs[lcsIndex])) {
        // Check if this line is modified (exists in both but different)
        if (j < lines2.length && lines2[j] !== lcs[lcsIndex]) {
          // Modified line - compute character-level diff
          const segments = getCharDiff(text1.split('\n')[i], text2.split('\n')[j])
          result.push({
            type: 'modified',
            oldLineNumber: oldLineNum++,
            newLineNumber: newLineNum++,
            content: text1.split('\n')[i],
            segments
          })
          i++
          j++
        } else {
          // Deleted line
          result.push({
            type: 'delete',
            oldLineNumber: oldLineNum++,
            content: text1.split('\n')[i]
          })
          i++
        }
      } else if (j < lines2.length) {
        // Inserted line
        result.push({
          type: 'insert',
          newLineNumber: newLineNum++,
          content: text2.split('\n')[j]
        })
        j++
      }
    }

    return result
  }

  // Get Longest Common Subsequence
  const getLCS = (arr1: string[], arr2: string[]): string[] => {
    const m = arr1.length
    const n = arr2.length
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    // Backtrack to find LCS
    const lcs: string[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (arr1[i - 1] === arr2[j - 1]) {
        lcs.unshift(arr1[i - 1])
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    return lcs
  }

  // Character-level diff for modified lines
  const getCharDiff = (str1: string, str2: string): DiffSegment[] => {
    const segments: DiffSegment[] = []
    const m = str1.length
    const n = str2.length
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    let i = m, j = n
    const result: Array<{ type: 'equal' | 'delete' | 'insert'; char: string }> = []

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && str1[i - 1] === str2[j - 1]) {
        result.unshift({ type: 'equal', char: str1[i - 1] })
        i--
        j--
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'insert', char: str2[j - 1] })
        j--
      } else if (i > 0) {
        result.unshift({ type: 'delete', char: str1[i - 1] })
        i--
      }
    }

    // Merge consecutive characters of same type
    for (const item of result) {
      if (segments.length > 0 && segments[segments.length - 1].type === item.type) {
        segments[segments.length - 1].text += item.char
      } else {
        segments.push({ type: item.type, text: item.char })
      }
    }

    return segments
  }

  const diffLines = useMemo(() => {
    if (!originalText && !modifiedText) return []
    return computeDiff(originalText, modifiedText)
  }, [originalText, modifiedText, ignoreWhitespace, caseSensitive])

  const stats = useMemo(() => {
    const additions = diffLines.filter(l => l.type === 'insert' || l.type === 'modified').length
    const deletions = diffLines.filter(l => l.type === 'delete').length
    const modified = diffLines.filter(l => l.type === 'modified').length
    return { additions, deletions, modified }
  }, [diffLines])

  const handleClear = () => {
    setOriginalText('')
    setModifiedText('')
  }

  const handleSwap = () => {
    const temp = originalText
    setOriginalText(modifiedText)
    setModifiedText(temp)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Text Diff Viewer
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Compare two text blocks and visualize differences with yellow highlighting
        </p>

        {/* Options */}
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Ignore Whitespace</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Case Sensitive</span>
            </label>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'unified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Split
            </button>
          </div>
        </div>

        {/* Input Areas */}
        <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Original Text
              </label>
              <span className="text-xs text-gray-500">
                {originalText.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="input w-full font-mono text-sm"
              rows={12}
              placeholder="Paste original text here..."
            />
          </div>
          {viewMode === 'unified' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modified Text
                </label>
                <span className="text-xs text-gray-500">
                  {modifiedText.split('\n').length} lines
                </span>
              </div>
              <textarea
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                className="input w-full font-mono text-sm"
                rows={12}
                placeholder="Paste modified text here..."
              />
            </div>
          )}
        </div>

        {viewMode === 'split' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modified Text
              </label>
              <span className="text-xs text-gray-500">
                {modifiedText.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              className="input w-full font-mono text-sm"
              rows={12}
              placeholder="Paste modified text here..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={handleSwap} className="btn-secondary">
            ⇄ Swap Texts
          </button>
          <button onClick={handleClear} className="btn-secondary">
            Clear All
          </button>
        </div>
      </div>

      {/* Diff Results */}
      {(originalText || modifiedText) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Differences
            </h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 dark:text-green-400">
                +{stats.additions} additions
              </span>
              <span className="text-red-600 dark:text-red-400">
                -{stats.deletions} deletions
              </span>
              {stats.modified > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ~{stats.modified} modified
                </span>
              )}
            </div>
          </div>

          <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="bg-gray-50 dark:bg-gray-900 font-mono text-sm">
                {diffLines.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No differences found - texts are identical
                  </div>
                ) : (
                  diffLines.map((line, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        line.type === 'delete'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : line.type === 'insert'
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : line.type === 'modified'
                          ? 'bg-yellow-50 dark:bg-yellow-900/20'
                          : ''
                      }`}
                    >
                      {/* Line Numbers */}
                      <div className="flex-shrink-0 flex">
                        <div className="w-12 px-2 py-1 text-right text-gray-500 dark:text-gray-400 border-r dark:border-gray-700 select-none">
                          {line.oldLineNumber || ''}
                        </div>
                        <div className="w-12 px-2 py-1 text-right text-gray-500 dark:text-gray-400 border-r dark:border-gray-700 select-none">
                          {line.newLineNumber || ''}
                        </div>
                      </div>

                      {/* Change Indicator */}
                      <div className="w-8 px-2 py-1 text-center flex-shrink-0 font-bold">
                        {line.type === 'delete' && (
                          <span className="text-red-600 dark:text-red-400">-</span>
                        )}
                        {line.type === 'insert' && (
                          <span className="text-green-600 dark:text-green-400">+</span>
                        )}
                        {line.type === 'modified' && (
                          <span className="text-yellow-600 dark:text-yellow-400">~</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-2 py-1 overflow-x-auto">
                        {line.type === 'modified' && line.segments ? (
                          <div className="whitespace-pre-wrap break-all">
                            {line.segments.map((segment, segIndex) => (
                              <span
                                key={segIndex}
                                className={
                                  segment.type === 'delete'
                                    ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 line-through'
                                    : segment.type === 'insert'
                                    ? 'bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 font-semibold'
                                    : ''
                                }
                              >
                                {segment.text}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-all">{line.content}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-bold">+</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">Added lines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 font-bold">-</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">Deleted lines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">~</span>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              Modified lines (
              <span className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">highlighted</span>
              )
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Line-by-line diff comparison</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Character-level highlighting for modified lines (yellow background)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Unified and split view modes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Case-sensitive and whitespace options</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Real-time diff statistics</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Perfect for code review, document comparison, and content analysis</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
