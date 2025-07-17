//GPT/gptcore/client/src/pages/TextGeneration&Chat/RealtimeSearch.jsx
import { useState, useRef, useEffect } from "react";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { SearchSettingsModal } from "@/components/SearchSettingsModal";

export function RealtimeSearch() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [searchSize, setSearchSize] = useState("medium");
  const [systemInstructions, setSystemInstructions] = useState(
    "You are a helpful assistant with access to web search. Provide accurate and up-to-date information based on search results."
  );

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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

  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage, showScrollButton]);

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
      const response = await fetch("http://localhost:8000/search/realtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: trimmed,
          searchSize: searchSize,
          systemInstructions: systemInstructions,
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

          if (chunk.includes("[Searching]") || chunk.includes("Searching the web...")) continue;
          if (chunk.includes("[Search completed]") || chunk.includes("Web search completed")) continue;

          try {
            if (chunk.trim().startsWith("{") && chunk.trim().endsWith("}")) {
              const event = JSON.parse(chunk);

              if (event.type === "response.output_text.delta" && event.delta) {
                const textContent =
                  typeof event.delta === "string"
                    ? event.delta
                    : event.delta.text || "";

                if (textContent) {
                  accumulated += textContent;
                  setStreamingMessage(accumulated);
                }
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
        {
          role: "assistant",
          content: "An error occurred while processing your search query.",
        },
      ]);
      setStreamingMessage("");
    } finally {
      setLoading(false);
    }
  };

  const toggleSettings = () => setShowSettings(!showSettings);
  const saveSettings = () => setShowSettings(false);

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        {showSettings && (
          <SearchSettingsModal
            isOpen={showSettings}
            onClose={toggleSettings}
            title="Search Settings"
            searchSize={searchSize}
            setSearchSize={setSearchSize}
            systemInstructions={systemInstructions}
            setSystemInstructions={setSystemInstructions}
            onSave={saveSettings}
          />
        )}
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {showBanner && (
            <Banner
              title="Real-time Web Search"
              description="Ask me anything! I can search the web in real-time to provide the most up-to-date information as I respond."
            />
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {streamingMessage && (
            <ChatMessage
              message={{ role: "assistant" }}
              isStreaming={true}
              streamingText={streamingMessage}
            />
          )}
          {loading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessageStream}
        onOpenSettings={toggleSettings}
        isLoading={loading}
      />
    </div>
  );
}

/**
 * RealtimeSearch.jsx
 *
 * This component provides a streaming AI-powered search interface with real-time web access.
 * It allows users to input queries, performs a live search using a backend AI agent,
 * and streams results incrementally for an interactive experience.
 *
 * Key Features:
 * - Real-time streamed responses via server-sent chunks
 * - Integrated settings modal for adjusting search depth and AI behavior
 * - Scroll-aware auto-scroll and UI feedback handling
 * - Differentiated response types and error handling during stream
 * - Smooth UI transitions and dark/light mode support
 *
 * Props: None
 *
 * Dependencies:
 * - `ChatInput`, `ChatMessage`, `LoadingIndicator`, `Banner`, `SearchSettingsModal`
 * - TailwindCSS for layout and styling
 * - `fetch()` API and Web Streams API for streaming support
 *
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/RealtimeSearch.jsx
 */
