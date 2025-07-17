// src/helpers/messageHelpers.js

/**
 * Creates a sanitized version of message history for API requests
 * Only includes text content and roles, not audio buffers or large data
 * @param {Array} messages - The current message history
 * @returns {Array} - Cleaned message history safe for API requests
 */
export const sanitizeMessageHistory = (messages) => {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map(message => {
      // Create a base message with role
      const sanitizedMessage = { 
        role: message.role
      };
      
      // Handle different content formats
      if (Array.isArray(message.content)) {
        // For array content, extract only the text items
        const textItem = message.content.find(item => item.type === 'text');
        sanitizedMessage.content = textItem ? textItem.text : '';
      } else if (typeof message.content === 'string') {
        // Simple string content, keep as is
        sanitizedMessage.content = message.content;
      } else if (message.content && typeof message.content === 'object') {
        // For other object types, convert to string or empty
        sanitizedMessage.content = String(message.content) || '';
      } else {
        // Fallback for any other format
        sanitizedMessage.content = '';
      }
      
      return sanitizedMessage;
    });
  };

/**
 * messageHelpers.js
 *
 * 📦 Location:
 * //src/helpers/messageHelpers.js
 *
 * 🧠 Purpose:
 * This file provides utility functions to process the message history
 * before sending it to the API. Its main function is to remove irrelevant
 * or heavy data such as audio blobs or complex structures that may cause
 * errors or slow down the request.
 *
 * 📌 Main Function:
 * @function sanitizeMessageHistory
 * Creates a clean version of the message history that contains only:
 * - The sender’s role (`user`, `assistant`, etc.).
 * - The plain text (`content`) of the messages, excluding blobs, buffers, or multimedia elements.
 *
 * @param {Array<Object>} messages - Full chat message history; may include strings, arrays, or blobs.
 * @returns {Array<Object>} messages - Sanitized history in the format `{ role, content }`.
 *
 * 🧪 Example Input:
 * ```js
 * [
 *   { role: "user", content: "Hello" },
 *   { role: "assistant", content: [{ type: "text", text: "Hi!" }, { type: "audio", text: "..." }] },
 *   { role: "user", content: { type: "blob", data: Uint8Array(...) } }
 * ]
 * ```
 *
 * 🧪 Example Output:
 * ```js
 * [
 *   { role: "user", content: "Hello" },
 *   { role: "assistant", content: "Hi!" },
 *   { role: "user", content: "[object Object]" } // if unrecognizable, converted to string
 * ]
 * ```
 *
 * 🔐 Security:
 * - Ensures the message history sent to the API does not contain audio blobs or binary content.
 * - Improves stability when making requests to OpenAI or other models.
 *
 * 🧩 Dependencies:
 * - No external dependencies required.
 *
 * 🧩 Recommended Usage:
 * This helper should be used right before constructing a `chat`-type request body.
 *
 * 📤 Export:
 * - sanitizeMessageHistory
 */
