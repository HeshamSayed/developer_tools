import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { toolCategories } from '@/utils/toolsData'
import { useFavorites } from '@/hooks/useFavorites'
import { useToolHistory } from '@/hooks/useToolHistory'
import { getToolBySlug } from '@/utils/toolsData'
import { categoryIcons } from '@/components/Common/CategoryIcons'
import { useAuth } from '@/contexts/AuthContext'
import { authService, PlatformStats } from '@/services/authService'
import ProfessionalCard from '@/components/Common/ProfessionalCard'
import ProfessionalButton from '@/components/Common/ProfessionalButton'
import ProfessionalSection from '@/components/Common/ProfessionalSection'

export default function Home() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') || ''
  const { favorites } = useFavorites()
  const { history } = useToolHistory()
  const { user } = useAuth()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)

  // Fetch platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await authService.getPlatformStats()
        setPlatformStats(stats)
      } catch (error) {
        console.error('Failed to fetch platform stats:', error)
      }
    }
    fetchStats()
  }, [])

  // Filter logic
  let filteredCategories = toolCategories
  if (categoryFilter) {
    filteredCategories = toolCategories.filter(category => category.slug === categoryFilter)
  }
  if (searchQuery) {
    filteredCategories = filteredCategories.map(category => ({
      ...category,
      tools: category.tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.tools.length > 0)
  }

  const recentTools = history.slice(0, 3).map(item => getToolBySlug(item.toolSlug)).filter(Boolean)
  const favoriteTools = favorites.slice(0, 3).map(slug => getToolBySlug(slug)).filter(Boolean)
  const totalTools = toolCategories.reduce((sum, cat) => sum + cat.tools.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <ProfessionalSection background="gradient" padding="xl">
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full border border-primary-200 dark:border-primary-700 mb-8 shadow-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {totalTools}+ Professional Tools Available
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700">
                Developer Tools
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Built for Professionals</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Cut your development time in half with enterprise-grade tools that streamline encoding, formatting,
              data transformation, and 100+ daily tasks. Boost productivity instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!user && (
                <ProfessionalButton
                  to="/register"
                  size="xl"
                  variant="primary"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                  iconPosition="right"
                >
                  Get Started Free
                </ProfessionalButton>
              )}

              {user && (
                <ProfessionalButton
                  to="/dashboard"
                  size="xl"
                  variant="primary"
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  iconPosition="right"
                >
                  Go to Dashboard
                </ProfessionalButton>
              )}

              <ProfessionalButton
                to="/about"
                size="xl"
                variant="outline"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                Learn More
              </ProfessionalButton>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Tools', value: platformStats ? `${platformStats.tools.total}` : `${totalTools}+`, icon: '🛠️' },
                { label: 'Categories', value: platformStats ? `${platformStats.tools.categories}` : `${toolCategories.length}+`, icon: '📂' },
                { label: 'Uptime', value: platformStats?.uptime || '99.9%', icon: '⚡' },
                { label: 'Users', value: platformStats ? `${platformStats.users.total.toLocaleString()}` : 'Loading...', icon: '👥' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProfessionalSection>

      {/* Featured Services */}
      {!searchQuery && !categoryFilter && (
        <ProfessionalSection background="white" padding="xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Premium tools to supercharge your development workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mock API Service */}
            <Link to="/mock-api" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Smart API Mocking
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      Create realistic mock APIs in seconds with dynamic data generation, conditional responses, latency simulation, and more. Perfect for testing and development.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        Multi-Protocol
                      </span>
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                        Faker Data
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        Conditional Responses
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-4 transition-all">
                      <span>Explore Mock API</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* AI Assistant Service */}
            <Link to="/ai-assistant" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      AI Code Assistant
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      Get intelligent code suggestions, debugging help, and best practices from our AI-powered assistant. Speed up your development with smart assistance.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        Code Generation
                      </span>
                      <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">
                        Smart Debugging
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        Best Practices
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-4 transition-all">
                      <span>Try AI Assistant</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </ProfessionalSection>
      )}

      {/* Search/Filter Info */}
      {(categoryFilter || searchQuery) && (
        <ProfessionalSection background="white" padding="sm">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-primary-800 dark:text-primary-300 font-semibold text-lg">
                {searchQuery && (
                  <>Found {filteredCategories.reduce((sum, cat) => sum + cat.tools.length, 0)} tool(s) matching "{searchQuery}"</>
                )}
                {categoryFilter && !searchQuery && (
                  <>Showing {filteredCategories[0]?.name || 'Category'} tools</>
                )}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </a>
            </div>
          </div>
        </ProfessionalSection>
      )}

      {/* Quick Access */}
      {(recentTools.length > 0 || favoriteTools.length > 0) && !searchQuery && (
        <ProfessionalSection background="white" padding="lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Access
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Jump right back into your favorite and recently used tools
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {favoriteTools.length > 0 && (
              <ProfessionalCard gradient hover padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Favorites</h3>
                </div>
                <div className="space-y-3">
                  {favoriteTools.map((tool: any) => (
                    <Link
                      key={tool.slug}
                      to={`/tools/${tool.slug}`}
                      className="block p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </ProfessionalCard>
            )}

            {recentTools.length > 0 && (
              <ProfessionalCard gradient hover padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Used</h3>
                </div>
                <div className="space-y-3">
                  {recentTools.map((tool: any) => (
                    <Link
                      key={tool.slug}
                      to={`/tools/${tool.slug}`}
                      className="block p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-700"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                    </Link>
                  ))}
                </div>
              </ProfessionalCard>
            )}
          </div>
        </ProfessionalSection>
      )}

      {/* Tool Categories */}
      <ProfessionalSection background="gray" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            All Developer Tools
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Browse our complete collection of {totalTools}+ professional tools organized by category
          </p>
        </div>
        <div className="space-y-16">
          {filteredCategories.map((category, index) => (
            <div key={category.slug} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl">
                    {(() => {
                      const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons]
                      return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null
                    })()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className="group"
                  >
                    <ProfessionalCard hover padding="lg" className="h-full">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {tool.name}
                        </h3>
                        {tool.badge && (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            tool.badge === 'BETA'
                              ? 'bg-accent-500 text-white'
                              : tool.badge === 'NEW'
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {tool.description}
                      </p>
                      <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-2 transition-all">
                        <span>Try it now</span>
                        <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </ProfessionalCard>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ProfessionalSection>

      {/* Features Section */}
      <ProfessionalSection background="white" padding="lg">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Multiply Your Productivity
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Enterprise-grade tools that transform hours of work into minutes, trusted by professional developers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Lightning Fast',
              description: 'Get results in milliseconds, not minutes. Optimized infrastructure delivers sub-second responses so you stay in flow',
              gradient: 'from-yellow-400 to-orange-500',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: '100% Secure',
              description: 'Work confidently with enterprise-grade security. Client-side processing means your sensitive data never leaves your browser',
              gradient: 'from-green-400 to-emerald-500',
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              title: 'Team Collaboration',
              description: 'Scale productivity across your entire team with role-based access, shared workspaces, and real-time analytics',
              gradient: 'from-primary-400 to-accent-500',
            },
          ].map((feature) => (
            <ProfessionalCard key={feature.title} hover padding="lg" className="text-center">
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </ProfessionalCard>
          ))}
        </div>
      </ProfessionalSection>

      {/* CTA Section */}
      <ProfessionalSection background="primary" padding="lg">
        <div className="relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
          <div className="relative text-center text-white max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to 10x Your Productivity?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of developers who save 10+ hours every week with automated workflows and instant tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <ProfessionalButton
                    to="/register"
                    size="xl"
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    Start Free Today
                  </ProfessionalButton>
                  <ProfessionalButton
                    to="/pricing"
                    size="xl"
                    className="bg-primary-800 text-white border-2 border-white/20 hover:bg-primary-900"
                  >
                    View Pricing
                  </ProfessionalButton>
                </>
              ) : (
                <>
                  <ProfessionalButton
                    to="/dashboard"
                    size="xl"
                    className="bg-white text-primary-600 hover:bg-gray-100"
                  >
                    View Dashboard
                  </ProfessionalButton>
                  <ProfessionalButton
                    to="/teams"
                    size="xl"
                    className="bg-primary-800 text-white border-2 border-white/20 hover:bg-primary-900"
                  >
                    My Teams
                  </ProfessionalButton>
                </>
              )}
            </div>
          </div>
        </div>
      </ProfessionalSection>
    </div>
  )
}
