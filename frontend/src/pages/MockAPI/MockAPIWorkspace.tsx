import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus, FiFolder, FiSettings, FiDownload } from 'react-icons/fi';
import type { MockApp, MockCollection, MockEndpoint } from '../../types/mockAPI';
import { mockAppAPI, mockCollectionAPI, mockEndpointAPI } from '../../services/mockAPIService';
import { useNotification } from '../../contexts/NotificationContext';
import AppSelector from './components/AppSelector';
import CollectionSidebar from './components/CollectionSidebar';
import EndpointEditor from './components/EndpointEditor';
import EnvironmentSelector from './components/EnvironmentSelector';
import ImportExport from './components/ImportExport';

const MockAPIWorkspace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();

  // State
  const [apps, setApps] = useState<MockApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<MockApp | null>(null);
  const [collections, setCollections] = useState<MockCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<MockCollection | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<MockEndpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  // Load apps on mount
  useEffect(() => {
    loadApps();
  }, []);

  // Load collections when app changes
  useEffect(() => {
    if (selectedApp) {
      loadCollections(selectedApp.id);
    }
  }, [selectedApp]);

  // Handle URL params
  useEffect(() => {
    const appId = searchParams.get('app');
    const collectionId = searchParams.get('collection');
    const endpointId = searchParams.get('endpoint');

    if (appId && apps.length > 0) {
      const app = apps.find(a => a.id === appId);
      if (app) setSelectedApp(app);
    }

    if (collectionId && collections.length > 0) {
      const collection = collections.find(c => c.id === collectionId);
      if (collection) setSelectedCollection(collection);
    }

    if (endpointId) {
      loadEndpoint(endpointId);
    }
  }, [searchParams, apps, collections]);

  const loadApps = async () => {
    try {
      setLoading(true);
      const data = await mockAppAPI.list();
      setApps(data);

      // Auto-select first app if available
      if (data.length > 0 && !selectedApp) {
        setSelectedApp(data[0]);
      }
    } catch (error: any) {
      console.error('Failed to load apps:', error);
      showError(error?.response?.data?.detail || 'Failed to load apps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async (appId: string) => {
    try {
      const data = await mockCollectionAPI.list(appId);
      setCollections(data);
    } catch (error: any) {
      console.error('Failed to load collections:', error);
      showError(error?.response?.data?.detail || 'Failed to load collections.');
    }
  };

  const loadEndpoint = async (endpointId: string) => {
    try {
      const endpoint = await mockEndpointAPI.get(endpointId);
      setSelectedEndpoint(endpoint);
    } catch (error: any) {
      console.error('Failed to load endpoint:', error);
      showError(error?.response?.data?.detail || 'Failed to load endpoint.');
    }
  };

  const handleAppChange = (app: MockApp | null) => {
    setSelectedApp(app);
    setSelectedCollection(null);
    setSelectedEndpoint(null);
    if (app) {
      setSearchParams({ app: app.id });
    } else {
      setSearchParams({});
    }
  };

  const handleCollectionSelect = (collection: MockCollection) => {
    setSelectedCollection(collection);
    setSelectedEndpoint(null);
    if (selectedApp) {
      setSearchParams({ app: selectedApp.id, collection: collection.id });
    }
  };

  const handleEndpointSelect = (endpoint: MockEndpoint) => {
    setSelectedEndpoint(endpoint);
    if (selectedApp && selectedCollection) {
      setSearchParams({
        app: selectedApp.id,
        collection: selectedCollection.id,
        endpoint: endpoint.id
      });
    }
  };

  const handleCreateApp = async (appData: any) => {
    try {
      const newApp = await mockAppAPI.create(appData);
      setApps([...apps, newApp]);
      setSelectedApp(newApp);
      showSuccess(`App "${newApp.name}" created successfully!`);
    } catch (error: any) {
      console.error('Failed to create app:', error);
      const errorMsg = error?.response?.data?.detail || error?.response?.data?.name?.[0] || 'Failed to create app. Please try again.';
      showError(errorMsg);
    }
  };

  const handleCreateCollection = async (collectionData: any) => {
    if (!selectedApp) {
      showError('Please select an app first.');
      return;
    }

    try {
      const newCollection = await mockCollectionAPI.create({
        ...collectionData,
        app: selectedApp.id
      });
      setCollections([...collections, newCollection]);
      setSelectedCollection(newCollection);
      showSuccess(`Collection "${newCollection.name}" created successfully!`);
    } catch (error: any) {
      console.error('Failed to create collection:', error);
      const errorMsg = error?.response?.data?.detail || error?.response?.data?.name?.[0] || 'Failed to create collection. Please try again.';
      showError(errorMsg);
    }
  };

  const handleCreateEndpoint = async (endpointData: any) => {
    if (!selectedCollection) {
      showError('Please select a collection first.');
      return;
    }

    try {
      const newEndpoint = await mockEndpointAPI.create({
        ...endpointData,
        collection: selectedCollection.id
      });

      // Reload collections to update endpoint count
      if (selectedApp) {
        await loadCollections(selectedApp.id);
      }

      setSelectedEndpoint(newEndpoint);
      showSuccess(`Endpoint "${newEndpoint.name}" created successfully!`);
    } catch (error: any) {
      console.error('Failed to create endpoint:', error);
      const errorMsg = error?.response?.data?.detail || error?.response?.data?.name?.[0] || 'Failed to create endpoint. Please try again.';
      showError(errorMsg);
    }
  };

  const handleUpdateEndpoint = async (endpointId: string, endpointData: any) => {
    try {
      const updatedEndpoint = await mockEndpointAPI.update(endpointId, endpointData);
      setSelectedEndpoint(updatedEndpoint);

      // Reload collections to update data
      if (selectedApp) {
        await loadCollections(selectedApp.id);
      }

      showSuccess('Endpoint updated successfully!');
    } catch (error: any) {
      console.error('Failed to update endpoint:', error);
      const errorMsg = error?.response?.data?.detail || 'Failed to update endpoint. Please try again.';
      showError(errorMsg);
    }
  };

  const handleDeleteEndpoint = async (endpointId: string) => {
    try {
      await mockEndpointAPI.delete(endpointId);
      setSelectedEndpoint(null);

      // Reload collections
      if (selectedApp) {
        await loadCollections(selectedApp.id);
      }

      showSuccess('Endpoint deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete endpoint:', error);
      const errorMsg = error?.response?.data?.detail || 'Failed to delete endpoint. Please try again.';
      showError(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Mock API Workspace
          </h1>
          <AppSelector
            apps={apps}
            selectedApp={selectedApp}
            onAppChange={handleAppChange}
            onCreateApp={handleCreateApp}
          />
        </div>

        <div className="flex items-center space-x-4">
          {selectedApp && (
            <>
              <button
                onClick={() => setShowImportExport(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span className="text-sm">Import/Export</span>
              </button>
              <EnvironmentSelector appId={selectedApp.id} />
            </>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Collections */}
        {!sidebarCollapsed && (
          <CollectionSidebar
            app={selectedApp}
            collections={collections}
            selectedCollection={selectedCollection}
            selectedEndpoint={selectedEndpoint}
            onCollectionSelect={handleCollectionSelect}
            onEndpointSelect={handleEndpointSelect}
            onCreateCollection={handleCreateCollection}
            onCreateEndpoint={handleCreateEndpoint}
            onRefresh={() => selectedApp && loadCollections(selectedApp.id)}
          />
        )}

        {/* Right Panel - Endpoint Editor */}
        <div className="flex-1 overflow-auto">
          {selectedApp ? (
            <EndpointEditor
              endpoint={selectedEndpoint}
              collection={selectedCollection}
              onUpdate={handleUpdateEndpoint}
              onCreate={handleCreateEndpoint}
              onDelete={handleDeleteEndpoint}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FiFolder className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Mock API Workspace
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Create or select an app to start building your mock APIs. Organize endpoints into collections, just like Postman!
              </p>
              <button
                onClick={() => {
                  // Trigger app creation modal
                  const appSelector = document.querySelector('[data-app-selector-create]') as HTMLElement;
                  if (appSelector) appSelector.click();
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <FiPlus className="w-5 h-5" />
                <span>Create Your First App</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import/Export Modal */}
      {showImportExport && selectedApp && (
        <ImportExport
          app={selectedApp}
          collections={collections}
          onClose={() => setShowImportExport(false)}
          onImportComplete={() => {
            setShowImportExport(false);
            loadCollections(selectedApp.id);
          }}
        />
      )}
    </div>
  );
};

export default MockAPIWorkspace;
