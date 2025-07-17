/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/components/ChatSettings.jsx
import { useCallback } from "react";
import { X } from "lucide-react";

// Define model options as a constant outside the component
const MODEL_OPTIONS = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { value: "gpt-4.1", label: "GPT-4.1 Latest" },
  { value: "chatgpt-4o-latest", label: "GPT-4o" },
  { value: "o1-mini", label: "o1-mini" },
  { value: "o3-mini", label: "o3-mini" },
  { value: "o4-mini", label: "o4-mini" },
  { value: "o1", label: "o1" },
  { value: "o3", label: "o3" },
  { value: "o1-pro", label: "o1-pro" },
];

export function ChatSettings({ 
  onClose = () => {},           // Callback when settings are closed
  isOpen = false,               // Control visibility from parent component
  setIsOpen = () => {},         // Allow parent to control visibility
  model = "gpt-4o-mini",        // Model setting from parent
  setModel = () => {},          // Update model in parent
  instructions = "",            // Instructions from parent
  setInstructions = () => {},   // Update instructions in parent
  temperature = 0.7,            // Temperature from parent
  setTemperature = () => {},    // Update temperature in parent
  clearMessages = () => {},     // Clear messages function from parent
  resetConversation = () => {}  // Reset everything function from parent
}) {
  // Handlers
  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose();
  }, [setIsOpen, onClose]);

  const handleClearMessages = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      clearMessages();
      setIsOpen(false);
    }
  }, [clearMessages, setIsOpen]);

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all settings to default and clear the conversation?")) {
      resetConversation();
      setIsOpen(false);
    }
  }, [resetConversation, setIsOpen]);

  // Only render if modal is open
  if (!isOpen) {
    return null; // Return nothing if not open
  }

  // Render the modal when open
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close settings"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Chat Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
            >
              {MODEL_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Enter instructions for the AI (optional)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Custom instructions guide AI responses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature: {temperature}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Precise</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer accent-green-600"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Creative</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lower: predictable, Higher: creative
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleClearMessages}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Clear Messages
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
                >
                  Reset Settings
                </button>
              </div>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}