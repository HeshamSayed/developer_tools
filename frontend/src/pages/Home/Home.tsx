import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toolCategories } from '@/utils/toolsData'
import { useFavorites } from '@/hooks/useFavorites'
import { useToolHistory } from '@/hooks/useToolHistory'
import { getToolBySlug } from '@/utils/toolsData'
import { categoryIcons } from '@/components/Common/CategoryIcons'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') || 'all'
  const [activeTab, setActiveTab] = useState(categoryFilter)
  
  const { favorites } = useFavorites()
  const { history } = useToolHistory()

  // Filter tools based on search and category
  const getFilteredCategories = () => {
    let categories = toolCategories

    // Filter by category tab
    if (activeTab !== 'all') {
      categories = categories.filter(cat => cat.slug === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      categories = categories.map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.tools.length > 0)
    }

    return categories
  }

  const filteredCategories = getFilteredCategories()
  const recentTools = history.slice(0, 6).map(item => getToolBySlug(item.toolSlug)).filter(Boolean)
  const favoriteTools = favorites.slice(0, 6).map(slug => getToolBySlug(slug)).filter(Boolean)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', tab)
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Results Info */}
        {searchQuery && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6 border border-primary-200 dark:border-primary-800">
            <p className="text-center text-primary-800 dark:text-primary-300 font-medium">
              Found {filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0)} tool(s) matching "{searchQuery}"
            </p>
          </div>
        )}

        {/* Quick Access Section */}
        {(recentTools.length > 0 || favoriteTools.length > 0) && !searchQuery && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favoriteTools.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-soft">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Your Favorites
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {favoriteTools.map((tool: any) => (
                      <Link
                        key={tool.slug}
                        to={`/tools/${tool.slug}`}
                        className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{tool.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {recentTools.length > 0 && (
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800 shadow-soft">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recently Used
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recentTools.map((tool: any) => (
                      <Link
                        key={tool.slug}
                        to={`/tools/${tool.slug}`}
                        className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{tool.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Tools
            </button>
            {toolCategories.map((category) => {
              const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons]
              return (
                <button
                  key={category.slug}
                  onClick={() => handleTabChange(category.slug)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeTab === category.slug
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tool Categories Grid */}
        <div className="space-y-12">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={category.slug} className="category-section animate-fade-in-up" style={{ animationDelay: `${(categoryIndex + 2) * 100}ms` }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/50 dark:to-accent-900/50 text-primary-600 dark:text-primary-400 shadow-sm">
                    {(() => {
                      const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons]
                      return IconComponent ? <IconComponent className="w-7 h-7" /> : null
                    })()}
                  </span>
                  {category.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className="group card hover:shadow-soft-lg transition-all duration-300 border-2 border-transparent hover:border-primary-400 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-accent-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:via-accent-500/5 group-hover:to-primary-500/5 transition-all duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {tool.name}
                        </h3>
                        {tool.badge && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            tool.badge === 'BETA'
                              ? 'bg-accent-500 text-white animate-pulse'
                              : tool.badge === 'NEW'
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {tool.description}
                      </p>
                      <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:gap-2 transition-all">
                        Try it now
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
