import { useEffect, useRef } from 'react'

interface AdBannerProps {
  position: string
  className?: string
}

export default function AdBanner({ position, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate AdSense ad loading with delay
    const timer = setTimeout(() => {
      if (adRef.current && window.adsbygoogle) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (e) {
          console.error('AdSense error:', e)
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`ad-banner ${className}`} data-position={position}>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center min-h-[90px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          {/* AdSense placeholder */}
          <div ref={adRef}>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot="XXXXXXXXXX"
                 data-ad-format="auto"
                 data-full-width-responsive="true">
            </ins>
          </div>
          <span className="text-xs text-gray-400">Advertisement</span>
        </div>
      </div>
    </div>
  )
}
