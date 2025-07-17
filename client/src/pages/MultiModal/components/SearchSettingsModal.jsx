/* eslint-disable react/prop-types */
import { useState } from "react";
import { X, Settings } from "lucide-react";
import { useChatContext } from "../context/ChatContext";

export const SearchSettingsModal = () => {
  // Manage open/close state internally
  const [isOpen, setIsOpen] = useState(false);
  
  // Get settings directly from context
  const {
    searchSystemInstructions,
    setSearchSystemInstructions,
    searchSize,
    setSearchSize,
    model, 
    setModel, 
  } = useChatContext();

  const openModal = (e) => {
    if (e) e.stopPropagation();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  
  // If modal is not open, return just the button to open it
  if (!isOpen) {
    return (
      <button
        className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={openModal}
        aria-label="Search Settings"
        title="Search Settings"
      >
        <Settings size={20} />
      </button>
    );
  }
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      onClick={closeModal}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Search Settings</h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="chatgpt-4o-latest">ChatGPT-4o Latest</option>
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                System Instructions
              </label>
              <textarea
                value={searchSystemInstructions}
                onChange={(e) => setSearchSystemInstructions(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Instructions for how the AI should handle search results"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Instructions that control how the AI responds to your queries.
              </p>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
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
 * ⚙️ Purpose:
 * - Configuration modal to customize the behavior of the web search mode.
 * - Allows users to select the AI model, search depth, and set custom instructions.
 *
 * 🧩 Props:
 * - This component does not receive props directly. It uses the global `useChatContext` to manage state.
 *
 * 🧠 State from context:
 * - `model`: Language model used to generate responses.
 * - `searchSize`: Search depth level (low, medium, high).
 * - `searchSystemInstructions`: Instructions to guide the model during search mode.
 * - Methods: `setModel`, `setSearchSize`, `setSearchSystemInstructions`.
 *
 * 💡 Logic:
 * - Displayed when clicking the gear icon button (`<Settings />`).
 * - Contains three sections:
 *   1. Model selection (`GPT-4o Mini`, `ChatGPT-4o Latest`).
 *   2. Search depth level (`Low`, `Medium`, `High`).
 *   3. Custom system instructions (free-text input).
 * - The modal closes when clicking outside or the close button (`<X />`).
 *
 * 🎨 Design:
 * - Translucent background with `backdrop-blur` to emphasize the modal.
 * - Centered modal with soft shadows and responsive styling.
 * - Uses `dark:` classes for dark mode compatibility.
 *
 * 📌 File Location:
 * //GPT/gptcore/client/src/components/SearchSettingsModal.jsx
 *
 * 🛠️ Notes:
 * - The modal mounts and unmounts conditionally using the local `isOpen` state.
 * - Options may be expanded in the future with new models or advanced parameters.
 */
