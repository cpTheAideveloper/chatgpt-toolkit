/* eslint-disable react/prop-types */
/* eslint-disable react/no-children-prop */
"use client";

import ReactMarkdown from "react-markdown";
import { SyntaxHighlighter } from "./SyntaxHighlighter";

const MarkdownViewerChat = ({ markdownContent }) => {
  return (
    <div className="prose max-w-none space-y-6 overflow-hidden px-4 leading-relaxed bg-base-100">
      <ReactMarkdown
        children={markdownContent}
        components={{
          h1: ({ children }) => (
            <h1 className="text-5xl font-bold mb-6 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium mt-6 mb-3">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-5 text-base-content/70">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside ml-6 mb-4 text-base-content/70">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside ml-6 mb-4 text-base-content/70">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 text-base-content/70">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="pl-4 italic text-gray-600 mb-4">
              {children}
            </blockquote>
          ),
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            return !inline && match ? (
              <div className="mockup-code relative mb-6 max-w-screen-md overflow-hidden rounded-lg border border-white/10">
                <SyntaxHighlighter
                  code={codeString}
                  language={match ? match[1] : "text"}
                  theme="dark"
                  lineNumbers={true}
                />
              </div>
            ) : (
              <code className={`rounded px-1 py-0.5 ${className}`} {...props}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>
  );
};

export default MarkdownViewerChat;

/**
 * MarkdownViewerChat.jsx
 *
 * This component renders markdown content with custom styling and code highlighting.
 * It is used for displaying AI or user-generated markdown responses inside the chat UI.
 * Built on top of `react-markdown`, it replaces default elements with styled Tailwind components
 * and integrates a custom `SyntaxHighlighter` for code blocks.
 *
 * Key Features:
 * - Custom renderers for markdown elements (headings, lists, code, blockquotes, etc.)
 * - Automatic language detection and syntax highlighting for fenced code blocks
 * - Inline code rendering with visual enhancements
 * - Dark theme support for code blocks and consistent text styling
 * - Used as part of `ChatMessage` to render assistant replies
 *
 * Props:
 * - `markdownContent` (string): The markdown text to be parsed and displayed
 *
 * Dependencies:
 * - `react-markdown` for markdown parsing
 * - `SyntaxHighlighter` (custom component)
 * - TailwindCSS for styling and layout
 *
 * Path: //GPT/gptcore/client/src/components/MarkdownViewerChat.jsx
 */
