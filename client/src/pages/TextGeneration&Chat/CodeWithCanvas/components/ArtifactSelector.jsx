/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/components/ArtifactSelector.jsx

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const ArtifactSelector = ({ artifacts, onSelect, currentArtifactId }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  if (!artifacts || artifacts.length === 0) return null;
  
  return (
    <div className="relative z-10">
      <div className="flex items-center mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mr-2 text-gray-600 hover:text-gray-900 focus:outline-none flex items-center"
          aria-label={isCollapsed ? "Expand file list" : "Collapse file list"}
        >
          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <span className="text-sm font-medium ml-1">Saved Code ({artifacts.length})</span>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="absolute top-8 left-0 right-0 bg-white z-20 shadow-lg rounded-md border border-gray-200 transition-all duration-300 overflow-hidden max-h-64 overflow-y-auto">
          <div className="space-y-1 p-2">
            {artifacts.map((artifact, index) => (
              <div 
                key={artifact.id}
                onClick={() => {
                  onSelect(artifact);
                  setIsCollapsed(true);
                }}
                className={`p-2 rounded cursor-pointer flex items-center ${
                  artifact.id === currentArtifactId 
                    ? 'bg-blue-100 border-l-4 border-blue-500 pl-1' 
                    : 'hover:bg-gray-100 border-l-4 border-transparent pl-1'
                }`}
              >
                <FileText size={16} className="mr-2 text-gray-600" />
                <span className="text-sm truncate">{artifact.title || `Code ${index + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactSelector;

/**
 * ArtifactSelector.jsx
 * 
 * A compact dropdown UI component for selecting saved code artifacts within the Code Canvas experience.
 * This component provides a collapsible menu where users can quickly switch between multiple generated code artifacts.
 * 
 * Key Features:
 * - Collapsible file selector with transition effects
 * - Visual highlight for the currently selected artifact
 * - Scrollable dropdown for long artifact lists
 * - Truncates long titles and supports fallback naming (e.g. "Code 1", "Code 2", ...)
 * 
 * Props:
 * - `artifacts` (Array): List of artifact objects with `id`, `title`, and `content`
 * - `onSelect` (Function): Callback triggered when a user selects an artifact
 * - `currentArtifactId` (String|Number): ID of the currently selected artifact for highlighting
 * 
 * Dependencies:
 * - `lucide-react` icons for file and toggles
 * - TailwindCSS for styling and transitions
 * 
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/components/ArtifactSelector.jsx
 */
