import { Highlight, themes } from 'prism-react-renderer'
import { useState } from 'react'
import CopyButton from './CopyButton'

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
  title?: string
}

export default function CodeBlock({ code, language, showLineNumbers = true, title }: CodeBlockProps) {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  return (
    <div className="relative">
      {title && (
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
          <CopyButton text={code} />
        </div>
      )}
      <Highlight
        theme={isDark ? themes.vsDark : themes.vsLight}
        code={code}
        language={language as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} rounded-lg overflow-x-auto p-4 ${!title ? 'rounded-t-lg' : ''}`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {showLineNumbers && (
                  <span className="inline-block w-8 select-none text-gray-500 text-right mr-4">
                    {i + 1}
                  </span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      {!title && (
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  )
}
