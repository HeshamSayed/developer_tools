import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  const lastUpdated = "November 12, 2025"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Developer Tools ("we," "our," or "us"). We are committed to protecting your privacy
              and ensuring you have a positive experience on our website. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our website and use our
              online developer tools.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By using our services, you agree to the collection and use of information in accordance with
              this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.1 Personal Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our tools are designed to work entirely in your browser. We do NOT collect, store, or transmit
              any personal information or data you process through our tools. All processing happens locally
              on your device.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Log Data:</strong> IP address, browser type, operating system, referring URLs, and timestamps</li>
              <li><strong>Usage Data:</strong> Pages visited, tools used, time spent on pages, and interaction patterns</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, and analytics cookies</li>
              <li><strong>Device Information:</strong> Device type, screen resolution, and browser capabilities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              2.3 Analytics Information
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              We use analytics tools to understand how users interact with our services. This helps us improve
              our tools and user experience. We collect aggregated, anonymous data about tool usage, performance
              metrics, and user behavior patterns.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>To provide, maintain, and improve our services</li>
              <li>To analyze usage patterns and optimize tool performance</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To understand user preferences and enhance user experience</li>
              <li>To display relevant advertisements through Google AdSense</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To communicate important updates about our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Google AdSense and Advertising
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use Google AdSense to display advertisements on our website. Google may use cookies and web
              beacons to serve ads based on your prior visits to our website or other websites on the Internet.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>What Google collects:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Information about your device and browser</li>
              <li>Pages you visit on our site</li>
              <li>Your interactions with advertisements</li>
              <li>General location information (city/region level)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              You can opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
              >
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold
              certain information. You can instruct your browser to refuse all cookies or to indicate when
              a cookie is being sent.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Types of Cookies We Use:
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant ads</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your
              information. However, no method of transmission over the Internet or electronic storage is
              100% secure. While we strive to use commercially acceptable means to protect your information,
              we cannot guarantee its absolute security.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Security measures include:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>HTTPS encryption for all data transmission</li>
              <li>Regular security audits and updates</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Input validation and sanitization</li>
              <li>Secure hosting infrastructure</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Since we don't store your tool input data, there's nothing to retain. Analytics and usage data
              is retained for up to 26 months to help us improve our services. Cookies are retained according
              to their individual expiration periods, typically ranging from session-only to 2 years.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Your Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Objection:</strong> Object to processing of your information</li>
              <li><strong>Data Portability:</strong> Request transfer of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our services are not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe your
              child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to and maintained on computers located outside of your
              state, province, country, or other governmental jurisdiction where data protection laws may
              differ. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last Updated" date. You are
              advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. GDPR Compliance (EU Users)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              If you are a resident of the European Economic Area (EEA), you have certain data protection
              rights under GDPR. We aim to take reasonable steps to allow you to correct, amend, delete, or
              limit the use of your personal information.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Legal basis for processing:</strong> Legitimate interests, consent, and legal obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. California Privacy Rights (CCPA)
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              California residents have additional rights under the California Consumer Privacy Act (CCPA),
              including the right to know what personal information is collected, the right to delete personal
              information, and the right to opt-out of the sale of personal information. We do not sell
              personal information.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                ← Back to Home
              </Link>
              <Link
                to="/terms"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
