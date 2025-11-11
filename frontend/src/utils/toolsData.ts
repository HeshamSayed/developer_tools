import { ToolCategory } from '@/types'

export const toolCategories: ToolCategory[] = [
  {
    slug: 'text-tools',
    name: 'Text & Code Tools',
    description: 'Format, validate, and transform text and code',
    icon: '📝',
    tools: [
      {
        slug: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format and beautify JSON with proper indentation',
        category: 'text-tools',
      },
      {
        slug: 'json-validator',
        name: 'JSON Validator',
        description: 'Validate JSON and get detailed error information',
        category: 'text-tools',
      },
      {
        slug: 'json-minify',
        name: 'JSON Minifier',
        description: 'Minify JSON by removing whitespace',
        category: 'text-tools',
      },
      {
        slug: 'text-diff',
        name: 'Text Diff',
        description: 'Compare two texts and highlight differences',
        category: 'text-tools',
      },
      {
        slug: 'regex-tester',
        name: 'Regex Tester',
        description: 'Test regex patterns with live matching',
        category: 'text-tools',
      },
      {
        slug: 'jwt-decoder',
        name: 'JWT Decoder',
        description: 'Decode and inspect JWT tokens',
        category: 'text-tools',
      },
    ],
  },
  {
    slug: 'encoding-tools',
    name: 'Encoding & Decoding',
    description: 'Encode and decode various formats',
    icon: '🔤',
    tools: [
      {
        slug: 'base64-encode',
        name: 'Base64 Encoder',
        description: 'Encode text to Base64 format',
        category: 'encoding-tools',
      },
      {
        slug: 'base64-decode',
        name: 'Base64 Decoder',
        description: 'Decode Base64 to text',
        category: 'encoding-tools',
      },
      {
        slug: 'url-encode',
        name: 'URL Encoder',
        description: 'Encode text for URLs',
        category: 'encoding-tools',
      },
      {
        slug: 'url-decode',
        name: 'URL Decoder',
        description: 'Decode URL-encoded text',
        category: 'encoding-tools',
      },
      {
        slug: 'html-encode',
        name: 'HTML Encoder',
        description: 'Encode HTML entities',
        category: 'encoding-tools',
      },
      {
        slug: 'html-decode',
        name: 'HTML Decoder',
        description: 'Decode HTML entities',
        category: 'encoding-tools',
      },
    ],
  },
  {
    slug: 'conversion-tools',
    name: 'Data Conversion',
    description: 'Convert between different data formats',
    icon: '🔄',
    tools: [
      {
        slug: 'csv-to-json',
        name: 'CSV to JSON',
        description: 'Convert CSV data to JSON format',
        category: 'conversion-tools',
      },
      {
        slug: 'json-to-csv',
        name: 'JSON to CSV',
        description: 'Convert JSON to CSV format',
        category: 'conversion-tools',
      },
    ],
  },
  {
    slug: 'security-tools',
    name: 'Security & Cryptography',
    description: 'Hash generation and password tools',
    icon: '🔐',
    tools: [
      {
        slug: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate MD5, SHA1, SHA256, SHA512 hashes',
        category: 'security-tools',
      },
      {
        slug: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
        category: 'security-tools',
      },
      {
        slug: 'password-strength',
        name: 'Password Strength Checker',
        description: 'Analyze password strength and get suggestions',
        category: 'security-tools',
      },
    ],
  },
  {
    slug: 'generator-tools',
    name: 'Generators',
    description: 'Generate UUIDs, QR codes, and more',
    icon: '🎲',
    tools: [
      {
        slug: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate unique identifiers (v1, v4)',
        category: 'generator-tools',
      },
      {
        slug: 'qr-generator',
        name: 'QR Code Generator',
        description: 'Generate QR codes from text',
        category: 'generator-tools',
      },
      {
        slug: 'color-picker',
        name: 'Color Picker',
        description: 'Pick colors and get HEX, RGB, HSL values',
        category: 'generator-tools',
      },
      {
        slug: 'cron-builder',
        name: 'Cron Expression Builder',
        description: 'Build and visualize cron expressions',
        category: 'generator-tools',
      },
    ],
  },
  {
    slug: 'time-tools',
    name: 'Time & Date Tools',
    description: 'Convert and format timestamps',
    icon: '⏰',
    tools: [
      {
        slug: 'timestamp-converter',
        name: 'Timestamp Converter',
        description: 'Convert between timestamps and human-readable dates',
        category: 'time-tools',
      },
    ],
  },
]

export const getAllTools = () => {
  return toolCategories.flatMap(category => category.tools)
}

export const getToolBySlug = (slug: string) => {
  return getAllTools().find(tool => tool.slug === slug)
}

export const getCategoryBySlug = (slug: string) => {
  return toolCategories.find(category => category.slug === slug)
}
