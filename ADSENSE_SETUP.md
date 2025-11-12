# Google AdSense Integration Guide

This guide explains how to set up and optimize Google AdSense for maximum revenue on the Developer Tools Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google AdSense Setup](#google-adsense-setup)
3. [Configuration](#configuration)
4. [Ad Placements](#ad-placements)
5. [Revenue Optimization](#revenue-optimization)
6. [Compliance](#compliance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating AdSense, ensure you have:

- [ ] Approved Google AdSense account
- [ ] Domain ownership verified in AdSense
- [ ] Privacy Policy page published
- [ ] Cookie consent mechanism implemented (✓ included)
- [ ] Original, valuable content (✓ developer tools)
- [ ] SSL/HTTPS enabled (required for AdSense)

## Google AdSense Setup

### Step 1: Apply for Google AdSense

1. Visit [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Add your website URL
4. Provide necessary information about your site
5. Wait for approval (can take 1-3 weeks)

### Step 2: Get Your Publisher ID

After approval:

1. Go to AdSense dashboard
2. Navigate to **Account** → **Settings**
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 3: Create Ad Units

For optimal revenue, create these ad units:

1. **Top Banner** (728x90 or Responsive)
   - Navigate to **Ads** → **By ad unit**
   - Create new ad unit → Display ads
   - Choose Horizontal or Responsive
   - Copy the ad slot ID

2. **Sidebar** (300x600 or 160x600)
   - Create new ad unit → Display ads
   - Choose Vertical or Rectangle
   - Copy the ad slot ID

3. **In-Content** (Responsive)
   - Create new ad unit → In-article ads
   - Choose responsive
   - Copy the ad slot ID

4. **Bottom Banner** (728x90 or Responsive)
   - Same as top banner
   - Copy the ad slot ID

5. **Mobile Banner** (320x50 or 320x100)
   - Create new ad unit for mobile
   - Choose Mobile banner
   - Copy the ad slot ID

6. **In-Feed** (For tool listings)
   - Create new ad unit → In-feed ads
   - Customize to match your site design
   - Copy the ad slot ID

## Configuration

### Environment Variables

Create or update `.env` file in the frontend directory:

```bash
# Google AdSense Configuration
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_TEST_MODE=false
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX

# Ad Slot IDs (from AdSense dashboard)
VITE_ADSENSE_SLOT_TOP_BANNER=1234567890
VITE_ADSENSE_SLOT_SIDEBAR=1234567891
VITE_ADSENSE_SLOT_IN_CONTENT=1234567892
VITE_ADSENSE_SLOT_BOTTOM_BANNER=1234567893
VITE_ADSENSE_SLOT_MOBILE_BANNER=1234567894
VITE_ADSENSE_SLOT_IN_FEED=1234567895
```

### Update index.html

Add AdSense script to `frontend/index.html`:

```html
<!-- In the <head> section -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID.

### Testing

For testing before going live:

```bash
# Enable test mode
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_TEST_MODE=true
```

This shows placeholder ads that look like real ads but don't make actual AdSense requests.

## Ad Placements

The system includes strategic ad placements:

### Homepage (`/`)
- **Top Banner**: Below header (optional, set to false by default for better UX)
- **Sidebar**: Sticky sidebar (300x600)
- **In-Feed**: Between tool categories
- **Bottom Banner**: Above footer

### Tool Pages (`/tools/:slug`)
- **Sidebar**: Sticky sidebar (best performer)
- **In-Content**: Between tool sections
- **Bottom Banner**: After tool output

### Mobile Optimization
- Sidebars hidden on mobile
- Mobile banners (320x50/320x100) used instead
- Responsive ads adapt to screen size

## Revenue Optimization

### Best Practices

1. **Ad Placement Strategy**
   - **Above the fold**: Maximum 1-2 ads
   - **Total per page**: 3-6 ads (Google recommendation)
   - **Spacing**: Minimum 300px between ads

2. **High-Performing Positions**
   - ✅ Sticky sidebar (highest revenue)
   - ✅ In-content after first section
   - ✅ Bottom banner (good viewability)
   - ❌ Top banner on tool pages (worse UX)

3. **Responsive Design**
   - Use responsive ad units
   - Different ads for mobile/desktop
   - Adapt to screen sizes

4. **Content Quality**
   - Original, valuable developer tools ✓
   - Regular updates and new tools
   - Minimum 300 words per page
   - Good user engagement

5. **Page Speed**
   - Lazy load ads (implemented)
   - Optimize images and assets
   - Use CDN for static files
   - Minify CSS/JS

6. **User Experience**
   - Don't overload with ads (max 6/page)
   - Clear "Advertisement" labels
   - Non-intrusive placement
   - Fast page load times

### Revenue Metrics to Monitor

Track these in Google AdSense dashboard:

- **RPM** (Revenue Per 1000 impressions)
- **CTR** (Click-Through Rate)
- **CPC** (Cost Per Click)
- **Viewability** (percentage of ads viewed)
- **Active View** (time ad is visible)

### Optimization Tips

1. **Test Ad Positions**
   - Use AdSense experiments
   - A/B test different layouts
   - Monitor which positions perform best

2. **Optimize for Viewability**
   - Sticky sidebar increases viewability
   - In-content ads get more views
   - Avoid placing ads too low

3. **Ad Sizes**
   - 300x250 (medium rectangle) - highest CTR
   - 728x90 (leaderboard) - good for headers
   - 336x280 (large rectangle) - high revenue
   - 300x600 (half page) - excellent for sidebar

4. **Content Optimization**
   - High-value keywords attract better ads
   - Developer tools = high CPC keywords
   - Technical content = premium advertisers

## Compliance

### GDPR & Cookie Consent

✅ **Implemented**: Cookie consent banner
- Users must consent before ads load
- Stores consent in localStorage
- Respects "Do Not Track" setting
- Privacy Policy linked

### Required Pages

1. **Privacy Policy** (`/privacy-policy`)
   - Must describe data collection
   - Explain cookie usage
   - Link to AdSense policies
   - Contact information

2. **Terms of Service** (`/terms`)
   - Website terms of use
   - Acceptable use policy
   - Disclaimer

### AdSense Policies

Ensure compliance with:

- ✅ **Content Policy**: Original, valuable tools
- ✅ **No prohibited content**: Clean, professional site
- ✅ **No click fraud**: Natural clicks only
- ✅ **Ad placement policy**: Proper spacing and labeling
- ✅ **Privacy requirements**: Cookie consent + privacy policy

**NEVER:**
- Ask users to click ads
- Click your own ads
- Use automated clicking
- Place ads on error pages
- Mislead users about ad content

## Troubleshooting

### Ads Not Showing

**Check these:**

1. **Environment variables set correctly?**
   ```bash
   echo $VITE_ADSENSE_ENABLED
   echo $VITE_ADSENSE_PUBLISHER_ID
   ```

2. **Cookie consent given?**
   - Open browser console
   - Check localStorage: `localStorage.getItem('cookie_consent')`
   - Should be "accepted"

3. **Test mode disabled?**
   ```bash
   VITE_ADSENSE_TEST_MODE=false
   ```

4. **AdSense script loaded?**
   - Open browser console
   - Check for script: `window.adsbygoogle`
   - Should be an array

5. **Account approved and verified?**
   - Check AdSense dashboard
   - Verify ads.txt file deployed

### Ads Showing Blank

- **New site**: Takes 24-48 hours for ads to start showing
- **Low traffic**: Ads may not always fill
- **Ad blockers**: Users with ad blockers won't see ads
- **Geographic location**: Limited ads in some regions

### Low Revenue

1. **Increase traffic**: More visitors = more revenue
2. **Improve content**: Higher quality = better ads
3. **Optimize placement**: Test different positions
4. **Check ad sizes**: Use high-performing sizes
5. **Monitor metrics**: Use AdSense reporting

### Policy Violations

If you receive a policy warning:

1. **Read the email carefully**
2. **Fix the issue immediately**
3. **Request review** if needed
4. **Never ignore warnings**

## Advanced Features

### Auto Ads (Optional)

Let Google optimize ad placement automatically:

1. Enable in `frontend/src/config/adsense.ts`:
   ```typescript
   enableAutoAds: true
   ```

2. Add to index.html:
   ```html
   <script>
     (adsbygoogle = window.adsbygoogle || []).push({
       google_ad_client: "ca-pub-XXXXXXXXXXXXXXXX",
       enable_page_level_ads: true
     });
   </script>
   ```

### Anchor Ads (Mobile)

Sticky ads at bottom of mobile screen:
- Enable in AdSense dashboard
- Higher revenue on mobile
- Non-intrusive placement

### Vignette Ads

Full-screen ads between page navigation:
- Enable in AdSense dashboard
- Good for high-traffic sites
- Use sparingly (can hurt UX)

## Performance Monitoring

### Key Metrics

Monitor these weekly:

- **Revenue**: Total earnings
- **RPM**: Revenue per 1000 impressions
- **Page RPM**: Revenue per 1000 page views
- **Impressions**: Total ad views
- **Clicks**: Total ad clicks
- **CTR**: Click-through rate (aim for 1-3%)

### Optimization Cycle

1. **Week 1-2**: Gather baseline data
2. **Week 3-4**: Test ad position changes
3. **Week 5-6**: Optimize high-traffic pages
4. **Week 7-8**: Test new ad formats
5. **Ongoing**: Monitor and adjust

## Support

- **AdSense Help**: https://support.google.com/adsense
- **Policy Center**: https://support.google.com/adsense/answer/48182
- **Community Forum**: https://support.google.com/adsense/community

## Checklist

Before going live with ads:

- [ ] Google AdSense account approved
- [ ] Publisher ID configured
- [ ] All ad slots created and configured
- [ ] Environment variables set
- [ ] AdSense script added to index.html
- [ ] Privacy Policy published
- [ ] Cookie consent working
- [ ] Test mode disabled
- [ ] ads.txt file deployed
- [ ] Site verified in AdSense
- [ ] SSL/HTTPS enabled
- [ ] Content policy compliant
- [ ] Ad placements optimized
- [ ] Performance monitored

## License

This documentation is part of the Developer Tools Platform.
