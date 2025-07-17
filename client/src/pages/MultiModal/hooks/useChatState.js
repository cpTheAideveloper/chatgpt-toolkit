// src/hooks/useChatState.js
import { useState, useRef, useEffect } from "react";

export const useChatState = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll logic for messages and streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]); // Depends only on state within this hook

  return {
    input,
    setInput,
    messages,
    setMessages,
    streamingMessage,
    setStreamingMessage,
    loading,
    setLoading,
    showBanner,
    setShowBanner,
    messagesEndRef,
    chatContainerRef,
  };
};

/**
 * useChatState.js
 *
 * 📦 Location:
 * //src/hooks/useChatState.js
 *
 * 🧠 Purpose:
 * This hook manages the dynamic state of a chat application, including user input, message history,
 * streaming assistant responses, loading indicators, and UI behaviors like scroll positioning.
 *
 * 🔁 Hook: `useChatState`
 *
 * @returns {{
*   input: string,
*   setInput: Function,
*   messages: Array,
*   setMessages: Function,
*   streamingMessage: string,
*   setStreamingMessage: Function,
*   loading: boolean,
*   setLoading: Function,
*   showBanner: boolean,
*   setShowBanner: Function,
*   messagesEndRef: RefObject,
*   chatContainerRef: RefObject
* }}
*
* 🧩 State Managed:
* - `input`: The current value of the user's message input field.
* - `messages`: The full history of chat messages (user and assistant).
* - `streamingMessage`: The assistant's currently streaming response (e.g. when using SSE).
* - `loading`: Whether a response is currently being fetched.
* - `showBanner`: Controls whether an initial banner or intro message should be shown.
*
* 🪄 Refs:
* - `messagesEndRef`: Used to scroll to the bottom of the chat automatically.
* - `chatContainerRef`: A reference to the scrollable chat container.
*
* 🎯 Effects:
* - Automatically scrolls to the latest message whenever messages or streaming content changes.
*
* ✅ Use Cases:
* - Enables smooth UI updates and auto-scrolling in real-time conversations.
* - Centralized state for any component in the chat app to access/update message history and input.
*
* 💡 Notes:
* - Typically used inside a `ChatProvider` context.
* - The auto-scroll effect can be customized for pause/resume logic on manual scroll.
*/
