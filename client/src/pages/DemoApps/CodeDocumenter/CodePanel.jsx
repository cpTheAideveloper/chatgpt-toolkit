/* eslint-disable react/prop-types */
// src/pages/CodeDocumenter/components/CodePanel.jsx
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import MarkdownViewerChat from "@/components/MarkdownViewerChat";

export function CodePanel({ code, filename }) {
  const [copied, setCopied] = useState(false);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };
  
  // Get language for syntax highlighting based on file extension
  const getLanguage = () => {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      // Add more mappings as needed
    };
    return langMap[ext] || 'plaintext';
  };
  
  // Create markdown content with code fence
  const createMarkdown = () => {
    const language = getLanguage();
    return `\`\`\`${language}\n${code}\n\`\`\``;
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
        <div className="font-medium text-gray-700">
          {filename} <span className="text-xs text-gray-500">(Original Code)</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
      
      {/* Code content using MarkdownViewerChat */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <MarkdownViewerChat markdownContent={createMarkdown()} />
      </div>
    </div>
  );
}

/**
 * CodePanel.jsx
 * 
 * Component for displaying code files with syntax highlighting in the CodeDocumenter.
 * Integrates with the MarkdownViewerChat component to leverage its syntax highlighting
 * capabilities.
 * 
 * Features:
 * - Language detection based on file extension
 * - Syntax highlighting via MarkdownViewerChat
 * - Copy to clipboard functionality
 * - Visual feedback when code is copied
 * 
 * Props:
 * - code: String containing the code to display
 * - filename: Name of the file (used for language detection and display)
 * 
 * Dependencies:
 * - MarkdownViewerChat for rendering code with syntax highlighting
 * - lucide-react for icons
 */