/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/components/ArtiFactPanel.jsx

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
      {/* Header */}
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

      {/* Artifact Selector */}
      {artifactCollection.length > 0 && (
        <div className="mb-2">
          <ArtifactSelector
            artifacts={artifactCollection}
            onSelect={setCurrentArtifact}
            currentArtifactId={currentArtifact?.id}
          />
        </div>
      )}

      {/* Artifact Viewer */}
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
 * A flexible side panel UI for viewing and managing AI-generated code artifacts.
 * Part of the CodeWithCanvas experience, it displays a scrollable list of selectable artifacts
 * and renders the selected file’s content using `ArtifactDisplay`.
 * 
 * Key Features:
 * - Toggleable visibility and resizable container
 * - Integrates artifact selection via `ArtifactSelector`
 * - Full content display for selected code output
 * - Buttons to close the panel and clear all saved artifacts
 * 
 * Props:
 * - `isArtifactPanelOpen` (boolean): Controls visibility of the panel
 * - `setIsArtifactPanelOpen` (function): Callback to toggle visibility
 * - `artifactCollection` (array): List of saved artifacts to render
 * - `clearAllArtifacts` (function): Clears all artifacts from state
 * - `currentArtifact` (object): Currently selected artifact to display
 * - `setCurrentArtifact` (function): Updates the selected artifact
 * 
 * Dependencies:
 * - `lucide-react` icons (X, Trash2)
 * - TailwindCSS for layout and styling
 * - Custom components: `ArtifactSelector`, `ArtifactDisplay`
 * 
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/components/ArtiFactPanel.jsx
 */
