/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/TextInputSection.jsx
import { Type, Settings, ChevronDown, Volume2 } from "lucide-react";

export function TextInputSection({
  userInput,
  onInputChange,
  characterCount,
  loading,
  onGenerate,
  configOpen,
  onToggleConfig,
  isGenerateDisabled,
}) {
  return (
    <div>
      {/* Text Input */}
      <div className="relative">
        <div className="absolute top-4 left-4">
          <Type size={20} className="text-gray-400" />
        </div>
        <textarea
          value={userInput}
          onChange={onInputChange}
          placeholder="Enter your text here..."
          className="w-full pl-12 pr-4 py-4 h-[250px] bg-gray-50 rounded-lg
            border border-gray-200 focus:border-green-500 focus:ring-2 
            focus:ring-green-100 outline-none resize-none
            text-gray-700 placeholder-gray-400"
        />
        <div className="absolute bottom-4 right-4 text-sm text-gray-400">
          {characterCount} characters
        </div>
      </div>

      {/* Config Toggle Button */}
      <div className="mt-6">
        <button
          onClick={onToggleConfig}
          className="w-full flex items-center justify-between py-3 px-4 rounded-lg
            bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors
            border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-500" />
            <span>Voice Configuration</span>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform ${
              configOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Generate Button */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={onGenerate}
          disabled={loading || isGenerateDisabled}
          className={`
            flex-1 py-3 px-4 rounded-lg font-medium
            flex items-center justify-center gap-2 transition-all duration-200
            ${
              loading || isGenerateDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }
          `}
        >
          <Volume2 size={20} />
          {loading ? "Generating..." : "Generate Speech"}
        </button>
      </div>
    </div>
  );
}

/**
 * TextInputSection.jsx
 * 
 * This component renders the primary user input interface for the Text-to-Speech feature.
 * It includes:
 * - A multiline `textarea` for entering the text to be spoken
 * - A dynamic character counter in the bottom right
 * - A button to toggle voice configuration settings
 * - A primary action button to trigger the speech generation
 *
 * 🧠 Features:
 * - Character count display in real time
 * - Disabled state for the Generate button when input is invalid or loading
 * - Expandable voice config toggle with icon animation
 *
 * 🔧 Props:
 * @param {string} userInput - The current text entered by the user
 * @param {function} onInputChange - Callback triggered on textarea input change
 * @param {number} characterCount - Number of characters typed
 * @param {boolean} loading - Whether the speech is currently being generated
 * @param {function} onGenerate - Function to initiate speech generation
 * @param {boolean} configOpen - Whether the voice config panel is open
 * @param {function} onToggleConfig - Function to toggle the config panel visibility
 * @param {boolean} isGenerateDisabled - Whether the generate button should be disabled
 *
 * 🧩 Usage Location:
 * - Used inside `TextToSpeech` page
 *
 * 📁 Path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/TextInputSection.jsx
 */
