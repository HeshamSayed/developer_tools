import { Link } from 'react-router-dom'
import { toolCategories } from '@/utils/toolsData'
import AdBanner from '@/components/Ads/AdBanner'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Ad */}
      <AdBanner position="homepage-top" className="mb-8" />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Free Developer Tools
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Powerful, fast, and easy-to-use online tools for developers. Format JSON, encode Base64,
          generate hashes, create passwords, and much more.
        </p>
      </div>

      {/* Tool Categories Grid */}
      <div className="space-y-12">
        {toolCategories.map((category) => (
          <div key={category.slug} className="category-section">
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
                  className="card hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-primary-500"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                    Try it now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* Native Ad between categories */}
            {category !== toolCategories[toolCategories.length - 1] && (
              <div className="my-8">
                <AdBanner position={`homepage-category-${category.slug}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Banner Ad */}
      <AdBanner position="homepage-bottom" className="mt-12" />

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Fast & Accurate
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All tools are optimized for speed and accuracy, processing your data in milliseconds
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Privacy First
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All processing happens securely. We don't store or share your data
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
