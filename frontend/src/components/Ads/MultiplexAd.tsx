import { useEffect, useRef } from 'react'
import ADSENSE_CONFIG, { shouldShowAds } from '@/config/adsense'

interface MultiplexAdProps {
  className?: string
}

/**
 * Multiplex Ads (Matched Content)
 * - Shows related content with ads
 * - Native ad format that blends with content
 * - High CTR and revenue potential
 * - Best placed at bottom of content pages
 */
export default function MultiplexAd({ className = '' }: MultiplexAdProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ADSENSE_CONFIG.enableMultiplexAds) return

    if (shouldShowAds() && adRef.current && !ADSENSE_CONFIG.testMode) {
      try {
        const adsbyGoogle = (window as any).adsbygoogle || []
        adsbyGoogle.push({})
      } catch (error) {
        console.error('Multiplex AdSense error:', error)
      }
    }
  }, [])

  if (!shouldShowAds() || !ADSENSE_CONFIG.enableMultiplexAds) {
    return null
  }

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className={`multiplex-ad my-8 ${className}`}>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          You might also like
        </h3>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border-2 border-dashed border-purple-300 dark:border-purple-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded mb-3 flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-600 dark:text-purple-300 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Multiplex Ad (Related Content) - Test Mode
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`multiplex-ad my-8 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        You might also like
      </h3>
      <div ref={adRef} className="rounded-lg overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.adSlots.multiplex}
          data-ad-format="autorelaxed"
        />
      </div>
    </div>
  )
}
