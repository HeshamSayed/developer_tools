import React, { useState, useEffect } from 'react';
import { FiSave, FiTrash2, FiCopy, FiCode, FiCheck } from 'react-icons/fi';
import type { MockEndpoint, MockCollection, MockEndpointFormData } from '../../../types/mockAPI';
import RequestTester from './RequestTester';

interface EndpointEditorProps {
  endpoint: MockEndpoint | null;
  collection: MockCollection | null;
  onUpdate: (endpointId: string, data: Partial<MockEndpointFormData>) => void;
  onCreate?: (data: MockEndpointFormData) => void;
  onDelete: (endpointId: string) => void;
}

const EndpointEditor: React.FC<EndpointEditorProps> = ({
  endpoint,
  collection,
  onUpdate,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'response' | 'advanced' | 'test'>('general');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<MockEndpointFormData>>({
    name: '',
    description: '',
    path: '/api/endpoint',
    method: 'GET',
    protocol: 'rest',
    status_code: 200,
    response_body: '{"message": "Success"}',
    response_headers: {},
    content_type: 'application/json',
    latency_min: 0,
    latency_max: 0,
    error_rate: 0,
    is_active: true,
    enable_logging: true,
    order: 0
  });

  useEffect(() => {
    if (endpoint) {
      setFormData({
        name: endpoint.name,
        description: endpoint.description,
        path: endpoint.path,
        method: endpoint.method,
        protocol: endpoint.protocol,
        status_code: endpoint.status_code,
        response_body: endpoint.response_body,
        response_headers: endpoint.response_headers,
        content_type: endpoint.content_type,
        latency_min: endpoint.latency_min,
        latency_max: endpoint.latency_max,
        error_rate: endpoint.error_rate,
        is_active: endpoint.is_active,
        enable_logging: endpoint.enable_logging,
        order: endpoint.order
      });
    }
  }, [endpoint]);

  const handleSave = async () => {
    if (!endpoint) return;

    setSaving(true);
    try {
      await onUpdate(endpoint.id, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (endpoint && window.confirm('Are you sure you want to delete this endpoint?')) {
      onDelete(endpoint.id);
    }
  };

  const copyMockURL = () => {
    if (endpoint) {
      const url = `http://localhost:8003${endpoint.mock_url}`;
      navigator.clipboard.writeText(url);
      alert('Mock URL copied to clipboard!');
    }
  };

  if (!endpoint) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <FiCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Endpoint Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select an endpoint from the sidebar or create a new one in a collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formData.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {collection?.name}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyMockURL}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <FiCopy className="w-4 h-4" />
              <span>Copy URL</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                saveSuccess
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mock URL Display */}
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mock URL</p>
          <code className="text-sm text-gray-900 dark:text-white font-mono">
            http://localhost:8003{endpoint.mock_url}
          </code>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'general', label: 'General' },
            { id: 'response', label: 'Response' },
            { id: 'advanced', label: 'Advanced' },
            { id: 'test', label: 'Test' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endpoint Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTTP Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Protocol
                </label>
                <select
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="rest">REST/JSON</option>
                  <option value="graphql">GraphQL</option>
                  <option value="soap">SOAP/XML</option>
                  <option value="toml">TOML</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Path
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="/api/users/:id"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.enable_logging}
                  onChange={(e) => setFormData({ ...formData, enable_logging: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Logging</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Code
                </label>
                <select
                  value={formData.status_code}
                  onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={200}>200 - OK</option>
                  <option value={201}>201 - Created</option>
                  <option value={204}>204 - No Content</option>
                  <option value={400}>400 - Bad Request</option>
                  <option value={401}>401 - Unauthorized</option>
                  <option value={403}>403 - Forbidden</option>
                  <option value={404}>404 - Not Found</option>
                  <option value={500}>500 - Internal Server Error</option>
                  <option value={502}>502 - Bad Gateway</option>
                  <option value={503}>503 - Service Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="application/json">JSON (application/json)</option>
                  <option value="application/xml">XML (application/xml)</option>
                  <option value="text/html">HTML (text/html)</option>
                  <option value="text/plain">Plain Text (text/plain)</option>
                  <option value="text/csv">CSV (text/csv)</option>
                  <option value="application/yaml">YAML (application/yaml)</option>
                  <option value="application/x-www-form-urlencoded">Form Data</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response Body
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Any format - JSON, XML, HTML, Plain Text, etc.)
                </span>
              </label>
              <textarea
                value={formData.response_body}
                onChange={(e) => setFormData({ ...formData, response_body: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder={formData.content_type === 'application/json'
                  ? '{"message": "Success", "data": {...}}'
                  : formData.content_type === 'application/xml'
                  ? '<?xml version="1.0"?>\n<response>\n  <message>Success</message>\n</response>'
                  : formData.content_type === 'text/html'
                  ? '<html>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>'
                  : 'Your custom response here...'}
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ✨ <strong>Template Variables:</strong> {'{{'} faker.name {'}}'}, {'{{'} faker.email {'}}'}, {'{{'} random_uuid {'}}'}, {'{{'} current_timestamp {'}}'}, etc.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🎨 <strong>Any Format Supported:</strong> JSON, XML, HTML, Plain Text, CSV, or custom formats
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ <strong>No Validation:</strong> Response body is not validated - you have complete freedom!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latency Simulation (milliseconds)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={formData.latency_min}
                    onChange={(e) => setFormData({ ...formData, latency_min: parseInt(e.target.value) })}
                    placeholder="Min"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={formData.latency_max}
                    onChange={(e) => setFormData({ ...formData, latency_max: parseInt(e.target.value) })}
                    placeholder="Max"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Random delay between min and max milliseconds
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Error Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.error_rate}
                onChange={(e) => setFormData({ ...formData, error_rate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Percentage of requests that should return errors (0-100)
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                Performance Testing
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Use latency and error rate settings to simulate real-world conditions and test how your application handles slow responses and failures.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Request Count: {endpoint.request_count}
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                This endpoint has been called {endpoint.request_count} times since creation.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Test Your Mock Endpoint
              </h3>
              <RequestTester endpoint={endpoint} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndpointEditor;
