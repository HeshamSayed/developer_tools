import { useEffect, useRef } from 'react'
import ADSENSE_CONFIG, { shouldShowAds } from '@/config/adsense'

interface InContentAdProps {
  className?: string
}

export default function InContentAd({ className = '' }: InContentAdProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className={`in-content-ad my-8 ${className}`}>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 text-center min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700">
          <div className="text-blue-600 dark:text-blue-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-medium mb-1">In-Content Advertisement</p>
            <p className="text-xs opacity-75">Responsive (300 x 250 optimal)</p>
            <p className="text-xs opacity-50 mt-2">Test Mode</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`in-content-ad my-8 ${className}`}>
      <div ref={adRef} className="rounded-lg overflow-hidden flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.adSlots.inContent}
          data-ad-format="fluid"
          data-ad-layout="in-article"
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    </div>
  )
}
