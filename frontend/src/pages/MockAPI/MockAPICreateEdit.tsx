import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockingService } from '@/services/mockingService';
import type { MockEndpointCreate, HTTPMethod, Protocol } from '@/types/mocking';
import ProfessionalButton from '@/components/Common/ProfessionalButton';

const DEFAULT_RESPONSE_TEMPLATES = {
  success: JSON.stringify({
    message: 'Success',
    data: {
      id: '{{random_uuid}}',
      timestamp: '{{timestamp}}'
    }
  }, null, 2),
  user: JSON.stringify({
    id: '{{random_int}}',
    name: '{{faker.name}}',
    email: '{{faker.email}}',
    phone: '{{faker.phone}}',
    address: {
      city: '{{faker.city}}',
      country: '{{faker.country}}'
    },
    company: '{{faker.company}}',
    job: '{{faker.job}}',
    created_at: '{{date}}'
  }, null, 2),
  list: JSON.stringify({
    items: [
      {
        id: 1,
        name: '{{faker.name}}',
        email: '{{faker.email}}'
      },
      {
        id: 2,
        name: '{{faker.name}}',
        email: '{{faker.email}}'
      }
    ],
    total: 2,
    page: 1
  }, null, 2),
  error: JSON.stringify({
    error: 'Bad Request',
    message: 'Invalid parameters',
    code: 400,
    timestamp: '{{timestamp}}'
  }, null, 2),
};

