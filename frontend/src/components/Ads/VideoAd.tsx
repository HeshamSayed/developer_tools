import { useEffect, useRef, useState } from 'react'
import ADSENSE_CONFIG, { shouldShowAds } from '@/config/adsense'

interface VideoAdProps {
  className?: string
  width?: number
  height?: number
}

export default function VideoAd({ className = '', width = 640, height = 360 }: VideoAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (shouldShowAds() && adRef.current) {
      // Video ads will be muted by default
      const videoElements = adRef.current.querySelectorAll('video')
      videoElements.forEach((video) => {
        video.muted = true
        video.setAttribute('muted', 'true')
        video.volume = 0
      })

      setIsLoaded(true)

      // Initialize AdSense video ad if not in test mode
      if (!ADSENSE_CONFIG.testMode) {
        try {
          const adsbyGoogle = (window as any).adsbygoogle || []
          adsbyGoogle.push({})
        } catch (error) {
          console.error('Video ad error:', error)
        }
      }
    }
  }, [])

  // Ensure video stays muted
  useEffect(() => {
    if (!isLoaded) return

    const observer = new MutationObserver(() => {
      if (adRef.current) {
        const videoElements = adRef.current.querySelectorAll('video')
        videoElements.forEach((video) => {
          if (!video.muted || video.volume > 0) {
            video.muted = true
            video.volume = 0
          }
        })
      }
    })

    if (adRef.current) {
      observer.observe(adRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['muted', 'volume'],
      })
    }

    return () => observer.disconnect()
  }, [isLoaded])

  if (!shouldShowAds()) {
    return null
  }

  if (ADSENSE_CONFIG.testMode) {
    return (
      <div className={`video-ad ${className}`}>
        <div
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden relative border-2 border-gray-700"
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 font-medium mb-2">Video Advertisement</p>
              <p className="text-gray-500 text-sm">{width} x {height}</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs">Muted by default</span>
              </div>
              <span className="mt-2 inline-block text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                Test Mode
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`video-ad ${className}`}>
      <div ref={adRef} className="rounded-lg overflow-hidden shadow-lg">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={ADSENSE_CONFIG.adSlots.topBanner}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Video muted • Advertisement
        </span>
      </div>
    </div>
  )
}
