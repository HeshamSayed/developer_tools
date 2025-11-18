import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Content */}
        <div>
          {/* Hero Section */}
          <div className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 border-2 border-primary-200 dark:border-primary-800 mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  HS
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Hesham Sayed
                </h1>
                <p className="text-xl text-primary-600 dark:text-primary-400 font-semibold mb-4">
                  Senior Software Engineer
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                    Full Stack Development
                  </span>
                  <span className="px-3 py-1 bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 rounded-full text-sm font-medium">
                    Python & Django
                  </span>
                  <span className="px-3 py-1 bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-300 rounded-full text-sm font-medium">
                    React & TypeScript
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About the Developer
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome! I'm Hesham Sayed, a passionate Senior Software Engineer with extensive experience in building robust, scalable web applications. I created DevTools to provide developers with a comprehensive suite of free, professional-grade tools that make daily development tasks easier and more efficient.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                With years of experience in full-stack development, I understand the challenges developers face when working with data transformation, encoding, formatting, and various other repetitive tasks. DevTools was born from the desire to streamline these workflows and save valuable development time.
              </p>
            </div>
          </div>

          {/* Expertise Section */}
          <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Technical Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/40 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Backend Development
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                    Python & Django
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                    RESTful APIs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                    Database Design
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                    Microservices Architecture
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-900/40 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-accent-900 dark:text-accent-100 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Frontend Development
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 dark:text-accent-400">✓</span>
                    React & TypeScript
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 dark:text-accent-400">✓</span>
                    Modern UI/UX Design
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 dark:text-accent-400">✓</span>
                    Responsive Development
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent-600 dark:text-accent-400">✓</span>
                    Performance Optimization
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Project Mission */}
          <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Project Mission
            </h2>
            <div className="bg-gradient-to-r from-primary-50 via-accent-50 to-primary-50 dark:from-primary-900/20 dark:via-accent-900/20 dark:to-primary-900/20 p-6 rounded-lg border-l-4 border-primary-500">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong className="text-primary-600 dark:text-primary-400">DevTools</strong> is committed to providing developers worldwide with powerful, fast, and secure tools that enhance productivity. Every tool is crafted with attention to detail, focusing on:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <strong>Precision:</strong> Accurate results every time
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <strong>Performance:</strong> Lightning-fast processing
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <strong>Privacy:</strong> Your data never leaves your browser (client-side processing where possible)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">💚</span>
                  <div>
                    <strong>Free Forever:</strong> No subscriptions, no paywalls, always accessible
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Connect Section */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Let's Connect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              I'm always interested in connecting with fellow developers, discussing new ideas, and exploring collaboration opportunities. Feel free to reach out!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.linkedin.com/in/heshamsayedfarghali/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-3 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
              <Link
                to="/"
                className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
