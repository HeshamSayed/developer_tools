import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setShowBanner(false)
    // Reload to enable ads
    window.location.reload()
  }

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    localStorage.setItem('cookie_consent_date', new Date().toISOString())
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Cookie Consent
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We use cookies and similar technologies to provide the best experience on our website. This includes
                analytics cookies and advertising cookies. By clicking "Accept All", you consent to the use of ALL cookies.
                You can also choose to decline non-essential cookies.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Read our{' '}
                <a href="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </a>{' '}
                to learn more about how we use cookies.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={handleAccept}
                className="btn btn-primary whitespace-nowrap"
              >
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="btn btn-secondary whitespace-nowrap"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom CSS animation (add to global CSS)
const style = document.createElement('style')
style.textContent = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}
