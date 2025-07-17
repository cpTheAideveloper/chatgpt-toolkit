//GPT/gptcore/client/src/pages/TextGeneration&Chat/Chat.jsx

import { useState, useRef, useEffect } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatSettings } from "@/components/ChatSettings";

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  
  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const [instructions, setInstructions] = useState("");
  const [temperature, setTemperature] = useState(0.7);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide banner on first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (showBanner) setShowBanner(false);

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userInput: trimmed,
          model,
          instructions,
          temperature,
          messages
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred while sending your message.",
          refusal: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    setShowBanner(true);
  };

  // Reset all settings and clear messages
  const resetConversation = () => {
    setModel("gpt-4o-mini");
    setInstructions("");
    setTemperature(0.7);
    clearMessages();
  };

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-auto px-4 py-6 space-y-6"
      >
        {/* Welcome Banner */}
        <div className="max-w-4xl mx-auto space-y-6">
          {showBanner && (
            <Banner
              title="Welcome to AI Chat"
              description="Ask me anything! I'm here to help you with questions, tasks, or just friendly conversation."
            />
          )}

          {/* Messages */}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

          {loading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={loading}
        onOpenSettings={() => setSettingsOpen(true)}
        showSettingsButton={true}
      />
      
      {/* Settings Component (always rendered, but conditionally displayed) */}
      <ChatSettings 
        isOpen={settingsOpen}
        setIsOpen={setSettingsOpen}
        model={model}
        setModel={setModel}
        instructions={instructions}
        setInstructions={setInstructions}
        temperature={temperature}
        setTemperature={setTemperature}
        clearMessages={clearMessages}
        resetConversation={resetConversation}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

/**
 * Chat.jsx
 * 
 * This component serves as the main interface for the AI-powered chat feature.
 * It manages the chat conversation state, user input, settings, and API interactions.
 * The component is designed to be responsive, accessible, and maintainable with clear
 * separation of concerns through modular sub-components.
 * 
 * Key Features:
 * - Chat with AI via API integration
 * - Configurable model settings (model selection, temperature, instructions)
 * - Auto-scrolling message view
 * - Loading states and error handling
 * - Responsive design with dark mode support
 * - Persistent settings and message history
 * 
 * Dependencies:
 * - React (useState, useRef, useEffect for state and lifecycle management)
 * - Custom components: LoadingIndicator, Banner, ChatInput, ChatMessage, ChatSettings
 * 
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/Chat.jsx
 */
