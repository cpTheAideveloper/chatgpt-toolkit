
### File Overview

- **File Path:** `src/hooks/useArtifactManager.js`
- **Purpose:** Manages the collection and display of code artifacts during a streaming session. It handles detecting start and end markers for code blocks, updating the artifact collection, and controlling the visibility of the artifact panel.

### Import Statements

```javascript
import { useState, useRef, useEffect } from "react";
import { getPartialMarkerMatch, extractStartMarkerInfo } from "../helpers/streamingHelpers";
import { MODES } from "../constants/chatConstants"; // Import MODES
```

- **`useState`, `useRef`, `useEffect`:** React hooks used for managing state, referencing mutable values, and performing side effects.
- **`getPartialMarkerMatch`, `extractStartMarkerInfo`:** Helper functions imported from `streamingHelpers.js` that assist in detecting specific patterns in the streaming text.
- **`MODES`:** An object containing different modes (e.g., `CODE` mode) imported from `chatConstants.js`.

### useArtifactManager Hook Definition

```javascript
export const useArtifactManager = (activeMode, onArtifactStart = null) => {
  // Hook implementation...
};
```

- **Purpose:** Defines a custom hook named `useArtifactManager` that takes two parameters:
  - **`activeMode`:** Represents the current mode (e.g., `CODE` mode).
  - **`onArtifactStart`:** An optional callback function that gets invoked when artifact collection starts.

### State Variables

```javascript
const [showArtifactPanel, setShowArtifactPanel] = useState(false);
const [currentArtifact, setCurrentArtifact] = useState(null);
const [artifactCollection, setArtifactCollection] = useState([]);
```

- **`showArtifactPanel`:** A boolean state that determines whether the artifact panel is visible.
  - **`useState(false)`:** Initializes the panel as hidden.
- **`currentArtifact`:** Holds the currently active artifact (e.g., the code snippet being collected).
  - **`useState(null)`:** Initially, there's no active artifact.
- **`artifactCollection`:** An array that stores all collected artifacts.
  - **`useState([])`:** Starts with an empty collection.

### Ref Variables

```javascript
const artifactRef = useRef({
  collecting: false,
  language: '',
  content: '',
  id: null
});

const chatTextRef = useRef('');
```

- **`artifactRef`:** A mutable reference that keeps track of the currently collecting artifact.
  - **Properties:**
    - **`collecting`:** Indicates if artifact collection is active.
    - **`language`:** The programming language of the artifact.
    - **`content`:** The content of the artifact.
    - **`id`:** A unique identifier for the artifact.
- **`chatTextRef`:** Accumulates incoming text chunks during streaming.

### useEffect for Artifact Panel Visibility

```javascript
useEffect(() => {
  if (activeMode === MODES.CODE) {
    setShowArtifactPanel(true);
  } else if (artifactCollection.length === 0) {
    setShowArtifactPanel(false);
  }
}, [activeMode, artifactCollection]);
```

- **Purpose:** Controls the visibility of the artifact panel based on the current mode and the presence of artifacts.
  - **If the `activeMode` is `CODE`,** the artifact panel is shown.
  - **If the `activeMode` is not `CODE`** and there are **no artifacts**, the panel is hidden.
- **Dependencies:**
  - **`activeMode`:** Triggers the effect when the mode changes.
  - **`artifactCollection`:** Triggers the effect when the collection changes.

### Helper Function: completeArtifact

```javascript
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
```

- **Purpose:** Finalizes the collection of an artifact when the end marker is detected.
- **Parameters:**
  - **`buffer`:** The current text buffer containing the artifact content.
  - **`endPattern`:** The pattern that signifies the end of the artifact (e.g., `[CODE_END]`).
- **Steps:**
  1. **Find the End Marker:** Locates the position of the `endPattern` in the buffer.
  2. **Extract Content Before End Marker:** Gets the text up to the end marker.
  3. **Update Artifact Content:** Appends the extracted content to the current artifact's content.
  4. **Update Artifact Collection:** Updates the artifact in the collection with the new content.
  5. **Stop Collecting:** Sets `collecting` to `false` to indicate that artifact collection has ended.
  6. **Return Remaining Buffer:** Returns the part of the buffer after the end marker for further processing.

### Main Function: processStreamChunk

```javascript
const processStreamChunk = (chunk) => {
  console.log(`Received chunk: "${chunk}"`);
  let buffer = chatTextRef.current + chunk;

  const startPattern = '[CODE_START:';
  const endPattern = '[CODE_END]';

  if (artifactRef.current.collecting) {
    // Handling when already collecting an artifact
    // ...
  }

  // Handling when not collecting
  // ...

  // Normal text processing
  // ...

  return { processedBuffer: buffer, displayUpdate: buffer, artifactUpdate: false };
};
```

- **Purpose:** Processes incoming text chunks to detect and manage artifacts.
- **Parameter:**
  - **`chunk`:** A piece of text received from the stream.
