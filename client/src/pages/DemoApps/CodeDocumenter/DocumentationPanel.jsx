/* eslint-disable react/prop-types */
// /client/src/pages/DemoApps/CodeDocumenter/DocumentationPanel.jsx
import { useState, useEffect } from "react";
import { Copy, Check, Download } from "lucide-react";

export function DocumentationPanel({ documentation, filename }) {
  const [copied, setCopied] = useState(false);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Copy documentation to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentation);
    setCopied(true);
  };
  
  // Download documentation as markdown
  const downloadMarkdown = () => {
    const element = document.createElement("a");
    const content = documentation;
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    
    // Generate a filename without the original extension
    const baseFilename = filename.split('.').slice(0, -1).join('.');
    element.download = `${baseFilename}-documentation.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
        <div className="font-medium text-gray-700">
          {filename} <span className="text-xs text-gray-500">(Documentation)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <button
            onClick={downloadMarkdown}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
            title="Download as Markdown"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      {/* Documentation content */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        <div className="prose prose-sm max-w-none">
          {/* Render documentation as HTML for better formatting */}
          <div dangerouslySetInnerHTML={{ __html: documentation.replace(/\n/g, '<br>') }} />
        </div>
      </div>
    </div>
  );
}
