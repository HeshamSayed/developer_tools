import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toolCategories } from '@/utils/toolsData'
import AdBanner from '@/components/Ads/AdBanner'
import VideoAd from '@/components/Ads/VideoAd'
import PopupAd from '@/components/Ads/PopupAd'
import Logo from '@/components/Common/Logo'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Popup Ad (non-intrusive, shows after 30s) */}
      <PopupAd delay={30000} frequency={5} />

      {/* Top Banner Ad - Premium placement */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <AdBanner slot="topBanner" className="py-4" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Professional Design */}
        <div className="text-center mb-12 animate-fade-in-up">
          {/* Logo Center Piece */}
          <div className="flex justify-center mb-8">
            <Logo size="xl" showText={false} className="animate-float" />
          </div>

          <div className="inline-block mb-4 px-6 py-3 bg-gradient-to-r from-primary-50 via-accent-50 to-primary-50 dark:from-primary-900/30 dark:via-accent-900/30 dark:to-primary-900/30 rounded-full border-2 border-primary-200 dark:border-primary-700 shadow-lg">
            <span className="text-sm font-bold bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent animate-pulse">
              ⚡ {totalTools}+ Professional Developer Tools - 100% Free
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
            DevTools Pro Suite
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-4 font-medium">
            Powerful, Fast & Professional Online Tools
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
            Format JSON, encode Base64, generate hashes, create passwords, build CSS designs, and much more. All tools are 100% free, secure, and privacy-focused.
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

            {/* Strategic Ad Placement after important categories */}
            {(categoryIndex === 1 || categoryIndex === 3) && (
              <div className="my-10">
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider">Advertisement</span>
                </div>
                <AdBanner slot="bottomBanner" />
              </div>
            )}

            {/* Video Ad after 2nd category */}
            {categoryIndex === 2 && (
              <div className="my-12 flex justify-center">
                <VideoAd width={728} height={400} />
              </div>
            )}
          </div>
        ))}
      </div>
      </div>

      {/* Bottom Section with Video Ad */}
      <div className="mt-16 mb-12">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Support Our Free Tools
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Watch a quick ad to help us keep these tools free forever
          </p>
        </div>
        <div className="flex justify-center">
          <VideoAd width={640} height={360} />
        </div>
      </div>

      {/* Bottom Banner Ad */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <AdBanner slot="bottomBanner" className="mb-8" />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Final CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers using our tools daily - completely free!
          </p>
          <a
            href="#search"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Explore All Tools
          </a>
        </div>
      </div>
    </div>
  )
}
