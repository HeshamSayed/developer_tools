import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ADSENSE_CONFIG, shouldShowAds } from '../../config/adsense'

/**
 * VignetteAd Component
 *
 * Displays full-screen interstitial ads between page navigation
 *
 * Features:
 * - Appears during page transitions (route changes)
 * - User-dismissible with close button
 * - Respects frequency limits (not on every navigation)
 * - Auto-closes after timeout
 * - GDPR compliant
 * - Google AdSense policy compliant
 *
 * Revenue Impact:
 * - High CPM due to full-screen format
 * - Better viewability (100%)
 * - Should be used sparingly to maintain UX
 *
 * Best Practices:
 * - Show max once per 3-5 page navigations
 * - Auto-dismiss after 5-10 seconds
 * - Always provide clear close button
 * - Don't show on first page load
 */

interface VignetteAdProps {
  /** Minimum number of page navigations before showing ad */
  minNavigations?: number
  /** Auto-dismiss after this many seconds (0 = no auto-dismiss) */
  autoDismissSeconds?: number
}

export default function VignetteAd({
  minNavigations = 3,
  autoDismissSeconds = 8
}: VignetteAdProps) {
  const location = useLocation()
  const [showAd, setShowAd] = useState(false)
  const [navigationCount, setNavigationCount] = useState(0)
  const adRef = useRef<HTMLDivElement>(null)
  const dismissTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!ADSENSE_CONFIG.enableVignetteAds || !shouldShowAds()) return

    // Don't show on first page load
    if (navigationCount === 0) {
      setNavigationCount(1)
      return
    }

    // Increment navigation counter
    const newCount = navigationCount + 1
    setNavigationCount(newCount)

    // Check if we should show the ad
    if (newCount >= minNavigations && newCount % minNavigations === 0) {
      setShowAd(true)

      // Auto-dismiss timer
      if (autoDismissSeconds > 0) {
        dismissTimerRef.current = setTimeout(() => {
          handleClose()
        }, autoDismissSeconds * 1000)
      }

      // Initialize AdSense ad
      if (!ADSENSE_CONFIG.testMode && adRef.current) {
        try {
          const adsbyGoogle = (window as any).adsbygoogle || []
          adsbyGoogle.push({})
        } catch (error) {
          console.error('Vignette AdSense error:', error)
        }
      }
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
      }
    }
  }, [location.pathname])

  const handleClose = () => {
    setShowAd(false)
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
    }
  }

  if (!showAd || !shouldShowAds() || !ADSENSE_CONFIG.enableVignetteAds) {
    return null
  }

  // Test mode placeholder
  if (ADSENSE_CONFIG.testMode) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-label="Advertisement"
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 transition-colors"
            aria-label="Close advertisement"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Test ad content */}
          <div className="p-8 pt-16 text-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-12 mb-4">
              <div className="text-white mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2">Vignette Ad (Test Mode)</h3>
                <p className="text-purple-100">Full-screen interstitial ad</p>
              </div>
              <div className="space-y-2 text-sm text-purple-100">
                <p>Format: Vignette (Full-screen)</p>
                <p>Appears: Every {minNavigations} page navigations</p>
                <p>Auto-dismiss: {autoDismissSeconds}s</p>
                <p>Revenue: High CPM (100% viewability)</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Advertisement • Test Mode
            </p>
            {autoDismissSeconds > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Auto-closing in {autoDismissSeconds} seconds...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Production AdSense ad
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 transition-colors shadow-lg"
          aria-label="Close advertisement"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* AdSense Vignette Ad */}
        <div ref={adRef} className="p-8">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ADSENSE_CONFIG.publisherId}
            data-ad-slot={ADSENSE_CONFIG.adSlots.vignette || ADSENSE_CONFIG.adSlots.inContent}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Ad label */}
        <div className="px-8 pb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Advertisement
          </p>
        </div>
      </div>
    </div>
  )
}
