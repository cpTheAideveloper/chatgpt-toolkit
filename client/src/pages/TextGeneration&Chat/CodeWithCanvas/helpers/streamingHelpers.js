//GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/helpers/streamingHelpers.js

/**
 * Returns the number of characters at the end of `buffer` that match the given `marker`.
 * This is useful for detecting partial streaming markers across chunk boundaries.
 *
 * @param {string} buffer - The current buffer or chunk of streamed content.
 * @param {string} marker - The marker pattern to match, e.g., "[CODE_END]".
 * @returns {number} - Number of matching characters at the end of the buffer.
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
 * Checks if a complete start marker exists in the buffer and extracts its language tag.
 * Used to detect code block initiation patterns like "[CODE_START:js]".
 *
 * @param {string} buffer - The current text buffer from the stream.
 * @param {string} startPattern - Marker pattern to search for, e.g., "[CODE_START:".
 * @returns {object|null} - Object containing startIndex, closingBracketIndex, and language if matched; otherwise null.
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
 * streamingHelpers.js
 *
 * This utility module provides low-level helper functions to support the real-time parsing
 * of streamed data in `CodeWithCanvas`. It is specifically designed to manage fragmented
 * markers in Server-Sent Events (SSE) when parsing custom code delimiters such as
 * `[CODE_START:<language>]... [CODE_END]`.
 *
 * Key Features:
 * - Detects partial or complete marker patterns in streamed buffers
 * - Supports seamless code extraction across split or delayed SSE chunks
 * - Lightweight and stateless design, enabling direct use in custom hooks or render logic
 *
 * Used In:
 * - `useChatArtifact` hook for extracting and managing AI-generated code artifacts
 *
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/helpers/streamingHelpers.js
 */
