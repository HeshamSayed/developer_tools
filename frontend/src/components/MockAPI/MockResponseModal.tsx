import { useState, useEffect } from 'react';
import { mockingService } from '@/services/mockingService';
import type { MockResponse, MockEndpoint } from '@/types/mocking';
import ProfessionalButton from '@/components/Common/ProfessionalButton';

interface MockResponseModalProps {
  endpoint: MockEndpoint;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

type ConditionType = 'default' | 'query_param' | 'header' | 'body_field' | 'random';

export default function MockResponseModal({ endpoint, isOpen, onClose, onUpdate }: MockResponseModalProps) {
  const [responses, setResponses] = useState<MockResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<MockResponse>>({
    endpoint: endpoint.id,
    name: '',
    description: '',
    condition_type: 'default',
    condition_key: '',
    condition_value: '',
    condition_probability: 100,
    response_body: '{}',
    status_code: 200,
    response_headers: {},
    priority: 1,
  });

  useEffect(() => {
    if (isOpen) {
      loadResponses();
    }
  }, [isOpen, endpoint.id]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const allResponses = await mockingService.getResponses();
      const endpointResponses = allResponses.filter(r => r.endpoint === endpoint.id);
      // Sort by priority (highest first)
      endpointResponses.sort((a, b) => b.priority - a.priority);
      setResponses(endpointResponses);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load responses:', err);
      setError('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!formData.name?.trim()) {
        setError('Response name is required');
        return;
      }

      if (editingId) {
        await mockingService.updateResponse(editingId, formData);
      } else {
        await mockingService.createResponse(formData);
      }

      await loadResponses();
      resetForm();
      onUpdate();
    } catch (err: any) {
      console.error('Failed to save response:', err);
      setError(err.response?.data?.message || 'Failed to save response');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conditional response?')) {
      return;
    }

    try {
      await mockingService.deleteResponse(id);
      await loadResponses();
      onUpdate();
    } catch (err: any) {
      console.error('Failed to delete response:', err);
      setError(err.response?.data?.message || 'Failed to delete response');
    }
  };

  const handleEdit = (response: MockResponse) => {
    setEditingId(response.id);
    setFormData({
      endpoint: response.endpoint,
      name: response.name,
      description: response.description,
      condition_type: response.condition_type,
      condition_key: response.condition_key,
      condition_value: response.condition_value,
      condition_probability: response.condition_probability,
      response_body: response.response_body,
      status_code: response.status_code,
      response_headers: response.response_headers || {},
      priority: response.priority,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      endpoint: endpoint.id,
      name: '',
      description: '',
      condition_type: 'default',
      condition_key: '',
      condition_value: '',
      condition_probability: 100,
      response_body: '{}',
      status_code: 200,
      response_headers: {},
      priority: 1,
    });
  };

  const getConditionDescription = (response: MockResponse): string => {
    switch (response.condition_type) {
      case 'default':
        return 'Always match (default)';
      case 'query_param':
        return `Query param: ${response.condition_key} = ${response.condition_value}`;
      case 'header':
        return `Header: ${response.condition_key} = ${response.condition_value}`;
      case 'body_field':
        return `Body field: ${response.condition_key} = ${response.condition_value}`;
      case 'random':
        return `Random (${response.condition_probability}% chance)`;
      default:
        return 'Unknown condition';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conditional Responses
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Endpoint: {endpoint.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response List */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Existing Responses ({responses.length})
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
              ) : responses.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No conditional responses yet. The endpoint will use its default response.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div
                      key={response.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded">
                              #{index + 1} Priority: {response.priority}
                            </span>
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {response.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {getConditionDescription(response)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Status: {response.status_code} | Used {response.usage_count} times
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(response)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(response.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add/Edit Form */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {editingId ? 'Edit Response' : 'Add New Response'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Success Response, Error 404"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition Type
                  </label>
                  <select
                    value={formData.condition_type}
                    onChange={(e) => setFormData({ ...formData, condition_type: e.target.value as ConditionType })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="default">Default (always match)</option>
                    <option value="query_param">Query Parameter</option>
                    <option value="header">Request Header</option>
                    <option value="body_field">Body Field</option>
                    <option value="random">Random (probability)</option>
                  </select>
                </div>

                {formData.condition_type !== 'default' && formData.condition_type !== 'random' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Condition Key
                      </label>
                      <input
                        type="text"
                        value={formData.condition_key}
                        onChange={(e) => setFormData({ ...formData, condition_key: e.target.value })}
                        placeholder={
                          formData.condition_type === 'query_param' ? 'e.g., status' :
                          formData.condition_type === 'header' ? 'e.g., X-User-Type' :
                          'e.g., user_type'
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Condition Value
                      </label>
                      <input
                        type="text"
                        value={formData.condition_value}
                        onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                        placeholder="e.g., premium, admin, active"
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </>
                )}

                {formData.condition_type === 'random' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Probability (%)
                    </label>
                    <input
                      type="number"
                      value={formData.condition_probability}
                      onChange={(e) => setFormData({ ...formData, condition_probability: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status Code
                    </label>
                    <input
                      type="number"
                      value={formData.status_code}
                      onChange={(e) => setFormData({ ...formData, status_code: parseInt(e.target.value) })}
                      min="100"
                      max="599"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Body
                  </label>
                  <textarea
                    value={formData.response_body}
                    onChange={(e) => setFormData({ ...formData, response_body: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Supports all template variables like {'{{'} faker.name {'}}'}, {'{{'} random_uuid {'}}'}, etc.
                  </p>
                </div>

                <div className="flex gap-2">
                  <ProfessionalButton
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Response' : 'Add Response'}
                  </ProfessionalButton>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
