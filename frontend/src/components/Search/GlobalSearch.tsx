import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTools } from '@/utils/toolsData'
import { KEYBOARD_SHORTCUTS } from '@/constants/designSystem'
import { CATEGORY_METADATA } from '@/constants/toolCategories'

interface SearchResult {
  slug: string
  name: string
  description: string
  category: string
  categoryName: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Search tools
  const searchTools = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const allTools = getAllTools()
    const lowerQuery = searchQuery.toLowerCase()

    const matches = allTools
      .map(tool => {
        const categoryMeta = CATEGORY_METADATA[tool.category]
        return {
          slug: tool.slug,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          categoryName: categoryMeta?.name || tool.category,
        }
      })
      .filter(tool => {
        const nameMatch = tool.name.toLowerCase().includes(lowerQuery)
        const descMatch = tool.description.toLowerCase().includes(lowerQuery)
        const categoryMatch = tool.categoryName.toLowerCase().includes(lowerQuery)
        return nameMatch || descMatch || categoryMatch
      })
      .slice(0, 8) // Limit to 8 results

    setResults(matches)
    setSelectedIndex(0)
  }, [])

  // Handle search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchTools(query)
    }, 150) // Debounce search

    return () => clearTimeout(timer)
  }, [query, searchTools])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.ESCAPE:
          onClose()
          break
        case KEYBOARD_SHORTCUTS.ARROW_DOWN:
          e.preventDefault()
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
          break
        case KEYBOARD_SHORTCUTS.ARROW_UP:
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
          break
        case KEYBOARD_SHORTCUTS.ENTER:
          e.preventDefault()
          if (results[selectedIndex]) {
            handleSelectTool(results[selectedIndex].slug)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose])

  const handleSelectTool = (toolSlug: string) => {
    navigate(`/tools/${toolSlug}`)
    onClose()
    setQuery('')
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1050] flex items-start justify-center pt-20 px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-label"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
        {/* Search Input */}
        <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700">
          <svg
            className="absolute left-4 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools... (try 'json', 'password', 'image')"
            className="w-full py-4 pl-12 pr-4 text-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            id="search-label"
          />
          <kbd className="hidden sm:block mr-4 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        {query && (
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.slug}
                    onClick={() => handleSelectTool(result.slug)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                        : 'border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {result.description}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {result.categoryName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No tools found for "{query}"
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Try different keywords
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State / Tips */}
        {!query && (
          <div className="py-8 px-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
              Popular searches:
            </p>
            <div className="flex flex-wrap gap-2">
              {['JSON', 'Base64', 'Password', 'Hash', 'Image', 'QR Code'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 font-mono">
                  ↑↓
                </kbd>{' '}
                to navigate,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 font-mono">
                  Enter
                </kbd>{' '}
                to select,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 font-mono">
                  ESC
                </kbd>{' '}
                to close
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
