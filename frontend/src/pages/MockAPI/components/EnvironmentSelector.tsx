import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiPlus, FiGlobe } from 'react-icons/fi';
import type { MockEnvironment, MockEnvironmentFormData } from '../../../types/mockAPI';
import { mockEnvironmentAPI } from '../../../services/mockAPIService';

interface EnvironmentSelectorProps {
  appId: string;
}

const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({ appId }) => {
  const [environments, setEnvironments] = useState<MockEnvironment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<MockEnvironment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<MockEnvironmentFormData>({
    app: appId,
    name: '',
    variables: {},
    is_active: false
  });
  const [variableInput, setVariableInput] = useState({ key: '', value: '' });

  useEffect(() => {
    loadEnvironments();
  }, [appId]);

  const loadEnvironments = async () => {
    try {
      const data = await mockEnvironmentAPI.list(appId);
      setEnvironments(data);

      // Select active environment
      const active = data.find(env => env.is_active);
      if (active) {
        setSelectedEnv(active);
      }
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newEnv = await mockEnvironmentAPI.create({
        ...formData,
        app: appId
      });

      setEnvironments([...environments, newEnv]);

      if (formData.is_active) {
        setSelectedEnv(newEnv);
      }

      setShowCreateModal(false);
      setFormData({
        app: appId,
        name: '',
        variables: {},
        is_active: false
      });
      setVariableInput({ key: '', value: '' });
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  };

  const handleActivate = async (env: MockEnvironment) => {
    try {
      await mockEnvironmentAPI.update(env.id, { is_active: true });
      setSelectedEnv(env);
      loadEnvironments();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to activate environment:', error);
    }
  };

  const addVariable = () => {
    if (variableInput.key && variableInput.value) {
      setFormData({
        ...formData,
        variables: {
          ...formData.variables,
          [variableInput.key]: variableInput.value
        }
      });
      setVariableInput({ key: '', value: '' });
    }
  };

  const removeVariable = (key: string) => {
    const newVars = { ...formData.variables };
    delete newVars[key];
    setFormData({ ...formData, variables: newVars });
  };

  const presetEnvironments = [
    { name: 'Development', variables: { API_URL: 'http://localhost:3000', DEBUG: 'true' } },
    { name: 'Staging', variables: { API_URL: 'https://staging.api.example.com', DEBUG: 'false' } },
    { name: 'Production', variables: { API_URL: 'https://api.example.com', DEBUG: 'false' } }
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FiGlobe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {selectedEnv ? selectedEnv.name : 'No Environment'}
          </span>
          <FiChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2 max-h-80 overflow-y-auto">
              {environments.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  No environments yet
                </div>
              ) : (
                environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => handleActivate(env)}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedEnv?.id === env.id ? 'bg-green-50 dark:bg-green-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {env.name}
                      </span>
                      {env.is_active && (
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {Object.keys(env.variables).length} variables
                    </div>
                  </button>
                ))
              )}

              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors mt-2"
              >
                <FiPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  New Environment
                </span>
              </button>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        )}
      </div>

      {/* Create Environment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create Environment
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Define environment variables for different stages (Dev, Staging, Production)
              </p>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {/* Preset Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Start (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetEnvironments.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, name: preset.name, variables: preset.variables })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Environment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Development"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Environment Variables
                </label>

                {/* Existing Variables */}
                {Object.entries(formData.variables).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {Object.entries(formData.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <code className="flex-1 text-sm text-gray-900 dark:text-white">
                          {key} = {value}
                        </code>
                        <button
                          type="button"
                          onClick={() => removeVariable(key)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Variable */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={variableInput.key}
                    onChange={(e) => setVariableInput({ ...variableInput, key: e.target.value })}
                    placeholder="Key (e.g., API_URL)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    value={variableInput.value}
                    onChange={(e) => setVariableInput({ ...variableInput, value: e.target.value })}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={addVariable}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active_env"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_active_env" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Set as active environment
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Environment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EnvironmentSelector;
