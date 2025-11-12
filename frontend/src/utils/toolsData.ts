import { ToolCategory } from '@/types'

export const toolCategories: ToolCategory[] = [
  // Most Powerful & Popular Tools First
  {
    slug: 'developer-tools',
    name: '🚀 Developer Tools',
    description: 'Advanced development and coding tools',
    icon: '💻',
    tools: [
      {
        slug: 'code-playground',
        name: 'Code Playground',
        description: 'Full-featured code editor with file system, live preview, and templates',
        category: 'developer-tools',
        badge: 'BETA',
      },
    ],
  },
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
      {
        slug: 'string-case-converter',
        name: 'String Case Converter',
        description: 'Convert strings between camelCase, snake_case, kebab-case, and more',
        category: 'text-tools',
      },
      {
        slug: 'sql-formatter',
        name: 'SQL Formatter',
        description: 'Format SQL queries with syntax highlighting',
        category: 'text-tools',
      },
      {
        slug: 'markdown-preview',
        name: 'Markdown Preview',
        description: 'Live markdown editor with HTML preview',
        category: 'text-tools',
      },
      {
        slug: 'text-diff',
        name: 'Text Diff',
        description: 'Compare two texts and highlight differences',
        category: 'text-tools',
      },
      {
        slug: 'xml-formatter',
        name: 'XML Formatter',
        description: 'Format and beautify XML documents',
        category: 'text-tools',
      },
      {
        slug: 'xml-validator',
        name: 'XML Validator',
        description: 'Validate XML structure and syntax',
        category: 'text-tools',
      },
      {
        slug: 'yaml-formatter',
        name: 'YAML Formatter',
        description: 'Format and validate YAML configuration files',
        category: 'text-tools',
      },
      {
        slug: 'css-formatter',
        name: 'CSS Formatter/Minifier',
        description: 'Format and minify CSS code',
        category: 'text-tools',
      },
      {
        slug: 'js-formatter',
        name: 'JavaScript Formatter/Minifier',
        description: 'Format and minify JavaScript code',
        category: 'text-tools',
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
      {
        slug: 'email-validator',
        name: 'Email Validator',
        description: 'Validate email addresses with detailed checks',
        category: 'security-tools',
      },
      {
        slug: 'ssl-checker',
        name: 'SSL Certificate Checker',
        description: 'Check SSL/TLS certificate information and validity',
        category: 'security-tools',
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
    slug: 'css-design-tools',
    name: 'CSS & Design Tools',
    description: 'Generate and customize CSS styles',
    icon: '🎨',
    tools: [
      {
        slug: 'gradient-generator',
        name: 'Gradient Generator',
        description: 'Create beautiful CSS gradients with live preview',
        category: 'css-design-tools',
      },
      {
        slug: 'box-shadow-generator',
        name: 'Box Shadow Generator',
        description: 'Design and customize box shadows visually',
        category: 'css-design-tools',
      },
      {
        slug: 'border-radius-generator',
        name: 'Border Radius Generator',
        description: 'Create custom border radius shapes',
        category: 'css-design-tools',
      },
      {
        slug: 'css-triangle-generator',
        name: 'CSS Triangle Generator',
        description: 'Generate CSS triangles in any direction',
        category: 'css-design-tools',
      },
      {
        slug: 'glassmorphism-generator',
        name: 'Glassmorphism Generator',
        description: 'Create frosted glass effects for modern UIs',
        category: 'css-design-tools',
      },
      {
        slug: 'neumorphism-generator',
        name: 'Neumorphism Generator',
        description: 'Generate soft UI neumorphic designs',
        category: 'css-design-tools',
      },
      {
        slug: 'tailwind-config-generator',
        name: 'Tailwind Config Generator',
        description: 'Generate custom Tailwind CSS configuration',
        category: 'css-design-tools',
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
        badge: 'BETA',
      },
      {
        slug: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure random passwords',
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
      {
        slug: 'lorem-ipsum-generator',
        name: 'Lorem Ipsum Generator',
        description: 'Generate Lorem Ipsum placeholder text',
        category: 'generator-tools',
      },
      {
        slug: 'ascii-art-generator',
        name: 'ASCII Art Generator',
        description: 'Generate ASCII art from text',
        category: 'generator-tools',
      },
    ],
  },
  {
    slug: 'image-tools',
    name: 'Image Tools',
    description: 'Powerful image manipulation and editing tools',
    icon: '🖼️',
    tools: [
      {
        slug: 'image-resizer',
        name: 'Image Resizer',
        description: 'Resize images to custom dimensions with quality control',
        category: 'image-tools',
      },
      {
        slug: 'image-compressor',
        name: 'Image Compressor',
        description: 'Reduce image file size while maintaining quality',
        category: 'image-tools',
      },
      {
        slug: 'image-cropper',
        name: 'Image Cropper',
        description: 'Crop images to desired dimensions and aspect ratios',
        category: 'image-tools',
      },
      {
        slug: 'image-flipper',
        name: 'Image Flipper & Rotator',
        description: 'Flip and rotate images horizontally, vertically, or both',
        category: 'image-tools',
      },
      {
        slug: 'meme-generator',
        name: 'Meme Generator',
        description: 'Create hilarious memes with custom text and images',
        category: 'image-tools',
      },
      {
        slug: 'image-info',
        name: 'Image Info & Resolution',
        description: 'Get detailed information about image resolution and format',
        category: 'image-tools',
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
        slug: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between length, weight, and temperature units',
        category: 'conversion-tools',
      },
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
      {
        slug: 'image-converter',
        name: 'Image Converter',
        description: 'Convert images between PNG, JPG, and WebP formats',
        category: 'conversion-tools',
      },
      // Document Conversion Tools
      {
        slug: 'pdf-to-word',
        name: 'PDF to Word',
        description: 'Convert PDF documents to editable Word (DOCX) files',
        category: 'conversion-tools',
        badge: 'NEW',
      },
      {
        slug: 'word-to-pdf',
        name: 'Word to PDF',
        description: 'Convert Word documents (DOCX) to PDF format',
        category: 'conversion-tools',
        badge: 'NEW',
      },
      {
        slug: 'pdf-to-excel',
        name: 'PDF to Excel',
        description: 'Extract tables from PDF and convert to Excel spreadsheets',
        category: 'conversion-tools',
        badge: 'NEW',
      },
      {
        slug: 'excel-to-pdf',
        name: 'Excel to PDF',
        description: 'Convert Excel spreadsheets to professional PDF documents',
        category: 'conversion-tools',
        badge: 'NEW',
      },
      {
        slug: 'excel-generator',
        name: 'Excel Generator',
        description: 'Create professional Excel spreadsheets with custom data',
        category: 'conversion-tools',
        badge: 'NEW',
      },
      {
        slug: 'pdf-generator',
        name: 'PDF Generator',
        description: 'Generate professional PDFs from templates (invoices, reports, certificates)',
        category: 'conversion-tools',
        badge: 'NEW',
      },
      {
        slug: 'binary-hex-converter',
        name: 'Binary/Hex Converter',
        description: 'Convert between binary, hexadecimal, and decimal',
        category: 'conversion-tools',
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
