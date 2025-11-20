import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  current?: boolean
  cta: string
}

export default function Pricing() {
  const { user } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const currentTier = user?.subscription_tier || 'free'

  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals getting started with developer tools',
      current: currentTier === 'free',
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      features: [
        'Access to 117+ developer tools',
        '100 API calls per day',
        'Basic analytics',
        'Community support',
        'Dark mode',
        'Mobile responsive',
        '1 team (up to 3 members)',
        'Basic usage tracking',
      ],
    },
    {
      name: 'Pro',
      price: billingPeriod === 'monthly' ? '$19' : '$190',
      period: billingPeriod === 'monthly' ? 'per month' : 'per year',
      description: 'For professionals who need more power and flexibility',
      highlighted: true,
      current: currentTier === 'pro',
      cta: currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      features: [
        'Everything in Free, plus:',
        'Unlimited API calls',
        'Advanced analytics & insights',
        'Priority support (24/7)',
        'Custom API keys',
        'Export data (JSON, CSV)',
        'Unlimited teams',
        'Up to 10 members per team',
        'Team collaboration features',
        'Audit logging',
        'Advanced usage tracking',
        'No rate limits',
        'Save 2 months with yearly',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'For organizations with advanced needs and compliance requirements',
      current: currentTier === 'enterprise',
      cta: currentTier === 'enterprise' ? 'Current Plan' : 'Contact Sales',
      features: [
        'Everything in Pro, plus:',
        'Dedicated account manager',
        'Custom integrations',
        'SSO & SAML authentication',
        'Advanced security features',
        'SLA guarantees (99.9% uptime)',
        'Unlimited teams & members',
        'Custom usage limits',
        'On-premise deployment option',
        'Advanced audit & compliance',
        'Custom training & onboarding',
        'White-label options',
        'API rate limit customization',
      ],
    },
  ]

  const handleSelectPlan = (tier: PricingTier) => {
    if (tier.current) {
      return
    }

    if (tier.name === 'Enterprise') {
      // Open contact form or email
      window.location.href = 'mailto:sales@developertools.com?subject=Enterprise Plan Inquiry'
      return
    }

    // For now, just show an alert. In production, this would redirect to payment
    alert(`Upgrading to ${tier.name} plan. Payment integration coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of our developer tools platform with the perfect plan for your needs
          </p>

          {/* Billing Period Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold rounded-full">
                Save 17%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 border-2 border-primary-500 shadow-xl scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {tier.current && (
                <div className="absolute -top-4 right-4">
                  <span className="px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {tier.price}
                  </span>
                  {tier.price !== 'Custom' && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      /{tier.period.split(' ')[1]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {tier.period}
                </p>
              </div>

              <button
                onClick={() => handleSelectPlan(tier)}
                disabled={tier.current}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-6 ${
                  tier.current
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : tier.highlighted
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white'
                }`}
              >
                {tier.cta}
              </button>

              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.startsWith('Everything in') ? (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className={`text-sm ${feature.startsWith('Everything in') ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial for Pro plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All Pro plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my API limits?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Free plan users will see rate limiting after 100 calls/day. Pro and Enterprise plans have no limits. You can monitor your usage in the dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Our team is here to help. Contact us and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/about"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Sales
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-8 py-3 bg-primary-800 text-white rounded-lg font-semibold hover:bg-primary-900 transition-colors border-2 border-white/20"
                >
                  Start Free Trial
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
