import { useChatContext } from "./context/ChatContext";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import CanvasView from "@/components/CanvasView";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ArtifactPanel } from "./components/ArtifactPanel";

export function MultiModal() {
  const {
    input,
    setInput,
    messages,
    streamingMessage,
    loading,
    showBanner,
    messagesEndRef,
    chatContainerRef,
    sendMessageStream,
    selectedFile, // Added to check for selected file
    clearSelectedFile,
    showArtifactPanel,
    setShowArtifactPanel,
    artifactCollection,
    clearAllArtifacts,
    currentArtifact,
    setCurrentArtifact,
  } = useChatContext();

  // State to manage scroll button visibility
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle scroll behavior to show/hide scroll button
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
  }, [chatContainerRef]);

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage, showScrollButton, messagesEndRef]);

  // Determine if right panel should be shown (file or artifacts)
  const showRightPanel = selectedFile || showArtifactPanel;

  return (
    <div className="relative flex flex-col md:flex-row w-full h-screen bg-gray-50">
      {/* Chat Column - Adjust width based on whether a right panel is visible */}
      <div
        className={`flex flex-col ${
          showRightPanel ? "w-full md:w-1/2" : "w-full"
        } h-full`}
      >
        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-auto px-4 py-6 space-y-6"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Banner */}
            {showBanner && (
              <Banner
                title="MultiModal Chat"
                description="Interact with text, Code, PDF, Voice, and Web Search Ask me anything!"
              />
            )}

            {/* Message History */}
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {/* Streaming Message */}
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
        />
      </div>

      {/* Right Panel Container - Always takes w-1/2 when visible */}
      {showRightPanel && (
        <div className="w-full md:w-1/2 relative h-full">
          {/* File Viewer */}
          {selectedFile && (
            <div className="absolute inset-0 z-10">
              {/* Remove file button */}
              <button
                onClick={clearSelectedFile}
                className="absolute top-2 right-2 z-20 p-2 text-gray-500 hover:text-gray-700 
                         bg-white rounded-full shadow hover:bg-gray-100"
              >
                <X size={18} />
              </button>

              {/* For images or text-based files, you can show a preview with CanvasView */}
              <CanvasView file={selectedFile} isOpen={!!selectedFile} />
            </div>
          )}

          {/* Artifact Panel - Only visible when showArtifactPanel is true */}
          {showArtifactPanel && (
            <div className={`absolute inset-0 ${selectedFile ? 'z-20' : 'z-10'}`}>
              <ArtifactPanel
                isArtifactPanelOpen={showArtifactPanel}
                setIsArtifactPanelOpen={setShowArtifactPanel}
                artifactCollection={artifactCollection}
                clearAllArtifacts={clearAllArtifacts}
                currentArtifact={currentArtifact}
                setCurrentArtifact={setCurrentArtifact}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * MultiModal.jsx
 *
 * 📦 Location:
 * //src/MultiModal.jsx
 *
 * 🧠 Purpose:
 * Main layout and orchestrator for a multimodal AI chat interface.
 * Supports text, code, audio, file (PDF/Image), and web-based interactions
 * using a flexible two-column layout with conditional rendering.
 *
 * 🎛️ Components Used:
 * - `ChatInput`: Main text input area with audio/code/search toggle buttons.
 * - `ChatMessage`: Renders individual user or assistant messages.
 * - `LoadingIndicator`: Shows a spinner during loading states.
 * - `Banner`: Displays a welcome or info banner on initial load.
 * - `CanvasView`: Renders previews of uploaded files like images or PDFs.
 * - `ArtifactPanel`: Displays collected code artifacts in a split-panel layout.
 *
 * 📥 Context Access:
 * Uses `useChatContext()` to access:
 * - State: `messages`, `streamingMessage`, `loading`, `selectedFile`, etc.
 * - Actions: `sendMessageStream`, `clearSelectedFile`, `setShowArtifactPanel`, etc.
 *
 * 📐 Layout:
 * - Left Column (`w-full` or `md:w-1/2`): Chat interface.
 * - Right Column (`md:w-1/2`): File preview or code artifact panel (conditionally rendered).
 *
 * 🔁 Side Effects:
 * - `useEffect`: Auto-scrolls chat when new messages or streaming content arrives.
 * - `useEffect`: Shows scroll-to-bottom button when the user scrolls up.
 *
 * 🖼️ Conditional Rendering:
 * - Shows a preview of the uploaded file if `selectedFile` is set.
 * - Shows the code artifact panel if `showArtifactPanel` is true.
 * - Handles toggling and layering (`z-index`) of overlapping file and artifact views.
 *
 * 🧩 External Dependencies:
 * - `lucide-react`: Icons (e.g., close `X`)
 *
 * 📤 Output:
 * A responsive, real-time chat interface that adapts based on input type and user mode.
 */