- **Steps:**
  1. **Log Incoming Chunk:** For debugging purposes.
  2. **Accumulate Buffer:** Combines the existing accumulated text with the new chunk.
  3. **Define Patterns:**
     - **`startPattern`:** Signifies the start of an artifact (e.g., `[CODE_START:javascript]`).
     - **`endPattern`:** Signifies the end of an artifact (`[CODE_END]`).

#### When Collecting an Artifact

```javascript
if (artifactRef.current.collecting) {
  if (buffer.includes(endPattern)) {
    buffer = completeArtifact(buffer, endPattern);
    chatTextRef.current = buffer; // Store leftover buffer
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
  return { processedBuffer: buffer, displayUpdate: null, artifactUpdate: true };
}
```

- **Scenario:** The hook is currently collecting an artifact.
- **Handling End of Artifact:**
  - **Check for End Marker:** If the `endPattern` is found in the buffer, `completeArtifact` is called to finalize the artifact.
  - **Update Buffer:** Stores any remaining text after the end marker.
  - **Return Value:** Indicates that an artifact update occurred.
- **Handling Partial End Marker:**
  - **`getPartialMarkerMatch`:** Checks if there's a partial match for the end marker at the end of the buffer.
  - **Update Content:** Adds the part of the buffer before the partial match to the current artifact.
  - **Update Collection and Current Artifact:** Reflects the updated content.
  - **Store Partial Marker:** Saves the incomplete marker in `chatTextRef`.
  - **Return Value:** Indicates an artifact update and provides the partial marker for display.
- **Handling Ongoing Collection:**
  - **Add Chunk to Content:** Appends the incoming chunk to the current artifact's content.
  - **Update Collection and Current Artifact:** Updates the stored artifact with the new content.
  - **Keep Accumulating:** Continues to accumulate text in `chatTextRef`.
  - **Return Value:** Indicates an artifact update without altering the display.

#### When Not Collecting an Artifact

```javascript
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

  const remainingContent = buffer.substring(closingBracketIndex + 1);
  chatTextRef.current = ''; // Reset ref as we consumed the start part

  return {
      processedBuffer: remainingContent,
      displayUpdate: displayText,
      artifactUpdate: true,
      startFound: true
  };
}

const partialStartMatch = getPartialMarkerMatch(buffer, startPattern);
if (partialStartMatch > 0) {
  chatTextRef.current = buffer; // Store partial marker + preceding text
  return { processedBuffer: buffer, displayUpdate: buffer, artifactUpdate: false };
}
```

- **Scenario:** The hook is not currently collecting an artifact.
- **Detect Start Marker:**
  - **`extractStartMarkerInfo`:** Searches for the `startPattern` in the buffer and extracts relevant information like the language.
  - **If a start marker is found:**
    - **Extract Information:** Gets the position of the marker and the specified language (e.g., `javascript`).
    - **Prepare Display Text:** Combines the text before the marker with a hint indicating a code block (e.g., `[Code: javascript]`).
    - **Initialize Artifact Collection:**
      - **`artifactRef.current`:** Sets `collecting` to `true` and initializes other properties.
      - **`newArtifact`:** Creates a new artifact object with an `id`, `type`, `language`, and `title`.
      - **Update States:**
        - **`artifactCollection`:** Adds the new artifact to the collection.
        - **`currentArtifact`:** Sets the new artifact as the current one.
        - **`showArtifactPanel`:** Ensures the artifact panel is visible.
    - **Callback Invocation:** If `onArtifactStart` is provided, it gets called.
    - **Handle Remaining Content:** Processes any text after the start marker.
    - **Reset Accumulated Text:** Clears `chatTextRef` as the start part is consumed.
    - **Return Value:** Provides the remaining buffer for further processing and indicates that a start marker was found.
- **Handle Partial Start Marker:**
  - **`getPartialMarkerMatch`:** Checks if there's a partial match for the start marker.
  - **Store Partial Marker:** Saves the incomplete marker in `chatTextRef`.
  - **Return Value:** Provides the buffer without updating artifacts.

#### Handling Normal Text

```javascript
chatTextRef.current = buffer;
return { processedBuffer: buffer, displayUpdate: buffer, artifactUpdate: false };
```

- **Scenario:** No markers are detected; the text is considered normal.
- **Action:** Updates the accumulated text with the current buffer.
- **Return Value:** Indicates no artifact updates and provides the buffer for display.

### Additional Helper Functions

#### clearAllArtifacts

```javascript
const clearAllArtifacts = () => {
  setArtifactCollection([]);
  setCurrentArtifact(null);
  if (activeMode !== MODES.CODE) {
    setShowArtifactPanel(false);
  }
};
```

