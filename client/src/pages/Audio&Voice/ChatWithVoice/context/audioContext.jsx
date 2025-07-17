/* eslint-disable react/prop-types */
//GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/context/audioContext.jsx
"use client";

import  { createContext, useContext, useState } from "react";


const AudioContext = createContext(undefined);

async function sendMessageToAPI(apiUrl, formData) {
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

export function AudioContextProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [assistant, setAssistant] = useState(); // corrected the spelling here




  const handleSendMessage = async (formData, audioURL, endpoint) => {
    setLoading(true);
    try {
      console.log(`Sending data to ${endpoint}`);
      const result = await sendMessageToAPI(endpoint, formData);

      const promptMessage = {
        role: "user",
        content: [{ type: "audio", text: audioURL}, { type: "text", text: result.userTransCription },],
      };

      console.log("Received response:", result);

      setMessages((prevMessages) => [...prevMessages, promptMessage, result]);
      setAssistant(result);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendAudio = async (audioBlob) => {
    if (!audioBlob) return;
   

    const audioURL = URL.createObjectURL(audioBlob);
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");

    await handleSendMessage(formData, audioURL, "http://localhost:8000/audio/talkToGpt");
  };

  const clearMessages = () => setMessages([]);

  return (
    <AudioContext.Provider
      value={{
        messages,
        isLoading,
        assistant,
        clearMessages,
        sendAudio,
        setLoading,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within an AudioContextProvider");
  }
  return context;
}

/**
 * audioContext.jsx
 *
 * 🧠 React context for managing voice interactions with an AI assistant.
 * Provides global state and functions to record audio, send it to the API, 
 * receive the transcription and assistant response, and maintain a message history.
 *
 * 📦 Location:
 * //GPT/gptcore/client/src/pages/Audio&Voice/ChatWithVoice/context/audioContext.jsx
 *
 * 🔄 Exports:
 * - `AudioContextProvider`: Provider component that wraps the app with audio context access.
 * - `useAudioContext`: Hook to access the context from any child component.
 *
 * 🧩 Provider Props:
 * @param {ReactNode} children - Child components that need access to the context.
 *
 * 📥 Internal State:
 * @state {Array} messages - Message history with audio and text.
 * @state {boolean} isLoading - Loading state while waiting for backend response.
 * @state {Object} assistant - Last assistant message received, including audio and text.
 *
 * 🎯 Main Functions:
 *
 * @function sendMessageToAPI(apiUrl, formData)
 * Sends data to the specified endpoint using `fetch` with POST method.
 * @param {string} apiUrl - Endpoint URL to contact.
 * @param {FormData} formData - Audio file in a FormData object.
 * @returns {Promise<Object>} Response parsed as JSON.
 *
 * @function handleSendMessage(formData, audioURL, endpoint)
 * Handles sending audio to the backend, and stores the transcription and assistant response.
 * Creates a user message including the original audio and transcription.
 * @param {FormData} formData - Contains the audio file.
 * @param {string} audioURL - URL generated from the audio blob.
 * @param {string} endpoint - Endpoint to which the FormData will be sent.
 *
 * @function sendAudio(audioBlob)
 * Converts an audio blob into FormData, generates its URL, and sends it to the `talkToGpt` endpoint.
 * @param {Blob} audioBlob - Audio recorded from the microphone.
 *
 * @function clearMessages()
 * Clears the message history.
 *
 * 💡 Custom Hook:
 *
 * @function useAudioContext()
 * Hook to access the context. Throws an error if used outside the provider.
 *
 * @returns {{
*   messages: Array,
*   isLoading: boolean,
*   assistant: Object,
*   clearMessages: Function,
*   sendAudio: Function,
*   setLoading: Function
* }}
*
* 🛡️ Precautions:
* - The `useAudioContext` hook must only be used within `AudioContextProvider`.
* - The backend must be running at `http://localhost:8000/audio/talkToGpt` for proper functionality.
*
* 🔁 Common Usage:
* - `AudioRecorder.jsx` calls `sendAudio(blob)` after recording ends.
* - `Modal.jsx` and other components access the context to display messages and loading states.
*/
