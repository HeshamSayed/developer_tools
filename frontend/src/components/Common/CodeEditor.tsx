import { useEffect, useRef, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
}

// Autocomplete suggestions for different languages
const getAutocompleteSuggestions = (language: string, currentWord: string): string[] => {
  const suggestions: Record<string, string[]> = {
    html: [
      'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'input', 'button', 'textarea', 'select', 'option', 'label',
      'header', 'footer', 'nav', 'main', 'section', 'article', 'aside',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'br', 'hr',
      'meta', 'link', 'script', 'style', 'title', 'head', 'body', 'html',
      'class=', 'id=', 'src=', 'href=', 'alt=', 'title=', 'style=', 'data-',
    ],
    css: [
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'width', 'height', 'margin', 'padding', 'border', 'background',
      'color', 'font-size', 'font-family', 'font-weight', 'text-align',
      'flex', 'grid', 'justify-content', 'align-items', 'gap',
      'border-radius', 'box-shadow', 'transform', 'transition', 'animation',
      'opacity', 'z-index', 'overflow', 'cursor', 'pointer-events',
      'absolute', 'relative', 'fixed', 'sticky', 'flex', 'block', 'inline-block',
      'none', 'center', 'space-between', 'flex-start', 'flex-end',
    ],
    javascript: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
      'async', 'await', 'Promise', 'then', 'catch',
      'document', 'querySelector', 'querySelectorAll', 'getElementById',
      'addEventListener', 'removeEventListener', 'createElement',
      'appendChild', 'removeChild', 'classList', 'add', 'remove', 'toggle',
      'console', 'log', 'error', 'warn', 'info',
      'Array', 'Object', 'String', 'Number', 'Boolean', 'map', 'filter', 'reduce',
      'forEach', 'find', 'includes', 'push', 'pop', 'shift', 'unshift',
    ],
  }

  const langSuggestions = suggestions[language] || []
  return langSuggestions.filter(s => s.toLowerCase().startsWith(currentWord.toLowerCase()))
}

// HTML tag autocomplete
const getHTMLTagCompletion = (tag: string): string => {
  const selfClosing = ['img', 'input', 'br', 'hr', 'meta', 'link']
  if (selfClosing.includes(tag)) {
    return `<${tag} />`
  }
  return `<${tag}></${tag}>`
}

