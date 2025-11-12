import { Link } from 'react-router-dom'

export default function TermsOfService() {
  const lastUpdated = "November 12, 2025"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing and using Developer Tools (the "Service"), you accept and agree to be bound by the
              terms and provision of this agreement. If you do not agree to abide by the above, please do not
              use this Service.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms of Service constitute a legally binding agreement made between you, whether personally
              or on behalf of an entity ("you") and Developer Tools ("we," "us" or "our"), concerning your access
              to and use of our website and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Developer Tools provides a collection of free, browser-based online tools for developers including
              but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Formatters:</strong> JSON, XML, HTML, CSS, JavaScript, SQL, YAML formatting and beautification</li>
              <li><strong>Converters:</strong> Base64, URL, HTML entities, case conversion, unit conversion</li>
              <li><strong>Encoders/Decoders:</strong> Base64, URL encoding, HTML entities, JWT decoding</li>
              <li><strong>Generators:</strong> UUID, password, hash, Lorem Ipsum, QR codes, random data</li>
              <li><strong>Utilities:</strong> Text diff, regex tester, timestamp converter, image tools, minifiers</li>
              <li><strong>Security Tools:</strong> Hash generators (MD5, SHA-1, SHA-256, SHA-512), SSL checkers</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              All tools operate entirely in your browser. We do not store, transmit, or have access to any data
              you process through our tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Obligations
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              By using this Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
              <li>Not use the Service in any way that violates any applicable national or international law</li>
              <li>Not engage in any activity that interferes with or disrupts the Service</li>
              <li>Not attempt to gain unauthorized access to any portion of the Service</li>
              <li>Not use the Service to transmit any malicious code, viruses, or harmful content</li>
              <li>Not use automated scripts or bots to scrape or overload the Service</li>
              <li>Not attempt to reverse engineer, decompile, or disassemble any aspect of the Service</li>
              <li>Not impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Respect rate limits and fair use policies to ensure service availability for all users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Service and its original content (excluding user-generated content), features, and functionality
              are and will remain the exclusive property of Developer Tools and its licensors. The Service is
              protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our trademarks and trade dress may not be used in connection with any product or service without
              the prior written consent of Developer Tools.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              4.1 User Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              You retain all rights to any content you process through our tools. Since all processing happens
              locally in your browser, we do not have access to, do not store, and claim no rights to your content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Disclaimer of Warranties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or completeness of results</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security of data processed through the tools</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>The Service will meet your specific requirements</li>
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from the use of the Service will be accurate or reliable</li>
              <li>Any errors in the Service will be corrected</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DEVELOPER TOOLS, ITS AFFILIATES,
              DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
              <li>Damages resulting from unauthorized access to or use of our servers</li>
              <li>Interruption or cessation of transmission to or from the Service</li>
              <li>Bugs, viruses, or other harmful code transmitted through the Service</li>
              <li>Errors or omissions in any content or loss or damage incurred from use of content</li>
              <li>Any conduct or content of any third party on the Service</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              This limitation applies whether the alleged liability is based on contract, tort, negligence,
              strict liability, or any other basis, even if we have been advised of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to defend, indemnify, and hold harmless Developer Tools and its licensees, licensors,
              employees, contractors, agents, officers, and directors from and against any claims, damages,
              obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Your use of and access to the Service</li>
              <li>Your violation of any term of these Terms of Service</li>
              <li>Your violation of any third-party right, including intellectual property or privacy rights</li>
              <li>Any claim that your content caused damage to a third party</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Third-Party Services and Advertising
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Service may contain advertisements from third parties, including Google AdSense. These
              advertisers may use cookies and web beacons to collect information about your visits to this
              and other websites.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We are not responsible for the privacy practices or content of third-party advertisers or websites.
              Your interactions with third-party advertisers are solely between you and the advertiser.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              8.1 External Links
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The Service may contain links to external websites that are not provided or maintained by us.
              We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on
              these external websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Service Availability and Modifications
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Modify, suspend, or discontinue the Service (or any part thereof) at any time</li>
              <li>Change these Terms of Service at any time</li>
              <li>Refuse service to anyone for any reason at any time</li>
              <li>Remove or modify any tool or feature without prior notice</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              We shall not be liable to you or any third party for any modification, suspension, or
              discontinuance of the Service. We will make reasonable efforts to notify users of significant
              changes through the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may terminate or suspend your access to the Service immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              All provisions of these Terms which by their nature should survive termination shall survive,
              including without limitation ownership provisions, warranty disclaimers, indemnity, and
              limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Fair Use Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To ensure fair access to our Service for all users, we implement rate limiting and may restrict
              access if we detect:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Excessive automated requests or bot activity</li>
              <li>Attempts to overload or disrupt the Service</li>
              <li>Unusual usage patterns that may indicate abuse</li>
              <li>Violation of our terms or policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Data Processing and Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
              your information. By using the Service, you also agree to our Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Important:</strong> All data processing through our tools happens entirely in your browser.
              We do not have access to, do not store, and do not transmit the content you process through our tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Governing Law and Jurisdiction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms shall be governed and construed in accordance with the laws of the United States,
              without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of
              those rights. If any provision of these Terms is held to be invalid or unenforceable by a court,
              the remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any concern or dispute about the Service, you agree to first try to resolve the
              dispute informally by contacting us.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              14.1 Arbitration Agreement
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Any dispute arising out of or relating to these Terms or the Service will be resolved through
              binding arbitration in accordance with the American Arbitration Association's rules, rather than
              in court, except that you may assert claims in small claims court if your claims qualify.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              15. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a
              revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
              What constitutes a material change will be determined at our sole discretion. By continuing to
              access or use our Service after revisions become effective, you agree to be bound by the revised
              terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              16. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> legal@developer-tools.com<br />
                <strong>Website:</strong> https://developer-tools.com<br />
                <strong>Support:</strong> support@developer-tools.com
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              17. Severability
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be
              limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain
              in full force and effect and enforceable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              18. Entire Agreement
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms of Service, together with our Privacy Policy, constitute the entire agreement between
              you and Developer Tools regarding the use of the Service, superseding any prior agreements between
              you and Developer Tools relating to your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              19. Acknowledgment
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE
              BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MAY NOT ACCESS OR USE THE SERVICE.
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
                to="/privacy"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
