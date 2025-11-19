import React, { useState, useEffect } from 'react'
import { backendApi } from '@/services/backendApi'

interface KeyValue {
  key: string
  value: string
  enabled: boolean
}

interface RequestData {
  url: string
  method: string
  queryParams: KeyValue[]
  headers: KeyValue[]
  authType: string
  authData: Record<string, string>
  bodyType: string
  body: string
  timeout: number
}

interface ResponseData {
  status_code: number
  status_text: string
  headers: Record<string, string>
  body: any
  content_type: string
  is_json: boolean
  response_time: number
  size: number
  size_formatted: string
  url: string
  ssl_error?: string
  cookies: Record<string, string>
  redirected: boolean
}

type Tab = 'params' | 'auth' | 'headers' | 'body'
type ResponseTab = 'body' | 'headers' | 'cookies' | 'code'

export default function HTTPRequestTester() {
  const [activeTab, setActiveTab] = useState<Tab>('params')
  const [responseTab, setResponseTab] = useState<ResponseTab>('body')

  const [requestData, setRequestData] = useState<RequestData>({
    url: '',
    method: 'GET',
    queryParams: [{ key: '', value: '', enabled: true }],
    headers: [{ key: '', value: '', enabled: true }],
    authType: 'none',
    authData: {},
    bodyType: 'none',
    body: '',
    timeout: 30,
  })

  const [response, setResponse] = useState<ResponseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<Array<{ url: string; method: string; timestamp: number }>>([])

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('httpRequestHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        // Ignore
      }
    }
  }, [])

  const addToHistory = (url: string, method: string) => {
    const newHistory = [
      { url, method, timestamp: Date.now() },
      ...history.filter(h => !(h.url === url && h.method === method)).slice(0, 9)
    ]
    setHistory(newHistory)
    localStorage.setItem('httpRequestHistory', JSON.stringify(newHistory))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const result = await backendApi.post('/api/tools/network/http-request-tester', requestData)
      setResponse(result)
      addToHistory(requestData.url, requestData.method)
    } catch (err: any) {
      setError(err.message || 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  const addKeyValue = (type: 'queryParams' | 'headers') => {
    setRequestData({
      ...requestData,
      [type]: [...requestData[type], { key: '', value: '', enabled: true }]
    })
  }

  const updateKeyValue = (type: 'queryParams' | 'headers', index: number, field: keyof KeyValue, value: any) => {
    const updated = [...requestData[type]]
    updated[index] = { ...updated[index], [field]: value }
    setRequestData({ ...requestData, [type]: updated })
  }

  const removeKeyValue = (type: 'queryParams' | 'headers', index: number) => {
    setRequestData({
      ...requestData,
      [type]: requestData[type].filter((_, i) => i !== index)
    })
  }

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600 dark:text-green-400'
    if (code >= 300 && code < 400) return 'text-blue-600 dark:text-blue-400'
    if (code >= 400 && code < 500) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const generateCurlCommand = () => {
    let cmd = `curl -X ${requestData.method}`

    // Add headers
    requestData.headers.forEach(h => {
      if (h.enabled && h.key) {
        cmd += ` \\\n  -H "${h.key}: ${h.value}"`
      }
    })

    // Add auth
    if (requestData.authType === 'bearer' && requestData.authData.token) {
      cmd += ` \\\n  -H "Authorization: Bearer ${requestData.authData.token}"`
    } else if (requestData.authType === 'basic' && requestData.authData.username) {
      cmd += ` \\\n  -u "${requestData.authData.username}:${requestData.authData.password || ''}"`
    }

    // Add body
    if (requestData.body && requestData.bodyType !== 'none') {
      cmd += ` \\\n  -d '${requestData.body}'`
    }

    // Build URL with query params
    let url = requestData.url
    const enabledParams = requestData.queryParams.filter(p => p.enabled && p.key)
    if (enabledParams.length > 0) {
      const query = enabledParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&')
      url += (url.includes('?') ? '&' : '?') + query
    }

    cmd += ` \\\n  "${url}"`
    return cmd
  }

  const generateJavaScriptCode = () => {
    let code = `fetch('${requestData.url}', {\n  method: '${requestData.method}'`

    const headers: Record<string, string> = {}
    requestData.headers.forEach(h => {
      if (h.enabled && h.key) headers[h.key] = h.value
    })

    if (requestData.authType === 'bearer' && requestData.authData.token) {
      headers['Authorization'] = `Bearer ${requestData.authData.token}`
    }

    if (Object.keys(headers).length > 0) {
      code += `,\n  headers: ${JSON.stringify(headers, null, 2).split('\n').join('\n  ')}`
    }

    if (requestData.body && requestData.bodyType !== 'none') {
      code += `,\n  body: '${requestData.body}'`
    }

    code += '\n})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));'
    return code
  }

  const generatePythonCode = () => {
    let code = `import requests\n\n`

    const headers: Record<string, string> = {}
    requestData.headers.forEach(h => {
      if (h.enabled && h.key) headers[h.key] = h.value
    })

    if (requestData.authType === 'bearer' && requestData.authData.token) {
      headers['Authorization'] = `Bearer ${requestData.authData.token}`
    }

    code += `url = "${requestData.url}"\n`

    if (Object.keys(headers).length > 0) {
      code += `headers = ${JSON.stringify(headers, null, 2)}\n`
    }

    if (requestData.body && requestData.bodyType === 'json') {
      code += `data = ${requestData.body}\n`
    }

    code += `\nresponse = requests.${requestData.method.toLowerCase()}(url`
    if (Object.keys(headers).length > 0) code += `, headers=headers`
    if (requestData.body && requestData.bodyType === 'json') code += `, json=data`
    code += `)\nprint(response.json())`

    return code
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Request Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL and Method */}
        <div className="flex gap-2">
          <select
            value={requestData.method}
            onChange={(e) => setRequestData({ ...requestData, method: e.target.value })}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          <input
            type="url"
            value={requestData.url}
            onChange={(e) => setRequestData({ ...requestData, url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            required
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-300 dark:border-gray-700">
          <div className="flex space-x-6">
            {(['params', 'auth', 'headers', 'body'] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-64">
          {/* Query Params Tab */}
          {activeTab === 'params' && (
            <div className="space-y-2">
              {requestData.queryParams.map((param, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => updateKeyValue('queryParams', index, 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => updateKeyValue('queryParams', index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => updateKeyValue('queryParams', index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyValue('queryParams', index)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addKeyValue('queryParams')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Parameter
              </button>
            </div>
          )}

          {/* Auth Tab */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              <select
                value={requestData.authType}
                onChange={(e) => setRequestData({ ...requestData, authType: e.target.value, authData: {} })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="apikey">API Key</option>
              </select>

              {requestData.authType === 'bearer' && (
                <input
                  type="text"
                  placeholder="Token"
                  value={requestData.authData.token || ''}
                  onChange={(e) => setRequestData({ ...requestData, authData: { ...requestData.authData, token: e.target.value } })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              )}

              {requestData.authType === 'basic' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Username"
                    value={requestData.authData.username || ''}
                    onChange={(e) => setRequestData({ ...requestData, authData: { ...requestData.authData, username: e.target.value } })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={requestData.authData.password || ''}
                    onChange={(e) => setRequestData({ ...requestData, authData: { ...requestData.authData, password: e.target.value } })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              )}

              {requestData.authType === 'apikey' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Key Name (e.g., X-API-Key)"
                    value={requestData.authData.keyName || ''}
                    onChange={(e) => setRequestData({ ...requestData, authData: { ...requestData.authData, keyName: e.target.value } })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Key Value"
                    value={requestData.authData.keyValue || ''}
                    onChange={(e) => setRequestData({ ...requestData, authData: { ...requestData.authData, keyValue: e.target.value } })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <select
                    value={requestData.authData.addTo || 'header'}
                    onChange={(e) => setRequestData({ ...requestData, authData: { ...requestData.authData, addTo: e.target.value } })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="header">Add to Header</option>
                    <option value="query">Add to Query Params</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Headers Tab */}
          {activeTab === 'headers' && (
            <div className="space-y-2">
              {requestData.headers.map((header, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => updateKeyValue('headers', index, 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    placeholder="Header Name"
                    value={header.key}
                    onChange={(e) => updateKeyValue('headers', index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => updateKeyValue('headers', index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyValue('headers', index)}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addKeyValue('headers')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Header
              </button>
            </div>
          )}

          {/* Body Tab */}
          {activeTab === 'body' && (
            <div className="space-y-3">
              <select
                value={requestData.bodyType}
                onChange={(e) => setRequestData({ ...requestData, bodyType: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="none">None</option>
                <option value="json">JSON</option>
                <option value="form">Form Data</option>
                <option value="raw">Raw</option>
                <option value="xml">XML</option>
              </select>

              {requestData.bodyType !== 'none' && (
                <textarea
                  value={requestData.body}
                  onChange={(e) => setRequestData({ ...requestData, body: e.target.value })}
                  placeholder={
                    requestData.bodyType === 'json'
                      ? '{\n  "key": "value"\n}'
                      : requestData.bodyType === 'xml'
                      ? '<root>\n  <element>value</element>\n</root>'
                      : 'Request body...'
                  }
                  rows={10}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              )}
            </div>
          )}
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="space-y-4">
          {/* Response Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response</h3>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-bold ${getStatusColor(response.status_code)}`}>
                  {response.status_code} {response.status_text}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Time</div>
                <div className="font-semibold text-gray-900 dark:text-white">{response.response_time} ms</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Size</div>
                <div className="font-semibold text-gray-900 dark:text-white">{response.size_formatted}</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Type</div>
                <div className="font-semibold text-gray-900 dark:text-white text-xs">{response.content_type}</div>
              </div>
            </div>

            {response.ssl_error && (
              <div className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
                SSL Warning: Certificate verification failed
              </div>
            )}

            {response.redirected && (
              <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                Redirected to: {response.url}
              </div>
            )}
          </div>

          {/* Response Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-300 dark:border-gray-700">
              <div className="flex space-x-6 px-6">
                {(['body', 'headers', 'cookies', 'code'] as ResponseTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResponseTab(tab)}
                    className={`py-3 px-1 font-medium transition-colors ${
                      responseTab === tab
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Body Tab */}
              {responseTab === 'body' && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Response Body</span>
                    <button
                      onClick={() => copyToClipboard(typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2))}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                    <code className="text-gray-900 dark:text-gray-300">
                      {response.is_json ? JSON.stringify(response.body, null, 2) : response.body}
                    </code>
                  </pre>
                </div>
              )}

              {/* Headers Tab */}
              {responseTab === 'headers' && (
                <div className="space-y-2">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-medium text-gray-900 dark:text-white">{key}:</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cookies Tab */}
              {responseTab === 'cookies' && (
                <div className="space-y-2">
                  {Object.keys(response.cookies).length > 0 ? (
                    Object.entries(response.cookies).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-900 dark:text-white">{key}:</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">{value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400 italic">No cookies in response</div>
                  )}
                </div>
              )}

              {/* Code Tab */}
              {responseTab === 'code' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">cURL</span>
                      <button
                        onClick={() => copyToClipboard(generateCurlCommand())}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs">
                      <code className="text-gray-900 dark:text-gray-300">{generateCurlCommand()}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">JavaScript (Fetch)</span>
                      <button
                        onClick={() => copyToClipboard(generateJavaScriptCode())}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs">
                      <code className="text-gray-900 dark:text-gray-300">{generateJavaScriptCode()}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Python (Requests)</span>
                      <button
                        onClick={() => copyToClipboard(generatePythonCode())}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs">
                      <code className="text-gray-900 dark:text-gray-300">{generatePythonCode()}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request History */}
      {history.length > 0 && !response && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Requests</h3>
          <div className="space-y-2">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => setRequestData({ ...requestData, url: item.url, method: item.method })}
                className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{item.method}</span>
                  <span className="text-sm text-gray-900 dark:text-white font-mono">{item.url}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
