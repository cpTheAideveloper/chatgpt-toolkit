// src/hooks/useModeManager.js
import { useState, useEffect, useRef } from "react";
import { MODES } from "../constants/chatConstants";

export const useModeManager = () => {
  const [activeMode, setActiveMode] = useState(MODES.NORMAL);
  const activeModeRef = useRef(activeMode);

  // Keep the ref updated
  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  // Mode toggle functions
  const toggleSearchMode = () => {
    setActiveMode(prev => prev === MODES.SEARCH ? MODES.NORMAL : MODES.SEARCH);
  };

  const toggleCodeMode = () => {
    setActiveMode(prev => prev === MODES.CODE ? MODES.NORMAL : MODES.CODE);
  };
  
  const toggleAudioMode = () => {
    setActiveMode(prev => prev === MODES.AUDIO ? MODES.NORMAL : MODES.AUDIO);
  };

  // Computed properties for convenience / backward compatibility
  const isSearchMode = activeMode === MODES.SEARCH;
  const codeMode = activeMode === MODES.CODE;
  const audioMode = activeMode === MODES.AUDIO;

  const resetMode = () => {
    setActiveMode(MODES.NORMAL);
  };

  return {
    activeMode, 
    setActiveMode,
    activeModeRef,
    MODES,
    toggleSearchMode,
    toggleCodeMode,
    toggleAudioMode,
    isSearchMode,
    codeMode,
    audioMode,
    resetMode,
  };
};

/**
 * useModeManager.js
 *
 * 📦 Location:
 * //src/hooks/useModeManager.js
 *
 * 🧠 Purpose:
 * Centralized hook to manage the current interaction mode of the chat (e.g., normal, search, code, audio, file).
 * Provides toggles and state references for easy access across components.
 *
 * 🔁 Hook: `useModeManager`
 *
 * @returns {{
*   activeMode: string,
*   setActiveMode: Function,
*   activeModeRef: RefObject<string>,
*   MODES: Object,
*   toggleSearchMode: Function,
*   toggleCodeMode: Function,
*   toggleAudioMode: Function,
*   isSearchMode: boolean,
*   codeMode: boolean,
*   audioMode: boolean,
*   resetMode: Function
* }}
*
* 📌 State:
* - `activeMode`: Current interaction mode (from `MODES` enum).
* - `activeModeRef`: Mutable reference to current mode, for use in async calls and effects.
*
* 🎛️ Mode Toggles:
* - `toggleSearchMode()`: Toggle between `SEARCH` and `NORMAL`.
* - `toggleCodeMode()`: Toggle between `CODE` and `NORMAL`.
* - `toggleAudioMode()`: Toggle between `AUDIO` and `NORMAL`.
*
* 🧩 Computed Booleans:
* - `isSearchMode`: `true` if current mode is `SEARCH`.
* - `codeMode`: `true` if current mode is `CODE`.
* - `audioMode`: `true` if current mode is `AUDIO`.
*
* 🧹 Utility:
* - `resetMode()`: Resets mode back to `NORMAL`.
*
* 💡 Notes:
* - `activeModeRef` is used in other hooks/components to access the most recent mode value safely inside asynchronous or streaming operations.
* - `MODES` constant must be imported from `chatConstants` and defines valid mode strings (e.g., `NORMAL`, `SEARCH`, `FILE`, `AUDIO`, `CODE`).
*/
