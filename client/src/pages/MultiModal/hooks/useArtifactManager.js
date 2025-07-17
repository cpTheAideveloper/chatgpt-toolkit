// src/hooks/useArtifactManager.js
import { useState, useRef, useEffect } from "react";
import { getPartialMarkerMatch, extractStartMarkerInfo } from "../helpers/streamingHelpers";
import { MODES } from "../constants/chatConstants"; // Import MODES

export const useArtifactManager = (activeMode, onArtifactStart = null) => {
  const [showArtifactPanel, setShowArtifactPanel] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState(null);
  const [artifactCollection, setArtifactCollection] = useState([]);

  // Ref for actively streaming artifact
  const artifactRef = useRef({
    collecting: false,
    language: '',
    content: '',
    id: null
  });

  // Ref for accumulating text during streaming (used by processStreamChunk)
  const chatTextRef = useRef('');

  // Handle artifact panel visibility
  useEffect(() => {
    if (activeMode === MODES.CODE) {
      setShowArtifactPanel(true);
    } else if (artifactCollection.length === 0) {
      setShowArtifactPanel(false);
    }
  }, [activeMode, artifactCollection]);

  // Helper: finalize artifact
  const completeArtifact = (buffer, endPattern) => {
    const endIndex = buffer.indexOf(endPattern);
    const contentBeforeEnd = buffer.substring(0, endIndex);
    artifactRef.current.content += contentBeforeEnd;

    setArtifactCollection(prev =>
      prev.map(artifact =>
        artifact.id === artifactRef.current.id
          ? { ...artifact, content: artifactRef.current.content }
          : artifact
      )
    );

    artifactRef.current.collecting = false;
    return buffer.substring(endIndex + endPattern.length);
  };

  // Process chunk for artifacts
  const processStreamChunk = (chunk) => {
    console.log(`Received chunk: "${chunk}"`);
    let buffer = chatTextRef.current + chunk;

    // If code mode is not active (based on the mode when streaming *started*), skip processing
    // Note: This check relies on activeModeRef from useModeManager being passed or checked elsewhere
    // For simplicity here, we assume the caller (processStream) handles this mode check.

    const startPattern = '[CODE_START:';
    const endPattern = '[CODE_END]';

    if (artifactRef.current.collecting) {
      if (buffer.includes(endPattern)) {
        buffer = completeArtifact(buffer, endPattern);
        chatTextRef.current = buffer; // Store leftover buffer
        // Caller should update streaming message with the display text
        return { processedBuffer: buffer, displayUpdate: null, artifactUpdate: true };
      }

      const partialEndMatch = getPartialMarkerMatch(buffer, endPattern);
      if (partialEndMatch > 0) {
        const contentUpToMarker = buffer.substring(0, buffer.length - partialEndMatch);
        artifactRef.current.content += contentUpToMarker;

        setArtifactCollection(prev =>
            prev.map(artifact =>
                artifact.id === artifactRef.current.id
                ? { ...artifact, content: artifactRef.current.content }
                : artifact
            )
        );
        setCurrentArtifact(prev =>
          prev && prev.id === artifactRef.current.id
            ? { ...prev, content: artifactRef.current.content }
            : prev
        );

        chatTextRef.current = buffer.substring(buffer.length - partialEndMatch); // Store partial marker
         // Caller should update streaming message with the display text (which is just the partial marker)
        return { processedBuffer: chatTextRef.current, displayUpdate: chatTextRef.current, artifactUpdate: true };
      }

      artifactRef.current.content += chunk;
      setArtifactCollection(prev =>
        prev.map(artifact =>
          artifact.id === artifactRef.current.id
            ? { ...artifact, content: artifactRef.current.content }
            : artifact
        )
      );
      setCurrentArtifact(prev =>
        prev && prev.id === artifactRef.current.id
          ? { ...prev, content: artifactRef.current.content }
          : prev
      );

      chatTextRef.current = buffer; // Keep accumulating in ref
      // In collection mode, the main display buffer shouldn't usually update unless markers found
      return { processedBuffer: buffer, displayUpdate: null, artifactUpdate: true };
    }

    // Not collecting, look for start marker
    const markerInfo = extractStartMarkerInfo(buffer, startPattern);
    if (markerInfo) {
      const { startIndex, closingBracketIndex, language } = markerInfo;
      const textBeforeMarker = buffer.substring(0, startIndex);
      const displayText = textBeforeMarker + `[Code: ${language}]`;

      artifactRef.current = {
          collecting: true,
          language,
          content: '',
          id: Date.now()
      };

      const newArtifact = {
        id: artifactRef.current.id,
        type: 'code',
        language,
        content: '',
        title: `${language.charAt(0).toUpperCase() + language.slice(1)} Code`
      };
      setArtifactCollection(prev => [...prev, newArtifact]);
      setCurrentArtifact(newArtifact);
      setShowArtifactPanel(true);
      if (onArtifactStart) onArtifactStart();

      // Process content *after* the marker recursively (or iteratively in processStream)
      const remainingContent = buffer.substring(closingBracketIndex + 1);
      chatTextRef.current = ''; // Reset ref as we consumed the start part

      // Return text before, display hint, and remaining buffer part to process
      return {
          processedBuffer: remainingContent, // The part to potentially re-process
          displayUpdate: displayText,        // What to show in chat now
          artifactUpdate: true,
          startFound: true                // Signal that a start marker was found
      };

    }

    const partialStartMatch = getPartialMarkerMatch(buffer, startPattern);
    if (partialStartMatch > 0) {
      chatTextRef.current = buffer; // Store partial marker + preceding text
      return { processedBuffer: buffer, displayUpdate: buffer, artifactUpdate: false };
    }

    // Normal text
    chatTextRef.current = buffer;
    return { processedBuffer: buffer, displayUpdate: buffer, artifactUpdate: false };
  };

  const clearAllArtifacts = () => {
    setArtifactCollection([]);
    setCurrentArtifact(null);
    if (activeMode !== MODES.CODE) {
      setShowArtifactPanel(false);
    }
  };

  const resetArtifactState = () => {
      setArtifactCollection([]);
      setCurrentArtifact(null);
      setShowArtifactPanel(false);
      chatTextRef.current = '';
      artifactRef.current = { collecting: false, language: '', content: '', id: null };
  }

  return {
    showArtifactPanel, setShowArtifactPanel,
    currentArtifact, setCurrentArtifact,
    artifactCollection, setArtifactCollection,
    artifactRef, // Expose refs if needed by provider logic
    chatTextRef,
    processStreamChunk, // Expose the core processing logic
    clearAllArtifacts,
    resetArtifactState,
  };
};

