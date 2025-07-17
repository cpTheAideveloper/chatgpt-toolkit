/* eslint-disable react/prop-types */
// components/ArtifactSelector.jsx
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
 * 📂 Location:
 * //components/ArtifactSelector.jsx
 *
 * 📋 Component Purpose:
 * Provides a dropdown-like file selector that allows the user to choose from a list of saved code artifacts.
 * Useful for managing and previewing multiple code outputs in a developer tool or AI assistant interface.
 *
 * 🧩 Props:
 * @prop {Array<Object>} artifacts - Array of artifact objects to display in the selector. Each must have an `id` and optionally a `title`.
 * @prop {Function} onSelect - Callback function triggered when a user selects an artifact from the list.
 * @prop {string} currentArtifactId - The ID of the currently selected artifact, used for styling the active item.
 *
 * 🎨 UI & Design:
 * - Button toggles a dropdown panel showing the list of artifacts.
 * - Uses Tailwind CSS for spacing, hover, and active state styles.
 * - Highlights the currently selected artifact.
 * - Each item includes an icon (`FileText`) and a title or fallback label.
 * - Max height of dropdown is constrained for scrollability.
 *
 * 🧠 Behavior:
 * - Maintains internal state (`isCollapsed`) to toggle visibility of the dropdown.
 * - When an artifact is clicked:
 *   - `onSelect` is called with the selected artifact.
 *   - Dropdown is automatically collapsed.
 *
 * 🛠️ Notes:
 * - `artifacts` must contain unique `id` values to work properly.
 * - Accessible label toggles are included for screen readers.
 *
 * 🔁 Lifecycle:
 * - Pure functional component using React `useState`.
 */
