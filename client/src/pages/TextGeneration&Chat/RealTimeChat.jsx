//GPT/gptcore/client/src/pages/TextGeneration&Chat/RealTimeChat.jsx

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { ChatSettings } from "@/components/ChatSettings";

export function RealTimeChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const [instructions, setInstructions] = useState("");
  const [temperature, setTemperature] = useState(0.7);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Handle scroll behavior
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage, showScrollButton]);

  // Hide banner on first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);

  const sendMessageStream = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (showBanner) setShowBanner(false);

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingMessage("");

    try {
      const response = await fetch("http://localhost:8000/chat/stream", {
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

      if (!response.ok || !response.body) {
        throw new Error("Network response was not ok or streaming not supported.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });

          try {
            if (chunk.trim().startsWith("{") && chunk.trim().endsWith("}")) {
              const event = JSON.parse(chunk);

              if (
                event.type === "response.output_text.delta" &&
                event.delta &&
                event.delta.text
              ) {
                accumulated += event.delta.text;
                setStreamingMessage(accumulated);
              } else if (event.type === "error") {
                console.error("Stream error:", event.error);
              }
            } else {
              accumulated += chunk;
              setStreamingMessage(accumulated);
            }
          } catch {
            accumulated += chunk;
            setStreamingMessage(accumulated);
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      setStreamingMessage("");
    } catch (error) {
      console.error("Error sending streaming message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred while sending your message." },
      ]);
      setStreamingMessage("");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setShowBanner(true);
  };

  const resetConversation = () => {
    setModel("gpt-4o-mini");
    setInstructions("");
    setTemperature(0.7);
    clearMessages();
  };

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50">
      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {showBanner && (
            <Banner
              title="Real-time Chat"
              description="Experience instant responses as the AI thinks. Watch the message appear word by word in real-time."
            />
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {streamingMessage && (
            <ChatMessage
              message={{ role: "assistant" }}
              isStreaming={true}
              streamingText={streamingMessage || ""}
            />
          )}
          {loading && !streamingMessage && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessageStream}
        isLoading={loading}
        onOpenSettings={() => setSettingsOpen(true)}
        showSettingsButton={true}
      />

      {/* Settings Modal */}
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
 * RealTimeChat.jsx
 *
 * This component provides a real-time chat interface with AI, where assistant responses
 * stream word-by-word for a natural and interactive experience. It's ideal for showcasing
 * the responsiveness and fluidity of AI-generated content in a conversational context.
 *
 * Key Features:
 * - Streaming AI responses via server-sent chunks
 * - User input and message state management
 * - Scroll behavior detection and smooth auto-scroll
 * - Settings customization: model, temperature, and system instructions
 * - Optional welcome banner and visual feedback via loading indicator
 * - Modular architecture using reusable subcomponents (ChatInput, ChatMessage, etc.)
 *
 * Props: None (used as a standalone page component)
 *
 * Dependencies:
 * - `@/components/ChatInput` for input handling
 * - `@/components/ChatMessage` for message rendering
 * - `@/components/LoadingIndicator` for loading state
 * - `@/components/Banner` for intro message
 * - `@/components/ChatSettings` for model config options
 *
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/RealTimeChat.jsx
 */