export default function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })

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

  const getCursorPosition = (textarea: HTMLTextAreaElement) => {
    const { selectionStart } = textarea
    const textBeforeCursor = value.substring(0, selectionStart)
    const lines = textBeforeCursor.split('\n')
    const currentLine = lines.length
    const currentColumn = lines[lines.length - 1].length

    // Calculate pixel position (approximate)
    const lineHeight = 20 // approximate line height
    const charWidth = 8 // approximate char width
    const top = currentLine * lineHeight
    const left = currentColumn * charWidth + 60 // 60px for line numbers

    return { top, left }
  }

  const getCurrentWord = (text: string, cursorPos: number): string => {
    let start = cursorPos - 1
    while (start >= 0 && /[\w-]/.test(text[start])) {
      start--
    }
    return text.substring(start + 1, cursorPos)
  }

  const handleInput = (newValue: string) => {
    onChange(newValue)

    if (!textareaRef.current) return

    const cursorPos = textareaRef.current.selectionStart
    const currentWord = getCurrentWord(newValue, cursorPos)

    if (currentWord.length >= 2) {
      const sugs = getAutocompleteSuggestions(language, currentWord)
      if (sugs.length > 0) {
        setSuggestions(sugs.slice(0, 8))
        setSelectedSuggestion(0)
        setShowAutocomplete(true)
        const pos = getCursorPosition(textareaRef.current)
        setAutocompletePosition(pos)
      } else {
        setShowAutocomplete(false)
      }
    } else {
      setShowAutocomplete(false)
    }
  }

  const insertSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return

    const cursorPos = textareaRef.current.selectionStart
    const currentWord = getCurrentWord(value, cursorPos)

    let newValue = value.substring(0, cursorPos - currentWord.length) + suggestion + value.substring(cursorPos)
    let newCursorPos = cursorPos - currentWord.length + suggestion.length

    // For HTML tags, add closing tag
    if (language === 'html' && !suggestion.includes('=') && !suggestion.includes('/')) {
      const completion = getHTMLTagCompletion(suggestion)
      if (completion.includes('></')) {
        newValue = value.substring(0, cursorPos - currentWord.length) + completion + value.substring(cursorPos)
        newCursorPos = cursorPos - currentWord.length + completion.indexOf('></') + 1
      }
    }

    onChange(newValue)
    setShowAutocomplete(false)

    // Set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos
        textareaRef.current.selectionEnd = newCursorPos
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Autocomplete navigation
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestion((prev) => Math.max(prev - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertSuggestion(suggestions[selectedSuggestion])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowAutocomplete(false)
        return
      }
    }

    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }

    // Auto-close brackets and quotes
    const pairs: Record<string, string> = {
      '{': '}',
      '[': ']',
      '(': ')',
      '"': '"',
      "'": "'",
      '<': '>',
    }

    if (pairs[e.key]) {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const selected = value.substring(start, end)
      const newValue = value.substring(0, start) + e.key + selected + pairs[e.key] + value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1 + selected.length
        }
      }, 0)
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const lines = value.substring(0, start).split('\n')
      const currentLine = lines[lines.length - 1]
      const indent = currentLine.match(/^\s*/)?.[0] || ''

      let newIndent = indent
      // Add extra indent if line ends with opening bracket
      if (currentLine.trimEnd().endsWith('{') || currentLine.trimEnd().endsWith('[')) {
        newIndent = indent + '  '
      }

      const newValue = value.substring(0, start) + '\n' + newIndent + value.substring(start)
      onChange(newValue)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1 + newIndent.length
        }
      }, 0)
    }

    // Ctrl+/ for comment toggle
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const lines = value.split('\n')
      const startLine = value.substring(0, start).split('\n').length - 1
      const endLine = value.substring(0, end).split('\n').length - 1

      const commentSymbol = language === 'html' ? '<!-- ' : language === 'css' ? '/* ' : '// '
      const commentEnd = language === 'html' ? ' -->' : language === 'css' ? ' */' : ''

      for (let i = startLine; i <= endLine; i++) {
        if (lines[i].trim().startsWith(commentSymbol.trim())) {
          // Uncomment
          lines[i] = lines[i].replace(commentSymbol, '').replace(commentEnd, '')
        } else {
          // Comment
          lines[i] = commentSymbol + lines[i] + commentEnd
        }
      }

      onChange(lines.join('\n'))
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
              style={{ ...style, margin: 0, padding: '16px', minHeight: '100%', paddingLeft: '60px' }}
              className="font-mono text-sm whitespace-pre overflow-auto"
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="relative">
                  <span className="absolute left-0 w-12 text-right pr-4 select-none opacity-40" style={{ left: '-44px' }}>
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
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        className="absolute inset-0 w-full h-full p-4 pl-[60px] font-mono text-sm bg-transparent text-transparent caret-white resize-none focus:outline-none"
        style={{
          caretColor: 'white',
          WebkitTextFillColor: 'transparent',
          lineHeight: '20px',
        }}
      />

      {/* Autocomplete dropdown */}
      {showAutocomplete && (
        <div
          className="absolute bg-gray-800 border border-gray-600 rounded shadow-lg z-50 overflow-hidden"
          style={{
            top: `${autocompletePosition.top + 24}px`,
            left: `${autocompletePosition.left}px`,
            minWidth: '200px',
            maxHeight: '200px',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-3 py-1.5 cursor-pointer text-sm font-mono ${
                index === selectedSuggestion
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => insertSuggestion(suggestion)}
              onMouseEnter={() => setSelectedSuggestion(index)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
