import { useState } from 'react';
import AIAssistant from '@/components/AI/AIAssistant';
import AIQuotaDisplay from '@/components/AI/AIQuotaDisplay';
import ProfessionalSection from '@/components/Common/ProfessionalSection';

export default function AIAssistantPage() {
  const [showPurchase, setShowPurchase] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ProfessionalSection background="transparent" padding="lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                AI Code Assistant
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Get instant help with code explanations, error fixes, and best practices
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              {
                icon: '📖',
                title: 'Code Explanations',
                description: 'Understand complex code snippets'
              },
              {
                icon: '🔧',
                title: 'Error Fixes',
                description: 'Debug and resolve issues quickly'
              },
              {
                icon: '⭐',
                title: 'Best Practices',
                description: 'Improve code quality and style'
              },
              {
                icon: '💬',
                title: 'General Help',
                description: 'Ask coding questions anytime'
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="h-[700px]">
              <AIAssistant />
            </div>

            {/* Info Section */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
                    Privacy & Security
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      All processing runs locally on our servers
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      No data sent to third-party services
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Content filtering for appropriate usage
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Your code remains confidential
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quota Display */}
            <AIQuotaDisplay onPurchaseClick={() => setShowPurchase(true)} />

            {/* Usage Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                Usage Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">1.</span>
                  <span>Select the appropriate context type for better results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">2.</span>
                  <span>Include code snippets when asking about specific implementations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">3.</span>
                  <span>Be specific about the programming language and framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">4.</span>
                  <span>Ask follow-up questions to dive deeper into topics</span>
                </li>
              </ul>
            </div>

            {/* Supported Languages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Supported Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#',
                  'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'
                ].map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 text-primary-700 dark:text-primary-400 rounded-lg text-xs font-semibold"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProfessionalSection>

      {/* Purchase Modal (TODO: Implement) */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Purchase Additional Quota
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Payment integration coming soon! For now, contact support to upgrade your quota.
            </p>
            <button
              onClick={() => setShowPurchase(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
