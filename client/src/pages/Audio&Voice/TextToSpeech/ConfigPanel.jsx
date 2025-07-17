/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/ConfigPanel.jsx
export function ConfigPanel({
    configOpen,
    voices,
    models,
    selectedVoice,
    setSelectedVoice,
    selectedModel,
    setSelectedModel,
    speedValue,
    setSpeedValue,
    instructions,
    setInstructions,
    predefinedInstructions,
  }) {
    if (!configOpen) return null;
  
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Speed Slider */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speed: {speedValue}x
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs">0.25</span>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.05"
                value={speedValue}
                onChange={(e) => setSpeedValue(e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs">4.0</span>
            </div>
          </div>
  
          {/* Instructions */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <select
              className="w-full p-2 mb-2 bg-white border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setInstructions(e.target.value);
                }
              }}
              value={
                predefinedInstructions.includes(instructions)
                  ? instructions
                  : "custom"
              }
            >
              {predefinedInstructions.map((instruction, idx) => (
                <option key={idx} value={instruction}>
                  {instruction.length > 50
                    ? instruction.substring(0, 47) + "..."
                    : instruction}
                </option>
              ))}
              <option value="custom">Custom instructions...</option>
            </select>
  
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Add custom instructions for voice generation..."
              className="w-full p-2 h-20 bg-white border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500
                text-gray-700 placeholder-gray-400 resize-none"
            />
          </div>
        </div>
      </div>
    );
  }
  

  /**
 * ConfigPanel.jsx
 *
 * This component renders a collapsible configuration panel for selecting voice generation settings.
 * It includes dropdowns for voice and model selection, a speed adjustment slider, and a section for
 * predefined or custom generation instructions.
 *
 * 🧠 Features:
 * - Selectable voice and model from provided lists
 * - Adjustable speech speed via range input (0.25x to 4.0x)
 * - Predefined or custom instruction input for guiding the AI's speech style
 * - Responsive grid layout for improved usability
 *
 * 🔧 Props:
 * @param {boolean} configOpen - Controls the visibility of the config panel
 * @param {Array} voices - Array of available voice options { id, name }
 * @param {Array} models - Array of available model options { id, name }
 * @param {string} selectedVoice - Currently selected voice ID
 * @param {Function} setSelectedVoice - Setter for the selected voice
 * @param {string} selectedModel - Currently selected model ID
 * @param {Function} setSelectedModel - Setter for the selected model
 * @param {number|string} speedValue - Current speed setting (range 0.25 to 4.0)
 * @param {Function} setSpeedValue - Setter for adjusting the speech speed
 * @param {string} instructions - Current instruction string
 * @param {Function} setInstructions - Setter for the instruction string
 * @param {Array} predefinedInstructions - List of predefined voice instruction options
 *
 * 🧩 Usage Location:
 * - Used inside `TextToSpeech` page alongside `TextInputSection` and `AudioPlayer`
 *
 * 📁 Path:
 * //GPT/gptcore/client/src/pages/Audio&Voice/TextToSpeech/ConfigPanel.jsx
 */
