/* eslint-disable react/prop-types */
import { X, Trash2 } from 'lucide-react';
import { ArtifactSelector } from './ArtifactSelector';
import { ArtifactDisplay } from './ArtifactDisplay';

export const ArtifactPanel = ({
  isArtifactPanelOpen,
  setIsArtifactPanelOpen,
  artifactCollection,
  clearAllArtifacts,
  currentArtifact,
  setCurrentArtifact,
}) => {
  if (!isArtifactPanelOpen) return null;
  
  return (
    <div className="flex-1 bg-white border-l border-black/10 p-4 flex flex-col h-full overflow-hidden relative resize-x min-w-[300px] max-w-[800px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Files</h2>
        <div className="flex items-center space-x-2">
          {artifactCollection.length > 0 && (
            <button
              onClick={clearAllArtifacts}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
              title="Clear All"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={() => setIsArtifactPanelOpen(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Selector at the top before the main content */}
      {artifactCollection.length > 0 && (
        <div className="mb-2">
          <ArtifactSelector
            artifacts={artifactCollection}
            onSelect={setCurrentArtifact}
            currentArtifactId={currentArtifact?.id}
          />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 h-full overflow-auto">
        {currentArtifact && (
          <ArtifactDisplay artifact={currentArtifact} />
        )}
      </div>
    </div>
  );
};

export default ArtifactPanel;

/**
 * ArtifactPanel.jsx
 *
 * 📂 Location:
 * //components/ArtifactPanel.jsx
 *
 * 📋 Component Purpose:
 * Provides a sidebar-style panel to manage and view code artifacts. 
 * Allows users to select, view, and clear artifacts, typically code outputs or file results from an AI assistant or coding session.
 *
 * 🧩 Props:
 * @prop {boolean} isArtifactPanelOpen - Controls whether the panel is visible.
 * @prop {Function} setIsArtifactPanelOpen - Function to toggle the panel's visibility.
 * @prop {Array<Object>} artifactCollection - Array of artifact objects to list and display.
 * @prop {Function} clearAllArtifacts - Callback to remove all artifacts from the collection.
 * @prop {Object} currentArtifact - Currently selected artifact for preview.
 * @prop {Function} setCurrentArtifact - Function to set the selected artifact from the list.
 *
 * 🎨 Layout & Design:
 * - Right-side panel with resizable width (`resize-x`).
 * - Min width: 300px / Max width: 800px.
 * - Flex column layout with header, selector, and display.
 * - Uses Tailwind for border, spacing, and scrollable sections.
 *
 * 🧠 Behavior:
 * - Panel only renders if `isArtifactPanelOpen` is true.
 * - Top bar includes a "Clear All" (Trash) and "Close" (X) button.
 * - Displays a selector (`ArtifactSelector`) for switching between artifacts.
 * - Main area renders `ArtifactDisplay` for currently selected file.
 *
 * 🔁 Lifecycle:
 * - Pure functional component; re-renders on prop/state change.
 *
 * 🧩 Subcomponents Used:
 * - `ArtifactSelector`: Dropdown/list component to choose an artifact.
 * - `ArtifactDisplay`: Syntax-highlighted content preview area.
 *
 * 🛠️ Usage Notes:
 * - Ideal for developer tools, AI assistant interfaces, or file viewers.
 * - To fully function, the `artifactCollection` should include a consistent `id` property on each artifact.
 */
