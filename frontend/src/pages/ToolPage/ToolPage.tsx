import { useParams } from 'react-router-dom'
import { getToolBySlug } from '@/utils/toolsData'
import AdBanner from '@/components/Ads/AdBanner'
import AdSidebar from '@/components/Ads/AdSidebar'
import JSONFormatter from '@/components/Tools/JSONFormatter'
import JSONValidator from '@/components/Tools/JSONValidator'
import JSONMinify from '@/components/Tools/JSONMinify'
import Base64Encoder from '@/components/Tools/Base64Encoder'
import Base64Decoder from '@/components/Tools/Base64Decoder'
import HashGenerator from '@/components/Tools/HashGenerator'
import PasswordGenerator from '@/components/Tools/PasswordGenerator'
import PasswordStrength from '@/components/Tools/PasswordStrength'
import TimestampConverter from '@/components/Tools/TimestampConverter'
import JWTDecoder from '@/components/Tools/JWTDecoder'
import TextDiff from '@/components/Tools/TextDiff'
import RegexTester from '@/components/Tools/RegexTester'
import CSVToJSON from '@/components/Tools/CSVToJSON'
import JSONToCSV from '@/components/Tools/JSONToCSV'
import URLEncoder from '@/components/Tools/URLEncoder'
import URLDecoder from '@/components/Tools/URLDecoder'
import HTMLEncoder from '@/components/Tools/HTMLEncoder'
import HTMLDecoder from '@/components/Tools/HTMLDecoder'
import UUIDGenerator from '@/components/Tools/UUIDGenerator'
import QRGenerator from '@/components/Tools/QRGenerator'
import ColorPicker from '@/components/Tools/ColorPicker'
import CronBuilder from '@/components/Tools/CronBuilder'

const toolComponents: Record<string, React.ComponentType> = {
  'json-formatter': JSONFormatter,
  'json-validator': JSONValidator,
  'json-minify': JSONMinify,
  'base64-encode': Base64Encoder,
  'base64-decode': Base64Decoder,
  'hash-generator': HashGenerator,
  'password-generator': PasswordGenerator,
  'password-strength': PasswordStrength,
  'timestamp-converter': TimestampConverter,
  'jwt-decoder': JWTDecoder,
  'text-diff': TextDiff,
  'regex-tester': RegexTester,
  'csv-to-json': CSVToJSON,
  'json-to-csv': JSONToCSV,
  'url-encode': URLEncoder,
  'url-decode': URLDecoder,
  'html-encode': HTMLEncoder,
  'html-decode': HTMLDecoder,
  'uuid-generator': UUIDGenerator,
  'qr-generator': QRGenerator,
  'color-picker': ColorPicker,
  'cron-builder': CronBuilder,
}

export default function ToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const tool = toolSlug ? getToolBySlug(toolSlug) : null
  const ToolComponent = toolSlug ? toolComponents[toolSlug] : null

  if (!tool || !ToolComponent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Tool Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The tool you're looking for doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Ad */}
      <AdBanner position="tool-top" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tool Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {tool.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {tool.description}
            </p>
          </div>

          {/* Tool Component */}
          <div className="card">
            <ToolComponent />
          </div>

          {/* In-Content Ad */}
          <AdBanner position="tool-in-content" className="my-8" />

          {/* Tool Description/Instructions */}
          <div className="card mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              How to use
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Enter or paste your data in the input field</li>
                <li>Configure any available options</li>
                <li>Click the process button to see results</li>
                <li>Copy the output to use it in your project</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdSidebar sticky />
        </div>
      </div>

      {/* Below Results Ad */}
      <AdBanner position="tool-below-results" className="mt-8" />
    </div>
  )
}
