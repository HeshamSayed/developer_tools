import { useEffect, useRef } from 'react'
import ADSENSE_CONFIG, { shouldShowAds } from '@/config/adsense'

interface InFeedAdProps {
  className?: string
  index?: number // Position in the feed (for tracking)
}

/**
 * In-Feed Ads
 * - Appears between content items (tool categories)
 * - Native format that matches your content style
 * - High CTR because it blends naturally
 * - Best practice: Place every 4-6 items in a list
 */
export default function InFeedAd({ className = '', index = 0 }: InFeedAdProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldShowAds() && adRef.current && !ADSENSE_CONFIG.testMode) {
      try {
        const adsbyGoogle = (window as any).adsbygoogle || []
        adsbyGoogle.push({})
      } catch (error) {
        console.error('In-feed AdSense error:', error)
      }
    }
  }, [])

  if (!shouldShowAds()) {
    return null
  }

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className={`in-feed-ad my-6 ${className}`}>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-2 border-dashed border-green-300 dark:border-green-700">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <div className="h-4 bg-green-300 dark:bg-green-700 rounded w-3/4"></div>
                <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-full"></div>
                <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-5/6"></div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded">
                  Sponsored
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  In-Feed Ad #{index + 1} - Test Mode
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`in-feed-ad my-6 ${className}`} data-index={index}>
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.adSlots.inFeed}
          data-ad-format="fluid"
          data-ad-layout-key="-6t+ed+2i-1n-4w"
        />
      </div>
    </div>
  )
}

/**
 * Best Practices for In-Feed Ads:
 *
 * 1. Placement: Every 4-6 content items
 * 2. Frequency: Maximum 1 ad per viewport height
 * 3. Design: Match your content style
 * 4. Labeling: Clearly mark as "Sponsored" or "Advertisement"
 *
 * Example Usage:
 *
 * {toolCategories.map((category, index) => (
 *   <React.Fragment key={category.id}>
 *     <ToolCategory category={category} />
 *     {(index + 1) % 4 === 0 && <InFeedAd index={Math.floor(index / 4)} />}
 *   </React.Fragment>
 * ))}
 */
