// Google AdSense Configuration
// Replace with your actual AdSense Publisher ID and ad slots

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
  publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX',

  // Enable/Disable ads globally
  enabled: import.meta.env.VITE_ADSENSE_ENABLED === 'true' || false,

  // Test mode (shows placeholder ads)
  testMode: import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' || true,

  // Ad slots for different positions
  adSlots: {
    // Top banner (728x90 or responsive)
    topBanner: import.meta.env.VITE_ADSENSE_SLOT_TOP_BANNER || '1234567890',

    // Sidebar (300x600 or 160x600)
    sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '1234567891',

    // In-content (responsive)
    inContent: import.meta.env.VITE_ADSENSE_SLOT_IN_CONTENT || '1234567892',

    // Bottom banner (728x90 or responsive)
    bottomBanner: import.meta.env.VITE_ADSENSE_SLOT_BOTTOM_BANNER || '1234567893',

    // Mobile banner (320x50 or 320x100)
    mobileBanner: import.meta.env.VITE_ADSENSE_SLOT_MOBILE_BANNER || '1234567894',

    // In-feed ads (for tool listings)
    inFeed: import.meta.env.VITE_ADSENSE_SLOT_IN_FEED || '1234567895',
  },

  // Ad placements configuration
  placements: {
    // Show ads on homepage
    homepage: {
      topBanner: true,
      sidebar: true,
      inFeed: true,
      bottomBanner: true,
    },

    // Show ads on tool pages
    toolPage: {
      topBanner: false, // Don't show top banner on tool pages (better UX)
      sidebar: true,
      inContent: true,
      bottomBanner: true,
    },

    // Mobile specific
    mobile: {
      showSidebar: false, // Don't show sidebar on mobile
      showBanner: true,
    },
  },

  // Performance settings
  lazyLoad: true, // Lazy load ads for better performance
  refreshInterval: 0, // Auto-refresh ads (0 = disabled, recommended to keep disabled)

  // Compliance
  respectDNT: true, // Respect Do Not Track
  gdprCompliant: true, // Enable GDPR compliance features
}

// Ad formats
export const AD_FORMATS = {
  AUTO: 'auto',
  RECTANGLE: 'rectangle',
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  FLUID: 'fluid',
}

// Ad sizes (for manual sizing)
export const AD_SIZES = {
  LEADERBOARD: { width: 728, height: 90 },
  BANNER: { width: 468, height: 60 },
  HALF_BANNER: { width: 234, height: 60 },
  BUTTON: { width: 125, height: 125 },
  SKYSCRAPER: { width: 120, height: 600 },
  WIDE_SKYSCRAPER: { width: 160, height: 600 },
  LARGE_RECTANGLE: { width: 336, height: 280 },
  MEDIUM_RECTANGLE: { width: 300, height: 250 },
  SMALL_RECTANGLE: { width: 180, height: 150 },
  SMALL_SQUARE: { width: 200, height: 200 },
  SQUARE: { width: 250, height: 250 },
  LARGE_SQUARE: { width: 336, height: 280 },
  MOBILE_BANNER: { width: 320, height: 50 },
  LARGE_MOBILE_BANNER: { width: 320, height: 100 },
}

// Best practices for maximum revenue
export const ADSENSE_BEST_PRACTICES = {
  // Recommended ad positions for maximum revenue
  recommendations: {
    // Above the fold: 1-2 ads maximum
    aboveFold: 2,

    // Total ads per page: 3-6 maximum (Google recommendation)
    maxAdsPerPage: 6,

    // Minimum content between ads: 300px
    minSpacingBetweenAds: 300,

    // Sticky sidebar: effective for long content
    useStickySidebar: true,

    // Auto ads: let Google optimize placement
    enableAutoAds: false, // Set to true if you want Google to manage all ads
  },

  // Content requirements
  content: {
    // Minimum word count for optimal ad performance
    minWordCount: 300,

    // Ensure valuable, original content
    requireUniqueContent: true,
  },
}

// Helper function to check if ads should be shown
export const shouldShowAds = (): boolean => {
  if (!ADSENSE_CONFIG.enabled) return false
  if (ADSENSE_CONFIG.testMode) return true

  // Don't show ads if user has Do Not Track enabled
  if (ADSENSE_CONFIG.respectDNT && navigator.doNotTrack === '1') {
    return false
  }

  // Check if consent was given (for GDPR)
  if (ADSENSE_CONFIG.gdprCompliant) {
    const consent = localStorage.getItem('cookie_consent')
    if (consent !== 'accepted') return false
  }

  return true
}

// Helper to check if on mobile
export const isMobile = (): boolean => {
  return window.innerWidth < 768
}

export default ADSENSE_CONFIG
