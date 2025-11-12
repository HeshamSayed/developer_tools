import { useState, useEffect, useCallback, useRef } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import type { FileNode, FileSystemState } from '@/types/filesystem'
import {
  createFileNode,
  buildFileTree,
  flattenFileTree,
  exportFile,
  exportAsZip,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  templates,
  generateId,
} from '@/utils/fileSystem'
import { useNotification } from '@/contexts/NotificationContext'

export default function CodePlayground() {
  const { showNotification } = useNotification()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const autoSaveTimerRef = useRef<NodeJS.Timeout>()

  // File System State
  const [files, setFiles] = useState<Record<string, FileNode>>({})
  const [rootId, setRootId] = useState<string>('')
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())

  // UI State
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<'file' | 'directory'>('file')
  const [creatingIn, setCreatingIn] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'split' | 'preview' | 'code'>('split')

  // Initialize with empty project or load from localStorage
  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved && saved.files && Object.keys(saved.files).length > 0) {
      setFiles(saved.files)
      setRootId(saved.rootId)
      setExpandedDirs(new Set([saved.rootId]))
      showNotification('Project loaded from localStorage', 'success')
    } else {
      initializeEmptyProject()
    }

    // Warning before unload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Auto-save
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleSave()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [files, autoSave, hasUnsavedChanges])

  const initializeEmptyProject = () => {
    const root = createFileNode('My Project', 'directory')
    const indexFile = createFileNode('index.html', 'file', root.id, '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>')

    const newFiles = {
      [root.id]: root,
      [indexFile.id]: indexFile,
    }

    setFiles(newFiles)
    setRootId(root.id)
    setExpandedDirs(new Set([root.id]))
    setActiveFileId(indexFile.id)
    setOpenTabs([indexFile.id])
  }

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    const root = createFileNode(template.name, 'directory')
    const newFiles: Record<string, FileNode> = { [root.id]: root }

    template.files.forEach(file => {
      const newFile = { ...file, id: generateId(), parentId: root.id }
      newFiles[newFile.id] = newFile
    })

    setFiles(newFiles)
    setRootId(root.id)
    setExpandedDirs(new Set([root.id]))
    setOpenTabs([])
    setActiveFileId(null)
    setShowTemplates(false)
    showNotification(`Loaded template: ${template.name}`, 'success')
  }

  const handleSave = () => {
    saveToLocalStorage({ files, rootId })
    setHasUnsavedChanges(false)
    showNotification('Project saved successfully', 'success')
  }

  const handleExport = async () => {
    await exportAsZip(files, rootId)
    showNotification('Project exported successfully', 'success')
  }

  const handleNewProject = () => {
    if (hasUnsavedChanges) {
      setShowWarning(true)
    } else {
      clearLocalStorage()
      setOpenTabs([])
      setActiveFileId(null)
      initializeEmptyProject()
      showNotification('New project created', 'success')
    }
  }

  const createItem = () => {
    if (!newItemName.trim() || !creatingIn) return

    const newItem = createFileNode(newItemName.trim(), newItemType, creatingIn)
    setFiles(prev => ({ ...prev, [newItem.id]: newItem }))
    setHasUnsavedChanges(true)

    if (newItemType === 'file') {
      setOpenTabs(prev => [...prev, newItem.id])
      setActiveFileId(newItem.id)
    } else {
      setExpandedDirs(prev => new Set([...prev, newItem.id]))
    }

    setCreatingIn(null)
    setNewItemName('')
    showNotification(`${newItemType === 'file' ? 'File' : 'Folder'} created successfully`, 'success')
  }

  const deleteItem = (id: string) => {
    const item = files[id]
    if (!item) return

    // Remove from open tabs if it's a file
    if (item.type === 'file') {
      setOpenTabs(prev => prev.filter(tabId => tabId !== id))
      if (activeFileId === id) {
        setActiveFileId(null)
      }
    }

    // Remove item and all its children
    const idsToRemove = new Set<string>([id])
    const findChildren = (parentId: string) => {
      Object.values(files).forEach(file => {
        if (file.parentId === parentId) {
          idsToRemove.add(file.id)
          if (file.type === 'directory') {
            findChildren(file.id)
          }
        }
      })
    }
    if (item.type === 'directory') {
      findChildren(id)
    }

    setFiles(prev => {
      const newFiles = { ...prev }
      idsToRemove.forEach(idToRemove => delete newFiles[idToRemove])
      return newFiles
    })

    setHasUnsavedChanges(true)
    showNotification('Deleted successfully', 'success')
  }

  const updateFileContent = (id: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [id]: { ...prev[id], content, updatedAt: Date.now() }
    }))
    setHasUnsavedChanges(true)
  }

  const toggleDirectory = (id: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const openFile = (id: string) => {
    if (!openTabs.includes(id)) {
      setOpenTabs(prev => [...prev, id])
    }
    setActiveFileId(id)
  }

  const closeTab = (id: string) => {
    setOpenTabs(prev => prev.filter(tabId => tabId !== id))
    if (activeFileId === id) {
      const currentIndex = openTabs.indexOf(id)
      const nextTab = openTabs[currentIndex + 1] || openTabs[currentIndex - 1]
      setActiveFileId(nextTab || null)
    }
  }

  const renderFileTree = (parentId: string, level: number = 0): React.ReactNode => {
    const children = Object.values(files)
      .filter(file => file.parentId === parentId)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })

    return children.map(item => (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            activeFileId === item.id ? 'bg-primary-100 dark:bg-primary-900/30' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => item.type === 'file' ? openFile(item.id) : toggleDirectory(item.id)}
        >
          {item.type === 'directory' ? (
            <span className="text-sm">{expandedDirs.has(item.id) ? '📂' : '📁'}</span>
          ) : (
            <span className="text-sm">📄</span>
          )}
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteItem(item.id)
              }}
              className="p-1 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              title="Delete"
            >
              🗑️
            </button>
            {item.type === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  exportFile(item)
                }}
                className="p-1 text-xs text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                title="Export"
              >
                💾
              </button>
            )}
          </div>
        </div>
        {item.type === 'directory' && expandedDirs.has(item.id) && (
          <div className="group">{renderFileTree(item.id, level + 1)}</div>
        )}
      </div>
    ))
  }

  const activeFile = activeFileId ? files[activeFileId] : null

  const renderPreview = () => {
    if (!activeFile || activeFile.type !== 'file') return null

    // For HTML files, try to create a live preview
    if (activeFile.language === 'html') {
      const htmlContent = activeFile.content || ''
      return (
        <iframe
          srcDoc={htmlContent}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts"
          title="Preview"
        />
      )
    }

    // For other files, show a message
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="mb-2">Preview not available for this file type</p>
          <p className="text-sm">Preview is only available for HTML files</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button onClick={handleNewProject} className="btn-sm bg-primary-600 text-white hover:bg-primary-700">
            📄 New Project
          </button>
          <button onClick={() => setShowTemplates(true)} className="btn-sm">
            📋 Templates
          </button>
          <button onClick={handleSave} className="btn-sm">
            💾 Save
          </button>
          <button onClick={handleExport} className="btn-sm">
            📦 Export
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Auto-save</span>
          </label>

          <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded p-1">
            <button
              onClick={() => setPreviewMode('code')}
              className={`px-3 py-1 text-xs rounded ${previewMode === 'code' ? 'bg-white dark:bg-gray-600' : ''}`}
              title="Code only"
            >
              💻
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-3 py-1 text-xs rounded ${previewMode === 'split' ? 'bg-white dark:bg-gray-600' : ''}`}
              title="Split view"
            >
              ⚡
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`px-3 py-1 text-xs rounded ${previewMode === 'preview' ? 'bg-white dark:bg-gray-600' : ''}`}
              title="Preview only"
            >
              👁️
            </button>
          </div>

          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 dark:text-orange-400">● Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 overflow-auto">
          <div className="p-2 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Files</span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setCreatingIn(rootId)
                  setNewItemType('file')
                }}
                className="p-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="New file"
              >
                📄+
              </button>
              <button
                onClick={() => {
                  setCreatingIn(rootId)
                  setNewItemType('directory')
                }}
                className="p-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="New folder"
              >
                📁+
              </button>
            </div>
          </div>

          <div className="p-2">
            {creatingIn && (
              <div className="mb-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createItem()
                    if (e.key === 'Escape') setCreatingIn(null)
                  }}
                  placeholder={`${newItemType === 'file' ? 'File' : 'Folder'} name`}
                  className="input w-full text-sm mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={createItem} className="btn-sm bg-primary-600 text-white flex-1">
                    Create
                  </button>
                  <button onClick={() => setCreatingIn(null)} className="btn-sm flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="group">{renderFileTree(rootId)}</div>
          </div>
        </div>

        {/* Editor & Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 overflow-x-auto">
              {openTabs.map(tabId => {
                const file = files[tabId]
                if (!file) return null
                return (
                  <div
                    key={tabId}
                    className={`flex items-center gap-2 px-3 py-1 rounded-t text-sm cursor-pointer ${
                      activeFileId === tabId
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    onClick={() => setActiveFileId(tabId)}
                  >
                    <span>{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tabId)
                      }}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Code Editor */}
            {previewMode !== 'preview' && (
              <div className={`${previewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col overflow-hidden`}>
                {activeFile ? (
                  <>
                    <textarea
                      value={activeFile.content || ''}
                      onChange={(e) => updateFileContent(activeFile.id, e.target.value)}
                      className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
                      spellCheck={false}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="mb-2">No file selected</p>
                      <p className="text-sm">Select a file from the explorer or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview Panel */}
            {previewMode !== 'code' && (
              <div className={`${previewMode === 'split' ? 'w-1/2' : 'w-full'} border-l border-gray-300 dark:border-gray-700 overflow-auto`}>
                {renderPreview()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose a Template</h2>
                <button onClick={() => setShowTemplates(false)} className="text-2xl text-gray-500 hover:text-gray-700">
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="p-6 text-left border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-all hover:shadow-lg"
                  >
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Unsaved Changes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have unsaved changes. If you continue, your work will be lost. Save your project before creating a new one.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  clearLocalStorage()
                  setOpenTabs([])
                  setActiveFileId(null)
                  initializeEmptyProject()
                  setHasUnsavedChanges(false)
                  setShowWarning(false)
                  showNotification('New project created', 'success')
                }}
                className="flex-1 btn-sm bg-red-600 text-white hover:bg-red-700"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
        <strong>💡 Tip:</strong> Your work is automatically saved to browser localStorage. Enable auto-save for continuous saving. Your data will be lost if you clear browser data or use incognito mode.
      </div>
    </div>
  )
}
