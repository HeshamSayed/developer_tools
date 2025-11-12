import { useEffect, useState } from 'react'
import ADSENSE_CONFIG, { shouldShowAds } from '@/config/adsense'

interface PopupAdProps {
  delay?: number // Delay before showing (milliseconds)
  frequency?: number // Show every N minutes
}

export default function PopupAd({ delay = 30000, frequency = 5 }: PopupAdProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!shouldShowAds()) return

    // Check if we've already shown a popup recently
    const lastShown = localStorage.getItem('last_popup_ad')
    if (lastShown) {
      const timeSince = Date.now() - parseInt(lastShown)
      const minInterval = frequency * 60 * 1000 // Convert minutes to milliseconds
      if (timeSince < minInterval) {
        return // Don't show popup if shown recently
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true)
      localStorage.setItem('last_popup_ad', Date.now().toString())
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, frequency])

  const handleClose = () => {
    setIsVisible(false)
  }

  // Don't render if shouldn't show ads or already shown
  if (!shouldShowAds() || !isVisible) {
    return null
  }

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-scale-in">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-all hover:scale-110 z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Ad content */}
          <div className="p-8">
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-8 border-2 border-dashed border-primary-300 dark:border-primary-700">
              <div className="text-center">
                <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-4">
                  <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Premium Advertisement
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This popup shows strategically to maximize revenue without disrupting user experience
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                    <p>✓ Shows after 30 seconds of engagement</p>
                    <p>✓ Only appears once every {frequency} minutes</p>
                    <p>✓ Easy to close with visible X button</p>
                    <p>✓ Non-intrusive timing strategy</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Test Mode - Real ads will appear here
                </p>
              </div>
            </div>
          </div>

          {/* Auto-close timer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click the X button to close or it will auto-close in 10 seconds
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Real AdSense popup
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-all hover:scale-110 z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* AdSense ad */}
        <div className="p-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ADSENSE_CONFIG.publisherId}
            data-ad-slot={ADSENSE_CONFIG.adSlots.vignette}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Advertisement</p>
        </div>
      </div>
    </div>
  )
}
