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
