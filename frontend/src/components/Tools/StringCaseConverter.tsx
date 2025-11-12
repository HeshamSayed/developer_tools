import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function StringCaseConverter() {
  const [input, setInput] = useState('Hello World Example Text')

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')
  }

  const toPascalCase = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '')
  }

  const toSnakeCase = (str: string) => {
    return str.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).join('_').toLowerCase()
  }

  const toKebabCase = (str: string) => {
    return str.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).join('-').toLowerCase()
  }

  const toConstantCase = (str: string) => {
    return str.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).join('_').toUpperCase()
  }

  const toDotCase = (str: string) => {
    return str.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).join('.').toLowerCase()
  }

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  }

  const results = [
    { name: 'camelCase', value: toCamelCase(input), desc: 'First word lowercase, rest capitalized' },
    { name: 'PascalCase', value: toPascalCase(input), desc: 'All words capitalized' },
    { name: 'snake_case', value: toSnakeCase(input), desc: 'Words separated by underscores' },
    { name: 'kebab-case', value: toKebabCase(input), desc: 'Words separated by hyphens' },
    { name: 'CONSTANT_CASE', value: toConstantCase(input), desc: 'Uppercase with underscores' },
    { name: 'dot.case', value: toDotCase(input), desc: 'Words separated by dots' },
    { name: 'Title Case', value: toTitleCase(input), desc: 'Each word capitalized' },
    { name: 'lowercase', value: input.toLowerCase(), desc: 'All characters lowercase' },
    { name: 'UPPERCASE', value: input.toUpperCase(), desc: 'All characters uppercase' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input w-full h-24 font-mono"
          placeholder="Enter text to convert..."
        />
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.name} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {result.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{result.desc}</p>
              </div>
              <CopyButton text={result.value} />
            </div>
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
              {result.value}
            </code>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Common Uses</h4>
        <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
          <li>• <strong>camelCase:</strong> JavaScript variables, Java methods</li>
          <li>• <strong>PascalCase:</strong> Class names, React components</li>
          <li>• <strong>snake_case:</strong> Python variables, database columns</li>
          <li>• <strong>kebab-case:</strong> URLs, CSS classes, file names</li>
          <li>• <strong>CONSTANT_CASE:</strong> Constants, environment variables</li>
        </ul>
      </div>
    </div>
  )
}