export default function MockAPICreateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<MockEndpointCreate>({
    name: '',
    description: '',
    path: '/api/example',
    method: 'GET',
    protocol: 'rest',
    status_code: 200,
    response_body: DEFAULT_RESPONSE_TEMPLATES.success,
    response_headers: {},
    content_type: 'application/json',
    latency_min: 0,
    latency_max: 0,
    error_rate: 0,
    is_active: true,
    enable_logging: true,
  });

  const [customHeader, setCustomHeader] = useState({ key: '', value: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      loadEndpoint(id);
    }
  }, [id, isEditMode]);

  const loadEndpoint = async (endpointId: string) => {
    try {
      setLoading(true);
      const endpoint = await mockingService.getEndpoint(endpointId);
      setFormData({
        name: endpoint.name,
        description: endpoint.description,
        path: endpoint.path,
        method: endpoint.method,
        protocol: endpoint.protocol,
        status_code: endpoint.status_code,
        response_body: endpoint.response_body,
        response_headers: endpoint.response_headers || {},
        content_type: endpoint.content_type,
        latency_min: endpoint.latency_min,
        latency_max: endpoint.latency_max,
        error_rate: endpoint.error_rate,
        is_active: endpoint.is_active,
        enable_logging: endpoint.enable_logging,
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to load endpoint:', err);
      setError(err.response?.data?.message || 'Failed to load endpoint');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.path.trim()) {
      setError('Path is required');
      return;
    }
    if (!formData.response_body.trim()) {
      setError('Response body is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditMode && id) {
        await mockingService.updateEndpoint(id, formData);
      } else {
        await mockingService.createEndpoint(formData);
      }

      navigate('/mock-api');
    } catch (err: any) {
      console.error('Failed to save endpoint:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save endpoint');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof MockEndpointCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addHeader = () => {
    if (customHeader.key && customHeader.value) {
      setFormData(prev => ({
        ...prev,
        response_headers: {
          ...(prev.response_headers || {}),
          [customHeader.key]: customHeader.value,
        },
      }));
      setCustomHeader({ key: '', value: '' });
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const headers = { ...(prev.response_headers || {}) };
      delete headers[key];
      return { ...prev, response_headers: headers };
    });
  };

  const applyTemplate = (template: keyof typeof DEFAULT_RESPONSE_TEMPLATES) => {
    handleInputChange('response_body', DEFAULT_RESPONSE_TEMPLATES[template]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading endpoint...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/mock-api"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Mock APIs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Mock Endpoint' : 'Create Mock Endpoint'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditMode ? 'Update your mock API endpoint configuration' : 'Configure a new mock API endpoint for testing'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Get User By ID"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description of what this endpoint does"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTTP Method *
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => handleInputChange('method', e.target.value as HTTPMethod)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  onChange={(e) => handleInputChange('protocol', e.target.value as Protocol)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="rest">REST/JSON</option>
                  <option value="graphql">GraphQL</option>
                  <option value="soap">SOAP/XML</option>
                  <option value="toml">TOML</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint Path *
                </label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => handleInputChange('path', e.target.value)}
                  placeholder="/api/users/:id"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use :param for path parameters (e.g., /api/users/:id)
                </p>
              </div>
            </div>
          </div>

          {/* Response Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Response Configuration
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status Code *
                  </label>
                  <input
                    type="number"
                    value={formData.status_code}
                    onChange={(e) => handleInputChange('status_code', parseInt(e.target.value))}
                    min="100"
                    max="599"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => handleInputChange('content_type', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="application/json">application/json</option>
                    <option value="application/xml">application/xml</option>
                    <option value="text/plain">text/plain</option>
                    <option value="text/html">text/html</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Response Body *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => applyTemplate('success')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                      Success Template
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('user')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    >
                      User Template
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('list')}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    >
                      List Template
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('error')}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      Error Template
                    </button>
                  </div>
                </div>
                <textarea
                  value={formData.response_body}
                  onChange={(e) => handleInputChange('response_body', e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  required
                />
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Template Variables:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Basic:</p>
                      <code className="block">{'{{'} random_int {'}}'},  {'{{'} random_uuid {'}}'},  {'{{'} timestamp {'}}'},  {'{{'} date {'}}'},  {'{{'} path {'}}'}</code>
                      <code className="block">{'{{'} query.param {'}}'},  {'{{'} body.field {'}}'}</code>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Personal:</p>
                      <code className="block">{'{{'} faker.name {'}}'},  {'{{'} faker.first_name {'}}'},  {'{{'} faker.last_name {'}}'}</code>
                      <code className="block">{'{{'} faker.email {'}}'},  {'{{'} faker.phone {'}}'},  {'{{'} faker.address {'}}'}</code>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Internet:</p>
                      <code className="block">{'{{'} faker.url {'}}'},  {'{{'} faker.domain {'}}'},  {'{{'} faker.username {'}}'}</code>
                      <code className="block">{'{{'} faker.ipv4 {'}}'},  {'{{'} faker.user_agent {'}}'}</code>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Business:</p>
                      <code className="block">{'{{'} faker.company {'}}'},  {'{{'} faker.job {'}}'}</code>
                      <code className="block">{'{{'} faker.currency_code {'}}'}</code>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Text:</p>
                      <code className="block">{'{{'} faker.sentence {'}}'},  {'{{'} faker.paragraph {'}}'}</code>
                      <code className="block">{'{{'} faker.text {'}}'},  {'{{'} faker.word {'}}'}</code>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Other:</p>
                      <code className="block">{'{{'} faker.random_number {'}}'},  {'{{'} faker.color {'}}'}</code>
                      <code className="block">{'{{'} faker.hex_color {'}}'},  {'{{'} faker.boolean {'}}'}</code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Headers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Response Headers
                </label>

                {/* Existing Headers */}
                {Object.keys(formData.response_headers || {}).length > 0 && (
                  <div className="mb-2 space-y-2">
                    {Object.entries(formData.response_headers || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <code className="flex-1 text-sm text-gray-800 dark:text-gray-300">
                          {key}: {value}
                        </code>
                        <button
                          type="button"
                          onClick={() => removeHeader(key)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Header */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customHeader.key}
                    onChange={(e) => setCustomHeader(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Header name"
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={customHeader.value}
                    onChange={(e) => setCustomHeader(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Header value"
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addHeader}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Advanced Settings
              </h2>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Latency (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.latency_min}
                      onChange={(e) => handleInputChange('latency_min', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Latency (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.latency_max}
                      onChange={(e) => handleInputChange('latency_max', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Simulates network latency (0 = no delay)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Error Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.error_rate}
                      onChange={(e) => handleInputChange('error_rate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Percentage of requests that return errors
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Active (endpoint can receive requests)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enable_logging}
                      onChange={(e) => handleInputChange('enable_logging', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Enable request logging
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <ProfessionalButton
              type="submit"
              disabled={saving}
              icon={
                saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              }
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Endpoint' : 'Create Endpoint'}
            </ProfessionalButton>

            <Link to="/mock-api">
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
