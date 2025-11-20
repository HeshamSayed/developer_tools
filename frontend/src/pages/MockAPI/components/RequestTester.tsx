import React, { useState } from 'react';
import { FiPlay, FiCopy, FiDownload, FiClock } from 'react-icons/fi';
import type { MockEndpoint } from '../../../types/mockAPI';

interface RequestTesterProps {
  endpoint: MockEndpoint;
}

interface TestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  responseTime: number;
  timestamp: string;
}

const RequestTester: React.FC<RequestTesterProps> = ({ endpoint }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestBody, setRequestBody] = useState('');
  const [requestHeaders, setRequestHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>([]);

  const mockUrl = `http://localhost:8003${endpoint.mock_url}`;

  const addHeader = () => {
    setRequestHeaders([...requestHeaders, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setRequestHeaders(requestHeaders.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...requestHeaders];
    updated[index][field] = value;
    setRequestHeaders(updated);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const buildUrlWithParams = () => {
    const params = queryParams
      .filter(p => p.key && p.value)
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return params ? `${mockUrl}?${params}` : mockUrl;
  };

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      // Build headers object
      const headers: Record<string, string> = {};
      requestHeaders.forEach(h => {
        if (h.key && h.value) {
          headers[h.key] = h.value;
        }
      });

      // Build fetch options
      const options: RequestInit = {
        method: endpoint.method,
        headers
      };

      // Add body for POST/PUT/PATCH/DELETE
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const url = buildUrlWithParams();
      const response = await fetch(url, options);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response body
      const contentType = response.headers.get('content-type') || '';
      let body = '';

      if (contentType.includes('application/json')) {
        const json = await response.json();
        body = JSON.stringify(json, null, 2);
      } else {
        body = await response.text();
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body,
        responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (result) {
      navigator.clipboard.writeText(result.body);
      alert('Response copied to clipboard!');
    }
  };

  const downloadResponse = () => {
    if (!result) return;

    const blob = new Blob([result.body], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-response-${endpoint.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCurlCommand = () => {
    let curl = `curl -X ${endpoint.method} '${buildUrlWithParams()}'`;

    requestHeaders.forEach(h => {
      if (h.key && h.value) {
        curl += ` \\\n  -H '${h.key}: ${h.value}'`;
      }
    });

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && requestBody) {
      curl += ` \\\n  -d '${requestBody}'`;
    }

    return curl;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    if (status >= 500) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
  };

  return (
    <div className="space-y-6">
      {/* URL Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mock URL
        </label>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-2 rounded-lg font-semibold text-sm ${
            endpoint.method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            endpoint.method === 'PATCH' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          }`}>
            {endpoint.method}
          </span>
          <input
            type="text"
            readOnly
            value={buildUrlWithParams()}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>
      </div>

      {/* Query Parameters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Query Parameters
          </label>
          <button
            onClick={addQueryParam}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add Parameter
          </button>
        </div>
        <div className="space-y-2">
          {queryParams.map((param, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={param.key}
                onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                placeholder="Key"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                value={param.value}
                onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => removeQueryParam(index)}
                className="text-red-600 hover:text-red-700 text-sm px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Headers
          </label>
          <button
            onClick={addHeader}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add Header
          </button>
        </div>
        <div className="space-y-2">
          {requestHeaders.map((header, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={header.key}
                onChange={(e) => updateHeader(index, 'key', e.target.value)}
                placeholder="Header Name"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="text"
                value={header.value}
                onChange={(e) => updateHeader(index, 'value', e.target.value)}
                placeholder="Header Value"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => removeHeader(index)}
                className="text-red-600 hover:text-red-700 text-sm px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Request Body */}
      {['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Request Body
          </label>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={6}
            placeholder='{"key": "value"}'
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>
      )}

      {/* Send Button */}
      <div>
        <button
          onClick={sendRequest}
          disabled={loading}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FiPlay className="w-5 h-5" />
              <span>Send Request</span>
            </>
          )}
        </button>
      </div>

      {/* cURL Command */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            cURL Command
          </h4>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generateCurlCommand());
              alert('cURL command copied!');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Copy
          </button>
        </div>
        <pre className="text-xs text-gray-900 dark:text-white font-mono overflow-x-auto">
          {generateCurlCommand()}
        </pre>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Error</h4>
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Response Display */}
      {result && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Response Header */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(result.status)}`}>
                  {result.status} {result.statusText}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiClock className="w-4 h-4" />
                  <span>{result.responseTime}ms</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyResponse}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  title="Copy response"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadResponse}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  title="Download response"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Response Headers */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                Response Headers ({Object.keys(result.headers).length})
              </summary>
              <div className="mt-2 space-y-1">
                {Object.entries(result.headers).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{value}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Response Body */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Response Body
            </h4>
            <pre className="text-xs text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
              {result.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTester;
