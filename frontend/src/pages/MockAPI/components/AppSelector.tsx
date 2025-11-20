import React, { useState } from 'react';
import { FiPlus, FiChevronDown, FiFolder } from 'react-icons/fi';
import type { MockApp, MockAppFormData } from '../../../types/mockAPI';

interface AppSelectorProps {
  apps: MockApp[];
  selectedApp: MockApp | null;
  onAppChange: (app: MockApp | null) => void;
  onCreateApp: (appData: MockAppFormData) => void;
}

const AppSelector: React.FC<AppSelectorProps> = ({
  apps,
  selectedApp,
  onAppChange,
  onCreateApp
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<MockAppFormData>({
    name: '',
    description: '',
    icon: '📦',
    color: '#6366f1',
    base_url: '',
    is_public: false
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateApp(formData);
    setShowCreateModal(false);
    setFormData({
      name: '',
      description: '',
      icon: '📦',
      color: '#6366f1',
      base_url: '',
      is_public: false
    });
  };

  const iconOptions = ['📦', '🚀', '⚡', '🔥', '💻', '🌟', '🎯', '🔧', '📱', '🌐'];

  return (
    <>
      {/* App Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {selectedApp ? (
            <>
              <span className="text-xl">{selectedApp.icon || '📦'}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedApp.name}
              </span>
            </>
          ) : (
            <>
              <FiFolder className="w-5 h-5 text-gray-500" />
              <span className="text-gray-500">Select App</span>
            </>
          )}
          <FiChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2 max-h-96 overflow-y-auto">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onAppChange(app);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedApp?.id === app.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <span className="text-2xl">{app.icon || '📦'}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {app.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {app.total_collections} collections • {app.total_endpoints} endpoints
                    </div>
                  </div>
                </button>
              ))}

              <button
                data-app-selector-create
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors mt-2"
              >
                <FiPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  Create New App
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Create App Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New App
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create a new workspace to organize your mock APIs
              </p>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {/* App Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  App Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E-commerce API"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mock APIs for e-commerce platform..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Icon and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-2 rounded-lg border-2 ${
                          formData.icon === icon
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10 rounded border border-gray-300 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#6366f1"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  placeholder="https://api.example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Public Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_public" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Make this app public (allow others to access your mock endpoints)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSelector;
