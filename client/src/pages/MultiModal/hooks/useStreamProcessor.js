// src/hooks/useStreamProcessor.js
export const useStreamProcessor = (
    chatTextRef,
    artifactRef,
    activeModeRef,
    setStreamingMessage,
    processStreamChunk
  ) => {
    const processStream = async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";
      
      // Save the current mode to ensure it persists
      const currentMode = activeModeRef.current;
      
      // Reset streaming state for this new message
      chatTextRef.current = '';
      artifactRef.current = { collecting: false, language: '', content: '', id: null };
    
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          try {
            // Handle SSE format (data: {...}) for code mode
            if (currentMode === 'code' || chunk.includes('data:')) {
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const eventData = line.substring(5).trim();
                  
                  // Check for the [DONE] marker
                  if (eventData === '[DONE]') {
                    console.log('Stream complete!');
                    continue;
                  }
                  
                  try {
                    const parsedData = JSON.parse(eventData);
                    
                    // Process content if available
                    if (parsedData.content) {
                      // Process the text chunk with artifact detection if in code mode
                      if (currentMode === 'code') {
                        const result = processStreamChunk(parsedData.content);
                        accumulated = result.processedBuffer;
                        if (result.displayUpdate) {
                          setStreamingMessage(result.displayUpdate);
                        }
                      } else {
                        // For non-code modes, directly accumulate
                        accumulated += parsedData.content;
                        setStreamingMessage(accumulated);
                      }
                    } else if (parsedData.error) {
                      console.error("Stream error:", parsedData.error);
                    }
                  } catch (parseError) {
                    console.error("Error parsing SSE data:", parseError, eventData);
                    // Even on parse error, try to process as raw text
                    if (currentMode === 'code') {
                      const result = processStreamChunk(eventData);
                      accumulated = result.processedBuffer;
                      if (result.displayUpdate) {
                        setStreamingMessage(result.displayUpdate);
                      }
                    } else {
                      accumulated += eventData;
                      setStreamingMessage(accumulated);
                    }
                  }
                } else if (line.trim() !== '') {
                  // For non-SSE lines that aren't empty
                  if (currentMode === 'code') {
                    const result = processStreamChunk(line);
                    accumulated = result.processedBuffer;
                    if (result.displayUpdate) {
                      setStreamingMessage(result.displayUpdate);
                    }
                  } else {
                    accumulated += line;
                    setStreamingMessage(accumulated);
                  }
                }
              }
            } else {
              // For non-SSE format (regular text chunks)
              if (currentMode === 'code') {
                const result = processStreamChunk(chunk);
                accumulated = result.processedBuffer;
                if (result.displayUpdate) {
                  setStreamingMessage(result.displayUpdate);
                }
              } else {
                accumulated += chunk;
                setStreamingMessage(accumulated);
              }
            }
          } catch (error) {
            console.error("Error processing chunk:", error);
            // Even on error, try to process the raw chunk
            if (currentMode === 'code') {
              const result = processStreamChunk(chunk);
              accumulated = result.processedBuffer;
              if (result.displayUpdate) {
                setStreamingMessage(result.displayUpdate);
              }
            } else {
              accumulated += chunk;
              setStreamingMessage(accumulated);
            }
          }
        }
      }
      
      return accumulated;
    };
  
    return {
      processStream
    };
  };

  /**
 * useStreamProcessor.js
 *
 * 📦 Location:
 * //src/hooks/useStreamProcessor.js
 *
 * 🧠 Purpose:
 * Handles streaming responses from the API, decoding Server-Sent Events (SSE) or plain text streams,
 * and updating the chat interface in real-time. Supports code artifact parsing when in CODE mode.
 *
 * 🔁 Hook: `useStreamProcessor`
 *
 * @param {Ref} chatTextRef - Ref to hold accumulated raw chat text.
 * @param {Ref} artifactRef - Ref for artifact collection state (used in CODE mode).
 * @param {Ref} activeModeRef - Ref that tracks the current active mode during streaming.
 * @param {Function} setStreamingMessage - Function to update the UI with the latest streaming content.
 * @param {Function} processStreamChunk - Function to detect and extract artifacts (e.g., code blocks).
 *
 * @returns {{
 *   processStream: (response: Response) => Promise<string>
  * }}
  *
  * 📥 Input:
  * - `response`: A `ReadableStream` response from `fetch()` containing streamed text or JSON data.
 
  * 📤 Output:
  * - Returns the full accumulated response string once the stream is complete.
 
  * ⚙️ Behavior:
  * - If the mode is `"code"`:
  *   - Processes each chunk to extract `[CODE_START:lang]... [CODE_END]` artifacts.
  *   - Updates both the chat display and artifact panel.
  * - In all other modes:
  *   - Accumulates plain text or JSON `content` fields from streamed responses.
  *   - Displays the real-time assistant message.
 
  * 💡 Notes:
  * - Supports both SSE-style streaming (e.g. `data: { "content": "..." }`) and raw text chunks.
  * - Falls back to raw text parsing if the JSON stream format fails.
  * - Handles `[DONE]` markers used in OpenAI-compatible streaming APIs.
  */
 