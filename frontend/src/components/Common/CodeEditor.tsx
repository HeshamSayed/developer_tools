import { useEffect, useRef } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
}

export default function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    // Sync scroll between textarea and preview
    const handleScroll = () => {
      if (textareaRef.current && preRef.current) {
        preRef.current.scrollTop = textareaRef.current.scrollTop
        preRef.current.scrollLeft = textareaRef.current.scrollLeft
      }
    }

    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll)
      return () => textarea.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)

      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Syntax highlighted preview layer */}
      <div className="absolute inset-0 overflow-auto pointer-events-none">
        <Highlight theme={themes.vsDark} code={value} language={language as any}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              ref={preRef}
              style={{ ...style, margin: 0, padding: '16px', minHeight: '100%' }}
              className="font-mono text-sm whitespace-pre overflow-auto"
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className="inline-block w-12 text-right pr-4 select-none opacity-40">
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>

      {/* Invisible textarea for input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        className="absolute inset-0 w-full h-full p-4 pl-16 font-mono text-sm bg-transparent text-transparent caret-white resize-none focus:outline-none"
        style={{
          caretColor: 'white',
          WebkitTextFillColor: 'transparent'
        }}
      />
    </div>
  )
}
