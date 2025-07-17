/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/components/SearchSettingsModal.jsx
import { X } from "lucide-react";

export const SearchSettingsModal = ({ 
  isOpen, 
  onClose, 
  title, 
  searchSize, 
  setSearchSize, 
  systemInstructions, 
  setSystemInstructions, 
  toggleSettings, 
  saveSettings 
}) => {
  // Early return if modal is not open
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Overlay - semi-transparent and allows background to be slightly visible */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300" />
      
      {/* Modal container with animation */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 transform transition-all duration-300 animate-in zoom-in-95 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            {/* Search Depth Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Depth
              </label>
              <select
                value={searchSize}
                onChange={(e) => setSearchSize(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low - Faster, less comprehensive</option>
                <option value="medium">Medium - Balanced search</option>
                <option value="high">High - Deep, comprehensive search</option>
              </select>
            </div>

            {/* System Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                System Instructions
              </label>
              <textarea
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Instructions that control how the AI responds to your queries.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-2">
              <button
                onClick={toggleSettings}
                className="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SearchSettingsModal.jsx
 * 
 * This component renders a modal dialog that allows users to configure advanced settings
 * for AI-based web search features. It supports dynamic adjustments of the search depth
 * and system instructions that guide the AI's behavior during queries.
 * 
 * Key Features:
 * - Configurable search depth levels (low, medium, high)
 * - System instruction textarea to guide AI responses
 * - Responsive modal design with smooth animations
 * - Dark mode compatibility
 * - Cancel and Save button controls with customizable callbacks
 * 
 * Props:
 * - `isOpen` (boolean): Whether the modal is visible
 * - `onClose` (function): Triggered when clicking outside or closing the modal
 * - `title` (string): Title text displayed in the modal header
 * - `searchSize` (string): Current search depth setting
 * - `setSearchSize` (function): Setter to update `searchSize`
 * - `systemInstructions` (string): AI behavior control instructions
 * - `setSystemInstructions` (function): Setter for system instructions
 * - `toggleSettings` (function): Triggered on cancel action
 * - `saveSettings` (function): Triggered on save action
 * 
 * Dependencies:
 * - `lucide-react` for icons (close button)
 * - TailwindCSS for layout, transitions, and theme support
 * 
 * Path: //GPT/gptcore/client/src/components/SearchSettingsModal.jsx
 */
