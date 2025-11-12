import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toolCategories } from '@/utils/toolsData'
import AdBanner from '@/components/Ads/AdBanner'
import { useFavorites } from '@/hooks/useFavorites'
import { useToolHistory } from '@/hooks/useToolHistory'
import { getToolBySlug } from '@/utils/toolsData'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const { favorites } = useFavorites()
  const { history } = useToolHistory()

  const filteredCategories = searchQuery
    ? toolCategories.map(category => ({
        ...category,
        tools: category.tools.filter(tool =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.tools.length > 0)
    : toolCategories

  const totalTools = toolCategories.reduce((sum, cat) => sum + cat.tools.length, 0)
  const recentTools = history.slice(0, 3).map(item => getToolBySlug(item.toolSlug)).filter(Boolean)
  const favoriteTools = favorites.slice(0, 3).map(slug => getToolBySlug(slug)).filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Ad */}
      <AdBanner slot="topBanner" className="mb-8" />

      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-full border border-primary-200 dark:border-primary-800">
          <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {totalTools}+ Professional Developer Tools
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent mb-6 leading-tight">
          Free Developer Tools
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Powerful, fast, and easy-to-use online tools for developers. Format JSON, encode Base64,
          generate hashes, create passwords, and much more.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools... (e.g., JSON, Base64, Hash)"
              className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 dark:bg-gray-800 dark:border-gray-600 dark:text-white pl-14 transition-all duration-200 shadow-soft group-hover:shadow-glow"
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
              Found {filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0)} tool(s)
            </p>
          )}
        </div>
      </div>

      {/* Quick Access Section */}
      {(recentTools.length > 0 || favoriteTools.length > 0) && !searchQuery && (
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favoriteTools.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-soft">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Your Favorites
                </h3>
                <div className="space-y-2">
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
                <div className="space-y-2">
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

      {/* Tool Categories Grid */}
      <div className="space-y-12">
        {filteredCategories.map((category, categoryIndex) => (
          <div key={category.slug} className="category-section animate-fade-in-up" style={{ animationDelay: `${(categoryIndex + 2) * 100}ms` }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {tool.name}
                    </h3>
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

            {/* Native Ad between categories */}
            {category !== toolCategories[toolCategories.length - 1] && (
              <div className="my-8">
                <AdBanner slot="bottomBanner" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Banner Ad */}
      <AdBanner slot="bottomBanner" className="mt-12" />

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 group-hover:animate-bounce-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Fast & Accurate
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All tools are optimized for speed and accuracy, processing your data in milliseconds
          </p>
        </div>

        <div className="text-center group animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="bg-gradient-to-br from-success-100 to-primary-100 dark:from-success-900 dark:to-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
            <svg className="w-8 h-8 text-success-600 dark:text-success-400 group-hover:animate-bounce-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors">
            Privacy First
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All processing happens securely. We don't store or share your data
          </p>
        </div>

        <div className="text-center group animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="bg-gradient-to-br from-accent-100 to-warning-100 dark:from-accent-900 dark:to-warning-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
            <svg className="w-8 h-8 text-accent-600 dark:text-accent-400 group-hover:animate-bounce-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
            Always Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Access all tools 24/7 from any device, completely free
          </p>
        </div>
      </div>
    </div>
  )
}
