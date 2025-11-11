import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToolHistory } from '@/hooks/useToolHistory'
import { useFavorites } from '@/hooks/useFavorites'
import { getToolBySlug } from '@/utils/toolsData'

export default function QuickAccessSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { history } = useToolHistory()
  const { favorites } = useFavorites()

  const recentTools = history.slice(0, 5).map(item => getToolBySlug(item.toolSlug)).filter(Boolean)
  const favoriteTools = favorites.slice(0, 5).map(slug => getToolBySlug(slug)).filter(Boolean)

  // Keyboard shortcut: Cmd/Ctrl + K to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:pr-4 group"
        title="Quick Access (Ctrl+K)"
      >
        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-accent-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Access
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/80 mt-1">Press Ctrl+K to toggle</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Favorites */}
            {favoriteTools.length > 0 && (
              <div className="animate-fade-in-up">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Favorites
                </h3>
                <div className="space-y-2">
                  {favoriteTools.map((tool: any, index) => (
                    <Link
                      key={tool.slug}
                      to={`/tool/${tool.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 border border-yellow-200 dark:border-yellow-800 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{tool.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Tools */}
            {recentTools.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Tools
                </h3>
                <div className="space-y-2">
                  {recentTools.map((tool: any, index) => (
                    <Link
                      key={tool.slug}
                      to={`/tool/${tool.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      style={{ animationDelay: `${(index + 5) * 50}ms` }}
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{tool.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {favoriteTools.length === 0 && recentTools.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">No recent tools yet</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">Start using tools to see them here</p>
              </div>
            )}

            {/* Keyboard Shortcuts Hint */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Shortcuts</h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between items-center">
                  <span>Toggle sidebar</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+K</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Format/Process</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">Ctrl+Enter</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
