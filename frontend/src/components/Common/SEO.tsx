import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  type?: string
}

export default function SEO({
  title = 'Developer Tools - Free Online Utilities',
  description = 'Free online developer tools for encoding, formatting, generating, and converting data. Fast, accurate, and easy to use.',
  keywords = ['developer tools', 'online tools', 'json formatter', 'base64 encoder', 'hash generator'],
  canonical,
  type = 'website'
}: SEOProps) {
  const fullTitle = title.includes('Developer Tools') ? title : `${title} | Developer Tools`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'Developer Tools',
          'description': description,
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Any',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          }
        })}
      </script>
    </Helmet>
  )
}
