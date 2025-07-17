// helpers/streamHelpers.js

/**
 * Returns the number of characters at the end of `buffer` that match the given `marker`.
 * Returns 0 if no partial match is found.
 */
export const getPartialMarkerMatch = (buffer, marker) => {
  for (let i = marker.length; i > 0; i--) {
    const partial = marker.substring(0, i);
    if (buffer.endsWith(partial)) {
      return i;
    }
  }
  return 0;
};

/**
 * Checks if a complete start marker exists in the buffer.
 * If found, returns an object with the start index, closing bracket index, and the extracted language.
 * Otherwise returns null.
 */
export const extractStartMarkerInfo = (buffer, startPattern) => {
  const startIndex = buffer.indexOf(startPattern);
  const closingBracketIndex = buffer.indexOf("]", startIndex + startPattern.length);
  if (closingBracketIndex !== -1) {
    const language = buffer.substring(startIndex + startPattern.length, closingBracketIndex);
    return { startIndex, closingBracketIndex, language };
  }
  return null;
};


/**
 * streamHelpers.js
 *
 * 📦 Location:
 * //helpers/streamHelpers.js
 *
 * 🧠 Purpose:
 * This module provides helper functions for analyzing streamed text in real time,
 * especially when processing responses from LLMs that contain special markers such as
 * [start:language] to indicate code sections.
 *
 * 🔍 Exported Functions:
 *
 * 1. 🔁 `getPartialMarkerMatch(buffer, marker)`
 *    - Checks whether the end of a text `buffer` partially matches a given marker.
 *    - Useful for detecting incomplete markers that may continue in the next stream chunk.
 *
 *    @param {string} buffer - Current accumulated text.
 *    @param {string} marker - Marker to detect (e.g., "[start:").
 *    @returns {number} Number of characters that match at the end of the buffer.
 *
 *    📤 Example:
 *    ```js
 *    getPartialMarkerMatch("This is a code [sta", "[start:") // => 5
 *    getPartialMarkerMatch("Unrelated text", "[start:")      // => 0
 *    ```
 *
 * 2. 📦 `extractStartMarkerInfo(buffer, startPattern)`
 *    - Searches the `buffer` for a complete start marker like "[start:js]".
 *    - If found, extracts the start and end positions of the marker and the language inside the brackets.
 *
 *    @param {string} buffer - Streamed text content.
 *    @param {string} startPattern - Start pattern to look for (e.g., "[start:").
 *    @returns {object|null} An object `{ startIndex, closingBracketIndex, language }` if found, or `null`.
 *
 *    📤 Example:
 *    ```js
 *    extractStartMarkerInfo("Some text [start:js] code here", "[start:")
 *    // => { startIndex: 10, closingBracketIndex: 18, language: "js" }
 *    ```
 *
 * 🧩 Recommended Usage:
 * These functions are used in stream processors to identify when
 * special sections begin, such as code blocks, embedded languages, or embedded instructions within text.
 *
 * ✅ Advantages:
 * - Helps handle streams that arrive in split parts.
 * - Improves accuracy when processing real-time generated text chunks.
 */
