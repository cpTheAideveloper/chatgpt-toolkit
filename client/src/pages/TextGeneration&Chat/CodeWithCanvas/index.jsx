//GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/index.jsx

import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ArtifactPanel } from "./components/ArtiFactPanel";
import { ChatInput } from "@/components/ChatInput";
import { useChatArtifact } from "./hooks/useChatArtifact";
import { Banner } from "@/components/Banner";

export const CodeWithCanvas = () => {
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const handleArtifactStart = useCallback(() => {
    setIsArtifactPanelOpen(true);
  }, []);

  const {
    messages,
    input,
    setInput,
    isLoading,
    streamedText,
    currentArtifact,
    artifactCollection,
    messagesEndRef,
    sendMessage,
    clearAllArtifacts,
    setCurrentArtifact,
  } = useChatArtifact({ onArtifactStart: handleArtifactStart });

  useEffect(() => {
    if (messages.length > 0) {
      setShowBanner(false);
    }
  }, [messages]);

  useEffect(() => {
    if (artifactCollection.length > 0) {
      setIsArtifactPanelOpen(true);
    }
  }, [artifactCollection]);

  return (
    <div className="relative flex h-screen">
      {/* Chat Section */}
      <div className={`flex flex-col ${isArtifactPanelOpen ? "w-1/2" : "w-full"}`}>
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="max-w-4xl mx-auto space-y-6 p-4">
            {showBanner && (
              <Banner
                title="Code Canvas"
                description="Ask me anything! I'm here to help you with questions, tasks, or just friendly conversation."
              />
            )}
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {isLoading && streamedText && (
              <ChatMessage
                message={{ role: "assistant" }}
                isStreaming={true}
                streamingText={streamedText}
              />
            )}

            {isLoading && !streamedText && (
              <div className="flex items-center text-gray-500 p-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse"></div>
                <div
                  className="w-3 h-3 bg-gray-300 rounded-full mr-2 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Artifact Panel */}
      {isArtifactPanelOpen && (
        <ArtifactPanel
          isArtifactPanelOpen={isArtifactPanelOpen}
          setIsArtifactPanelOpen={setIsArtifactPanelOpen}
          artifactCollection={artifactCollection}
          clearAllArtifacts={clearAllArtifacts}
          currentArtifact={currentArtifact}
          setCurrentArtifact={setCurrentArtifact}
        />
      )}
    </div>
  );
};

/**
 * CodeWithCanvas.jsx
 *
 * This component creates an interactive split-screen experience where users can chat with an AI model,
 * and automatically open a side panel (artifact panel) whenever code artifacts are generated in response.
 * It provides real-time code completion, code streaming, and preview functionality for developers.
 *
 * Key Features:
 * - Code-focused AI chat with streaming response
 * - Artifact panel for displaying and managing generated code/output
 * - Smooth transitions between full-width and split layout views
 * - Auto-scroll behavior and typing indicators
 * - Banner introduction for first-time interaction
 *
 * Integration:
 * - Uses `useChatArtifact` custom hook for streaming logic and state management
 * - Integrates with `ArtifactPanel` for showing code artifacts
 * - Relies on `ChatInput`, `ChatMessage`, and `Banner` components for structured chat
 *
 * Dependencies:
 * - React (hooks), TailwindCSS for styling
 * - Custom components: `ArtifactPanel`, `ChatMessage`, `ChatInput`, `Banner`
 *
 * Path: //GPT/gptcore/client/src/pages/TextGeneration&Chat/CodeWithCanvas/index.jsx
 */
