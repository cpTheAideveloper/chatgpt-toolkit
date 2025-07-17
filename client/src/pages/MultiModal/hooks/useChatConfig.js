// src/hooks/useChatConfig.js
import { useState } from "react";

export const useChatConfig = (
  initialModel = "gpt-4o-mini",
  initialInstructions = "",
  initialTemperature = 0.7
) => {
  const [model, setModel] = useState(initialModel);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [temperature, setTemperature] = useState(initialTemperature);

  return {
    model,
    setModel,
    instructions,
    setInstructions,
    temperature,
    setTemperature,
  };
};


/**
 * useChatConfig.js
 *
 * 📦 Location:
 * //src/hooks/useChatConfig.js
 *
 * 🧠 Purpose:
 * This hook provides a simple stateful configuration manager for chat settings.
 * It handles the selected AI model, optional system instructions, and temperature (creativity level).
 *
 * 🔁 Hook: `useChatConfig`
 *
 * @param {string} initialModel - The default AI model to use (e.g., "gpt-4o-mini").
 * @param {string} initialInstructions - System-level instructions to guide AI behavior.
 * @param {number} initialTemperature - Controls randomness in AI responses (0 = deterministic, 2 = highly creative).
 *
 * @returns {{
*   model: string,
*   setModel: Function,
*   instructions: string,
*   setInstructions: Function,
*   temperature: number,
*   setTemperature: Function
* }}
*
* ⚙️ Configurable Properties:
* - `model`: The current model name (can be changed via dropdowns or settings).
* - `instructions`: Optional text that guides how the AI should behave globally.
* - `temperature`: Number between 0 and 2 that adjusts how creative or precise the responses should be.
*
* ✅ Use Cases:
* - Customizing a chat assistant's tone and behavior.
* - Allowing users to select models like GPT-4, Claude, etc.
* - Providing global system-level instructions across multiple user prompts.
*
* 💡 Notes:
* - Works independently and can be combined with mode/context managers or streaming hooks.
* - Used within the ChatProvider to persist user configuration across a session.
*/
