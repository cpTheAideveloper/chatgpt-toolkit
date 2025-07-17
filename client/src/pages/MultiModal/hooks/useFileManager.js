// src/hooks/useFileManager.js
import { useState, useEffect } from "react";
import { MODES } from "../constants/chatConstants"; // Import MODES

// Needs access to setActiveMode from useModeManager
export const useFileManager = (activeMode, setActiveMode) => {
  const [selectedFile, setSelectedFile] = useState(null);

  // Set the file mode when a file is selected
  useEffect(() => {
    if (selectedFile) {
      setActiveMode(MODES.FILE);
    } else if (activeMode === MODES.FILE) {
      // If file is cleared and we were in file mode, go back to normal
      setActiveMode(MODES.NORMAL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, setActiveMode]); // Dependency on activeMode removed to avoid loop, handled logic internally

  const clearSelectedFile = () => {
    setSelectedFile(null);
    // When clearing file, return to normal mode only if current mode IS file mode
    if (activeMode === MODES.FILE) {
        setActiveMode(MODES.NORMAL);
    }
  };

  return {
    selectedFile, setSelectedFile,
    clearSelectedFile,
  };
};

/**
 * useFileManager.js
 *
 * 📦 Location:
 * //src/hooks/useFileManager.js
 *
 * 🧠 Purpose:
 * Manages the file selected by the user for processing in the chat application. Automatically toggles
 * the chat mode to `FILE` when a file is uploaded and resets it to `NORMAL` when the file is cleared.
 *
 * 🔁 Hook: `useFileManager`
 *
 * @param {string} activeMode - The current mode of the chat (from `useModeManager`).
 * @param {Function} setActiveMode - Function to update the chat mode (from `useModeManager`).
 *
 * @returns {{
*   selectedFile: File | null,
*   setSelectedFile: Function,
*   clearSelectedFile: Function
* }}
*
* 🧩 State Managed:
* - `selectedFile`: The currently selected file (PDF, DOCX, etc.) for chat interaction.
*
* 🎯 Side Effects:
* - Automatically switches to `FILE` mode when a file is selected.
* - Automatically reverts to `NORMAL` mode when the file is cleared and the current mode is `FILE`.
*
* ✅ Use Cases:
* - Enables file-to-chat interactions (ask about file contents, summarize, etc.)
* - Keeps UI state in sync with file presence.
*
* 💡 Notes:
* - This hook is tightly coupled with `useModeManager` and expects the `MODES` enum to handle transitions.
* - Avoids redundant re-renders or mode toggling loops.
*/
