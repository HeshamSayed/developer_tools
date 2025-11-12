import { useState, useRef } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function CSVToJSON() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasHeaders, setHasHeaders] = useState(true)
  const [prettyPrint, setPrettyPrint] = useState(true)
  const [arrayFormat, setArrayFormat] = useState<'objects' | 'arrays'>('objects')
  const [metadata, setMetadata] = useState<{rows: number, columns: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (csv: string, delimiter: string): any[][] => {
    const lines = csv.trim().split('\n')
    const result: any[][] = []

    for (const line of lines) {
      const row: any[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === delimiter && !inQuotes) {
          row.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }

      row.push(current.trim())
      result.push(row)
    }

    return result
  }

  const handleConvert = () => {
    setLoading(true)
    setError('')
    setOutput('')
    setMetadata(null)

    try {
      const rows = parseCSV(input, delimiter)

      if (rows.length === 0) {
        throw new Error('No data found')
      }

      let jsonData: any

      if (arrayFormat === 'objects' && hasHeaders) {
        const headers = rows[0]
        const dataRows = rows.slice(1)

        jsonData = dataRows.map(row => {
          const obj: any = {}
          headers.forEach((header, index) => {
            let value: any = row[index] || ''

            // Try to parse as number
            if (value && !isNaN(value)) {
              value = parseFloat(value)
            }
            // Try to parse as boolean
            else if (value === 'true' || value === 'false') {
              value = value === 'true'
            }
            // Try to parse as null
            else if (value === 'null' || value === '') {
              value = null
            }

            obj[header] = value
          })
          return obj
        })
      } else if (arrayFormat === 'arrays') {
        jsonData = hasHeaders ? rows.slice(1) : rows
      } else {
        // Objects without headers - use column indices
        jsonData = rows.map(row => {
          const obj: any = {}
          row.forEach((value, index) => {
            obj[`column_${index}`] = value
          })
          return obj
        })
      }

      const formattedOutput = prettyPrint
        ? JSON.stringify(jsonData, null, 2)
        : JSON.stringify(jsonData)

      setOutput(formattedOutput)
      setMetadata({
        rows: hasHeaders ? rows.length - 1 : rows.length,
        columns: rows[0]?.length || 0
      })
    } catch (err: any) {
      setError(err.message || 'Failed to convert CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setInput(text)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    setInput(`name,age,city,active
John Doe,30,New York,true
Jane Smith,25,Boston,true
Bob Johnson,35,Chicago,false
Alice Williams,28,Seattle,true`)
    setHasHeaders(true)
    setDelimiter(',')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
    setMetadata(null)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample CSV"
          >
            📋 Sample
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-sm"
            title="Upload CSV file"
          >
            📁 Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
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
              title="Download JSON"
            >
              💾 Download
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Delimiter:
          </label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
            <option value=" ">Space</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format:
          </label>
          <select
            value={arrayFormat}
            onChange={(e) => setArrayFormat(e.target.value as 'objects' | 'arrays')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="objects">Array of Objects</option>
            <option value="arrays">Array of Arrays</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              First row is headers
            </span>
          </label>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prettyPrint}
              onChange={(e) => setPrettyPrint(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pretty print JSON
            </span>
          </label>
        </div>
      </div>

      {/* Input Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            CSV Input
          </label>
          <span className="text-xs text-gray-500">
            {input.length} characters
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea font-mono text-sm"
          rows={12}
          placeholder="name,age,city
John,30,New York
Jane,25,Boston"
        />
      </div>

      {/* Convert Button */}
      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Converting...' : '🔄 Convert to JSON'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            ❌ Error
          </h3>
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Metadata */}
      {metadata && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-900 dark:text-blue-100">
              <strong>Rows:</strong> {metadata.rows}
            </span>
            <span className="text-blue-900 dark:text-blue-100">
              <strong>Columns:</strong> {metadata.columns}
            </span>
            <span className="text-blue-900 dark:text-blue-100">
              <strong>Total Entries:</strong> {metadata.rows * metadata.columns}
            </span>
          </div>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              JSON Output
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {output.length} characters
              </span>
              <CopyButton text={output} />
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900 font-mono text-sm"
            rows={16}
          />

          {/* Quick Info */}
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>Size: {(output.length / 1024).toFixed(2)} KB</span>
            <span>Lines: {output.split('\n').length}</span>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm">
        <p className="font-medium text-gray-900 dark:text-white mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Supports quoted values with commas: <code className="text-xs">"New York, NY"</code></li>
          <li>Automatically detects numbers and booleans</li>
          <li>Empty values are converted to null</li>
          <li>Choose "Array of Objects" for key-value pairs (requires headers)</li>
          <li>Choose "Array of Arrays" for preserving the raw table structure</li>
        </ul>
      </div>
    </div>
  )
}
