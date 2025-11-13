import { useEffect, useRef } from 'react'
import ADSENSE_CONFIG, { shouldShowAds, isMobile } from '@/config/adsense'

interface AdBannerProps {
  slot: string
  className?: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
}

export default function AdBanner({ slot, className = '', format = 'auto' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const mobile = isMobile()

  useEffect(() => {
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

  if (!shouldShowAds()) {
    return null
  }

  // Use mobile banner on mobile devices
  const actualSlot = mobile && slot !== 'mobileBanner' ? 'mobileBanner' : slot
  const adSlot = (ADSENSE_CONFIG.adSlots as any)[actualSlot] || ADSENSE_CONFIG.adSlots.topBanner

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className={`ad-banner ${className}`}>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 text-center min-h-[90px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Advertisement</p>
                <p className="text-xs opacity-75">{mobile ? '320 x 50' : '728 x 90'}</p>
              </div>
              <span className="text-xs opacity-50 ml-4">Test Mode</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`ad-banner ${className}`}>
      <div ref={adRef} className="rounded-lg overflow-hidden flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={adSlot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
      <div className="text-center mt-1">
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    </div>
  )
}
