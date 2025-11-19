import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { utilityTools } from '@/services/backendApi'

export default function GoStacktraceFormatter() {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFormat = async () => {
    setError('')
    setFormatted([])

    if (!input.trim()) {
      return
    }

    try {
      setLoading(true)
      const response = await utilityTools.goStacktrace({ input })
      if (response.success) {
        setFormatted(response.frames)
      } else {
        setError('Formatting failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setInput(`panic: runtime error: invalid memory address or nil pointer dereference
[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x4a1f3e]

goroutine 1 [running]:
main.processData(0x0, 0x0)
	/home/user/project/main.go:42 +0x5e
main.main()
	/home/user/project/main.go:15 +0x39`)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={() => { setInput(''); setFormatted([]); setError('') }} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Go Stacktrace Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="textarea font-mono text-sm" rows={10} placeholder="Paste Go stacktrace here..." />
      </div>

      <div className="flex justify-center">
        <button onClick={handleFormat} disabled={!input.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Formatting...' : 'Format Stacktrace'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {formatted.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Formatted Stacktrace</h3>
            <CopyButton text={input} />
          </div>
          <div className="space-y-2">
            {formatted.map((frame, i) => (
              <div key={i} className={`p-3 rounded ${
                frame.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' :
                frame.type === 'goroutine' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' :
                'bg-gray-50 dark:bg-gray-800'
              }`}>
                {frame.type === 'error' && (
                  <div className="font-mono text-sm text-red-700 dark:text-red-300">{frame.message}</div>
                )}
                {frame.type === 'goroutine' && (
                  <div className="font-mono text-sm text-blue-700 dark:text-blue-300">{frame.message}</div>
                )}
                {frame.type === 'frame' && (
                  <div className="font-mono text-sm">
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">{frame.function}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">{frame.location}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
