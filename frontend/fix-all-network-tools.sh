#!/bin/bash

# Fix HTTPRequestTester.tsx - Tab buttons
sed -i "s/'bg-gray-700 text-blue-400 border-b-2 border-blue-400'/'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'/g" src/components/Tools/HTTPRequestTester.tsx
sed -i "s/'text-gray-400 hover:text-white'/'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'/g" src/components/Tools/HTTPRequestTester.tsx

# Fix DNSLookup.tsx - SOA record labels and all text-gray-400 in spans
sed -i 's/<span className="text-gray-400">Primary NS:<\/span>/<span className="text-gray-600 dark:text-gray-400">Primary NS:<\/span>/g' src/components/Tools/DNSLookup.tsx
sed -i 's/<span className="text-gray-400">Admin Email:<\/span>/<span className="text-gray-600 dark:text-gray-400">Admin Email:<\/span>/g' src/components/Tools/DNSLookup.tsx
sed -i 's/<span className="text-gray-400">Serial:<\/span>/<span className="text-gray-600 dark:text-gray-400">Serial:<\/span>/g' src/components/Tools/DNSLookup.tsx
sed -i 's/<span className="text-gray-400">Refresh:<\/span>/<span className="text-gray-600 dark:text-gray-400">Refresh:<\/span>/g' src/components/Tools/DNSLookup.tsx
sed -i 's/<span className="text-gray-400">Retry:<\/span>/<span className="text-gray-600 dark:text-gray-400">Retry:<\/span>/g' src/components/Tools/DNSLookup.tsx
sed -i 's/<span className="text-gray-400">Expire:<\/span>/<span className="text-gray-600 dark:text-gray-400">Expire:<\/span>/g' src/components/Tools/DNSLookup.tsx
sed -i 's/<span className="text-gray-400">Minimum TTL:<\/span>/<span className="text-gray-600 dark:text-gray-400">Minimum TTL:<\/span>/g' src/components/Tools/DNSLookup.tsx

# Fix DNSLookup checkbox labels
sed -i "s/'bg-blue-600\/20 border-blue-500'/'bg-blue-100 dark:bg-blue-600\/20 border-blue-500 dark:border-blue-500'/g" src/components/Tools/DNSLookup.tsx

# Fix DNSLookup result cards
sed -i 's/className={`bg-gray-800 rounded-lg p-6 border ${/className={`bg-white dark:bg-gray-800 rounded-lg p-6 border ${/g' src/components/Tools/DNSLookup.tsx

# Fix PingTest - All remaining text-gray-400 in result sections
sed -i 's/<span className="text-gray-400">URL:<\/span>/<span className="text-gray-600 dark:text-gray-400">URL:<\/span>/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-gray-400">Host:<\/span>/<span className="text-gray-600 dark:text-gray-400">Host:<\/span>/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-gray-400">IP Address:<\/span>/<span className="text-gray-600 dark:text-gray-400">IP Address:<\/span>/g' src/components/Tools/PingTest.tsx
sed -i 's/<div className="text-sm text-gray-400 mb-1">Packets Sent<\/div>/<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Packets Sent<\/div>/g' src/components/Tools/PingTest.tsx
sed -i 's/<div className="text-sm text-gray-400 mb-1">Packets Received<\/div>/<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Packets Received<\/div>/g' src/components/Tools/PingTest.tsx
sed -i 's/<div className="text-sm text-gray-400 mb-1">Packet Loss<\/div>/<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Packet Loss<\/div>/g' src/components/Tools/PingTest.tsx
sed -i 's/<div className="text-sm text-gray-400 mb-1">Avg Time<\/div>/<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Time<\/div>/g' src/components/Tools/PingTest.tsx
sed -i 's/<div className="text-sm text-gray-400 mb-1">Min Time<\/div>/<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Time<\/div>/g' src/components/Tools/PingTest.tsx
sed -i 's/<div className="text-sm text-gray-400 mb-1">Max Time<\/div>/<div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Time<\/div>/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-gray-400">#{ping.sequence}<\/span>/<span className="text-gray-600 dark:text-gray-400">#{ping.sequence}<\/span>/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-green-400">Success<\/span>/<span className="text-green-600 dark:text-green-400">Success<\/span>/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-red-400">Failed<\/span>/<span className="text-red-600 dark:text-red-400">Failed<\/span>/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-blue-400 text-sm">/<span className="text-blue-600 dark:text-blue-400 text-sm">/g' src/components/Tools/PingTest.tsx
sed -i 's/<span className="text-red-400 text-sm">{ping.error}<\/span>/<span className="text-red-600 dark:text-red-400 text-sm">{ping.error}<\/span>/g' src/components/Tools/PingTest.tsx

# Fix PingTest - Progress bar backgrounds
sed -i 's/className="flex-1 bg-gray-200 dark:bg-gray-900 rounded-full/className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full/g' src/components/Tools/PingTest.tsx

# Fix HTTPRequestTester - Response display
sed -i 's/<div className="text-sm text-gray-900 dark:text-white font-mono mt-1">{response.url}<\/div>/<div className="text-sm text-gray-900 dark:text-white font-mono mt-1">{response.url}<\/div>/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/<div className="text-sm text-yellow-400">SSL Warning:/<div className="text-sm text-yellow-600 dark:text-yellow-400">SSL Warning:/g' src/components/Tools/HTTPRequestTester.tsx

# Fix HTTPRequestTester - Response time and size colors
sed -i 's/className="text-2xl font-bold text-blue-400">/className="text-2xl font-bold text-blue-600 dark:text-blue-400">/g' src/components/Tools/HTTPRequestTester.tsx
sed -i 's/className="text-2xl font-bold text-purple-400">/className="text-2xl font-bold text-purple-600 dark:text-purple-400">/g' src/components/Tools/HTTPRequestTester.tsx

# Fix WhoisLookup - Remaining text-gray-400 in description
sed -i 's/<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">/<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">/g' src/components/Tools/WhoisLookup.tsx

echo "All network tools comprehensively fixed for light/dark mode!"
