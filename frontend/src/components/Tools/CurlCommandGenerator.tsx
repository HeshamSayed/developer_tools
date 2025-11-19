import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { commandGenerators } from '@/services/backendApi'

export default function CurlCommandGenerator() {
  const [url, setUrl] = useState('https://api.example.com/users')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET')
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer YOUR_TOKEN')
  const [body, setBody] = useState('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}')
  const [queryParams, setQueryParams] = useState('page=1\nlimit=10')
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateCommand = async () => {
    setError('')
    setCommand('')

    try {
      setLoading(true)
      const response = await commandGenerators.curlCommand({
        url,
        method,
        headers: headers || undefined,
        body: body || undefined,
        query_params: queryParams || undefined
      })
      if (response.success) {
        setCommand(response.result)
      } else {
        setError('Command generation failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = (m: typeof method) => {
    setMethod(m)
    if (m === 'GET') {
      setUrl('https://api.example.com/users')
      setQueryParams('page=1\nlimit=10')
    } else if (m === 'POST') {
      setUrl('https://api.example.com/users')
      setBody('{\n  "name": "John Doe",\n  "email": "john@example.com"\n}')
    } else if (m === 'PUT') {
      setUrl('https://api.example.com/users/123')
      setBody('{\n  "name": "John Updated"\n}')
    } else if (m === 'DELETE') {
      setUrl('https://api.example.com/users/123')
    }
    setTimeout(generateCommand, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={() => loadSample('GET')} className="btn btn-secondary text-sm">GET</button>
        <button onClick={() => loadSample('POST')} className="btn btn-secondary text-sm">POST</button>
        <button onClick={() => loadSample('PUT')} className="btn btn-secondary text-sm">PUT</button>
        <button onClick={() => loadSample('PATCH')} className="btn btn-secondary text-sm">PATCH</button>
        <button onClick={() => loadSample('DELETE')} className="btn btn-secondary text-sm">DELETE</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HTTP Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="input">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="input font-mono" placeholder="https://api.example.com/endpoint" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Parameters (one per line: key=value)</label>
        <textarea value={queryParams} onChange={(e) => setQueryParams(e.target.value)} className="textarea font-mono" rows={3} placeholder="page=1&#10;limit=10" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Headers (one per line: Key: Value)</label>
        <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} className="textarea font-mono" rows={3} placeholder="Content-Type: application/json&#10;Authorization: Bearer TOKEN" />
      </div>

      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="textarea font-mono" rows={6} placeholder='{"key": "value"}' />
        </div>
      )}

      <div className="flex justify-center">
        <button onClick={generateCommand} disabled={loading} className="btn btn-primary px-8">
          {loading ? 'Generating...' : 'Generate Curl Command'}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generated Curl Command</label>
            <CopyButton text={command} />
          </div>
          <div className="card bg-gray-50 dark:bg-gray-900">
            <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all">{command}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
