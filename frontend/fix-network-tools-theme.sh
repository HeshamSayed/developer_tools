#!/bin/bash

# Fix HTTPRequestTester.tsx
sed -i 's/className="w-full px-4 py-2 bg-gray-800 border border-gray-700/className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="bg-red-900\/50 border border-red-700 text-red-200/className="bg-red-50 dark:bg-red-900\/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="bg-gray-800 rounded-lg p-6 border border-gray-700"/className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="bg-gray-800 rounded-lg border border-gray-700"/className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="text-sm text-gray-400/className="text-sm text-gray-600 dark:text-gray-400/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/text-gray-400 hover:text-white"/text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="bg-gray-700 text-blue-400/className="bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm/className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="bg-gray-900 p-4 rounded-lg/className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="text-gray-300"/className="text-gray-900 dark:text-gray-300"/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="font-medium text-gray-400"/className="font-medium text-gray-600 dark:text-gray-400"/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="text-white font-mono text-sm/className="text-gray-900 dark:text-white font-mono text-sm/g' src/components/Tools/HTTPRequestTester.tsx

# Fix DNSLookup.tsx
sed -i 's/className="w-full px-4 py-2 bg-gray-800 border border-gray-700/className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="bg-red-900\/50 border border-red-700 text-red-200/className="bg-red-50 dark:bg-red-900\/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="bg-gray-800 rounded-lg p-4 border border-gray-700"/className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/: '\''bg-blue-600\/20 border-blue-500'\''/: '\''bg-blue-100 dark:bg-blue-600\/20 border-blue-600 dark:border-blue-500'\''/g' src/components/Tools/DNSLookup.tsx
sed -i 's/: '\''bg-gray-800 border-gray-700 hover:border-gray-600'\''/: '\''bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'\''/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="font-medium text-white"/className="font-medium text-gray-900 dark:text-white"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-xs text-gray-400"/className="text-xs text-gray-600 dark:text-gray-400"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-lg font-semibold text-blue-400"/className="text-lg font-semibold text-blue-600 dark:text-blue-400"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-xl font-bold text-white"/className="text-xl font-bold text-gray-900 dark:text-white"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-sm text-gray-400"/className="text-sm text-gray-600 dark:text-gray-400"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/border-green-700/border-green-300 dark:border-green-700/g' src/components/Tools/DNSLookup.tsx
sed -i 's/border-red-700/border-red-300 dark:border-red-700/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="bg-gray-900 p-4 rounded-lg border border-gray-700"/className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-white font-mono"/className="text-gray-900 dark:text-white font-mono"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-gray-400 italic"/className="text-gray-600 dark:text-gray-400 italic"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-red-400"/className="text-red-600 dark:text-red-400"/g' src/components/Tools/DNSLookup.tsx
sed -i 's/className="text-purple-400 font-semibold"/className="text-purple-600 dark:text-purple-400 font-semibold"/g' src/components/Tools/DNSLookup.tsx

# Fix PingTest.tsx
sed -i 's/className="w-full px-4 py-2 bg-gray-800 border border-gray-700/className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white/g' src/components/Tools/PingTest.tsx
sed -i 's/className="bg-red-900\/50 border border-red-700 text-red-200/className="bg-red-50 dark:bg-red-900\/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200/g' src/components/Tools/PingTest.tsx
sed -i 's/className="bg-gray-800 rounded-lg p-6 border border-gray-700"/className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-blue-400"/className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-green-400"/className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-purple-400"/className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-yellow-400"/className="text-lg font-semibold mb-4 text-yellow-600 dark:text-yellow-400"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-sm text-gray-400"/className="text-sm text-gray-600 dark:text-gray-400"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-gray-400 text-sm/className="text-gray-600 dark:text-gray-400 text-sm/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-white font-mono"/className="text-gray-900 dark:text-white font-mono"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-white font-mono text-sm"/className="text-gray-900 dark:text-white font-mono text-sm"/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-2xl font-bold text-white"/className="text-2xl font-bold text-gray-900 dark:text-white"/g' src/components/Tools/PingTest.tsx
sed -i 's/: '\''bg-gray-900 border-gray-700'\''/: '\''bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'\''/g' src/components/Tools/PingTest.tsx
sed -i 's/: '\''bg-red-900\/20 border-red-700'\''/: '\''bg-red-50 dark:bg-red-900\/20 border-red-300 dark:border-red-700'\''/g' src/components/Tools/PingTest.tsx
sed -i 's/className="bg-gray-900 rounded-full/className="bg-gray-200 dark:bg-gray-900 rounded-full/g' src/components/Tools/PingTest.tsx
sed -i 's/className="text-white text-sm w-16/className="text-gray-900 dark:text-white text-sm w-16/g' src/components/Tools/PingTest.tsx

# Fix WhoisLookup.tsx
sed -i 's/className="w-full px-4 py-2 bg-gray-800 border border-gray-700/className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="bg-red-900\/50 border border-red-700 text-red-200/className="bg-red-50 dark:bg-red-900\/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="bg-gray-800 rounded-lg p-6 border border-gray-700"/className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="bg-gray-800 rounded-lg border border-gray-700"/className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-blue-400"/className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-green-400"/className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-purple-400"/className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-lg font-semibold mb-4 text-orange-400"/className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-lg font-semibold text-gray-400"/className="text-lg font-semibold text-gray-600 dark:text-gray-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-sm text-gray-400"/className="text-sm text-gray-600 dark:text-gray-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-gray-400"/className="text-gray-600 dark:text-gray-400"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-white"/className="text-gray-900 dark:text-white"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-white font-mono"/className="text-gray-900 dark:text-white font-mono"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="bg-gray-900 p-3 rounded-lg"/className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-white text-sm"/className="text-gray-900 dark:text-white text-sm"/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="bg-gray-900 p-4 rounded-lg/className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg/g' src/components/Tools/WhoisLookup.tsx
sed -i 's/className="text-gray-300"/className="text-gray-900 dark:text-gray-300"/g' src/components/Tools/WhoisLookup.tsx

echo "All network tools theme fixes applied!"
