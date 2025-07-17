import { useState, useCallback } from "react";
import { X, Settings } from "lucide-react";
import { useChatContext } from "../context/ChatContext";

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
export function ChatSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    model,
    setModel,
    instructions,
    setInstructions,
    temperature,
    setTemperature,
    resetConversation,
    clearMessages,
  } = useChatContext();

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all settings to default and clear the conversation?")) {
      setModel("gpt-4o-mini");
      setInstructions("");
      setTemperature(0.7);
      resetConversation();
      setIsOpen(false);
    }
  }, [setModel, setInstructions, setTemperature, resetConversation]);

  const handleClearMessages = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      clearMessages();
      setIsOpen(false);
    }
  }, [clearMessages]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-green-600"
        title="Settings"
        aria-label="Open settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div
            className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close settings"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-gray-800">Chat Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-green-500"
                >
                  {MODEL_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Enter instructions for the AI (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Custom instructions guide AI responses
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {temperature}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Precise</span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer accent-green-600"
                  />
                  <span className="text-xs text-gray-500">Creative</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Lower: predictable, Higher: creative
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleClearMessages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      Clear Messages
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm border border-red-300 rounded-lg hover:bg-red-50 text-red-700"
                    >
                      Reset All
                    </button>
                  </div>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * ChatSettings.jsx
 *
 * ⚙️ Purpose:
 * - Provides a modal interface for users to adjust chat configuration settings,
 *   including model selection, system instructions, temperature, and message history.
 *
 * 🧩 Props: None (uses context via `useChatContext`)
 *
 * 🧠 Context Dependencies (from ChatContext):
 * - `model`: Current AI model string (e.g., gpt-4o-mini).
 * - `setModel`: Updates the selected model.
 * - `instructions`: System prompt/instructions for the assistant.
 * - `setInstructions`: Updates the system instructions.
 * - `temperature`: Controls randomness of responses (0–2).
 * - `setTemperature`: Updates temperature setting.
 * - `resetConversation`: Clears messages and resets chat configuration.
 * - `clearMessages`: Clears only the chat messages.
 *
 * 💡 Logic:
 * - Clicking the settings icon (`Settings`) opens a modal.
 * - Provides dropdown to switch AI models (`MODEL_OPTIONS`).
 * - Provides a textarea for system instructions.
 * - Includes a temperature slider (0–2).
 * - Allows users to:
 *   - Clear all messages.
 *   - Reset all settings to defaults.
 *   - Close the settings modal.
 *
 * 🎨 UI:
 * - Responsive modal centered on screen with backdrop blur.
 * - Styled using TailwindCSS.
 * - Color cues for danger (`Reset`) and primary (`Close`, `Apply`).
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/components/ChatSettings.jsx
 *
 * 📌 Notes:
 * - System instructions are optional but affect assistant behavior.
 * - Temperature should remain between 0 and 2.
 * - Resets will revert to model: 'gpt-4o-mini', temp: 0.7, and empty instructions.
 */