- **Purpose:** Clears all collected artifacts and resets the current artifact.
- **Steps:**
  1. **Clear Collection:** Sets `artifactCollection` to an empty array.
  2. **Clear Current Artifact:** Sets `currentArtifact` to `null`.
  3. **Hide Panel if Not in CODE Mode:** If the active mode isn't `CODE`, hides the artifact panel.

#### resetArtifactState

```javascript
const resetArtifactState = () => {
  setArtifactCollection([]);
  setCurrentArtifact(null);
  setShowArtifactPanel(false);
  chatTextRef.current = '';
  artifactRef.current = { collecting: false, language: '', content: '', id: null };
};
```

- **Purpose:** Completely resets the artifact state, clearing all artifacts and accumulated text.
- **Steps:**
  1. **Clear Collection:** Sets `artifactCollection` to an empty array.
  2. **Clear Current Artifact:** Sets `currentArtifact` to `null`.
  3. **Hide Panel:** Sets `showArtifactPanel` to `false`.
  4. **Reset Accumulated Text:** Clears `chatTextRef`.
  5. **Reset Artifact Reference:** Sets `artifactRef` back to its initial state.

### Returned Object

```javascript
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
```

- **Purpose:** Exposes various states, references, and functions to components that use this hook.
- **Exposed Items:**
  - **States and Setters:**
    - `showArtifactPanel`, `setShowArtifactPanel`
    - `currentArtifact`, `setCurrentArtifact`
    - `artifactCollection`, `setArtifactCollection`
  - **Refs:**
    - `artifactRef`: Mutable reference for the current artifact.
    - `chatTextRef`: Mutable reference for accumulating text.
  - **Functions:**
    - `processStreamChunk`: Core function to process incoming text chunks.
    - `clearAllArtifacts`: Function to clear all artifacts.
    - `resetArtifactState`: Function to reset the entire artifact state.

### Summary

The `useArtifactManager` hook is a powerful tool for managing code artifacts within a streaming context. Here's a high-level summary of what it does:

1. **State Management:**
   - Controls the visibility of an artifact panel.
   - Keeps track of the current artifact being collected.
   - Maintains a collection of all artifacts.

2. **Artifact Detection:**
   - Detects start (`[CODE_START:language]`) and end (`[CODE_END]`) markers in incoming text chunks.
   - Starts and stops artifact collection based on these markers.

3. **Artifact Processing:**
   - Accumulates artifact content between start and end markers.
   - Updates the artifact collection with new artifacts.
   - Handles partial marker matches to ensure accurate detection.

4. **Utility Functions:**
   - Provides functions to clear and reset artifacts, giving components control over artifact management.

5. **Exposing Functionality:**
   - Returns state variables, references, and functions so that components using this hook can interact with and respond to artifact management as needed.

### Example Usage

Here's a simple example of how you might use the `useArtifactManager` hook within a React component:

```javascript
import React, { useEffect } from 'react';
import { useArtifactManager } from './hooks/useArtifactManager';
import { MODES } from './constants/chatConstants';

const ChatComponent = () => {
  const {
    showArtifactPanel,
    artifactCollection,
    processStreamChunk,
    clearAllArtifacts,
    resetArtifactState,
  } = useArtifactManager(MODES.CODE, () => {
    console.log('Artifact collection started!');
  });

  useEffect(() => {
    // Simulate receiving chunks of text
    const chunks = [
      "Hello! Here's some code:",
      "[CODE_START:javascript]",
      "console.log('Hello, world!');",
      "[CODE_END]",
      "Hope that helps!",
    ];

    chunks.forEach(chunk => {
      const result = processStreamChunk(chunk);
      // Handle the result as needed (e.g., update display)
      console.log(result);
    });
  }, [processStreamChunk]);

  return (
    <div>
      {showArtifactPanel && (
        <div className="artifact-panel">
          <h2>Collected Code Artifacts</h2>
          <ul>
            {artifactCollection.map(artifact => (
              <li key={artifact.id}>
                <h3>{artifact.title}</h3>
                <pre>{artifact.content}</pre>
              </li>
            ))}
          </ul>
          <button onClick={clearAllArtifacts}>Clear Artifacts</button>
        </div>
      )}
      {/* Rest of your chat component */}
    </div>
  );
};

export default ChatComponent;
```

- **Explanation:**
  - **Initialization:** The `useArtifactManager` is initialized with `MODES.CODE` and a callback that logs when artifact collection starts.
  - **Simulated Chunks:** An array of text chunks simulates incoming streaming data.
  - **Processing Chunks:** Each chunk is processed using `processStreamChunk`.
  - **Displaying Artifacts:** If `showArtifactPanel` is `true`, a panel displays all collected artifacts.
  - **Clearing Artifacts:** A button allows users to clear all collected artifacts.

This example demonstrates how the hook detects code blocks within incoming text, collects them as artifacts, and displays them in a panel. You can integrate similar logic into your application to manage and display artifacts effectively.