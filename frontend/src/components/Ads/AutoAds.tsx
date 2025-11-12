import { useEffect } from 'react'
import ADSENSE_CONFIG, { shouldShowAds } from '@/config/adsense'

/**
 * Auto Ads - Google's Automatic Ad Placement
 *
 * Benefits:
 * - Google automatically finds best ad positions
 * - Machine learning optimizes placement for maximum revenue
 * - No manual ad placement needed
 * - Adapts to user behavior and page layout
 * - Can increase revenue by 10-30%
 *
 * Note: Enable this OR manual ad placement, not both
 */
export default function AutoAds() {
  useEffect(() => {
    if (!ADSENSE_CONFIG.enableAutoAds || !shouldShowAds()) return

    if (ADSENSE_CONFIG.testMode) {
      console.log('[AdSense] Auto Ads enabled (Test Mode)')
      return
    }

    try {
      // Initialize Auto Ads
      const adsbyGoogle = (window as any).adsbygoogle || []
      adsbyGoogle.push({
        google_ad_client: ADSENSE_CONFIG.publisherId,
        enable_page_level_ads: true,
        overlays: {
          bottom: ADSENSE_CONFIG.enableAnchorAds, // Anchor ads (sticky mobile)
        },
      })

      console.log('[AdSense] Auto Ads initialized')
    } catch (error) {
      console.error('[AdSense] Auto Ads initialization error:', error)
    }
  }, [])

  // Auto Ads is invisible - Google handles everything
  return null
}

/**
 * Usage:
 *
 * Add to your App.tsx:
 *
 * import AutoAds from './components/Ads/AutoAds'
 *
 * function App() {
 *   return (
 *     <>
 *       <AutoAds />
 *       {/* rest of your app *\/}
 *     </>
 *   )
 * }
 *
 * Then enable in .env:
 * VITE_ADSENSE_AUTO_ADS=true
 * VITE_ADSENSE_ANCHOR_ADS=true
 */
