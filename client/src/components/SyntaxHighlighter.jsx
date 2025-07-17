/* eslint-disable react/prop-types */ 
'use client'

import { Highlight, themes } from 'prism-react-renderer'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text: ', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy code"
      className="rounded-md p-1.5 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-600"
    >
      {copied ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <Copy size={16} />
      )}
    </button>
  )
}

export const SyntaxHighlighter = ({
  code,
  language,
  lineNumbers = true,
  theme = 'dark',
}) => {
  const prismTheme = theme === 'dark' ? themes.vsDark : themes.vsLight

  return (
    <div className="relative">
      {/* Copy button positioned at the top right */}
      <div className="absolute top-2 right-2 z-10">
        <CopyButton code={code} />
      </div>
      
      <Highlight
        theme={prismTheme}
        code={code}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} p-4 pt-10 rounded-lg overflow-auto pb-20`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })} className="table-row">
                {lineNumbers && (
                  <span className="table-cell text-right pr-4 opacity-50 select-none">
                    {i + 1}
                  </span>
                )}
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

export default SyntaxHighlighter

/**
 * SyntaxHighlighter.jsx
 *
 * This component renders syntax-highlighted code blocks using `prism-react-renderer`
 * and includes a copy-to-clipboard button for user convenience. It supports optional
 * line numbering and light/dark themes for readability.
 *
 * Key Features:
 * - Syntax highlighting via `prism-react-renderer`
 * - Light and dark theme support via `vsLight` and `vsDark`
 * - Line numbers toggleable via `lineNumbers` prop
 * - Copy-to-clipboard functionality with feedback state
 * - Responsive design with scrollable code blocks and overflow handling
 *
 * Props:
 * - `code` (string): The raw code to highlight
 * - `language` (string): The programming language (e.g., "js", "py")
 * - `lineNumbers` (boolean): Whether to show line numbers (default: true)
 * - `theme` (string): Either "dark" or "light" (default: "dark")
 *
 * Dependencies:
 * - `prism-react-renderer` for syntax highlighting
 * - `lucide-react` for UI icons
 * - TailwindCSS for styling
 *
 * Path: //GPT/gptcore/client/src/components/SyntaxHighlighter.jsx
 */