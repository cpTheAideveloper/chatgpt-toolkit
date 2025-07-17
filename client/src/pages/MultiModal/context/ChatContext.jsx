/* eslint-disable react/prop-types */
// src/context/ChatContext.js
import { createContext, useContext } from "react";
import { useChatConfig } from "../hooks/useChatConfig";
import { useChatState } from "../hooks/useChatState";
import { useModeManager } from "../hooks/useModeManager";
import { useFileManager } from "../hooks/useFileManager";
import { useSearchConfig } from "../hooks/useSearchConfig";
import { useArtifactManager } from "../hooks/useArtifactManager";
import { useStreamProcessor } from "../hooks/useStreamProcessor";
import { useAudioManager } from "../hooks/useAudioManager";
import { sanitizeMessageHistory } from "../helpers/messageHelpers";

// Create the context
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

// Provider component
export const ChatProvider = ({
  children,
  initialModel = "gpt-4o-mini",
  initialInstructions = "",
  initialTemperature = 0.7,
  initialSearchSystemInstructions = "You are a helpful assistant with access to web search. Provide accurate and up-to-date information based on search results.",
  initialSearchSize = "medium",
  onArtifactStart = null,
}) => {
  // Use the mode manager
  const modeManager = useModeManager();
  const { activeMode, setActiveMode, activeModeRef, MODES } = modeManager;

  // Use chat configuration
  const chatConfig = useChatConfig(
    initialModel,
    initialInstructions,
    initialTemperature
  );

  // Use search configuration
  const searchConfig = useSearchConfig(
    initialSearchSystemInstructions,
    initialSearchSize
  );

  // Use chat state
  const chatState = useChatState();
  const { messages, setMessages, setStreamingMessage, setLoading } = chatState;

  // Use file manager - depends on mode manager
  const fileManager = useFileManager(activeMode, setActiveMode);

  // Use artifact manager - depends on mode manager
  const artifactManager = useArtifactManager(activeMode, onArtifactStart);
  const { chatTextRef, artifactRef, processStreamChunk } = artifactManager;

  // Use stream processor - depends on artifact manager, chat state, and mode manager
  const streamProcessor = useStreamProcessor(
    chatTextRef,
    artifactRef,
    activeModeRef,
    setStreamingMessage,
    processStreamChunk
  );
  
  // Use audio manager - depends on chat state and mode manager
  const audioManager = useAudioManager(setMessages, activeModeRef, MODES);
  
  // Combine actions from different hooks
  const resetConversation = () => {
    chatState.setMessages([]);
    chatState.setStreamingMessage("");
    chatState.setShowBanner(true);
    modeManager.resetMode();
    fileManager.setSelectedFile(null);
    artifactManager.resetArtifactState();
  };

  const clearMessages = () => {
    chatState.setMessages([]);
    chatState.setStreamingMessage("");
  };

  // Create the universal send message function
  const sendMessageStream = async (messageText) => {
    const trimmed = (messageText || chatState.input).trim();
    if (!trimmed) return;

    if (chatState.showBanner) chatState.setShowBanner(false);
    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    chatState.setInput("");
    setLoading(true);
    setStreamingMessage("");

    // Store the current mode at the start of the request
    activeModeRef.current = activeMode;

    // Sanitize message history before sending to API - removes large audio buffers
    const sanitizedHistory = sanitizeMessageHistory(messages);

    let endpoint;
    let requestBody;
    let headers = {};

    // Select endpoint and prepare request body based on active mode
    switch (activeMode) {
      case MODES.FILE:
        endpoint = "/filestream";
        requestBody = new FormData();
        requestBody.append("file", fileManager.selectedFile);
        requestBody.append("userInput", trimmed);
        // Use sanitized history for the request
        requestBody.append("history", JSON.stringify([...sanitizedHistory, userMessage]));
        requestBody.append("systemInstructions", chatConfig.instructions);
        requestBody.append("model", chatConfig.model);
        requestBody.append("temperature", chatConfig.temperature);
        break;
        
      case MODES.SEARCH:
        endpoint = "/search/realtime";
        requestBody = {
          userInput: trimmed,
          systemInstructions: searchConfig.searchSystemInstructions,
          searchSize: searchConfig.searchSize,
          model: chatConfig.model,
        };
        headers = { "Content-Type": "application/json" };
        break;
        
      case MODES.CODE:
        endpoint = "/code";
        requestBody = {
          userInput: trimmed,
          // Use sanitized history for the request
          history: [...sanitizedHistory, userMessage],
          model: chatConfig.model,
          instructions: chatConfig.instructions,
          temperature: chatConfig.temperature,
        };
        headers = { "Content-Type": "application/json" };
        break;
        
      case MODES.AUDIO:
        // In audio mode, text messages still use the normal endpoint
        // Audio-specific handling is in the sendAudio function
        endpoint = "/chat/stream";
        requestBody = {
          userInput: trimmed,
          // Use sanitized history for the request
          history: [...sanitizedHistory, userMessage],
          model: chatConfig.model,
          instructions: chatConfig.instructions,
          temperature: chatConfig.temperature,
        };
        headers = { "Content-Type": "application/json" };
        break;
        
      default:
        endpoint = "/chat/stream";
        requestBody = {
          userInput: trimmed,
          // Use sanitized history for the request
          history: [...sanitizedHistory, userMessage],
          model: chatConfig.model,
          instructions: chatConfig.instructions,
          temperature: chatConfig.temperature,
        };
        headers = { "Content-Type": "application/json" };
    }

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: headers,
        body: fileManager.selectedFile ? requestBody : JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Could not read error response");
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      
      if (!response.body) {
        throw new Error("Response doesn't support streaming");
      }

      const finalMessage = await streamProcessor.processStream(response);
      
      // If code mode is active and we're still collecting an artifact at the end, 
      // show appropriate placeholder
      const assistantMessageContent = (activeModeRef.current === MODES.CODE && artifactRef.current.collecting)
        ? finalMessage + `[Code: ${artifactRef.current.language}]`
        : finalMessage;
        
      // Ensure the mode remains active
      if (activeModeRef.current === MODES.CODE) {
        setActiveMode(MODES.CODE);
        artifactManager.setShowArtifactPanel(true);
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessageContent }]);
      setStreamingMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `An error occurred: ${error.message}` },
      ]);
      setStreamingMessage("");
    } finally {
      setLoading(false);
      
      // Final confirmation that mode is still active if it was active when we started
      if (activeModeRef.current === MODES.CODE) {
        setActiveMode(MODES.CODE);
        artifactManager.setShowArtifactPanel(true);
      } else if (activeModeRef.current === MODES.AUDIO) {
        setActiveMode(MODES.AUDIO);
      }
    }
  };

  // Combine all values from hooks
  const value = {
    // From chat config
    ...chatConfig,
    
    // From search config
    ...searchConfig,
    
    // From chat state
    ...chatState,
    
    // From mode manager
    ...modeManager,
    
    // From file manager
    ...fileManager,
    
    // From artifact manager
    ...artifactManager,
    
    // From audio manager
    ...audioManager,
    
    // Additional actions
    sendMessageStream,
    resetConversation,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

/**
 * ChatContext.js
 *
 * 📦 Location:
 * //src/context/ChatContext.js
 *
 * 🧠 Purpose:
 * This file defines the global chat context for the application.
 * It provides shared state and functions to manage the conversation with the AI,
 * including interaction modes (file, search, code, voice), model configuration,
 * file attachments, artifact generation, and audio processing.
 *
 * ⚙️ Custom Hooks Used:
 * - `useChatConfig`: Manages the model, system instructions, and temperature.
 * - `useChatState`: Manages messages, loading state, and text input.
 * - `useModeManager`: Controls active modes (normal, file, search, code, audio).
 * - `useFileManager`: Manages uploaded files.
 * - `useSearchConfig`: Configures search instructions and depth for web search.
 * - `useArtifactManager`: Manages generation and display of code artifacts.
 * - `useStreamProcessor`: Processes streaming responses from the backend.
 * - `useAudioManager`: Manages voice input and output modes.
 *
 * 📥 `ChatProvider` Props:
 * @prop {ReactNode} children - Components wrapped by the provider.
 * @prop {string} initialModel - Default AI model (e.g., 'gpt-4o-mini').
 * @prop {string} initialInstructions - Default system prompt.
 * @prop {number} initialTemperature - AI creativity (0.0 - 2.0).
 * @prop {string} initialSearchSystemInstructions - Base prompt for web search.
 * @prop {string} initialSearchSize - Search depth ('low', 'medium', 'high').
 * @prop {function|null} onArtifactStart - Optional callback triggered when starting code artifacts.
 *
 * 📤 Functions Available in Context:
 * - `sendMessageStream`: Sends messages to the backend with support for multiple modes.
 * - `resetConversation`: Resets all chat states and clears history.
 * - `clearMessages`: Deletes only the current messages.
 * - `setModel`, `setTemperature`, `setInstructions`: Model configuration.
 * - `setSearchSystemInstructions`, `setSearchSize`: Search configuration.
 * - `toggleAudioMode`, `toggleCodeMode`, `toggleSearchMode`: Mode toggles.
 * - `setSelectedFile`, `setShowArtifactPanel`: UI controls.
 * - `sendAudio`: Sends voice input to the backend.
 *
 * 🧪 Message Sending Logic (`sendMessageStream`):
 * - Dynamically builds the message body depending on the active mode.
 * - Sanitizes the message history to avoid sending heavy data (e.g., audio blobs).
 * - Processes streaming responses and updates the UI in real time.
 * - If code mode is active, displays the artifact panel.
 *
 * 🔁 Lifecycle:
 * - Stores the active mode in a ref (`activeModeRef`) to ensure consistency during streaming.
 * - Updates loading, streaming, and message states when receiving backend responses.
 *
 * 🛡️ Validation:
 * - The `useChatContext()` hook throws an error if used outside of `ChatProvider`.
 *
 * 🧩 Example Usage:
 * ```jsx
 * const { input, setInput, sendMessageStream, messages } = useChatContext();
 * ```
 */
