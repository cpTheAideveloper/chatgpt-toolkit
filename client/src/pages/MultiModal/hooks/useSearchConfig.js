// src/hooks/useSearchConfig.js
import { useState } from "react";

export const useSearchConfig = (
  initialSearchSystemInstructions = "You are a helpful assistant...",
  initialSearchSize = "medium"
) => {
  const [searchSystemInstructions, setSearchSystemInstructions] = useState(
    initialSearchSystemInstructions
  );
  const [searchSize, setSearchSize] = useState(initialSearchSize);

  return {
    searchSystemInstructions,
    setSearchSystemInstructions,
    searchSize,
    setSearchSize,
  };
};

/**
 * useSearchConfig.js
 *
 * 📦 Location:
 * //src/hooks/useSearchConfig.js
 *
 * 🧠 Purpose:
 * Manages configuration related to the AI's web search capabilities, including system instructions and search depth.
 *
 * 🔁 Hook: `useSearchConfig`
 *
 * @param {string} initialSearchSystemInstructions - Default system prompt for guiding search behavior.
 * @param {string} initialSearchSize - Default search depth setting (e.g., "low", "medium", "high").
 *
 * @returns {{
*   searchSystemInstructions: string,
*   setSearchSystemInstructions: Function,
*   searchSize: string,
*   setSearchSize: Function
* }}
*
* 📌 State:
* - `searchSystemInstructions`: Text used to instruct the AI how to handle and present search results.
* - `searchSize`: Indicates how deep or broad the AI should search ("low", "medium", or "high").
*
* 💡 Notes:
* - This hook is used when the `SEARCH` mode is active, and the user wants to customize search behavior.
* - Default values can be overridden at the provider level or during initialization.
*/
