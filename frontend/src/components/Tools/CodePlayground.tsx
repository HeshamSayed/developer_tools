import { useState, useEffect, useRef } from 'react'
import type { FileNode, FileSystemState } from '@/types/filesystem'
import {
  createFileNode,
  exportFile,
  exportAsZip,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  templates,
  generateId,
  renameFile,
  searchFiles,
  getFilePath,
} from '@/utils/fileSystem'
import { useNotification } from '@/contexts/NotificationContext'
import CodeEditor from '@/components/Common/CodeEditor'

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
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [previewMode, setPreviewMode] = useState<'split' | 'preview' | 'code'>('split')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FileNode[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [fontSize, setFontSize] = useState(14)

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
      }, 2000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [files, autoSave, hasUnsavedChanges])

  // Search files
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchFiles(files, searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, files])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Ctrl/Cmd + F to search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Escape to close search
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
      }
      // Ctrl/Cmd + W to close tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeFileId) {
        e.preventDefault()
        closeTab(activeFileId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFileId])

  const initializeEmptyProject = () => {
    const root = createFileNode('My Project', 'directory')
    const indexFile = createFileNode('index.html', 'file', root.id, '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Project</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>')
    const styleFile = createFileNode('style.css', 'file', root.id, 'body {\n  margin: 0;\n  padding: 20px;\n  font-family: system-ui, sans-serif;\n  background: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}')
    const scriptFile = createFileNode('script.js', 'file', root.id, "console.log('Hello World!');\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('Page loaded!');\n});")

    const newFiles = {
      [root.id]: root,
      [indexFile.id]: indexFile,
      [styleFile.id]: styleFile,
      [scriptFile.id]: scriptFile,
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
    setHasUnsavedChanges(false)
    showNotification(`Loaded template: ${template.name}`, 'success')
  }

  const handleSave = () => {
    saveToLocalStorage({ files, rootId })
    setHasUnsavedChanges(false)
    const now = new Date().toLocaleTimeString()
    showNotification(`Project saved at ${now}`, 'success')
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

    // Check for duplicate names
    const siblings = Object.values(files).filter(f => f.parentId === creatingIn)
    if (siblings.some(s => s.name === newItemName.trim())) {
      showNotification(`A ${newItemType} with this name already exists`, 'error')
      return
    }

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
    showNotification(`${newItemType === 'file' ? 'File' : 'Folder'} created`, 'success')
  }

  const startRename = (id: string) => {
    setRenamingId(id)
    setRenameValue(files[id]?.name || '')
  }

  const finishRename = () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null)
      return
    }

    const file = files[renamingId]
    if (!file) return

    // Check for duplicate names
    const siblings = Object.values(files).filter(f => f.parentId === file.parentId && f.id !== renamingId)
    if (siblings.some(s => s.name === renameValue.trim())) {
      showNotification('A file with this name already exists', 'error')
      return
    }

    const newFiles = renameFile(files, renamingId, renameValue.trim())
    setFiles(newFiles)
    setHasUnsavedChanges(true)
    setRenamingId(null)
    showNotification('Renamed successfully', 'success')
  }

  const deleteItem = (id: string) => {
    const item = files[id]
    if (!item) return

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

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
      <div key={item.id} className="group">
        {renamingId === item.id ? (
          <div className="flex items-center gap-2 px-2 py-1" style={{ paddingLeft: `${level * 16 + 8}px` }}>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishRename()
                if (e.key === 'Escape') setRenamingId(null)
              }}
              onBlur={finishRename}
              className="input flex-1 text-sm py-0.5"
              autoFocus
            />
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ${
              activeFileId === item.id ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => item.type === 'file' ? openFile(item.id) : toggleDirectory(item.id)}
          >
            {item.type === 'directory' ? (
              <span className="text-base flex-shrink-0">{expandedDirs.has(item.id) ? '📂' : '📁'}</span>
            ) : (
              <span className="text-base flex-shrink-0">📄</span>
            )}
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
              {item.type === 'directory' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCreatingIn(item.id)
                      setNewItemType('file')
                    }}
                    className="p-1 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                    title="New file"
                  >
                    📄+
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCreatingIn(item.id)
                      setNewItemType('directory')
                    }}
                    className="p-1 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                    title="New folder"
                  >
                    📁+
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  startRename(item.id)
                }}
                className="p-1 text-xs hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                title="Rename"
              >
                ✏️
              </button>
              {item.type === 'file' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    exportFile(item)
                  }}
                  className="p-1 text-xs hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                  title="Export"
                >
                  💾
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteItem(item.id)
                }}
                className="p-1 text-xs hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
        {item.type === 'directory' && expandedDirs.has(item.id) && (
          <div>{renderFileTree(item.id, level + 1)}</div>
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
          sandbox="allow-scripts allow-same-origin"
          title="Preview"
        />
      )
    }

    // For other files, show a message
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="mb-2 text-4xl">👁️</p>
          <p className="mb-1 font-medium">Preview not available</p>
          <p className="text-sm">Preview is only available for HTML files</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={handleNewProject} className="btn-sm bg-primary-600 text-white hover:bg-primary-700">
            📄 New
          </button>
          <button onClick={() => setShowTemplates(true)} className="btn-sm">
            📋 Templates
          </button>
          <button onClick={handleSave} className="btn-sm" title="Save (Ctrl+S)">
            💾 Save
          </button>
          <button onClick={handleExport} className="btn-sm">
            📦 Export
          </button>
          <button onClick={() => setShowSearch(true)} className="btn-sm" title="Search (Ctrl+F)">
            🔍 Search
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Font:</span>
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 2))}
              className="px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              A-
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className="px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              A+
            </button>
          </div>

          <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded p-1">
            <button
              onClick={() => setPreviewMode('code')}
              className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'code' ? 'bg-white dark:bg-gray-600' : ''}`}
              title="Code only"
            >
              💻
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'split' ? 'bg-white dark:bg-gray-600' : ''}`}
              title="Split view"
            >
              ⚡
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`px-3 py-1 text-xs rounded transition-colors ${previewMode === 'preview' ? 'bg-white dark:bg-gray-600' : ''}`}
              title="Preview only"
            >
              👁️
            </button>
          </div>

          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">● Unsaved</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* File Explorer */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 overflow-auto flex-shrink-0">
          <div className="p-2 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Explorer</span>
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
                  <button onClick={createItem} className="btn-sm bg-primary-600 text-white flex-1 text-xs">
                    Create
                  </button>
                  <button onClick={() => setCreatingIn(null)} className="btn-sm flex-1 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {renderFileTree(rootId)}
          </div>
        </div>

        {/* Editor & Preview */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 overflow-x-auto flex-shrink-0">
              {openTabs.map(tabId => {
                const file = files[tabId]
                if (!file) return null
                return (
                  <div
                    key={tabId}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-t text-sm cursor-pointer transition-colors group ${
                      activeFileId === tabId
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveFileId(tabId)}
                  >
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tabId)
                      }}
                      className="hover:text-red-600 opacity-70 group-hover:opacity-100"
                      title="Close (Ctrl+W)"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* File path bar */}
          {activeFile && (
            <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
              {getFilePath(files, activeFile.id)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Code Editor */}
            {previewMode !== 'preview' && (
              <div className={`${previewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col overflow-hidden`} style={{ fontSize: `${fontSize}px` }}>
                {activeFile ? (
                  <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
                    <CodeEditor
                      value={activeFile.content || ''}
                      onChange={(content) => updateFileContent(activeFile.id, content)}
                      language={activeFile.language || 'text'}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <p className="mb-2 text-4xl">📝</p>
                      <p className="mb-1 font-medium">No file selected</p>
                      <p className="text-sm">Select a file from the explorer or create a new one</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview Panel */}
            {previewMode !== 'code' && (
              <div className={`${previewMode === 'split' ? 'w-1/2' : 'w-full'} border-l border-gray-300 dark:border-gray-700 overflow-auto bg-gray-100 dark:bg-gray-900`}>
                {renderPreview()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplates(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose a Template</h2>
                <button onClick={() => setShowTemplates(false)} className="text-3xl text-gray-500 hover:text-gray-700 leading-none">
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="p-6 text-left border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-all hover:shadow-lg group"
                  >
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{template.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSearch(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[70vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Search Files</h2>
                <button onClick={() => setShowSearch(false)} className="text-2xl text-gray-500 hover:text-gray-700 leading-none">
                  ×
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by filename..."
                className="input w-full mb-4"
                autoFocus
              />
              <div className="space-y-2 max-h-96 overflow-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(file => (
                    <button
                      key={file.id}
                      onClick={() => {
                        openFile(file.id)
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{getFilePath(files, file.id)}</div>
                      </div>
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No files found</p>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">Type to search files</p>
                )}
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
              <span className="text-4xl">⚠️</span>
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
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200 flex-shrink-0">
        <strong>💡 Pro Tip:</strong> Press Ctrl+S to save, Ctrl+F to search files, Ctrl+W to close tabs. Your work is saved to localStorage. Enable auto-save for continuous saving.
      </div>
    </div>
  )
}
