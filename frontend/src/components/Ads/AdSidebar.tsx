import { useEffect, useRef } from 'react'
import ADSENSE_CONFIG, { shouldShowAds, isMobile } from '@/config/adsense'

interface AdSidebarProps {
  sticky?: boolean
}

export default function AdSidebar({ sticky = false }: AdSidebarProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Don't render on mobile
    if (isMobile()) return

    // Load AdSense ad
    if (shouldShowAds() && adRef.current && !ADSENSE_CONFIG.testMode) {
      try {
        const adsbyGoogle = (window as any).adsbygoogle || []
        adsbyGoogle.push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [])

  // Don't show on mobile
  if (isMobile() || !shouldShowAds()) {
    return null
  }

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className={`ad-sidebar ${sticky ? 'sticky top-20' : ''}`}>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 text-center min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-sm font-medium mb-2">Advertisement</p>
            <p className="text-xs opacity-75">300 x 600</p>
            <p className="text-xs opacity-50 mt-2">Test Mode</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`ad-sidebar ${sticky ? 'sticky top-20' : ''}`}>
      <div ref={adRef} className="rounded-lg overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.adSlots.sidebar}
          data-ad-format="vertical"
          data-full-width-responsive="false"
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    </div>
  )
}
