import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiFolder,
  FiChevronRight,
  FiChevronDown,
  FiRefreshCw
} from 'react-icons/fi';
import type { MockApp, MockCollection, MockEndpoint, MockCollectionFormData } from '../../../types/mockAPI';
import { mockEndpointAPI } from '../../../services/mockAPIService';

interface CollectionSidebarProps {
  app: MockApp | null;
  collections: MockCollection[];
  selectedCollection: MockCollection | null;
  selectedEndpoint: MockEndpoint | null;
  onCollectionSelect: (collection: MockCollection) => void;
  onEndpointSelect: (endpoint: MockEndpoint) => void;
  onCreateCollection: (data: MockCollectionFormData) => void;
  onCreateEndpoint: (data: any) => void;
  onRefresh: () => void;
}

const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  app,
  collections,
  selectedCollection,
  selectedEndpoint,
  onCollectionSelect,
  onEndpointSelect,
  onCreateCollection,
  onCreateEndpoint,
  onRefresh
}) => {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [collectionEndpoints, setCollectionEndpoints] = useState<Record<string, MockEndpoint[]>>({});
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showCreateEndpointModal, setShowCreateEndpointModal] = useState(false);
  const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
  const [collectionFormData, setCollectionFormData] = useState<MockCollectionFormData>({
    app: '',
    name: '',
    description: '',
    order: 0,
    folder: ''
  });
  const [endpointFormData, setEndpointFormData] = useState({
    name: '',
    path: '',
    method: 'GET',
    status_code: 200,
    response_body: '{"message": "Success"}'
  });

  // Load endpoints for expanded collections
  useEffect(() => {
    expandedCollections.forEach(async (collectionId) => {
      if (!collectionEndpoints[collectionId]) {
        try {
          const endpoints = await mockEndpointAPI.list(collectionId);
          setCollectionEndpoints(prev => ({
            ...prev,
            [collectionId]: endpoints
          }));
        } catch (error) {
          console.error('Failed to load endpoints:', error);
        }
      }
    });
  }, [expandedCollections]);

  const toggleCollection = async (collection: MockCollection) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collection.id)) {
      newExpanded.delete(collection.id);
    } else {
      newExpanded.add(collection.id);

      // Load endpoints if not already loaded
      if (!collectionEndpoints[collection.id]) {
        try {
          const endpoints = await mockEndpointAPI.list(collection.id);
          setCollectionEndpoints(prev => ({
            ...prev,
            [collection.id]: endpoints
          }));
        } catch (error) {
          console.error('Failed to load endpoints:', error);
        }
      }
    }
    setExpandedCollections(newExpanded);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;

    onCreateCollection({
      ...collectionFormData,
      app: app.id
    });

    setShowCreateCollectionModal(false);
    setCollectionFormData({
      app: '',
      name: '',
      description: '',
      order: 0,
      folder: ''
    });
  };

  const handleCreateEndpoint = (collectionId: string) => {
    setTargetCollectionId(collectionId);
    // Reset form with default values
    const timestamp = Date.now();
    setEndpointFormData({
      name: `New Endpoint`,
      path: `/api/endpoint-${timestamp}`,
      method: 'GET',
      status_code: 200,
      response_body: '{"message": "Success"}'
    });
    setShowCreateEndpointModal(true);
  };

  const handleEndpointCreate = async () => {
    if (!targetCollectionId) return;

    const collectionId = targetCollectionId;

    try {
      await onCreateEndpoint({
        collection: collectionId,
        name: endpointFormData.name,
        path: endpointFormData.path,
        method: endpointFormData.method,
        protocol: 'rest',
        status_code: endpointFormData.status_code,
        response_body: endpointFormData.response_body,
        response_headers: {},
        content_type: 'application/json',
        order: 0,
        description: '',
        latency_min: 0,
        latency_max: 0,
        error_rate: 0,
        is_active: true,
        enable_logging: true
      });

      setShowCreateEndpointModal(false);
      setTargetCollectionId(null);

      // Refresh endpoints for this collection immediately
      const endpoints = await mockEndpointAPI.list(collectionId);
      setCollectionEndpoints(prev => ({
        ...prev,
        [collectionId]: endpoints
      }));
    } catch (error) {
      console.error('Failed to create endpoint:', error);
      setShowCreateEndpointModal(false);
      setTargetCollectionId(null);
    }
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      POST: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      PUT: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      PATCH: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      DELETE: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      HEAD: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
      OPTIONS: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
    };
    return colors[method] || 'text-gray-600 bg-gray-100';
  };

  if (!app) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center p-8">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Select an app to view collections
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Collections</h2>
            <button
              onClick={onRefresh}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCreateCollectionModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span className="text-sm font-medium">New Collection</span>
          </button>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-2">
          {collections.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FiFolder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                No collections yet. Create one to organize your endpoints.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection) => {
                const isExpanded = expandedCollections.has(collection.id);
                const endpoints = collectionEndpoints[collection.id] || [];

                return (
                  <div key={collection.id} className="mb-1">
                    {/* Collection Header */}
                    <div
                      className={`group flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedCollection?.id === collection.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => {
                        onCollectionSelect(collection);
                        toggleCollection(collection);
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollection(collection);
                        }}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        {isExpanded ? (
                          <FiChevronDown className="w-4 h-4" />
                        ) : (
                          <FiChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <FiFolder className="w-4 h-4 flex-shrink-0" />

                      <span className="flex-1 text-sm font-medium truncate">
                        {collection.name}
                      </span>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {collection.total_endpoints}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateEndpoint(collection.id);
                        }}
                        className="p-1 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Add endpoint to this collection"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Endpoints */}
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-0.5">
                        {endpoints.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              No endpoints yet
                            </p>
                            <button
                              onClick={() => handleCreateEndpoint(collection.id)}
                              className="w-full px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>Add First Endpoint</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {endpoints.map((endpoint) => (
                              <div
                                key={endpoint.id}
                                onClick={() => onEndpointSelect(endpoint)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  selectedEndpoint?.id === endpoint.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <span
                                  className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${getMethodColor(
                                    endpoint.method
                                  )}`}
                                >
                                  {endpoint.method}
                                </span>
                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {endpoint.name}
                                </span>
                                {!endpoint.is_active && (
                                  <span className="text-xs text-gray-400">●</span>
                                )}
                              </div>
                            ))}

                            {/* Add another endpoint button */}
                            <button
                              onClick={() => handleCreateEndpoint(collection.id)}
                              className="w-full px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center justify-center space-x-1 border border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>Add Endpoint</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Collection Modal */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Collection
              </h2>
            </div>

            <form onSubmit={handleCreateCollection} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={collectionFormData.name}
                  onChange={(e) => setCollectionFormData({ ...collectionFormData, name: e.target.value })}
                  placeholder="User Management"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={collectionFormData.description}
                  onChange={(e) => setCollectionFormData({ ...collectionFormData, description: e.target.value })}
                  placeholder="Endpoints for user CRUD operations..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCollectionModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Endpoint Form Modal */}
      {showCreateEndpointModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Endpoint
            </h3>

            <div className="space-y-4">
              {/* Endpoint Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoint Name *
                </label>
                <input
                  type="text"
                  value={endpointFormData.name}
                  onChange={(e) => setEndpointFormData({...endpointFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Get Users, Create Order"
                />
              </div>

              {/* HTTP Method & Path Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    HTTP Method *
                  </label>
                  <select
                    value={endpointFormData.method}
                    onChange={(e) => setEndpointFormData({...endpointFormData, method: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Path *
                  </label>
                  <input
                    type="text"
                    value={endpointFormData.path}
                    onChange={(e) => setEndpointFormData({...endpointFormData, path: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="/api/users"
                  />
                </div>
              </div>

              {/* Status Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Status Code *
                </label>
                <select
                  value={endpointFormData.status_code}
                  onChange={(e) => setEndpointFormData({...endpointFormData, status_code: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="200">200 OK</option>
                  <option value="201">201 Created</option>
                  <option value="204">204 No Content</option>
                  <option value="400">400 Bad Request</option>
                  <option value="401">401 Unauthorized</option>
                  <option value="403">403 Forbidden</option>
                  <option value="404">404 Not Found</option>
                  <option value="500">500 Internal Server Error</option>
                </select>
              </div>

              {/* Response Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Body (JSON)
                </label>
                <textarea
                  value={endpointFormData.response_body}
                  onChange={(e) => setEndpointFormData({...endpointFormData, response_body: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder='{"message": "Success"}'
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> You can customize headers, latency, error rates, and more advanced settings after creating the endpoint.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowCreateEndpointModal(false);
                  setTargetCollectionId(null);
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndpointCreate}
                disabled={!endpointFormData.name || !endpointFormData.path}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollectionSidebar;
