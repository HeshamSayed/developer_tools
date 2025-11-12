import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from '@/components/Common/Logo'

export default function Header() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const isDark = localStorage.getItem('theme') === 'dark'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
              Home
            </Link>
            <Link to="/tools/json-formatter" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
              JSON Tools
            </Link>
            <Link to="/tools/base64-encode" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
              Encoders
            </Link>
            <Link to="/tools/hash-generator" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
              Security
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 py-2">
                Home
              </Link>
              <Link to="/tools/json-formatter" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 py-2">
                JSON Tools
              </Link>
              <Link to="/tools/base64-encode" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 py-2">
                Encoders
              </Link>
              <Link to="/tools/hash-generator" className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 py-2">
                Security
              </Link>
              <button
                onClick={toggleDarkMode}
                className="text-left text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 py-2"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
