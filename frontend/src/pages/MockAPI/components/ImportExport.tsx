import React, { useState } from 'react';
import { FiDownload, FiUpload, FiFile, FiX } from 'react-icons/fi';
import type { MockApp, MockCollection, MockEndpoint } from '../../../types/mockAPI';
import { mockEndpointAPI, mockCollectionAPI } from '../../../services/mockAPIService';
import { useNotification } from '../../../contexts/NotificationContext';

interface ImportExportProps {
  app: MockApp;
  collections: MockCollection[];
  onClose: () => void;
  onImportComplete?: () => void;
}

const ImportExport: React.FC<ImportExportProps> = ({
  app,
  collections,
  onClose,
  onImportComplete
}) => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedFormat, setSelectedFormat] = useState<'openapi' | 'postman'>('openapi');
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  const toggleCollection = (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const selectAll = () => {
    setSelectedCollections(new Set(collections.map(c => c.id)));
  };

  const deselectAll = () => {
    setSelectedCollections(new Set());
  };

  const exportAsOpenAPI = async () => {
    try {
      // For simplicity, we'll export all collections and their endpoints
      const selectedCols = collections.filter(c => selectedCollections.has(c.id));

      if (selectedCols.length === 0) {
        alert('Please select at least one collection to export');
        return;
      }

      // Build OpenAPI 3.0 spec
      const spec = {
        openapi: '3.0.0',
        info: {
          title: app.name,
          description: app.description || 'Mock API Endpoints',
          version: '1.0.0'
        },
        servers: [
          {
            url: app.base_url || 'http://localhost:8003',
            description: 'Mock server'
          }
        ],
        paths: {} as any,
        components: {
          schemas: {}
        }
      };

      // For each selected collection, fetch endpoints and add to spec
      for (const collection of selectedCols) {
        try {
          const endpoints = await mockEndpointAPI.list(collection.id);

          endpoints.forEach((endpoint: MockEndpoint) => {
            const path = endpoint.path;
            const method = endpoint.method.toLowerCase();

            if (!spec.paths[path]) {
              spec.paths[path] = {};
            }

            // Parse response body if it's JSON
            let exampleResponse: any = {};
            try {
              exampleResponse = JSON.parse(endpoint.response_body);
            } catch {
              exampleResponse = endpoint.response_body;
            }

            spec.paths[path][method] = {
              summary: endpoint.name,
              description: endpoint.description || '',
              tags: [collection.name],
              responses: {
                [endpoint.status_code]: {
                  description: 'Success response',
                  content: {
                    [endpoint.content_type]: {
                      example: exampleResponse
                    }
                  }
                }
              }
            };
          });
        } catch (error) {
          console.error(`Failed to fetch endpoints for collection ${collection.name}:`, error);
        }
      }

      // Download the spec
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}-openapi.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('OpenAPI specification exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export OpenAPI specification');
    }
  };

  const exportAsPostman = async () => {
    try {
      const selectedCols = collections.filter(c => selectedCollections.has(c.id));

      if (selectedCols.length === 0) {
        alert('Please select at least one collection to export');
        return;
      }

      // Build Postman Collection v2.1 format
      const postmanCollection = {
        info: {
          name: app.name,
          description: app.description || 'Mock API Endpoints',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [] as any[]
      };

      // For each selected collection, fetch endpoints and add to collection
      for (const collection of selectedCols) {
        try {
          const endpoints = await mockEndpointAPI.list(collection.id);

          const collectionItem = {
            name: collection.name,
            description: collection.description,
            item: endpoints.map((endpoint: MockEndpoint) => ({
              name: endpoint.name,
              request: {
                method: endpoint.method,
                header: Object.entries(endpoint.response_headers || {}).map(([key, value]) => ({
                  key,
                  value,
                  type: 'text'
                })),
                url: {
                  raw: `{{baseUrl}}${endpoint.path}`,
                  host: ['{{baseUrl}}'],
                  path: endpoint.path.split('/').filter(Boolean)
                },
                description: endpoint.description
              },
              response: [
                {
                  name: 'Example Response',
                  originalRequest: {
                    method: endpoint.method,
                    header: [],
                    url: {
                      raw: `{{baseUrl}}${endpoint.path}`,
                      host: ['{{baseUrl}}'],
                      path: endpoint.path.split('/').filter(Boolean)
                    }
                  },
                  status: `${endpoint.status_code}`,
                  code: endpoint.status_code,
                  _postman_previewlanguage: 'json',
                  header: Object.entries(endpoint.response_headers || {}).map(([key, value]) => ({
                    key,
                    value
                  })),
                  body: endpoint.response_body
                }
              ]
            }))
          };

          postmanCollection.item.push(collectionItem);
        } catch (error) {
          console.error(`Failed to fetch endpoints for collection ${collection.name}:`, error);
        }
      }

      // Download the collection
      const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name.toLowerCase().replace(/\s+/g, '-')}-postman.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Postman collection exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export Postman collection');
    }
  };

  const handleExport = () => {
    if (selectedFormat === 'openapi') {
      exportAsOpenAPI();
    } else {
      exportAsPostman();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress('Reading file...');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Detect format
      const isPostman = data.info?.schema?.includes('getpostman.com');
      const isOpenAPI = data.openapi && data.openapi.startsWith('3.');

      if (!isPostman && !isOpenAPI) {
        showError('Unknown file format. Please upload a Postman Collection or OpenAPI 3.0 file.');
        setImporting(false);
        setImportProgress('');
        return;
      }

      let createdCount = 0;

      if (isPostman) {
        setImportProgress('Importing Postman collection...');
        createdCount = await importPostmanCollection(data);
      } else if (isOpenAPI) {
        setImportProgress('Importing OpenAPI specification...');
        createdCount = await importOpenAPI(data);
      }

      showSuccess(`Successfully imported collection! ${createdCount} endpoints created.`);

      if (onImportComplete) {
        onImportComplete();
      }

      // Reset and close after success
      setTimeout(() => {
        setImportProgress('');
        setImporting(false);
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error('Import failed:', error);
      showError(error?.message || 'Failed to import file. Please check the file format.');
      setImportProgress('');
      setImporting(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const importPostmanCollection = async (postmanData: any) => {
    const { item: items = [] } = postmanData;
    let createdCount = 0;

    for (const collectionOrFolder of items) {
      // Check if this is a folder with items or a single request
      if (collectionOrFolder.item && Array.isArray(collectionOrFolder.item)) {
        // It's a folder/collection
        setImportProgress(`Creating collection: ${collectionOrFolder.name}...`);

        try {
          // Create collection
          const newCollection = await mockCollectionAPI.create({
            app: app.id,
            name: collectionOrFolder.name || 'Imported Collection',
            description: collectionOrFolder.description || '',
            order: 0,
            folder: ''
          });

          // Create endpoints in this collection
          for (const request of collectionOrFolder.item) {
            if (request.request) {
              await createEndpointFromPostmanRequest(request, newCollection.id);
              createdCount++;
              setImportProgress(`Imported ${createdCount} endpoints...`);
            }
          }
        } catch (error) {
          console.error(`Failed to import collection ${collectionOrFolder.name}:`, error);
          showError(`Failed to import collection: ${collectionOrFolder.name}`);
        }
      } else if (collectionOrFolder.request) {
        // It's a direct request, create in a default collection
        setImportProgress('Creating endpoints...');

        try {
          // Find or create "Imported" collection
          let importedCollection = collections.find(c => c.name === 'Imported Requests');
          if (!importedCollection) {
            importedCollection = await mockCollectionAPI.create({
              app: app.id,
              name: 'Imported Requests',
              description: 'Endpoints imported from Postman',
              order: 0,
              folder: ''
            });
          }

          await createEndpointFromPostmanRequest(collectionOrFolder, importedCollection.id);
          createdCount++;
          setImportProgress(`Imported ${createdCount} endpoints...`);
        } catch (error) {
          console.error('Failed to import request:', error);
        }
      }
    }

    return createdCount;
  };

  const createEndpointFromPostmanRequest = async (request: any, collectionId: string) => {
    const method = request.request?.method || 'GET';
    const url = request.request?.url;

    // Parse URL
    let path = '/api/endpoint';
    if (typeof url === 'string') {
      try {
        const urlObj = new URL(url);
        path = urlObj.pathname;
      } catch {
        path = url.startsWith('/') ? url : '/' + url;
      }
    } else if (url?.path) {
      path = '/' + (Array.isArray(url.path) ? url.path.join('/') : url.path);
    }

    // Get response body if available
    let responseBody = '{"message": "Success"}';
    let statusCode = 200;
    let contentType = 'application/json';

    if (request.response && request.response.length > 0) {
      const exampleResponse = request.response[0];
      responseBody = exampleResponse.body || responseBody;
      statusCode = exampleResponse.code || statusCode;

      const contentTypeHeader = exampleResponse.header?.find((h: any) =>
        h.key.toLowerCase() === 'content-type'
      );
      if (contentTypeHeader) {
        contentType = contentTypeHeader.value;
      }
    }

    // Create endpoint
    await mockEndpointAPI.create({
      collection: collectionId,
      name: request.name || `${method} ${path}`,
      description: request.request?.description || '',
      path: path,
      method: method,
      protocol: 'rest',
      status_code: statusCode,
      response_body: responseBody,
      response_headers: {},
      content_type: contentType,
      latency_min: 0,
      latency_max: 0,
      error_rate: 0,
      is_active: true,
      enable_logging: true,
      order: 0
    });
  };

  const importOpenAPI = async (openAPIData: any) => {
    const { paths = {} } = openAPIData;
    let createdCount = 0;

    // Group endpoints by tags (convert to collections)
    const endpointsByTag: Record<string, any[]> = {};

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods as any)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method)) {
          const tags = (details as any).tags || ['Imported'];
          const tag = tags[0] || 'Imported';

          if (!endpointsByTag[tag]) {
            endpointsByTag[tag] = [];
          }

          endpointsByTag[tag].push({
            path,
            method: method.toUpperCase(),
            details
          });
        }
      }
    }

    // Create collections and endpoints
    for (const [tag, endpoints] of Object.entries(endpointsByTag)) {
      setImportProgress(`Creating collection: ${tag}...`);

      try {
        // Create collection
        const newCollection = await mockCollectionAPI.create({
          app: app.id,
          name: tag,
          description: `Imported from OpenAPI`,
          order: 0,
          folder: ''
        });

        // Create endpoints
        for (const endpoint of endpoints) {
          const { path, method, details } = endpoint;

          // Get response body from example
          let responseBody = '{"message": "Success"}';
          let statusCode = 200;
          let contentType = 'application/json';

          if (details.responses) {
            const firstResponse = Object.entries(details.responses)[0];
            if (firstResponse) {
              statusCode = parseInt(firstResponse[0]) || 200;
              const responseData = firstResponse[1] as any;

              if (responseData.content) {
                const contentTypeEntry = Object.entries(responseData.content)[0];
                if (contentTypeEntry) {
                  contentType = contentTypeEntry[0];
                  const mediaType = contentTypeEntry[1] as any;
                  if (mediaType.example) {
                    responseBody = typeof mediaType.example === 'string'
                      ? mediaType.example
                      : JSON.stringify(mediaType.example, null, 2);
                  }
                }
              }
            }
          }

          await mockEndpointAPI.create({
            collection: newCollection.id,
            name: details.summary || `${method} ${path}`,
            description: details.description || '',
            path: path,
            method: method,
            protocol: 'rest',
            status_code: statusCode,
            response_body: responseBody,
            response_headers: {},
            content_type: contentType,
            latency_min: 0,
            latency_max: 0,
            error_rate: 0,
            is_active: true,
            enable_logging: true,
            order: 0
          });

          createdCount++;
          setImportProgress(`Imported ${createdCount} endpoints...`);
        }
      } catch (error) {
        console.error(`Failed to import collection ${tag}:`, error);
        showError(`Failed to import collection: ${tag}`);
      }
    }

    return createdCount;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import / Export
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'export'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiDownload className="w-4 h-4" />
                <span>Export</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'import'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiUpload className="w-4 h-4" />
                <span>Import</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedFormat('openapi')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      selectedFormat === 'openapi'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <FiFile className="w-8 h-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                    <div className="font-medium text-gray-900 dark:text-white">OpenAPI 3.0</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Standard REST API specification
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedFormat('postman')}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      selectedFormat === 'postman'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <FiFile className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                    <div className="font-medium text-gray-900 dark:text-white">Postman</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Postman Collection v2.1
                    </div>
                  </button>
                </div>
              </div>

              {/* Collection Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Collections to Export
                  </label>
                  <div className="space-x-2">
                    <button
                      onClick={selectAll}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                  {collections.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No collections available
                    </div>
                  ) : (
                    collections.map((collection) => (
                      <label
                        key={collection.id}
                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollections.has(collection.id)}
                          onChange={() => toggleCollection(collection.id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {collection.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {collection.total_endpoints} endpoints
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={selectedCollections.size === 0}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
              >
                <FiDownload className="w-5 h-5" />
                <span>
                  Export {selectedCollections.size > 0 ? `(${selectedCollections.size} collections)` : ''}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Import Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Supported Formats
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Postman Collection v2.0 / v2.1</li>
                  <li>• OpenAPI 3.0 Specification</li>
                </ul>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Drop your file here or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={importing}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    {importing ? 'Importing...' : 'Choose File'}
                  </label>
                </div>
              </div>

              {/* Import Progress */}
              {importProgress && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                      {importProgress}
                    </p>
                  </div>
                </div>
              )}

              {/* Import Instructions */}
              {!importing && (
                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-200 mb-2">
                    How it works
                  </h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Collections and folders will be imported as collections</li>
                    <li>• Requests will be imported as endpoints</li>
                    <li>• Response examples will be used as mock responses</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