/**
 * useArtifactManager.js
 *
 * 📦 Location:
 * //src/hooks/useArtifactManager.js
 *
 * 🧠 Purpose:
 * This custom React hook manages the lifecycle of "code artifacts" extracted from streamed AI responses.
 * It detects start and end markers in streamed text to capture code blocks, manage artifact state,
 * and update the UI accordingly—especially useful in code generation or developer assistant modes.
 *
 * 🔁 Hook: `useArtifactManager`
 *
 * @param {string} activeMode - The current interaction mode (e.g., text, code, search).
 * @param {function|null} onArtifactStart - Optional callback when a new artifact collection begins.
 * @returns {{
*   showArtifactPanel: boolean,
*   setShowArtifactPanel: Function,
*   currentArtifact: object|null,
*   setCurrentArtifact: Function,
*   artifactCollection: object[],
*   setArtifactCollection: Function,
*   artifactRef: React.MutableRefObject,
*   chatTextRef: React.MutableRefObject,
*   processStreamChunk: Function,
*   clearAllArtifacts: Function,
*   resetArtifactState: Function
* }}
*
* 🔍 Core Features:
*
* 1. 📥 `processStreamChunk(chunk)`
*    - Main function to parse a streaming text chunk.
*    - Detects `[CODE_START:language]` and `[CODE_END]` markers.
*    - Updates current artifact being collected and chat buffer accordingly.
*
*    @param {string} chunk - New string fragment from the streaming API.
*    @returns {{
*      processedBuffer: string,           // Remaining buffer to continue processing.
*      displayUpdate: string|null,        // Optional message to show in chat UI.
*      artifactUpdate: boolean,           // Whether an artifact was changed or added.
*      startFound?: boolean               // True if a new artifact was initialized.
*    }}
*
* 2. 🧹 `clearAllArtifacts()`
*    - Removes all saved artifacts and hides the panel (if not in CODE mode).
*
* 3. 🧼 `resetArtifactState()`
*    - Fully resets artifact tracking, content, and buffers.
*
* 📌 Internal Refs:
* - `artifactRef`: Tracks whether the hook is actively collecting an artifact and its content.
* - `chatTextRef`: Used to accumulate unprocessed or partial stream data between chunks.
*
* 🧩 Integration Notes:
* - Must be used within a system that handles `stream` updates and provides `activeMode`.
* - Designed to work closely with a panel (`ArtifactPanel`) for displaying saved code.
* - Use `MODES.CODE` to toggle behavior when artifacts should be collected.
*
* ✅ Benefits:
* - Enables real-time, multi-language code snippet extraction.
* - Tracks and stores full blocks of streamed content separately from chat.
* - Maintains clean UI updates by separating display logic from code artifacts.
*/
