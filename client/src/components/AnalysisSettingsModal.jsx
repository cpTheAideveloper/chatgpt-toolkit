/* eslint-disable react/prop-types */

import { X } from "lucide-react";

export const AnalysisSettingsModal = ({
  isOpen,
  onClose,
  title = "Analysis Settings",
  model,
  setModel,
  systemInstructions,
  setSystemInstructions,
  onSave,
  onCancel
}) => {
  // If modal is not open, render nothing
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300" />
      
      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 transform transition-all duration-300 animate-in zoom-in-95 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="gpt-4o">GPT-4o (Most capable)</option>
              <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
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
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 dark:text-white"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Instructions that guide how the AI analyzes and responds to your file.
            </p>
          </div>
        </div>
        
        {/* Footer (Buttons) */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onCancel || onClose}
            className="px-4 py-2 mr-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AnalysisSettingsModal.jsx
 *
 * This component renders a customizable modal dialog for adjusting AI analysis settings.
 * It allows the user to select an AI model and set system instructions that guide the model's behavior.
 * This modal is intended to be reused in any workflow that supports user-configurable prompt behavior.
 * 
 * Key Features:
 * - Controlled visibility via `isOpen` prop
 * - Model selection dropdown (supports GPT-4o, GPT-4o Mini, GPT-3.5 Turbo)
 * - System instruction textarea input
 * - Responsive and accessible layout with dark mode support
 * - Modal can be closed by clicking outside or pressing the close button
 * - Fully themeable with Tailwind CSS
 * 
 * Props:
 * - `isOpen` (boolean): Whether the modal is visible
 * - `onClose` (function): Callback to close the modal
 * - `title` (string): Custom title text (default: "Analysis Settings")
 * - `model`, `setModel`: Current model and setter for two-way binding
 * - `systemInstructions`, `setSystemInstructions`: Current system message and setter
 * - `onSave` (function): Callback for Save button
 * - `onCancel` (function): Optional callback for Cancel (defaults to `onClose`)
 * 
 * Dependencies:
 * - `lucide-react` (X icon)
 * - TailwindCSS for styling and animation
 * 
 * Path: //GPT/gptcore/client/src/components/AnalysisSettingsModal.jsx
 */
