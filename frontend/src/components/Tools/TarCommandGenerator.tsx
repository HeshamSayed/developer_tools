import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { commandGenerators } from '@/services/backendApi'

export default function TarCommandGenerator() {
  const [operation, setOperation] = useState<'create' | 'extract' | 'list'>('create')
  const [compression, setCompression] = useState<'none' | 'gzip' | 'bzip2' | 'xz'>('gzip')
  const [archiveName, setArchiveName] = useState('archive.tar.gz')
  const [files, setFiles] = useState('file1.txt file2.txt folder/')
  const [verbose, setVerbose] = useState(true)
  const [command, setCommand] = useState('')
  const [explanation, setExplanation] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateCommand = async () => {
    setError('')
    setCommand('')
    setExplanation([])

    try {
      setLoading(true)
      const response = await commandGenerators.tarCommand({
        operation,
        compression,
        archive_name: archiveName,
        files: files || undefined,
        verbose
      })
      if (response.success) {
        setCommand(response.result)
        setExplanation(response.explanation || [])
      } else {
        setError('Command generation failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = (op: typeof operation) => {
    setOperation(op)
    if (op === 'create') {
      setArchiveName('backup.tar.gz')
      setFiles('documents/ photos/')
    } else if (op === 'extract') {
      setArchiveName('backup.tar.gz')
    } else {
      setArchiveName('backup.tar.gz')
    }
    setTimeout(generateCommand, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={() => loadSample('create')} className="btn btn-secondary text-sm">Create Archive</button>
        <button onClick={() => loadSample('extract')} className="btn btn-secondary text-sm">Extract Archive</button>
        <button onClick={() => loadSample('list')} className="btn btn-secondary text-sm">List Contents</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operation</label>
        <select value={operation} onChange={(e) => setOperation(e.target.value as any)} className="input">
          <option value="create">Create Archive (-c)</option>
          <option value="extract">Extract Archive (-x)</option>
          <option value="list">List Contents (-t)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compression</label>
        <select value={compression} onChange={(e) => setCompression(e.target.value as any)} className="input">
          <option value="none">No compression</option>
          <option value="gzip">Gzip (-z) [.tar.gz]</option>
          <option value="bzip2">Bzip2 (-j) [.tar.bz2]</option>
          <option value="xz">XZ (-J) [.tar.xz]</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Archive Name</label>
        <input type="text" value={archiveName} onChange={(e) => setArchiveName(e.target.value)} className="input" placeholder="archive.tar.gz" />
      </div>

      {operation === 'create' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Files/Directories</label>
          <input type="text" value={files} onChange={(e) => setFiles(e.target.value)} className="input" placeholder="file1.txt file2.txt folder/" />
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <input type="checkbox" checked={verbose} onChange={(e) => setVerbose(e.target.checked)} className="w-4 h-4 text-primary-600" />
        <label className="text-sm text-gray-700 dark:text-gray-300">Verbose output (-v)</label>
      </div>

      <div className="flex justify-center">
        <button onClick={generateCommand} disabled={loading} className="btn btn-primary px-8">
          {loading ? 'Generating...' : 'Generate Command'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {command && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generated Tar Command</label>
            <CopyButton text={command} />
          </div>
          <div className="card bg-gray-50 dark:bg-gray-900">
            <code className="font-mono text-sm text-gray-900 dark:text-gray-100">{command}</code>
          </div>
          {explanation.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">Explanation:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {explanation.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
