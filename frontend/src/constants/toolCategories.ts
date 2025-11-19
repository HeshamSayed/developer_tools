// Tool Category Metadata
// Maps category slugs to enhanced display information

export interface CategoryMetadata {
  slug: string
  name: string
  description: string
  icon: string
  color: string // Tailwind color class
  order: number // Display order
  featured?: boolean
}

export const CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  'network-tools': {
    slug: 'network-tools',
    name: 'Network & API',
    description: 'Network diagnostics, API testing, and domain tools',
    icon: 'network-tools',
    color: 'blue',
    order: 1,
    featured: true,
  },
  'developer-tools': {
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'Advanced development and coding tools',
    icon: 'developer-tools',
    color: 'purple',
    order: 2,
    featured: true,
  },
  'text-tools': {
    slug: 'text-tools',
    name: 'Text & Code',
    description: 'Format, validate, and transform text and code',
    icon: 'text-tools',
    color: 'indigo',
    order: 3,
  },
  'security-tools': {
    slug: 'security-tools',
    name: 'Security',
    description: 'Hash generation and password tools',
    icon: 'security-tools',
    color: 'red',
    order: 4,
    featured: true,
  },
  'encoding-tools': {
    slug: 'encoding-tools',
    name: 'Encoding',
    description: 'Encode and decode various formats',
    icon: 'encoding-tools',
    color: 'green',
    order: 5,
  },
  'css-design-tools': {
    slug: 'css-design-tools',
    name: 'CSS & Design',
    description: 'Generate and customize CSS styles',
    icon: 'css-design-tools',
    color: 'pink',
    order: 6,
  },
  'generator-tools': {
    slug: 'generator-tools',
    name: 'Generators',
    description: 'Generate UUIDs, QR codes, and more',
    icon: 'generator-tools',
    color: 'yellow',
    order: 7,
  },
  'image-tools': {
    slug: 'image-tools',
    name: 'Image Tools',
    description: 'Powerful image manipulation and editing',
    icon: 'image-tools',
    color: 'orange',
    order: 8,
  },
  'conversion-tools': {
    slug: 'conversion-tools',
    name: 'Conversion',
    description: 'Convert between different data formats',
    icon: 'conversion-tools',
    color: 'teal',
    order: 9,
  },
  'time-tools': {
    slug: 'time-tools',
    name: 'Time & Date',
    description: 'Convert and format timestamps',
    icon: 'time-tools',
    color: 'cyan',
    order: 10,
  },
}

// Get categories sorted by order
export const getSortedCategories = () => {
  return Object.values(CATEGORY_METADATA).sort((a, b) => a.order - b.order)
}

// Get featured categories
export const getFeaturedCategories = () => {
  return Object.values(CATEGORY_METADATA)
    .filter(cat => cat.featured)
    .sort((a, b) => a.order - b.order)
}
