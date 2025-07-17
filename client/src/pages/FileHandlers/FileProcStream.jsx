/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X
} from "lucide-react";

// Replace ChatBubble/InputBox with modern ChatMessage/ChatInput
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";

import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Banner } from "@/components/Banner";
import CanvasView from "@/components/CanvasView"; // Optional for file previews

export function FileProcStream() {
  // File & type
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("word");
  const [isDragging, setIsDragging] = useState(false);

  // Chat
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Streaming progress (0–100)
  const [streamProgress, setStreamProgress] = useState(0);

  // UI toggles
  const [showBanner, setShowBanner] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  //------------------------------------------------------
  // SCROLLING & BANNER
  //------------------------------------------------------
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!nearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  useEffect(() => {
    if (messages.length > 0) setShowBanner(false);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  //------------------------------------------------------
  // FILE HANDLING
  //------------------------------------------------------
  const handleFileChange = (file) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    detectFileType(file);
  };

  const detectFileType = (file) => {
    const isWordFile = file.name.match(/\.(docx?|doc)$/i);
    const isPdfFile = file.name.match(/\.pdf$/i);

    if (isWordFile) setFileType("word");
    if (isPdfFile) setFileType("pdf");

    setSelectedFile(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //------------------------------------------------------
  // STREAMING SUBMIT LOGIC
  //------------------------------------------------------
  const handleSubmit = async () => {
    if (!selectedFile || !userInput.trim()) return;

    setLoading(true);
    setStreamProgress(0);

    // Add user message
    const userMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    // Prepare data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userInput", userInput);

    // Decide which streaming endpoint
    const endpoint = fileType === "pdf" ? "pdf" : "word";

    try {
      const res = await fetch(`http://localhost:8000/realtime-file/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok || !res.body) {
        throw new Error("Streaming not supported or network error.");
      }

      // Add a placeholder assistant message for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let accumulated = "";

      // Read the stream chunk by chunk
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update progress (rough estimate)
          setStreamProgress((prev) => Math.min(prev + 10, 90));

          // Update last message in the list
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return updated;
          });
        }
      }

      // Finalize progress at 100%
      setStreamProgress(100);

      // Ensure final content is set
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: accumulated,
        };
        return updated;
      });
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred while processing your file. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
      setStreamProgress(0);
    }
  };

  //------------------------------------------------------
  // RENDER
  //------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-gray-50 md:flex-row">
      {/* LEFT Column: File Upload or Preview */}
      <div className="w-full md:w-1/2 p-6">
        {selectedFile ? (
          <div className="relative h-full">
            {/* Remove Button */}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 z-10 p-2 text-gray-500 hover:text-gray-700
                         bg-white rounded-full shadow hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            {/* If you want to preview images/text/PDFs, show CanvasView */}
            <CanvasView file={selectedFile} isOpen={!!selectedFile} />
          </div>
        ) : (
          <div
            className={`
              relative flex flex-col items-center justify-center
              h-full rounded-xl border-2 border-dashed
              transition-all duration-200
              ${isDragging ? "border-green-400 bg-green-50" : "border-gray-300 bg-white hover:bg-gray-50"}
              p-8
            `}
            onDrop={handleFileDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center cursor-pointer">
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drop your document here, or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports Word (.doc, .docx) and PDF files
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* RIGHT Column: Chat Interface */}
      <div className="flex flex-col flex-1 bg-white border-l border-gray-200">
        
        {/* Optional top bar with streaming progress */}
        <div className="border-b border-gray-200 p-4">
          <div className="font-semibold text-gray-800">Streaming Document Analysis</div>
          {loading && streamProgress > 0 && (
            <div className="mt-2 h-1 bg-gray-100">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${streamProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {showBanner && (
              <Banner
                title="Streaming Document Analysis"
                description="Upload documents and see real-time partial responses as your file is processed."
              />
            )}

            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}

            {loading && !messages.some(m => m.role === "assistant") && (
              <LoadingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* "Scroll to bottom" button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute right-8 bottom-48 p-2 bg-white rounded-full shadow-lg
              border border-gray-200 text-gray-500 hover:text-gray-700
              transition-all duration-200 hover:shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={userInput}
              setInput={setUserInput}
              sendMessage={handleSubmit}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * FileProcStream.jsx
 *
 * 💬 Real-time (streaming) document analysis component. 
 * Allows users to upload a Word or PDF file, submit questions, 
 * and receive progressive (chunked) responses as the AI processes the content.
 *
 * 📂 Location:
 * //GPT/gptcore/client/src/pages/FileProcessing/FileProcStream.jsx
 *
 * 🔄 Main State Variables:
 * @state {File|null} selectedFile - File selected by the user.
 * @state {string} fileType - File type ("word" or "pdf").
 * @state {boolean} isDragging - Whether the user is dragging a file.
 * @state {string} userInput - User input text before sending.
 * @state {Array} messages - List of chat messages (user + AI).
 * @state {boolean} loading - Whether a submission/processing is active.
 * @state {number} streamProgress - Estimated streaming progress (0–100).
 * @state {boolean} showBanner - Whether to show the initial welcome banner.
 * @state {boolean} showScrollButton - Whether to show a scroll-to-bottom button.
 *
 * 🔁 Refs:
 * @ref {object} chatContainerRef - Ref for detecting scroll position and managing auto-scroll.
 * @ref {object} messagesEndRef - Ref to scroll automatically to the bottom of the chat.
 * @ref {object} fileInputRef - Ref to the hidden file input element.
 *
 * 📥 Events:
 * @function handleFileDrop - Handles files dragged into the drop zone.
 * @function handleFileChange - Updates the selected file from input.
 * @function detectFileType - Determines the uploaded file type by its extension.
 * @function removeFile - Removes the uploaded file.
 * @function handleSubmit - Sends the user message and file to the backend (streaming).
 *
 * 📡 Streaming Logic:
 * - Uses `fetch(...).body.getReader()` to process the response body in chunks.
 * - Chunks are accumulated in `accumulated`, updating the latest chat message.
 * - A simulated progress bar updates based on processed chunks.
 *
 * 🛠 Backend Endpoints:
 * - `/realtime-file/word`: Streams processing of .doc/.docx files.
 * - `/realtime-file/pdf`: Streams processing of PDF files.
 *
 * 💬 User Interface:
 * - Left column: file upload area (drag & drop + `CanvasView`).
 * - Right column: real-time AI chat (input + message history).
 * - Scroll-to-bottom button appears if the user scrolls away from the end.
 * - Streaming progress bar visible while the response is loading.
 *
 * 🧩 Related Components:
 * - `ChatInput`, `ChatMessage`: Chat input and message display.
 * - `Banner`: Introductory welcome banner.
 * - `CanvasView`: Preview of uploaded file.
 * - `LoadingIndicator`: Loading animation.
 *
 * 🎯 Use Cases:
 * - Progressive analysis of long documents.
 * - Instant feedback while response is being generated.
 * - A smoother alternative to receiving a full answer in one block.
 *
 * @returns {JSX.Element}
 */
