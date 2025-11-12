import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { getToolBySlug } from '@/utils/toolsData'
import AdBanner from '@/components/Ads/AdBanner'
import AdSidebar from '@/components/Ads/AdSidebar'
import { useFavorites } from '@/hooks/useFavorites'
import { useToolHistory } from '@/hooks/useToolHistory'
import { useNotification } from '@/contexts/NotificationContext'
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
import SQLFormatter from '@/components/Tools/SQLFormatter'
import XMLFormatter from '@/components/Tools/XMLFormatter'
import XMLValidator from '@/components/Tools/XMLValidator'
import YAMLFormatter from '@/components/Tools/YAMLFormatter'
import MarkdownPreview from '@/components/Tools/MarkdownPreview'
import CSSFormatter from '@/components/Tools/CSSFormatter'
import JavaScriptFormatter from '@/components/Tools/JavaScriptFormatter'
import ImageConverter from '@/components/Tools/ImageConverter'
import LoremIpsumGenerator from '@/components/Tools/LoremIpsumGenerator'
import BinaryHexConverter from '@/components/Tools/BinaryHexConverter'
import ASCIIArtGenerator from '@/components/Tools/ASCIIArtGenerator'
import SSLChecker from '@/components/Tools/SSLChecker'
import GradientGenerator from '@/components/Tools/GradientGenerator'
import BoxShadowGenerator from '@/components/Tools/BoxShadowGenerator'
import BorderRadiusGenerator from '@/components/Tools/BorderRadiusGenerator'
import CSSTriangleGenerator from '@/components/Tools/CSSTriangleGenerator'
import GlassmorphismGenerator from '@/components/Tools/GlassmorphismGenerator'
import NeumorphismGenerator from '@/components/Tools/NeumorphismGenerator'
import TailwindConfigGenerator from '@/components/Tools/TailwindConfigGenerator'
import StringCaseConverter from '@/components/Tools/StringCaseConverter'
import UnitConverter from '@/components/Tools/UnitConverter'
import EmailValidator from '@/components/Tools/EmailValidator'
import CodePlayground from '@/components/Tools/CodePlayground'

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
  'sql-formatter': SQLFormatter,
  'xml-formatter': XMLFormatter,
  'xml-validator': XMLValidator,
  'yaml-formatter': YAMLFormatter,
  'markdown-preview': MarkdownPreview,
  'css-formatter': CSSFormatter,
  'js-formatter': JavaScriptFormatter,
  'image-converter': ImageConverter,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'binary-hex-converter': BinaryHexConverter,
  'ascii-art-generator': ASCIIArtGenerator,
  'ssl-checker': SSLChecker,
  'gradient-generator': GradientGenerator,
  'box-shadow-generator': BoxShadowGenerator,
  'border-radius-generator': BorderRadiusGenerator,
  'css-triangle-generator': CSSTriangleGenerator,
  'glassmorphism-generator': GlassmorphismGenerator,
  'neumorphism-generator': NeumorphismGenerator,
  'tailwind-config-generator': TailwindConfigGenerator,
  'string-case-converter': StringCaseConverter,
  'unit-converter': UnitConverter,
  'email-validator': EmailValidator,
  'code-playground': CodePlayground,
}

export default function ToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const tool = toolSlug ? getToolBySlug(toolSlug) : null
  const ToolComponent = toolSlug ? toolComponents[toolSlug] : null
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addToHistory } = useToolHistory()
  const { showSuccess } = useNotification()

  const isToolFavorite = toolSlug ? isFavorite(toolSlug) : false

  // Add tool to history when page loads
  useEffect(() => {
    if (tool && toolSlug) {
      addToHistory(toolSlug, tool.name)
    }
  }, [tool, toolSlug, addToHistory])

  const handleToggleFavorite = () => {
    if (toolSlug) {
      toggleFavorite(toolSlug)
      if (isFavorite(toolSlug)) {
        showSuccess('Removed from favorites')
      } else {
        showSuccess('Added to favorites!')
      }
    }
  }

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

  // Special layout for Code Playground - full screen with ads at top/bottom
  if (toolSlug === 'code-playground') {
    return (
      <div className="flex flex-col h-screen">
        {/* Compact Header with Ads */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {tool.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </div>
            <button
              onClick={handleToggleFavorite}
              className={`flex-shrink-0 p-2 rounded-lg border transition-all ${
                isToolFavorite
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}
              title={isToolFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill={isToolFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
          {/* Top Ad Banner */}
          <AdBanner slot="topBanner" className="px-4 pb-2" />
        </div>

        {/* Full Height Code Playground */}
        <div className="flex-1 overflow-hidden">
          <ToolComponent />
        </div>
      </div>
    )
  }

  // Default layout for other tools
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Ad */}
      <AdBanner slot="topBanner" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tool Header */}
          <div className="mb-6 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {tool.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </div>
              <button
                onClick={handleToggleFavorite}
                className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  isToolFavorite
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-500 hover:shadow-glow'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-yellow-300 dark:hover:border-yellow-700 hover:text-yellow-500'
                }`}
                title={isToolFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-6 h-6" fill={isToolFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tool Component */}
          <div className="card">
            <ToolComponent />
          </div>

          {/* In-Content Ad */}
          <AdBanner slot="bottomBanner" className="my-8" />

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
      <AdBanner slot="bottomBanner" className="mt-8" />
    </div>
  )
}
