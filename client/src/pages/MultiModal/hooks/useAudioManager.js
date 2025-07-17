// src/hooks/useAudioManager.js
import { useState } from "react";
import { sanitizeMessageHistory } from "../helpers/messageHelpers";

/**
 * Format the audio response into message format compatible with chat history
 * @param {Object} result - The response from the API
 * @param {string} audioURL - The URL to the recorded audio
 * @returns {Object} - Formatted user and assistant messages
 */
const formatAudioMessages = (result, audioURL) => {
  // Extract user transcription
  const userTranscription = result.userTransCription || "";
  
  // Create user message
  const userMessage = {
    role: "user",
    content: [
      { type: "audio", text: audioURL },
      { type: "text", text: userTranscription }
    ],
    timestamp: new Date().toISOString()
  };
  
  // Format assistant message based on the response structure
  let assistantContent = [];
  
  if (result.content && Array.isArray(result.content)) {
    // Handle the array structure from the response
    assistantContent = result.content.map(item => {
      // Handle audio buffer
      if (item.type === "audio" && item.text && item.text.data) {
        return {
          type: "audio",
          text: item.text
        };
      }
      // Handle text response
      else if (item.type === "text" && item.text) {
        return {
          type: "text",
          text: item.text
        };
      }
      return item;
    });
  } 
  // Fallback for simple text response
  else if (typeof result.content === 'string') {
    assistantContent = [{ type: "text", text: result.content }];
  }
  // Fallback for simple message response
  else if (typeof result.message === 'string') {
    assistantContent = [{ type: "text", text: result.message }];
  }
  // Final fallback
  else {
    assistantContent = [{ type: "text", text: "I processed your audio." }];
  }
  
  const assistantMessage = {
    role: "assistant",
    content: assistantContent,
    userTransCription: userTranscription, // Keep the original transcription for reference
    timestamp: new Date().toISOString()
  };
  
  return { userMessage, assistantMessage };
};

export const useAudioManager = (setMessages, activeModeRef, MODES) => {
  const [isAudioLoading, setAudioLoading] = useState(false);
  const [assistant, setAssistant] = useState(null);
  
  async function sendMessageToAPI(apiUrl, formData, messages) {
    // Sanitize message history before adding it to the request
    const sanitizedHistory = sanitizeMessageHistory(messages);
    
    // Add sanitized history to the form data if needed
    if (messages && messages.length > 0) {
      formData.append("history", JSON.stringify(sanitizedHistory));
    }
    
    const response = await fetch(apiUrl, {
      method: "POST",
      cache: "no-store",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    return response.json();
  }

  const handleSendAudioMessage = async (formData, audioURL, endpoint, messages = []) => {
    setAudioLoading(true);
    try {
      console.log(`Sending data to ${endpoint}`);
      const result = await sendMessageToAPI(endpoint, formData, messages);

      console.log("Audio API response:", result);
      
      // Format the messages
      const { userMessage, assistantMessage } = formatAudioMessages(result, audioURL);

      // Update the main message history with formatted messages
      setMessages((prevMessages) => [
        ...prevMessages, 
        userMessage,
        assistantMessage
      ]);
      
      // Store the entire result for any components that need it
      setAssistant(result);
    } catch (error) {
      console.error("Error sending audio message:", error);
      // Add error message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: [{ type: "text", text: `An error occurred processing your audio: ${error.message}` }],
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setAudioLoading(false);
    }
  };

  const sendAudio = async (audioBlob, currentMessages = []) => {
    if (!audioBlob) return;
   
    // Store that we're in audio mode when the request starts
    activeModeRef.current = MODES.AUDIO;

    const audioURL = URL.createObjectURL(audioBlob);
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");

    await handleSendAudioMessage(
      formData, 
      audioURL, 
      "http://localhost:8000/audio/talkToGpt",
      currentMessages
    );
  };

  return {
    isAudioLoading,
    setAudioLoading,
    assistant,
    sendAudio
  };
};

/**
 * useAudioManager.js
 *
 * 📦 Location:
 * //src/hooks/useAudioManager.js
 *
 * 🧠 Purpose:
 * Provides a reusable hook to handle sending audio messages to an AI backend,
 * formatting the responses, and integrating them into a real-time chat experience.
 * It tracks loading state, formats message structure, and extracts audio and transcription content.
 *
 * 🔁 Hook: `useAudioManager`
 *
 * @param {Function} setMessages - Setter for updating the global chat message history.
 * @param {Ref} activeModeRef - Ref to track which mode (e.g., AUDIO) is active at the time of request.
 * @param {Object} MODES - Enum of supported modes (used to verify AUDIO mode).
 * @returns {{
*   isAudioLoading: boolean,
*   setAudioLoading: Function,
*   assistant: Object|null,
*   sendAudio: Function
* }}
*
* 🔊 Core Responsibilities:
*
* 1. 🧠 `sendAudio(audioBlob, currentMessages)`
*    - Sends a recorded audio blob to the AI API.
*    - Automatically sets audio mode, prepares the form data,
*      and processes the response.
*    - Appends formatted `user` and `assistant` messages into the chat state.
*
* 2. 💬 `formatAudioMessages(result, audioURL)`
*    - Helper to transform a backend response into a structured user/assistant
*      message with both transcription and audio components.
*    - Supports both audio+text or pure text responses.
*
* 3. 📡 `handleSendAudioMessage(formData, audioURL, endpoint, messages)`
*    - Internal helper that prepares request, handles response, and appends
*      messages to the chat.
*    - Uses history sanitization via `sanitizeMessageHistory()` to exclude
*      large binary content from chat history in the request.
*
* 4. 📤 `sendMessageToAPI(apiUrl, formData, messages)`
*    - Sends a `POST` request with audio and history.
*    - Can be adapted to multiple endpoints if needed.
*
* ⚠️ Error Handling:
* - Captures errors from failed audio upload or processing.
* - Injects a user-facing assistant error message into the chat.
*
* 📌 Side Effects:
* - Maintains and exposes `isAudioLoading` to manage UI state.
* - Stores last assistant response in `assistant` for follow-up actions or playback.
*
* ✅ Use Cases:
* - Voice chat with AI assistants.
* - Real-time transcription and audio response playback.
* - AI tools requiring contextual audio-based interactions.
*/
